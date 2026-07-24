import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Detección automática de locale por Accept-Language con fallback a `es`
// y persistencia en cookie (Sección 3). El middleware de auth admin se
// añade en la Tanda 10.
export default createMiddleware(routing);

export const config = {
  // Matchea la raíz explícitamente y todo lo demás excepto API, assets
  // internos y archivos con extensión. Sin el `/` explícito, la raíz no
  // se enruta al locale por defecto y devuelve 404.
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
