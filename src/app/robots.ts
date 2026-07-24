import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zonas privadas: portal de donante y admin nunca se indexan.
      disallow: ["/admin", "/cuenta"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
