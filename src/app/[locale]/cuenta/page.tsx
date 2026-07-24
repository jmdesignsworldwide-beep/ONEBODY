import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cuenta", robots: { index: false } };

export default async function AccountPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/entrar`);

  // Perfil propio (RLS: el donante lee su propia fila).
  const supabase = await getServerAuthClient();
  const { data: profile } = supabase
    ? await supabase
        .from("donor_profiles")
        .select("display_name, total_donated_usd, donation_count")
        .eq("id", user!.id)
        .maybeSingle()
    : { data: null };

  const displayLocale = await getLocale();
  const money = (n: number) =>
    new Intl.NumberFormat(displayLocale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const name =
    (profile?.display_name as string | null) ||
    (user!.user_metadata?.display_name as string | undefined) ||
    user!.email;

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-3xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Badge>{t("accountTitle")}</Badge>
                <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] text-ob-bone">
                  {t("welcome", { name: name ?? "" })}
                </h1>
              </div>
              <LogoutButton />
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
                  {t("totalDonated")}
                </p>
                <p className="tabular mt-2 font-display text-4xl text-ob-bone">
                  {money(Number(profile?.total_donated_usd ?? 0))}
                </p>
              </div>
              <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
                  {t("donationsCount")}
                </p>
                <p className="tabular mt-2 font-display text-4xl text-ob-bone">
                  {Number(profile?.donation_count ?? 0)}
                </p>
              </div>
            </div>

            <p className="mt-10 text-ob-smoke">{t("portalSoon")}</p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
