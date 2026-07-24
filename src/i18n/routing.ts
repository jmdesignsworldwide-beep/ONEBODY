import { defineRouting } from "next-intl/routing";

/**
 * Los 15 locales de ONEBODY (Sección 3).
 * `es` es la fuente de verdad y el default. Los archivos de mensajes completos
 * para los 15 idiomas y la detección/selección se completan en la Tanda 3.
 * La arquitectura de routing por locale se establece desde la Fundación para
 * evitar reestructuración posterior.
 */
export const locales = [
  "es",
  "en",
  "fr",
  "ht",
  "pt",
  "it",
  "de",
  "nl",
  "zh",
  "ar",
  "ja",
  "ko",
  "ru",
  "hi",
  "pl",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

/** Locales que requieren layout RTL. */
export const rtlLocales: readonly Locale[] = ["ar"];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // `always`: cada ruta lleva prefijo de locale y la raíz `/` REDIRIGE al
  // idioma detectado. Es la configuración robusta en el edge de Vercel —
  // evita el 404 de la raíz sin idioma que produce `as-needed` con render
  // estático. Todas las páginas viven en `/{locale}/...` (rutas reales).
  localePrefix: "always",
  localeDetection: true,
});
