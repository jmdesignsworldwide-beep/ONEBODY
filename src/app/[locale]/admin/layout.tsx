import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminRole } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/entrar`);
  const role = await getAdminRole(user);
  if (!role) redirect(`/${locale}/cuenta`);
  const t = await getTranslations("Admin");

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section className="pb-24">
          <Container className="max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge>{t("panel")}</Badge>
                <span className="text-xs uppercase tracking-widest text-ob-smoke">
                  {t(`role_${role}` as "role_editor")}
                </span>
              </div>
              <LogoutButton />
            </div>
            <div className="mt-8">
              <AdminNav />
            </div>
            <div className="mt-10">{props.children}</div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
