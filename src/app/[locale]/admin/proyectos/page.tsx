import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listAdminProjects } from "@/lib/admin/projects-queries";
import { AdminEmptyState } from "@/components/admin/empty-state";

const statusTone: Record<string, string> = {
  draft: "text-ob-smoke",
  active: "text-ob-red",
  funded: "text-ob-bone",
  completed: "text-ob-bone",
  archived: "text-ob-smoke",
};

export default async function AdminProjectsPage() {
  const t = await getTranslations("Admin");
  const tc = await getTranslations("Categories");
  const locale = await getLocale();
  const projects = await listAdminProjects();

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ob-bone">{t("navProjects")}</h1>
        <Link
          href="/admin/proyectos/nuevo"
          className="rounded-full bg-ob-bone px-5 py-2.5 text-sm font-semibold text-ob-black transition-colors hover:opacity-90"
        >
          {t("newProject")}
        </Link>
      </div>

      {projects.length === 0 ? (
        <AdminEmptyState
          title={t("noProjects")}
          ctaLabel={t("newProject")}
          ctaHref="/admin/proyectos/nuevo"
        />
      ) : (
        <ul className="mt-8 divide-y divide-ob-ash/30 overflow-hidden rounded-[var(--radius-ob)] border border-ob-ash/40">
          {projects.map((p) => {
            const pct =
              Number(p.goal_amount) > 0
                ? Math.round(
                    (Number(p.raised_amount) / Number(p.goal_amount)) * 100,
                  )
                : 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/proyectos/${p.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-ob-graphite px-5 py-4 transition-colors hover:bg-ob-ash/20"
                >
                  <span
                    className={`w-20 shrink-0 text-xs uppercase tracking-widest ${statusTone[p.status] ?? "text-ob-smoke"}`}
                  >
                    {t(`status_${p.status}` as "status_draft")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ob-bone">
                      {p.title_es}
                    </span>
                    <span className="block truncate text-xs text-ob-smoke">
                      /{p.slug} · {tc(p.category)}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-right text-sm text-ob-bone">
                    {money(Number(p.raised_amount))}
                    <span className="ml-2 text-ob-smoke">{pct}%</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
