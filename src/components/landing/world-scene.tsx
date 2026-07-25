"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Container, Section } from "@/components/ui/layout";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";

// El globo se carga diferido, fuera del bundle crítico (el único momento pesado).
const GlobeScene = dynamic(
  () => import("./globe-scene").then((m) => m.GlobeScene),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto aspect-square w-full max-w-[520px]" aria-hidden />
    ),
  },
);

/** Escena 2 — El mundo: ONEBODY alcanzando hacia afuera; Santiago late. */
export function WorldScene() {
  const t = useTranslations("Landing");
  return (
    <Section className="overflow-hidden">
      <Container className="grid items-center gap-10 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <Reveal y={8}>
            <span className="text-xs uppercase tracking-[0.25em] text-ob-smoke">
              {t("worldEyebrow")}
            </span>
          </Reveal>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] text-ob-bone">
            <RevealHeading delay={0.1}>{t("worldTitle")}</RevealHeading>
          </h2>
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ob-smoke">
              {t("worldBody")}
            </p>
          </Reveal>
        </div>
        <div className="order-1 mx-auto aspect-square w-full max-w-[520px] md:order-2">
          <GlobeScene ariaLabel={t("worldTitle")} />
        </div>
      </Container>
    </Section>
  );
}
