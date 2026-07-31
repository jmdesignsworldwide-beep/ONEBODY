import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreatedImage } from "@/components/ui/treated-image";
import { GrowthMeter } from "@/components/projects/growth-meter";
import { Reveal } from "@/components/motion/reveal";
import { MobileGoalBar } from "@/components/projects/mobile-goal-bar";
import { ShareMenu } from "@/components/share/share-menu";
import { Link } from "@/i18n/navigation";
import { getProjectDetail } from "@/lib/queries";
import { getOrigin } from "@/lib/site-url";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const detail = await getProjectDetail(slug, locale);
  if (!detail) return { title: "404" };
  const p = detail.project;
  const origin = await getOrigin();
  const title = p.title_es;
  const description =
    p.summary_es || "Un proyecto de la Fundación ONEBODY.";
  // URL absoluta y pública (Instagram/WhatsApp exigen imagen pública y absoluta).
  // Solo aceptamos una portada http(s) absoluta; en cualquier otro caso caemos a
  // la imagen OG por defecto de la marca — nunca una tarjeta rota.
  const image =
    p.cover_image && /^https?:\/\//.test(p.cover_image)
      ? p.cover_image
      : `${origin}/og-default.png`;
  const url = `${origin}/${locale}/proyectos/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale,
      title,
      description,
      url,
      siteName: "ONEBODY",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage(props: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const detail = await getProjectDetail(slug, locale);
  if (!detail) notFound();
  const { project: p, budget, updates, donors } = detail;

  const t = await getTranslations("Projects");
  const tc = await getTranslations("Categories");
  const tShare = await getTranslations("Share");
  const origin = await getOrigin();
  const shareUrl = `${origin}/${locale}/proyectos/${slug}`;
  const shareText = tShare("projectMessage", { title: p.title_es });
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const date = (s: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(s));

  const progress =
    p.goal_amount > 0 ? Math.min(1, p.raised_amount / p.goal_amount) : 0;
  const budgetTotal = budget.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-24 pt-16 md:pb-0">
        {/* Portada a ancho completo con overlay */}
        <div className="relative">
          <TreatedImage
            src={p.cover_image ?? undefined}
            alt={p.title_es}
            aspect="16/9"
            priority
            className="max-h-[70vh] w-full rounded-none"
            sizes="100vw"
          />
          <div className="absolute inset-x-0 bottom-0">
            <Container className="pb-10">
              <Badge tone="solid">{tc(p.category)}</Badge>
              <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,7vw,5rem)] leading-[1.02] text-ob-bone">
                {p.title_es}
              </h1>
              {p.location_name && (
                <p className="mt-3 text-ob-smoke">{p.location_name}</p>
              )}
            </Container>
          </div>
        </div>

        <Container className="grid gap-16 py-16 md:grid-cols-[1.6fr_1fr]">
          {/* Columna principal */}
          <div className="min-w-0">
            <Reveal>
              <p className="text-xl leading-relaxed text-ob-bone/90">
                {p.summary_es}
              </p>
              <div className="mt-8 space-y-4 leading-relaxed text-ob-smoke">
                {p.story_es
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </Reveal>

            {/* Desglose presupuestario — lo que separa una fundación seria */}
            {budget.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="font-display text-2xl text-ob-bone">
                  {t("budgetTitle")}
                </h2>
                <table className="mt-6 w-full border-collapse text-left">
                  <tbody>
                    {budget.map((b) => (
                      <tr key={b.id} className="border-b border-ob-ash/20">
                        <td className="py-3 text-ob-bone">{b.label_es}</td>
                        <td className="tabular py-3 text-right text-ob-smoke">
                          {money(Number(b.amount))}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-ob-ash/40">
                      <td className="py-3 font-medium text-ob-bone">
                        {t("budgetTotal")}
                      </td>
                      <td className="tabular py-3 text-right font-medium text-ob-bone">
                        {money(budgetTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Reveal>
            )}

            {/* Bitácora de avances — línea de tiempo vertical */}
            <Reveal className="mt-14">
              <h2 className="font-display text-2xl text-ob-bone">
                {t("updatesTitle")}
              </h2>
              {updates.length === 0 ? (
                <p className="mt-4 text-ob-smoke">{t("updatesEmpty")}</p>
              ) : (
                <ol className="mt-6 space-y-8 border-l border-ob-ash/30 pl-6">
                  {updates.map((u) => (
                    <li key={u.id} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-[1.72rem] top-1.5 size-2.5 rounded-full bg-ob-bone"
                      />
                      {u.published_at && (
                        <p className="text-xs uppercase tracking-widest text-ob-smoke">
                          {date(u.published_at)}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-xl text-ob-bone">
                        {u.title_es}
                      </h3>
                      <p className="mt-2 leading-relaxed text-ob-smoke">
                        {u.body_es}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Reveal>
          </div>

          {/* Panel lateral: meta de convergencia + donantes */}
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
              <div className="flex items-center justify-center">
                <GrowthMeter
                  progress={progress}
                  className="h-28 w-auto"
                  ariaLabel={`${Math.round(progress * 100)}%`}
                />
              </div>
              <div className="tabular mt-4 text-center">
                <p className="font-display text-3xl text-ob-bone">
                  {money(p.raised_amount)}
                </p>
                <p className="text-ob-smoke">
                  {t("goal")} {money(p.goal_amount)} ·{" "}
                  {Math.round(progress * 100)}%
                </p>
              </div>
              <Button
                href={`/donar/${p.slug}`}
                variant="donate"
                className="mt-6 w-full"
              >
                {t("donateToThis")}
              </Button>
              <div className="mt-3">
                <ShareMenu
                  url={shareUrl}
                  text={shareText}
                  subject={p.title_es}
                  variant="button"
                  className="w-full"
                />
              </div>
            </div>

            {donors.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl text-ob-bone">
                  {t("donorsTitle")}
                </h2>
                <ul className="mt-4 divide-y divide-ob-ash/20">
                  {donors.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span className="truncate text-ob-bone">
                        {d.display_name}
                      </span>
                      <span className="tabular shrink-0 text-ob-smoke">
                        {money(Number(d.amount_usd))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <Link
                href="/proyectos"
                className="text-sm text-ob-smoke underline-offset-4 hover:text-ob-bone hover:underline"
              >
                ← {t("backToProjects")}
              </Link>
            </div>
          </aside>
        </Container>
      </main>

      <MobileGoalBar
        slug={p.slug}
        raised={p.raised_amount}
        goal={p.goal_amount}
        shareUrl={shareUrl}
        shareText={shareText}
        shareSubject={p.title_es}
      />
      <SiteFooter />
    </>
  );
}
