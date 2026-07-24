"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { getOrigin } from "@/lib/site-url";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const emailSchema = z.string().trim().toLowerCase().email().max(200);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres.").max(200);

export type AuthResult = { ok: true } | { ok: false; error: string };

/** Crea el perfil de donante y enlaza donaciones de invitado por email. */
async function linkDonor(userId: string, email: string, name: string, locale: string) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin
    .from("donor_profiles")
    .upsert(
      { id: userId, display_name: name || null, preferred_locale: locale },
      { onConflict: "id" },
    );
  // Enlaza donaciones de invitado con este email → recomputa totales (trigger).
  await admin
    .from("donations")
    .update({ donor_id: userId })
    .eq("donor_email", email)
    .is("donor_id", null);
}

export async function signInAction(
  email: string,
  password: string,
  locale: string,
): Promise<AuthResult> {
  const rl = rateLimit(clientKey(await headers(), "signin"), 10, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };

  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: "Correo inválido." };

  const supabase = await getServerAuthClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible." };
  const { error } = await supabase.auth.signInWithPassword({
    email: e.data,
    password,
  });
  if (error) return { ok: false, error: "Correo o contraseña incorrectos." };
  redirect(`/${locale}/cuenta`);
}

export type SignUpResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string };

export async function signUpAction(
  email: string,
  password: string,
  name: string,
  locale: string,
): Promise<SignUpResult> {
  const rl = rateLimit(clientKey(await headers(), "signup"), 6, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };

  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: "Correo inválido." };
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Contraseña inválida." };

  const supabase = await getServerAuthClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible." };
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: e.data,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${origin}/${locale}/cuenta`,
    },
  });
  if (error) {
    return { ok: false, error: "No se pudo crear la cuenta. ¿Ya existe?" };
  }
  if (data.user) {
    await linkDonor(data.user.id, e.data, name, locale);
  }
  if (data.session) {
    redirect(`/${locale}/cuenta`);
  }
  return { ok: true, needsConfirmation: true };
}

export async function requestResetAction(
  email: string,
  locale: string,
): Promise<AuthResult> {
  const rl = rateLimit(clientKey(await headers(), "reset"), 5, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };
  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: "Correo inválido." };

  const supabase = await getServerAuthClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible." };
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(e.data, {
    redirectTo: `${origin}/${locale}/cuenta`,
  });
  // Respuesta idéntica exista o no la cuenta (no filtrar existencia).
  return { ok: true };
}

export async function signOutAction(locale: string): Promise<void> {
  const supabase = await getServerAuthClient();
  if (supabase) await supabase.auth.signOut();
  redirect(`/${locale}`);
}

/**
 * Conversión post-donación de un clic (Sección 5.3): el email ya está capturado,
 * sólo falta la contraseña. Crea la cuenta auto-confirmada (service_role),
 * enlaza sus donaciones e inicia sesión.
 */
export async function createAccountFromDonationAction(
  donationId: string,
  password: string,
  locale: string,
): Promise<AuthResult> {
  const rl = rateLimit(clientKey(await headers(), "convert"), 6, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Contraseña inválida." };

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Servicio no disponible." };

  const { data: donation } = await admin
    .from("donations")
    .select("donor_email, donor_name")
    .eq("id", donationId)
    .maybeSingle();
  if (!donation?.donor_email) {
    return { ok: false, error: "No encontramos el correo de la donación." };
  }
  const email = String(donation.donor_email).toLowerCase();
  const name = (donation.donor_name as string | null) ?? "";

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });
  if (error || !created.user) {
    return { ok: false, error: "No se pudo crear la cuenta. ¿Ya existe?" };
  }
  await linkDonor(created.user.id, email, name, locale);

  const supabase = await getServerAuthClient();
  if (supabase) {
    await supabase.auth.signInWithPassword({ email, password });
  }
  redirect(`/${locale}/cuenta`);
}
