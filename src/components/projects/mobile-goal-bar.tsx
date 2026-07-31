"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShareMenu } from "@/components/share/share-menu";

/**
 * Barra de meta fija en móvil (Sección 5.2): recaudado/meta + compartir + CTA de
 * donación siempre visibles al hacer scroll. Oculta en desktop (el panel lateral
 * cumple esa función). Compartir vive junto a donar: es el motor de crecimiento.
 */
export function MobileGoalBar({
  slug,
  raised,
  goal,
  shareUrl,
  shareText,
  shareSubject,
}: {
  slug: string;
  raised: number;
  goal: number;
  shareUrl: string;
  shareText: string;
  shareSubject: string;
}) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ob-ash/40 bg-ob-black/90 backdrop-blur-md md:hidden">
      <div className="h-0.5 w-full bg-ob-graphite">
        <div className="h-full bg-ob-red" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div className="tabular text-sm">
          <span className="text-ob-bone">{money(raised)}</span>
          <span className="text-ob-smoke">
            {" "}
            / {money(goal)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShareMenu
            url={shareUrl}
            text={shareText}
            subject={shareSubject}
            variant="icon"
            className="!bg-ob-graphite !text-ob-bone"
          />
          <Link
            href={`/donar/${slug}`}
            className="rounded-full bg-ob-red px-5 py-2 text-sm font-semibold text-ob-white shadow-[0_0_20px_var(--color-ob-red-glow)]"
          >
            {t("donateToThis")}
          </Link>
        </div>
      </div>
    </div>
  );
}
