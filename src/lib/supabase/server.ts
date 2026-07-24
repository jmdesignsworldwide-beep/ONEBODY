import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./config";

/**
 * Cliente Supabase para lecturas públicas en Server Components (clave anon,
 * RLS aplica). Sin sesión: sólo accede a lo que las políticas exponen al
 * público. Devuelve null si las llaves no están configuradas, para que los
 * llamadores caigan a estados vacíos.
 */
export function getPublicServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
