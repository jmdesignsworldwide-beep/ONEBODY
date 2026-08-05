import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { DonationForm } from "@/components/donate/donation-form";
import { getCurrentDonor } from "@/lib/donar/current-donor";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Donar" });
  return { title: t("title") };
}

export default async function DonatePage(props: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ amount?: string; recurring?: string }>;
}) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Donar");
  const currentUser = await getCurrentDonor();

  // Preset opcional desde las metas de Transparencia (?amount=1300&recurring=1).
  const parsedAmount = Number(sp.amount);
  const initialAmount =
    Number.isFinite(parsedAmount) && parsedAmount >= 1
      ? Math.min(1_000_000, Math.floor(parsedAmount))
      : undefined;
  const initialRecurring = sp.recurring === "1" || sp.recurring === "true";

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-xl">
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
            <div className="mt-12">
              <DonationForm
                currentUser={currentUser}
                initialAmount={initialAmount}
                initialRecurring={initialRecurring}
              />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
