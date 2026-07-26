import { getTranslations } from "next-intl/server";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Reveal } from "@/components/motion/reveal";
import { StatsCounters } from "./stats-counters";
import type { PublicStats } from "@/lib/supabase/types";

export async function NumbersSection({ stats }: { stats: PublicStats }) {
  const t = await getTranslations("Landing");
  return (
    <Section className="border-t border-ob-ash/20">
      <Container>
        <Reveal>
          <SectionHeading
            title={t("numbersTitle")}
            description={t("numbersSub")}
          />
        </Reveal>
        <div className="mt-14">
          <StatsCounters stats={stats} />
        </div>
      </Container>
    </Section>
  );
}
