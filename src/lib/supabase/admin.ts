import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role — SOLO SERVIDOR (Sección 9.1). Bypassa RLS;
 * se usa exclusivamente en acciones de servidor de confianza (crear/actualizar
 * donaciones, procesar webhooks). Jamás se importa en el cliente. La clave vive
 * en SUPABASE_SERVICE_ROLE_KEY (marcada Sensitive en Vercel), nunca NEXT_PUBLIC_.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
