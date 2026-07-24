import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { ResetForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Recuperar", robots: { index: false } };

export default async function RecoverPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-sm">
            <SectionHeading title={t("resetTitle")} description={t("resetSubtitle")} />
            <div className="mt-10">
              <ResetForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
