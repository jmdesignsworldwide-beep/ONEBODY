import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
} from "./lib/supabase/config";

// Detección de locale por Accept-Language con fallback a `es` + refresco de la
// sesión de Supabase por cookies. next-intl produce la respuesta (routing por
// locale) y Supabase escribe las cookies de sesión refrescadas sobre ella.
const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  if (isSupabaseConfigured) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    // Refresca la sesión (no confiar en getSession en middleware).
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Excluye API, internos de Next/Vercel, los iconos generados por convención
  // (icon, apple-icon, opengraph-image) y cualquier archivo con extensión.
  matcher: [
    "/",
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};
