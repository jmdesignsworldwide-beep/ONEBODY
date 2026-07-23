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
  localePrefix: "as-needed",
  localeDetection: true,
});
