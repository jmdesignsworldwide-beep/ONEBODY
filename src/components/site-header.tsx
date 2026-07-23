import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./wordmark";

/**
 * Header del sitio. Navegación monocroma; el único rojo es el CTA de donación
 * (Sección 2.2 — disciplina del rojo). El selector de idioma completo llega en
 * la Tanda 3; aquí un conmutador base ES/EN demuestra el routing por locale.
 */
export function SiteHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const other = locale === "es" ? "en" : "es";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ob-ash/30 bg-ob-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl tracking-tight">
          <Wordmark />
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-8 text-sm text-ob-smoke md:flex"
        >
          <Link href="/proyectos" className="transition-colors hover:text-ob-bone">
            {t("projects")}
          </Link>
          <Link href="/nosotros" className="transition-colors hover:text-ob-bone">
            {t("about")}
          </Link>
          <Link href="/impacto" className="transition-colors hover:text-ob-bone">
            {t("impact")}
          </Link>
          <Link
            href="/transparencia"
            className="transition-colors hover:text-ob-bone"
          >
            {t("transparency")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            locale={other}
            className="text-xs font-medium uppercase tracking-widest text-ob-smoke transition-colors hover:text-ob-bone"
            aria-label={`Cambiar idioma a ${other === "en" ? "English" : "Español"}`}
          >
            {other}
          </Link>
          <Link
            href="/donar"
            className="rounded-full bg-ob-red px-5 py-2 text-sm font-semibold text-ob-white shadow-[0_0_20px_var(--color-ob-red-glow)] transition-colors hover:bg-ob-red-deep"
          >
            {t("donate")}
          </Link>
        </div>
      </div>
    </header>
  );
}
