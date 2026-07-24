import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { SignupForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function SignupPage(props: {
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
            <SectionHeading title={t("signupTitle")} description={t("signupSubtitle")} />
            <div className="mt-10">
              <SignupForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
