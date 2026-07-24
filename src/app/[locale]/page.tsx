import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";

export default async function LandingPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <LandingContent />;
}

function LandingContent() {
  const t = useTranslations("Foundation");

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />

        {/* Nota de estado de la Fundación. La secuencia narrativa completa
            (contadores, proyectos, muro de donantes) llega en la Tanda 6. */}
        <section className="border-t border-ob-ash/20 bg-ob-carbon">
          <div className="mx-auto max-w-4xl px-6 py-28 text-center">
            <span className="inline-block rounded-full border border-ob-ash px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-ob-smoke">
              {t("badge")}
            </span>
            <h2 className="mt-8 font-display text-[clamp(2rem,5vw,3.25rem)] text-ob-bone">
              {t("heading")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ob-smoke">
              {t("body")}
            </p>
            <p className="mt-12 font-display text-xl text-ob-bone/70">
              {t("tagline")}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
