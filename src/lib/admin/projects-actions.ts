"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminRole, canEdit } from "@/lib/admin/auth";

const COVER_BUCKET = "project-covers";
const MAX_UPLOAD = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const CATEGORIES = [
  "vivienda",
  "alimentacion",
  "educacion",
  "maternidad",
  "adiccion",
  "emergencia",
  "salud",
  "general",
] as const;

const STATUSES = [
  "draft",
  "active",
  "funded",
  "completed",
  "archived",
] as const;

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug"),
  title_es: z.string().trim().min(1).max(160),
  summary_es: z.string().trim().max(400).default(""),
  story_es: z.string().trim().max(20000).default(""),
  category: z.enum(CATEGORIES),
  status: z.enum(STATUSES),
  goal_amount: z.number().min(0).max(1_000_000_000),
  currency: z.string().trim().length(3).default("USD"),
  cover_image: z.string().trim().url().max(2000).nullable(),
  location_name: z.string().trim().max(200).nullable(),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(10000),
});

type EditorCtx =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; error: string };

async function requireEditorClient(): Promise<EditorCtx> {
  const supabase = await getServerAuthClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "No autenticado." };
  const role = await getAdminRole(user);
  if (!canEdit(role)) return { ok: false, error: "Sin permiso." };
  return { ok: true, supabase, user };
}

function revalidateProjects() {
  revalidatePath("/[locale]/admin/proyectos", "page");
  revalidatePath("/[locale]/proyectos", "page");
}

/**
 * Sube una imagen de portada a Supabase Storage y devuelve su URL pública.
 * Solo admins (validado server-side). La escritura pasa por el cliente
 * service_role tras verificar el rol — no hay ruta de subida directa para el
 * cliente. El bucket es de LECTURA pública (las portadas son públicas en el
 * sitio); la subida solo ocurre aquí. Nombre con UUID (sin colisiones ni
 * inyección de rutas).
 */
export async function uploadCoverImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No se recibió ninguna imagen." };
  }
  if (file.size > MAX_UPLOAD) {
    return { ok: false, error: "La imagen supera 5 MB." };
  }
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return { ok: false, error: "Formato no permitido (usa JPG, PNG o WebP)." };
  }

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Almacenamiento no disponible." };

  // Asegura el bucket (idempotente): lectura pública, límite y tipos correctos.
  await admin.storage.createBucket(COVER_BUCKET, {
    public: true,
    fileSizeLimit: MAX_UPLOAD,
    allowedMimeTypes: Object.keys(ALLOWED_MIME),
  });

  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(COVER_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = admin.storage.from(COVER_BUCKET).getPublicUrl(path);
  return { ok: true, data: { url: data.publicUrl } };
}

/** Crea un proyecto. RLS exige rol editor+; el trigger de auditoría registra al actor. */
export async function createProjectAction(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const { data, error } = await ctx.supabase
    .from("projects")
    .insert({ ...parsed.data, created_by: ctx.user.id })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese slug ya existe." };
    return { ok: false, error: "No se pudo crear el proyecto." };
  }
  revalidateProjects();
  return { ok: true, data: { id: (data as { id: string }).id } };
}

/** Actualiza los campos editoriales de un proyecto (no toca raised_amount). */
export async function updateProjectAction(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const { error } = await ctx.supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese slug ya existe." };
    return { ok: false, error: "No se pudo guardar." };
  }
  revalidateProjects();
  revalidatePath(`/[locale]/admin/proyectos/${id}`, "page");
  return { ok: true };
}

/** Cambia sólo el estado (publicar / archivar / etc.). */
export async function setProjectStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = z.enum(STATUSES).safeParse(status);
  if (!parsed.success) return { ok: false, error: "Estado inválido." };

  const { error } = await ctx.supabase
    .from("projects")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo cambiar el estado." };
  revalidateProjects();
  revalidatePath(`/[locale]/admin/proyectos/${id}`, "page");
  return { ok: true };
}

/** Elimina un proyecto (cascada a traducciones, presupuesto y avances). */
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const { error } = await ctx.supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidateProjects();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Presupuesto
// ---------------------------------------------------------------------------
const budgetSchema = z.object({
  label_es: z.string().trim().min(1).max(200),
  amount: z.number().min(0).max(1_000_000_000),
  sort_order: z.number().int().min(0).max(10000),
});

export async function addBudgetItemAction(
  projectId: string,
  raw: unknown,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = budgetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const { error } = await ctx.supabase
    .from("project_budget_items")
    .insert({ project_id: projectId, ...parsed.data });
  if (error) return { ok: false, error: "No se pudo añadir la partida." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  return { ok: true };
}

export async function deleteBudgetItemAction(
  projectId: string,
  itemId: string,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const { error } = await ctx.supabase
    .from("project_budget_items")
    .delete()
    .eq("id", itemId);
  if (error) return { ok: false, error: "No se pudo eliminar la partida." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Bitácora de avances
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  title_es: z.string().trim().min(1).max(160),
  body_es: z.string().trim().min(1).max(20000),
  publish: z.boolean(),
});

export async function addProjectUpdateAction(
  projectId: string,
  raw: unknown,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const { title_es, body_es, publish } = parsed.data;
  const { error } = await ctx.supabase.from("project_updates").insert({
    project_id: projectId,
    title_es,
    body_es,
    published_at: publish ? new Date().toISOString() : null,
  });
  if (error) return { ok: false, error: "No se pudo publicar el avance." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  return { ok: true };
}

export async function toggleUpdatePublishAction(
  projectId: string,
  updateId: string,
  publish: boolean,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const { error } = await ctx.supabase
    .from("project_updates")
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq("id", updateId);
  if (error) return { ok: false, error: "No se pudo actualizar el avance." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  return { ok: true };
}

export async function deleteProjectUpdateAction(
  projectId: string,
  updateId: string,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const { error } = await ctx.supabase
    .from("project_updates")
    .delete()
    .eq("id", updateId);
  if (error) return { ok: false, error: "No se pudo eliminar el avance." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  return { ok: true };
}
