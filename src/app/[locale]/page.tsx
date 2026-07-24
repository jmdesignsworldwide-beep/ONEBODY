import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { NumbersSection } from "@/components/landing/numbers-section";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactTiers } from "@/components/landing/impact-tiers";
import { DonorWall } from "@/components/landing/donor-wall";
import { Closing } from "@/components/landing/closing";
import {
  getPublicStats,
  getFeaturedProjects,
  getWallEntries,
} from "@/lib/queries";

// Revalida los datos públicos cada 60s (ISR); el muro se actualiza en vivo
// vía realtime en el cliente.
export const revalidate = 60;

export default async function LandingPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [stats, projects, wall] = await Promise.all([
    getPublicStats(),
    getFeaturedProjects(locale),
    getWallEntries(12),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <NumbersSection stats={stats} />
        <FeaturedProjects projects={projects} />
        <HowItWorks />
        <ImpactTiers />
        <DonorWall initial={wall} />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
