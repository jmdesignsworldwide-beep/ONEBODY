import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { PortalNav } from "@/components/account/portal-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/entrar`);
  const t = await getTranslations("Account");

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section className="pb-24">
          <Container className="max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <Badge>{t("portal")}</Badge>
              <LogoutButton />
            </div>
            <div className="mt-8">
              <PortalNav />
            </div>
            <div className="mt-10">{props.children}</div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
