import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { DonationForm } from "@/components/donate/donation-form";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Donar" });
  return { title: t("title") };
}

export default async function DonatePage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Donar");

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-xl">
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
            <div className="mt-12">
              <DonationForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
