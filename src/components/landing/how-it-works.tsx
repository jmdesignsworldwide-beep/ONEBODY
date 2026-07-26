import { getTranslations } from "next-intl/server";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export async function HowItWorks() {
  const t = await getTranslations("Landing");
  const steps = [
    { t: t("how1t"), b: t("how1b") },
    { t: t("how2t"), b: t("how2b") },
    { t: t("how3t"), b: t("how3b") },
  ];
  return (
    <Section className="border-t border-ob-ash/20 bg-ob-carbon">
      <Container>
        <Reveal>
          <SectionHeading title={t("howTitle")} align="center" />
        </Reveal>
        <Stagger className="mt-16 grid gap-10 md:grid-cols-3" gap={0.1}>
          {steps.map((s, i) => (
            <StaggerItem key={s.t}>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center">
                  <span className="tabular font-display text-3xl text-ob-bone/30">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl text-ob-bone">{s.t}</h3>
                <p className="mt-2 max-w-xs text-ob-smoke">{s.b}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
