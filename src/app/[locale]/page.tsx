import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { Hero } from "@/components/hero";
import { WorldScene } from "@/components/landing/world-scene";
import { NumbersSection } from "@/components/landing/numbers-section";
import { SeedScene } from "@/components/landing/seed-scene";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactTiers } from "@/components/landing/impact-tiers";
import { LiveDonations } from "@/components/landing/live-donations";
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
      <ScrollProgress />
      <SiteHeader />
      <main id="main">
        <Hero />
        <WorldScene />
        <NumbersSection stats={stats} />
        <SeedScene />
        <FeaturedProjects projects={projects} />
        <HowItWorks />
        <ImpactTiers />
        <Closing />
      </main>
      <SiteFooter />
      {/* Notificaciones flotantes de donación en vivo (reemplazan el muro). */}
      <LiveDonations initial={wall} />
    </>
  );
}
