import "server-only";
import { getCurrentUser } from "@/lib/supabase/server-auth";

/**
 * Identidad del donante con sesión para prellenar el formulario (un paso menos).
 * Devuelve null si es invitado. La donación SIEMPRE se valida y vincula de nuevo
 * server-side con la identidad de la sesión (no se confía en estos valores del
 * cliente); esto es solo para la UI.
 */
export async function getCurrentDonor(): Promise<{
  name: string;
  email: string;
} | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  const name =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";
  return { name, email: user.email };
}
