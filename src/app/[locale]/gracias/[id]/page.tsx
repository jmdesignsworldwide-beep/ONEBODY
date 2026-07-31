import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { NodeMark } from "@/components/motion/node-mark";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server-auth";
import { getOrigin } from "@/lib/site-url";
import { ConvertForm } from "@/components/auth/forms";
import { ShareInline } from "@/components/share/share-inline";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gracias",
  robots: { index: false, follow: false },
};

export default async function ThanksPage(props: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Donar");
  const ta = await getTranslations("Auth");
  const tShare = await getTranslations("Share");
  const tImpact = await getTranslations("Landing");
  const user = await getCurrentUser();

  const supabase = getAdminClient();
  const { data: donation } = supabase
    ? await supabase
        .from("donations")
        .select("id, amount_usd, status, project_id, is_recurring")
        .eq("id", id)
        .maybeSingle()
    : { data: null };
  if (!donation) notFound();
  const recurring = Boolean(donation.is_recurring);

  let projectTitle: string | null = null;
  let projectSlug: string | null = null;
  if (donation.project_id && supabase) {
    const { data: proj } = await supabase
      .from("projects")
      .select("title_es, slug")
      .eq("id", donation.project_id)
      .maybeSingle();
    projectTitle = (proj?.title_es as string | undefined) ?? null;
    projectSlug = (proj?.slug as string | undefined) ?? null;
  }

  // Enlace absoluto para compartir la donación (o el sitio si no hubo proyecto).
  const origin = await getOrigin();
  const shareUrl = projectSlug
    ? `${origin}/${locale}/proyectos/${projectSlug}`
    : `${origin}/${locale}`;
  const shareText = projectTitle
    ? tShare("donateMessage", { title: projectTitle })
    : tShare("subtitle");

  const amount = Number(donation.amount_usd);
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
  const status = donation.status as string;
  const impact =
    amount >= 250
      ? tImpact("impact250")
      : amount >= 100
        ? tImpact("impact100")
        : amount >= 50
          ? tImpact("impact50")
          : tImpact("impact25");

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-16">
        <Section>
          <Container className="max-w-xl text-center">
            {status === "completed" ? (
              <>
                <div className="flex justify-center">
                  <NodeMark className="h-20 w-20 text-ob-bone" />
                </div>
                <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4rem)] text-ob-bone">
                  {t("thanksTitle")}
                </h1>
                <p className="mt-4 text-lg text-ob-smoke">
                  {t("thanksBody", { amount: money })}
                </p>
                {projectTitle && (
                  <p className="mt-2 text-ob-bone">{projectTitle}</p>
                )}
                <p className="mx-auto mt-6 max-w-md text-ob-smoke">
                  {money} · {recurring ? t("summaryMonthly") : t("summaryOnce")}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-ob-smoke">
                  {impact}
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Button href="/proyectos" variant="secondary">
                    {t("thanksProjects")}
                  </Button>
                  <a
                    href={`/${locale}/cuenta/recibo/${donation.id}`}
                    className="inline-flex items-center rounded-full border border-ob-ash px-6 py-3 text-sm font-medium text-ob-bone transition-colors hover:border-ob-bone"
                  >
                    {t("receiptCta")}
                  </a>
                </div>

                {/* Comparte tu donación — el multiplicador (efecto GoFundMe). */}
                <div className="mt-12 rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-carbon p-6 text-left">
                  <h2 className="text-center font-display text-xl text-ob-bone">
                    {tShare("donateHeading")}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-center text-sm text-ob-smoke">
                    {tShare("donateBody")}
                  </p>
                  <div className="mx-auto mt-5 max-w-sm">
                    <ShareInline
                      url={shareUrl}
                      text={shareText}
                      subject={projectTitle ?? "ONEBODY"}
                    />
                  </div>
                </div>

                {/* Conversión de un clic: el email ya está capturado. */}
                {!user && (
                  <div className="mt-14 rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-carbon p-6">
                    <p className="font-display text-xl text-ob-bone">
                      {ta("convertTitle")}
                    </p>
                    <p className="mt-2 text-sm text-ob-smoke">
                      {ta("convertBody")}
                    </p>
                    <ConvertForm donationId={donation.id as string} />
                  </div>
                )}
              </>
            ) : status === "failed" ? (
              <>
                <h1 className="font-display text-4xl text-ob-bone">
                  {t("failedTitle")}
                </h1>
                <p className="mt-4 text-ob-smoke">{t("failedBody")}</p>
                <div className="mt-8 flex justify-center">
                  <Button href="/donar" variant="donate">
                    {t("failedRetry")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl text-ob-bone">
                  {t("pendingTitle")}
                </h1>
                <p className="mt-4 text-ob-smoke">{t("pendingBody")}</p>
              </>
            )}
            <p className="mt-16 font-display text-lg text-ob-bone/60">
              Diseñados para ser UNO
              <span className="mx-2 text-ob-red">·</span>
              Meant to be ONE
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
