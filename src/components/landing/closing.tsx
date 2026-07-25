import { getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ClosingEmblem } from "./closing-emblem";

export async function Closing() {
  const t = await getTranslations("Landing");
  return (
    <Section className="border-t border-ob-ash/20 text-center">
      <Container>
        <ClosingEmblem />
        <Reveal>
          <h2 className="font-display text-[clamp(2.5rem,7vw,5rem)] text-ob-bone">
            {t("closingTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ob-smoke">
            {t("closingBody")}
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="/donar" variant="donate" size="lg">
              {t("closingCta")}
            </Button>
          </div>
          <p className="mt-16 font-display text-lg text-ob-bone/60">
            Diseñados para ser UNO
            <span className="mx-2 text-ob-red">·</span>
            Meant to be ONE
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
