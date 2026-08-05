import { useTranslations } from "next-intl";
import { Wordmark } from "./wordmark";

/**
 * Footer del sitio. Incluye el crédito de estudio obligatorio con tres enlaces
 * funcionales — cero enlaces muertos (Sección 11).
 */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = 2026;

  return (
    <footer className="border-t border-ob-ash/30 bg-ob-black">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          {/* Contacto OFICIAL de la fundación (separado del crédito de estudio). */}
          <div>
            <Wordmark className="h-9 w-auto" />
            <p className="mt-4 max-w-sm text-sm font-medium text-ob-bone">
              Fundación ONE BODY
            </p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-ob-smoke">
              Altos de Virella, Calle 10 #3, Santiago 51000, República Dominicana
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ob-smoke">
              <a
                href="mailto:Fundaciononebody@gmail.com"
                className="underline-offset-4 transition-colors hover:text-ob-bone hover:underline"
              >
                Fundaciononebody@gmail.com
              </a>
              <span aria-hidden className="text-ob-ash">·</span>
              <a
                href="tel:+18098207812"
                className="underline-offset-4 transition-colors hover:text-ob-bone hover:underline"
              >
                1-809-820-7812
              </a>
            </p>
          </div>

          <p className="font-display text-lg text-ob-bone/80">
            Diseñados para ser UNO
            <span className="mx-2 text-ob-red">·</span>
            Meant to be ONE
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-ob-ash/20 pt-8 text-sm text-ob-smoke md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {t("rights")}
          </p>

          {/* Crédito de estudio — Sección 11. Tres enlaces funcionales. */}
          <div className="flex items-center gap-2 text-ob-smoke">
            <span>{t("designedBy")}</span>
            <span aria-hidden className="text-ob-ash">
              ·
            </span>
            <a
              href="mailto:jm.nexus.designs@gmail.com"
              className="underline-offset-4 transition-colors hover:text-ob-bone hover:underline"
            >
              {t("email")}
            </a>
            <a
              href="https://wa.me/18494421919"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-ob-bone hover:underline"
            >
              {t("whatsapp")}
            </a>
            <a
              href="https://instagram.com/jm.nexus.designs"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-ob-bone hover:underline"
            >
              {t("instagram")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
