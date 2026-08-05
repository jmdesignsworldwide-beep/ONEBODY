import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listDonations } from "@/lib/admin/data-queries";
import { RefundButton } from "@/components/admin/refund-button";
import { AdminEmptyState } from "@/components/admin/empty-state";
import type { DonationStatus } from "@/lib/supabase/types";

const STATUSES: DonationStatus[] = [
  "pending",
  "completed",
  "failed",
  "refunded",
];

const statusTone: Record<string, string> = {
  pending: "text-ob-smoke",
  completed: "text-ob-bone",
  failed: "text-ob-smoke",
  refunded: "text-ob-red",
};

export default async function AdminDonationsPage(props: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await props.searchParams;
  const t = await getTranslations("Admin");
  const locale = await getLocale();

  const status = STATUSES.includes(sp.status as DonationStatus)
    ? (sp.status as DonationStatus)
    : undefined;
  const page = Number.parseInt(sp.page ?? "0", 10) || 0;
  const { rows, hasMore } = await listDonations({ status, page });

  const money = (n: number, ccy: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: ccy || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const date = (s: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(s),
    );

  const filterHref = (s?: DonationStatus) =>
    s ? `/admin/donaciones?status=${s}` : "/admin/donaciones";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ob-bone">{t("navDonations")}</h1>
        <a
          href={`/${locale}/admin/donaciones/export${status ? `?status=${status}` : ""}`}
          className="rounded-full border border-ob-ash px-5 py-2.5 text-sm text-ob-bone transition-colors hover:border-ob-bone"
        >
          {t("exportCsv")}
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={filterHref()}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!status ? "border-ob-bone text-ob-bone" : "border-ob-ash/50 text-ob-smoke hover:text-ob-bone"}`}
        >
          {t("filterAll")}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={filterHref(s)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${status === s ? "border-ob-bone text-ob-bone" : "border-ob-ash/50 text-ob-smoke hover:text-ob-bone"}`}
          >
            {t(`donStatus_${s}` as "donStatus_completed")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState title={t("noDonations")} />
      ) : (
        <>
        {/* Móvil (390px): tarjetas apiladas — operable con el pulgar, sin scroll lateral. */}
        <ul className="mt-6 space-y-3 sm:hidden">
          {rows.map((d) => (
            <li
              key={d.id}
              className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-ob-bone">
                    {d.is_anonymous ? t("anonymous") : d.donor_name || t("noName")}
                  </p>
                  {d.donor_email && (
                    <p className="truncate text-xs text-ob-smoke">{d.donor_email}</p>
                  )}
                </div>
                <p className="tabular shrink-0 whitespace-nowrap text-right text-ob-bone">
                  {money(Number(d.amount), d.currency)}
                  {d.is_recurring && <span className="ml-1 text-xs text-ob-smoke">↻</span>}
                </p>
              </div>
              <p className="mt-2 truncate text-sm text-ob-smoke">
                {d.project_title ?? t("generalFund")}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-ob-smoke">
                  {date(d.created_at)}
                  <span className="mx-1.5 text-ob-ash">·</span>
                  <span
                    className={`uppercase tracking-widest ${statusTone[d.status] ?? "text-ob-smoke"}`}
                  >
                    {t(`donStatus_${d.status}` as "donStatus_completed")}
                  </span>
                </span>
                {d.status === "completed" && <RefundButton id={d.id} />}
              </div>
            </li>
          ))}
        </ul>

        {/* Escritorio: tabla completa. */}
        <div className="mt-6 hidden overflow-x-auto rounded-[var(--radius-ob)] border border-ob-ash/40 sm:block">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-ob-ash/30 text-left text-xs uppercase tracking-widest text-ob-smoke">
                <th className="px-4 py-3 font-normal">{t("colDate")}</th>
                <th className="px-4 py-3 font-normal">{t("colDonor")}</th>
                <th className="px-4 py-3 font-normal">{t("colProject")}</th>
                <th className="px-4 py-3 text-right font-normal">{t("colAmount")}</th>
                <th className="px-4 py-3 font-normal">{t("colStatus")}</th>
                <th className="px-4 py-3 text-right font-normal">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ob-ash/20">
              {rows.map((d) => (
                <tr key={d.id} className="bg-ob-graphite">
                  <td className="whitespace-nowrap px-4 py-3 text-ob-smoke">
                    {date(d.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-ob-bone">
                      {d.is_anonymous
                        ? t("anonymous")
                        : d.donor_name || t("noName")}
                    </span>
                    {d.donor_email && (
                      <span className="block text-xs text-ob-smoke">
                        {d.donor_email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ob-smoke">
                    {d.project_title ?? t("generalFund")}
                  </td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-right text-ob-bone">
                    {money(Number(d.amount), d.currency)}
                    {d.is_recurring && (
                      <span className="ml-1 text-xs text-ob-smoke">↻</span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-xs uppercase tracking-widest ${statusTone[d.status] ?? "text-ob-smoke"}`}
                  >
                    {t(`donStatus_${d.status}` as "donStatus_completed")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status === "completed" && <RefundButton id={d.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {(page > 0 || hasMore) && (
        <div className="mt-6 flex items-center justify-between">
          {page > 0 ? (
            <Link
              href={`/admin/donaciones?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
            >
              ← {t("prev")}
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              href={`/admin/donaciones?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
            >
              {t("next")} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
