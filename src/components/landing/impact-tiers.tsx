import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { GrowthMark } from "@/components/motion/growth-mark";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Impacto por monto: cifras concretas, no abstractas (Sección 5.1). Cada una
 * con CTA directo al flujo de donación con el monto preseleccionado.
 */
export async function ImpactTiers() {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const tiers = [
    { amount: 25, text: t("impact25") },
    { amount: 50, text: t("impact50") },
    { amount: 100, text: t("impact100") },
    { amount: 250, text: t("impact250") },
  ];

  return (
    <Section className="border-t border-ob-ash/20">
      <Container>
        <Reveal>
          <SectionHeading
            mark={<GrowthMark className="h-7 w-7 text-ob-bone/70" />}
            title={t("impactTitle")}
          />
        </Reveal>
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
          {tiers.map((tier) => (
            <StaggerItem key={tier.amount}>
              <Link
                href={`/donar?monto=${tier.amount}`}
                className="group block h-full"
              >
                <Card interactive className="flex h-full flex-col">
                  <span className="tabular font-display text-4xl text-ob-red">
                    {money(tier.amount)}
                  </span>
                  <p className="mt-3 flex-1 text-ob-bone">{tier.text}</p>
                  <span className="mt-6 text-sm font-medium text-ob-smoke transition-colors group-hover:text-ob-bone">
                    {t("closingCta")} →
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
