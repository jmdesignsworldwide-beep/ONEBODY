"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminRole } from "@/lib/admin/auth";
import { getOrigin } from "@/lib/site-url";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { safeLocale } from "@/i18n/routing";
import { hasDonationClaim } from "@/lib/donar/claim";
import { ensureProfile, linkDonationsByEmail } from "@/lib/auth/link";
import { isOAuthProvider, type OAuthProvider } from "@/lib/auth/oauth";
import { ensureSubscriptionForDonation } from "@/lib/payments/subscriptions";

const emailSchema = z.string().trim().toLowerCase().email().max(200);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres.").max(200);
const uuidSchema = z.string().uuid();

export type AuthResult = { ok: true } | { ok: false; error: string };


export async function signInAction(
  email: string,
  password: string,
  locale: string,
): Promise<AuthResult> {
  const rl = rateLimit(clientKey(await headers(), "signin"), 10, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };
  locale = safeLocale(locale);

  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: "Correo inválido." };

  const supabase = await getServerAuthClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible." };
  const { data, error } = await supabase.auth.signInWithPassword({
    email: e.data,
    password,
  });
  if (error) return { ok: false, error: "Correo o contraseña incorrectos." };
  // Email probado (contraseña sobre cuenta confirmada): es seguro enlazar aquí
  // las donaciones de invitado que quedaron sin enlazar antes de confirmar.
  let dest = "cuenta";
  if (data.user) {
    await linkDonationsByEmail(data.user.id, e.data);
    // Fuente de verdad ÚNICA: el rol se lee de admin_users server-side (con
    // service_role), nunca se infiere del dominio del email. Los administradores
    // van directo al panel; el resto, al portal de donante. El bloqueo de /admin
    // para no-admins sigue viviendo en admin/layout.tsx (independiente de esto).
    const role = await getAdminRole(data.user);
    if (role) dest = "admin";
  }
  redirect(`/${locale}/${dest}`);
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
  locale = safeLocale(locale);

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
    // Siempre creamos el perfil; pero SÓLO enlazamos donaciones por email si hay
    // sesión activa (email ya probado). Si falta confirmación, el enlace se hará
    // al iniciar sesión — así no se roban donaciones de otra persona.
    await ensureProfile(data.user.id, name, locale);
    if (data.session) await linkDonationsByEmail(data.user.id, e.data);
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
  locale = safeLocale(locale);
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
  redirect(`/${safeLocale(locale)}`);
}

/**
 * Inicio de sesión / registro con un proveedor social (Google, Apple, Facebook).
 * No pide contraseña: Supabase Auth arranca el flujo OAuth (PKCE) y devuelve la
 * URL del proveedor; redirigimos allí. Al volver, `/[locale]/auth/callback`
 * canjea el código por una sesión y enruta admin vs. donante.
 *
 * Seguridad: el `redirectTo` se ancla al origen real del sitio (getOrigin) y
 * debe estar en la allowlist de "Redirect URLs" de Supabase. Las credenciales
 * (Client ID/Secret) de cada proveedor viven sólo en el dashboard de Supabase.
 */
export async function signInWithOAuthAction(
  provider: string,
  locale: string,
): Promise<{ ok: false; error: string }> {
  const rl = rateLimit(clientKey(await headers(), "oauth"), 12, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };
  locale = safeLocale(locale);

  if (!isOAuthProvider(provider)) {
    return { ok: false, error: "Proveedor no soportado." };
  }
  const p: OAuthProvider = provider;

  const supabase = await getServerAuthClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible." };
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: p,
    options: {
      redirectTo: `${origin}/${locale}/auth/callback`,
    },
  });
  if (error || !data?.url) {
    // Suele significar que el proveedor aún no está habilitado en Supabase.
    return {
      ok: false,
      error: "Este método aún no está disponible. Intenta con tu correo.",
    };
  }
  redirect(data.url);
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
  locale = safeLocale(locale);
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Contraseña inválida." };
  const idCheck = uuidSchema.safeParse(donationId);
  if (!idCheck.success) return { ok: false, error: "Donación inválida." };

  // Prueba de propiedad: sólo el navegador que hizo la donación puede convertir.
  // Cierra el secuestro de cuenta por URL de /gracias filtrada o id ajeno.
  if (!(await hasDonationClaim(idCheck.data))) {
    return { ok: false, error: "No pudimos verificar que esta donación es tuya." };
  }

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "Servicio no disponible." };

  const { data: donation } = await admin
    .from("donations")
    .select("donor_email, donor_name")
    .eq("id", idCheck.data)
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
  // Perfil + enlace SÓLO de la donación probada por sesión (no todas las del
  // email): evita arrastrar donaciones ajenas si el email no fuera del titular.
  await ensureProfile(created.user.id, name, locale);
  await admin
    .from("donations")
    .update({ donor_id: created.user.id })
    .eq("id", idCheck.data)
    .is("donor_id", null);
  // Si esa donación era recurrente, ahora que tiene cuenta se materializa su
  // suscripción (idempotente; no hace nada si no aplica).
  await ensureSubscriptionForDonation(idCheck.data);

  const supabase = await getServerAuthClient();
  if (supabase) {
    await supabase.auth.signInWithPassword({ email, password });
  }
  redirect(`/${locale}/cuenta`);
}
