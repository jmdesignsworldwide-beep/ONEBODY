import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { MockCheckout } from "@/components/donate/mock-checkout";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function MockCheckoutPage(props: {
  params: Promise<{ locale: Locale; session: string }>;
}) {
  const { locale, session } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Donar");

  // El id de sesión mock es `mock_cs_<donationId>`.
  const donationId = session.startsWith("mock_cs_")
    ? session.slice("mock_cs_".length)
    : session;

  const supabase = getAdminClient();
  const { data: donation } = supabase
    ? await supabase
        .from("donations")
        .select("id, amount_usd, status, project_id")
        .eq("id", donationId)
        .maybeSingle()
    : { data: null };

  if (!donation) notFound();
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(donation.amount_usd));

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-md text-center">
            <Badge>{t("mockBadge")}</Badge>
            <h1 className="mt-6 font-display text-4xl text-ob-bone">
              {t("mockTitle")}
            </h1>
            <p className="mt-3 text-ob-smoke">{t("mockBody")}</p>
            <p className="tabular mt-8 font-display text-5xl text-ob-bone">
              {money}
            </p>
            <div className="mt-10">
              <MockCheckout donationId={donation.id as string} />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
