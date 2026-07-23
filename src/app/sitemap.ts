import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/routing";

/**
 * Sitemap con alternates por locale (hreflang) para el contenido público ya
 * existente. Conforme se construyan proyectos/impacto/etc. (tandas siguientes)
 * se añaden aquí sus rutas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // `as-needed`: el locale por defecto va sin prefijo.
  const localePath = (locale: string, path: string) =>
    locale === defaultLocale ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`;

  const publicPaths = [""]; // landing; se ampliará por tanda

  return publicPaths.map((path) => ({
    url: localePath(defaultLocale, path),
    lastModified: new Date("2026-07-23"),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, localePath(locale, path)]),
      ),
    },
  }));
}
