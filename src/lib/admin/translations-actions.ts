"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminRole, canEdit } from "@/lib/admin/auth";
import { locales } from "@/i18n/routing";

export type ActionResult = { ok: true } | { ok: false; error: string };

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

const translationSchema = z.object({
  locale: z.enum(locales as unknown as [string, ...string[]]),
  title: z.string().trim().max(160).default(""),
  summary: z.string().trim().max(400).default(""),
  story: z.string().trim().max(20000).default(""),
  reviewed: z.boolean(),
});

/**
 * Crea o actualiza la traducción de un proyecto para un locale. Vía cliente SSR
 * autenticado: RLS exige is_editor(). `reviewed` marca la revisión humana
 * (reviewed_by = actor) y desactiva is_machine_translated.
 */
export async function upsertTranslationAction(
  projectId: string,
  raw: unknown,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const parsed = translationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  if (parsed.data.locale === "es")
    return { ok: false, error: "El español es el texto base del proyecto." };

  const { locale, title, summary, story, reviewed } = parsed.data;
  const { error } = await ctx.supabase.from("project_translations").upsert(
    {
      project_id: projectId,
      locale,
      title,
      summary,
      story,
      is_machine_translated: !reviewed,
      reviewed_by: reviewed ? ctx.user.id : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id,locale" },
  );
  if (error) return { ok: false, error: "No se pudo guardar la traducción." };

  revalidatePath(`/[locale]/admin/proyectos/${projectId}/traducciones`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  revalidatePath("/[locale]/proyectos/[slug]", "page");
  return { ok: true };
}

/** Elimina la traducción de un locale (vuelve a caer al español en público). */
export async function deleteTranslationAction(
  projectId: string,
  locale: string,
): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const { error } = await ctx.supabase
    .from("project_translations")
    .delete()
    .eq("project_id", projectId)
    .eq("locale", locale);
  if (error) return { ok: false, error: "No se pudo eliminar la traducción." };
  revalidatePath(`/[locale]/admin/proyectos/${projectId}/traducciones`, "page");
  revalidatePath("/[locale]/proyectos", "page");
  revalidatePath("/[locale]/proyectos/[slug]", "page");
  return { ok: true };
}
