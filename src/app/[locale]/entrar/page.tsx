import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage(props: {
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
            <SectionHeading title={t("loginTitle")} />
            <div className="mt-10">
              <LoginForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
