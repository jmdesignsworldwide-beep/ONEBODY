import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listAdminProjects } from "@/lib/admin/projects-queries";
import type { ProjectStatus } from "@/lib/supabase/types";

export default async function AdminOverviewPage() {
  const t = await getTranslations("Admin");
  const locale = await getLocale();
  const projects = await listAdminProjects();

  const byStatus = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const totalRaised = projects.reduce((s, p) => s + Number(p.raised_amount), 0);
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalRaised);

  const statuses: ProjectStatus[] = [
    "draft",
    "active",
    "funded",
    "completed",
    "archived",
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ob-bone">{t("navOverview")}</h1>
          <p className="mt-2 text-ob-smoke">{t("overviewSubtitle")}</p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="rounded-full bg-ob-bone px-5 py-2.5 text-sm font-semibold text-ob-black transition-colors hover:bg-ob-white"
        >
          {t("newProject")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
          <p className="text-xs uppercase tracking-widest text-ob-smoke">
            {t("statTotalRaised")}
          </p>
          <p className="tabular mt-2 font-display text-3xl text-ob-bone">{money}</p>
        </div>
        <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
          <p className="text-xs uppercase tracking-widest text-ob-smoke">
            {t("statProjects")}
          </p>
          <p className="tabular mt-2 font-display text-3xl text-ob-bone">
            {projects.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
          <p className="text-xs uppercase tracking-widest text-ob-smoke">
            {t("statActive")}
          </p>
          <p className="tabular mt-2 font-display text-3xl text-ob-bone">
            {byStatus.active ?? 0}
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-ob-bone">{t("byStatus")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {statuses.map((s) => (
            <div
              key={s}
              className="rounded-full border border-ob-ash/40 px-4 py-2 text-sm text-ob-smoke"
            >
              {t(`status_${s}` as "status_draft")}
              <span className="tabular ml-2 text-ob-bone">{byStatus[s] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
