import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { getPublishedProjects } from "@/lib/queries";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return { title: t("indexTitle") };
}

export default async function ProjectsIndexPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const projects = await getPublishedProjects();

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow={t("indexEyebrow")}
                title={t("indexTitle")}
                description={t("indexSubtitle")}
              />
            </Reveal>

            {projects.length === 0 ? (
              <p className="mt-12 text-lg text-ob-smoke">{t("empty")}</p>
            ) : (
              <Stagger
                className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                gap={0.08}
              >
                {projects.map((p, i) => (
                  <StaggerItem key={p.id}>
                    <ProjectCard project={p} priority={i < 3} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
