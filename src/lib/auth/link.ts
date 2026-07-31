import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

/** Crea/actualiza el perfil de donante (idempotente). */
export async function ensureProfile(
  userId: string,
  name: string,
  locale: string,
) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin
    .from("donor_profiles")
    .upsert(
      { id: userId, display_name: name || null, preferred_locale: locale },
      { onConflict: "id" },
    );
}

/**
 * Enlaza donaciones de invitado con este email → recomputa totales (trigger).
 * SÓLO debe llamarse cuando la propiedad del email está probada:
 *  - inicio de sesión con contraseña sobre una cuenta confirmada,
 *  - alta con sesión activa,
 *  - o inicio de sesión con un proveedor OAuth (Google/Apple/Facebook) que
 *    entrega un email verificado.
 * Nunca antes de confirmar el email: evita el robo de donaciones de una víctima.
 */
export async function linkDonationsByEmail(userId: string, email: string) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin
    .from("donations")
    .update({ donor_id: userId })
    .eq("donor_email", email.toLowerCase())
    .is("donor_id", null);
}
