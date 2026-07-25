import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConvergenceCanvas } from "@/components/convergence/convergence-canvas";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("title"), description: t("lead") };
}

export default async function AboutPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const tf = await getTranslations("Foundation");

  const values = [
    { t: t("value1t"), b: t("value1b") },
    { t: t("value2t"), b: t("value2b") },
    { t: t("value3t"), b: t("value3b") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        {/* Intro */}
        <Section className="pb-8">
          <Container className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="flex flex-col gap-6">
                <Badge>{tf("badge")}</Badge>
                <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] text-ob-bone">
                  {t("title")}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-ob-smoke">
                  {t("lead")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex justify-center">
                <ConvergenceCanvas
                  variant="hero"
                  progress={0.82}
                  ariaLabel={t("title")}
                />
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* Misión */}
        <Section className="py-16">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow={t("missionEyebrow")} title={t("missionTitle")} />
            <p className="mt-6 text-xl leading-relaxed text-ob-bone/90">
              {t("missionBody")}
            </p>
          </Container>
        </Section>

        {/* Valores */}
        <Section className="bg-ob-sand py-24">
          <Container>
            <SectionHeading
              eyebrow={t("valuesEyebrow")}
              title={t("valuesTitle")}
              align="center"
            />
            <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
              {values.map((v) => (
                <StaggerItem key={v.t}>
                  <div className="h-full rounded-[var(--radius-ob)] border border-ob-ash bg-ob-graphite p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="mb-5">
                      <ConvergenceCanvas
                        variant="inline"
                        progress={1}
                        ariaLabel=""
                      />
                    </div>
                    <h3 className="font-display text-2xl text-ob-bone">{v.t}</h3>
                    <p className="mt-3 leading-relaxed text-ob-smoke">{v.b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>

        {/* Dónde */}
        <Section className="py-24">
          <Container className="max-w-3xl text-center">
            <SectionHeading
              eyebrow={t("whereEyebrow")}
              title={t("whereTitle")}
              description={t("whereBody")}
              align="center"
            />
            <p className="mt-10 font-display text-2xl italic text-ob-red">
              {tf("tagline")}
            </p>
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
