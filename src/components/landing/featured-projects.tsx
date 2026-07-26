import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreatedImage } from "@/components/ui/treated-image";
import { GrowthMark } from "@/components/motion/growth-mark";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { FeaturedProject } from "@/lib/supabase/types";

export async function FeaturedProjects({
  projects,
}: {
  projects: FeaturedProject[];
}) {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Section className="border-t border-ob-ash/20">
      <Container>
        <Reveal>
          <SectionHeading
            title={t("projectsTitle")}
            description={t("projectsBody")}
          />
        </Reveal>

        {projects.length === 0 ? (
          <p className="mt-12 text-lg text-ob-smoke">{t("projectsEmpty")}</p>
        ) : (
          <Stagger className="mt-14 grid gap-8 md:grid-cols-3" gap={0.09}>
            {projects.map((p) => {
              return (
                <StaggerItem key={p.id}>
                  <Link
                    href={`/proyectos/${p.slug}`}
                    className="group block"
                    aria-label={p.title_es}
                  >
                    <div className="relative">
                      <TreatedImage
                        src={p.cover_image ?? undefined}
                        alt={p.title_es}
                        aspect="4/5"
                      />
                      <div className="absolute left-4 top-4">
                        <Badge tone="solid">{p.category}</Badge>
                      </div>
                    </div>
                    <h3 className="mt-5 font-display text-2xl text-ob-bone">
                      {p.title_es}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-ob-smoke">
                      {p.summary_es}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <GrowthMark className="h-6 w-6 shrink-0 text-ob-bone/70" />
                      <div className="tabular text-sm">
                        <p className="text-ob-bone">{money(p.raised_amount)}</p>
                        <p className="text-ob-smoke">
                          {t("goalLabel")} {money(p.goal_amount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        <Reveal className="mt-14">
          <Button href="/proyectos" variant="secondary">
            {t("projectsLink")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
