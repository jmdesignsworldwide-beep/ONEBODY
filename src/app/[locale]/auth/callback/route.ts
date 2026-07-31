import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { getAdminRole } from "@/lib/admin/auth";
import { ensureProfile, linkDonationsByEmail } from "@/lib/auth/link";
import { safeLocale } from "@/i18n/routing";

/**
 * Callback de OAuth (Google / Apple / Facebook).
 *
 * El proveedor redirige aquí con un `code`. Lo canjeamos por una sesión (PKCE)
 * y sembramos las cookies de sesión sobre la respuesta. Como el proveedor
 * entrega un email verificado, es seguro enlazar las donaciones de invitado de
 * ese email (misma garantía que el inicio de sesión con contraseña).
 *
 * Enrutado: la fuente de verdad del rol es `admin_users` leída server-side
 * (getAdminRole con service_role) — nunca se infiere del email. Admin → /admin;
 * el resto → /cuenta. El bloqueo de /admin para no-admins vive, además, en
 * admin/layout.tsx (defensa en profundidad).
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ locale: string }> },
) {
  const { locale: rawLocale } = await ctx.params;
  const locale = safeLocale(rawLocale);
  const origin = request.nextUrl.origin;

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/${locale}/entrar?error=${reason}`, origin));

  // El proveedor devolvió un error (p. ej. el usuario canceló el consentimiento).
  if (providerError) return fail("oauth_cancelled");
  if (!code) return fail("oauth");

  const supabase = await getServerAuthClient();
  if (!supabase) return fail("oauth");

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return fail("oauth");

  const user = data.user;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.display_name as string | undefined) ??
    "";

  await ensureProfile(user.id, name, locale);
  // Email verificado por el proveedor: enlazar donaciones de invitado es seguro.
  if (user.email) await linkDonationsByEmail(user.id, user.email);

  const role = await getAdminRole(user);
  const dest = role ? "admin" : "cuenta";
  return NextResponse.redirect(new URL(`/${locale}/${dest}`, origin));
}
