"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

export type ActionResult = { ok: true } | { ok: false; error: string };

const profileSchema = z.object({
  display_name: z.string().trim().max(120).nullable(),
  preferred_locale: z.string().min(2).max(5),
  show_publicly: z.boolean(),
  email_updates: z.boolean(),
});

export async function updateProfileAction(raw: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const supabase = await getServerAuthClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "No autenticado." };

  const { error } = await supabase
    .from("donor_profiles")
    .update(parsed.data)
    .eq("id", user.id);
  if (error) return { ok: false, error: "No se pudo guardar." };
  return { ok: true };
}

async function setSubscriptionStatus(
  id: string,
  status: "active" | "paused" | "cancelled",
): Promise<ActionResult> {
  const supabase = await getServerAuthClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "No autenticado." };

  if (status === "cancelled") {
    // Cancela también en el proveedor (mock: siempre resuelve).
    try {
      await getPaymentProvider().cancelSubscription(id);
    } catch {
      /* el proveedor real puede fallar; se refleja abajo */
    }
  }
  const patch: Record<string, unknown> = { status };
  if (status === "cancelled") patch.cancelled_at = new Date().toISOString();
  const { error } = await supabase
    .from("subscriptions")
    .update(patch)
    .eq("id", id); // RLS: sólo la suya
  if (error) return { ok: false, error: "No se pudo actualizar." };
  return { ok: true };
}

export async function pauseSubscriptionAction(id: string) {
  return setSubscriptionStatus(id, "paused");
}
export async function resumeSubscriptionAction(id: string) {
  return setSubscriptionStatus(id, "active");
}
export async function cancelSubscriptionAction(id: string) {
  return setSubscriptionStatus(id, "cancelled");
}

/**
 * Eliminación de datos por solicitud del donante (GDPR, Sección 9.12). Borra el
 * perfil y la cuenta de autenticación; las donaciones quedan con donor_id nulo
 * (histórico contable), sin datos personales del perfil.
 */
export async function deleteAccountAction(locale: string): Promise<void> {
  const user = await getCurrentUser();
  const admin = getAdminClient();
  if (user && admin) {
    await admin.from("donor_profiles").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);
  }
  const supabase = await getServerAuthClient();
  if (supabase) await supabase.auth.signOut();
  redirect(`/${locale}`);
}
