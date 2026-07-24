import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/routing";
import { getPublishedProjects } from "@/lib/queries";

export const revalidate = 3600;

/**
 * Sitemap con alternates por locale (hreflang) para el contenido público:
 * landing, índice de proyectos y cada proyecto publicado (leídos vía RLS).
 * Resiliente si faltan las llaves de Supabase (cae al contenido estático).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const localePath = (locale: string, path: string) =>
    `${siteUrl}/${locale}${path}`;

  const entry = (
    path: string,
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: localePath(defaultLocale, path),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, localePath(locale, path)]),
      ),
    },
  });

  const staticPaths: MetadataRoute.Sitemap = [
    entry("", 1),
    entry("/proyectos", 0.8),
  ];

  let projects: MetadataRoute.Sitemap = [];
  try {
    const list = await getPublishedProjects();
    projects = list.map((p) => entry(`/proyectos/${p.slug}`, 0.7));
  } catch {
    // Sin datos: sólo rutas estáticas.
  }

  return [...staticPaths, ...projects];
}
