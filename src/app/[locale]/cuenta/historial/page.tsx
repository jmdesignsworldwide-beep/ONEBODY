import { getLocale, getTranslations } from "next-intl/server";
import { getMyDonations } from "@/lib/account-queries";
import { getServerAuthClient } from "@/lib/supabase/server-auth";

export default async function HistoryPage() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const donations = await getMyDonations();

  // Títulos de los proyectos referenciados (RLS: proyectos públicos).
  const ids = Array.from(
    new Set(donations.map((d) => d.project_id).filter(Boolean) as string[]),
  );
  const titles = new Map<string, string>();
  if (ids.length) {
    const supabase = await getServerAuthClient();
    const { data } = supabase
      ? await supabase.from("projects").select("id, title_es").in("id", ids)
      : { data: null };
    (data ?? []).forEach((p) =>
      titles.set(p.id as string, p.title_es as string),
    );
  }

  const money = (n: number, c: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: c || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const date = (s: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(s));

  const statusLabel: Record<string, string> = {
    completed: t("statusCompleted"),
    pending: t("statusPending"),
    failed: t("statusFailed"),
    refunded: t("statusRefunded"),
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-ob-bone">{t("navHistory")}</h1>
      {donations.length === 0 ? (
        <p className="mt-8 text-ob-smoke">{t("historyEmpty")}</p>
      ) : (
        <div className="mt-8 divide-y divide-ob-ash/20 border-t border-ob-ash/20">
          {donations.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="tabular text-ob-bone">
                  {money(Number(d.amount_usd), d.currency)}
                  {d.is_recurring && (
                    <span className="ml-2 text-xs text-ob-smoke">
                      {t("recurring")}
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-ob-smoke">
                  {d.project_id
                    ? (titles.get(d.project_id) ?? "—")
                    : t("generalFund")}{" "}
                  · {date(d.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest text-ob-smoke">
                  {statusLabel[d.status] ?? d.status}
                </span>
                {d.status === "completed" && (
                  <a
                    href={`/${locale}/cuenta/recibo/${d.id}`}
                    className="rounded-full border border-ob-ash px-4 py-1.5 text-sm text-ob-bone transition-colors hover:border-ob-bone"
                  >
                    {t("receipt")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
