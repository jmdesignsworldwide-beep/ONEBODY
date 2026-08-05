import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Transparency" });
  return { title: t("title"), description: t("lead") };
}

export default async function TransparencyPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Transparency");

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  // Metas donables reales — conectadas al flujo de donación (recurrente).
  const goals = [
    { title: t("opsTitle"), body: t("opsBody"), amount: 1300, cta: t("opsCta") },
    { title: t("fundsTitle"), body: t("fundsBody"), amount: 1500, cta: t("fundsCta") },
  ];

  const pillars = [
    { t: t("pillar1t"), b: t("pillar1b") },
    { t: t("pillar2t"), b: t("pillar2b") },
    { t: t("pillar3t"), b: t("pillar3b") },
  ];
  const flow = [t("flow1"), t("flow2"), t("flow3"), t("flow4")];
  const faq = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
  ];

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

        {/* Metas donables reales — el corazón de la transparencia */}
        <Section className="py-16">
          <Container>
            <SectionHeading eyebrow={t("goalsEyebrow")} title={t("goalsTitle")} />
            <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {goals.map((g) => (
                <StaggerItem key={g.title} className="min-w-0">
                  <div className="ob-lift flex h-full flex-col rounded-[var(--radius-ob)] border border-ob-ash bg-ob-graphite p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <span className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
                      {t("monthlyBadge")}
                    </span>
                    <div className="tabular mt-2">
                      <span className="font-display text-[clamp(2.5rem,6vw,3.5rem)] leading-none text-ob-bone">
                        {money(g.amount)}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl text-ob-bone">
                      {g.title}
                    </h3>
                    <p className="mt-3 flex-1 leading-relaxed text-ob-smoke">
                      {g.body}
                    </p>
                    <div className="mt-8">
                      <Button
                        href={`/donar?amount=${g.amount}&recurring=1`}
                        variant="donate"
                        size="lg"
                        className="w-full"
                      >
                        {g.cta}
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>

        {/* Mirando hacia adelante */}
        <Section className="bg-ob-sand py-24">
          <Container className="max-w-3xl">
            <SectionHeading title={t("aheadTitle")} />
            <p className="mt-6 text-lg leading-relaxed text-ob-bone/90">
              {t("aheadBody")}
            </p>
            <p className="mt-8 font-display text-2xl italic text-ob-bone/70">
              {t("aheadClosing")}
            </p>
          </Container>
        </Section>

        {/* Pilares */}
        <Section className="py-16">
          <Container>
            <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pillars.map((p) => (
                <StaggerItem key={p.t} className="min-w-0">
                  <div className="h-full rounded-[var(--radius-ob)] border border-ob-ash bg-ob-graphite p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <h3 className="font-display text-2xl text-ob-bone">{p.t}</h3>
                    <p className="mt-3 leading-relaxed text-ob-smoke">{p.b}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>

        {/* Flujo del dinero */}
        <Section className="bg-ob-sand py-24">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow={t("flowEyebrow")} title={t("flowTitle")} />
            <ol className="mt-10 space-y-6">
              {flow.map((step, i) => (
                <li key={step} className="flex gap-5">
                  <span className="tabular flex size-9 shrink-0 items-center justify-center rounded-full border border-ob-ash text-sm font-semibold text-ob-bone">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-lg leading-relaxed text-ob-bone/90">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        {/* Preguntas frecuentes */}
        <Section className="py-24">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
            <div className="mt-10 divide-y divide-ob-ash">
              {faq.map((item) => (
                <div key={item.q} className="py-6">
                  <h3 className="font-display text-xl text-ob-bone">{item.q}</h3>
                  <p className="mt-2 leading-relaxed text-ob-smoke">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
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
