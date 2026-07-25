import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumbersSection } from "@/components/landing/numbers-section";
import { ImpactTiers } from "@/components/landing/impact-tiers";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { DonorWall } from "@/components/landing/donor-wall";
import { Reveal } from "@/components/motion/reveal";
import {
  getPublicStats,
  getFeaturedProjects,
  getWallEntries,
} from "@/lib/queries";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Impact" });
  return { title: t("title"), description: t("lead") };
}

export default async function ImpactPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Impact");

  const [stats, projects, wall] = await Promise.all([
    getPublicStats(),
    getFeaturedProjects(locale),
    getWallEntries(12),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section className="pb-4">
          <Container className="max-w-3xl">
            <Reveal>
              <div className="flex flex-col gap-6">
                <Badge>{t("badge")}</Badge>
                <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] text-ob-bone">
                  {t("title")}
                </h1>
                <p className="text-lg leading-relaxed text-ob-smoke">
                  {t("lead")}
                </p>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* Cifras reales */}
        <NumbersSection stats={stats} />

        {/* Impacto por monto */}
        <ImpactTiers />

        {/* Proyectos que avanzan */}
        {projects.length > 0 && <FeaturedProjects projects={projects} />}

        {/* Muro de donantes en vivo */}
        <DonorWall initial={wall} />

        {/* Cierre */}
        <Section className="py-24">
          <Container className="max-w-2xl text-center">
            <SectionHeading
              title={t("ctaTitle")}
              description={t("ctaBody")}
              align="center"
            />
            <div className="mt-10">
              <Button href="/donar" variant="donate" size="lg">
                {t("cta")}
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
