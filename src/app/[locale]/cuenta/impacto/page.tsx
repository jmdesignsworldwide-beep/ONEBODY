import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMySupportedProjects } from "@/lib/account-queries";
import { GrowthMark } from "@/components/motion/growth-mark";
import type { ProjectCategory } from "@/lib/supabase/types";

export default async function ImpactPage() {
  const t = await getTranslations("Account");
  const tc = await getTranslations("Categories");
  const locale = await getLocale();
  const projects = await getMySupportedProjects();

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div>
      <h1 className="font-display text-3xl text-ob-bone">{t("navImpact")}</h1>
      <p className="mt-2 text-ob-smoke">{t("impactSubtitle")}</p>

      {projects.length === 0 ? (
        <p className="mt-8 text-ob-smoke">{t("impactEmpty")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {projects.map((p) => {
            const progress =
              Number(p.goal_amount) > 0
                ? Math.min(1, Number(p.raised_amount) / Number(p.goal_amount))
                : 0;
            return (
              <Link
                key={p.id as string}
                href={`/proyectos/${p.slug}`}
                className="group flex items-center gap-5 rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-5 transition-colors hover:border-ob-ash"
              >
                <GrowthMark className="h-7 w-7 shrink-0 text-ob-bone/70" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-ob-smoke">
                    {tc(p.category as ProjectCategory)}
                  </p>
                  <h2 className="mt-1 truncate font-display text-xl text-ob-bone">
                    {p.title_es as string}
                  </h2>
                  {p.location_name && (
                    <p className="truncate text-sm text-ob-smoke">
                      {p.location_name as string}
                    </p>
                  )}
                  <p className="tabular mt-1 text-sm text-ob-bone">
                    {money(Number(p.raised_amount))} · {Math.round(progress * 100)}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
