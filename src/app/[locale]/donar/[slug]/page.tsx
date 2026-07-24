import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { DonationForm } from "@/components/donate/donation-form";
import { getProjectDetail } from "@/lib/queries";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const t = await getTranslations({ locale, namespace: "Donar" });
  const detail = await getProjectDetail(slug, locale);
  return { title: `${t("title")} · ${detail?.project.title_es ?? ""}` };
}

export default async function DonateProjectPage(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const detail = await getProjectDetail(slug, locale);
  if (!detail) notFound();
  const t = await getTranslations("Donar");

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-xl">
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
            <div className="mt-12">
              <DonationForm
                projectId={detail.project.id}
                projectTitle={detail.project.title_es}
              />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
