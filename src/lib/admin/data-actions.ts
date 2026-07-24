"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminRole, canEdit } from "@/lib/admin/auth";
import { getPaymentProvider } from "@/lib/payments";

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

/**
 * Reembolsa una donación completada. Vía cliente SSR autenticado: RLS exige
 * is_editor() y el trigger de auditoría registra al actor. Al pasar a
 * 'refunded', los triggers recalculan lo recaudado del proyecto y los totales
 * del donante (sólo cuentan 'completed'). Intenta también el reembolso en el
 * proveedor (mock: siempre resuelve).
 */
export async function refundDonationAction(id: string): Promise<ActionResult> {
  const ctx = await requireEditorClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { data: donation } = await ctx.supabase
    .from("donations")
    .select("id, status, provider_ref")
    .eq("id", id)
    .maybeSingle();
  if (!donation) return { ok: false, error: "Donación no encontrada." };
  if (donation.status !== "completed")
    return { ok: false, error: "Sólo se reembolsan donaciones completadas." };

  try {
    if (donation.provider_ref)
      await getPaymentProvider().refund(donation.provider_ref);
  } catch {
    // El proveedor real puede fallar; el estado se refleja abajo de todos modos.
  }

  const { error } = await ctx.supabase
    .from("donations")
    .update({ status: "refunded" })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo reembolsar." };

  revalidatePath("/[locale]/admin/donaciones", "page");
  return { ok: true };
}
