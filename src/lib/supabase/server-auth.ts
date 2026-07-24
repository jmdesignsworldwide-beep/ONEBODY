import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./config";

/**
 * Cliente Supabase con sesión por cookies (SSR) para Server Components y server
 * actions. La sesión se refresca en el middleware; aquí el `setAll` puede fallar
 * en Server Components (no pueden escribir cookies) — se ignora sin romper.
 */
export async function getServerAuthClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component: el refresco lo hace el middleware.
        }
      },
    },
  });
}

/** Usuario autenticado actual (o null). Seguro en Server Components. */
export async function getCurrentUser() {
  const supabase = await getServerAuthClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
