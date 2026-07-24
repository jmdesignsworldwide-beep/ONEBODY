import { getLocale, getTranslations } from "next-intl/server";
import { getAnalytics } from "@/lib/admin/analytics-queries";
import { BarList, AreaChart } from "@/components/admin/charts";
import type { ProjectCategory } from "@/lib/supabase/types";

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
      <p className="text-xs uppercase tracking-widest text-ob-smoke">{label}</p>
      <p className="tabular mt-2 font-display text-3xl text-ob-bone">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
      <h2 className="mb-4 font-display text-lg text-ob-bone">{title}</h2>
      {children}
    </div>
  );
}

export default async function AnalyticsPage() {
  const t = await getTranslations("Admin");
  const tc = await getTranslations("Categories");
  const locale = await getLocale();
  const a = await getAnalytics();

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const num = (n: number) => new Intl.NumberFormat(locale).format(n);
  const pct = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(n);

  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  const countryLabel = (code: string) => {
    try {
      return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
      return code;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ob-bone">{t("navAnalytics")}</h1>
        <p className="mt-2 text-ob-smoke">{t("analyticsSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("statTotalRaised")} value={money(a.totalRaised)} />
        <Stat label={t("anDonations")} value={num(a.donationCount)} />
        <Stat label={t("anAvgGift")} value={money(a.avgGift)} />
        <Stat label={t("anRecurring")} value={pct(a.recurringShare)} />
      </div>

      <Panel title={t("anRaisedByDay")}>
        <AreaChart points={a.raisedByDay} format={money} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("anByCategory")}>
          <BarList
            points={a.byCategory}
            format={money}
            labelFor={(c) => tc(c as ProjectCategory)}
          />
        </Panel>
        <Panel title={t("anByCountry")}>
          <BarList points={a.byCountry} format={money} labelFor={countryLabel} />
        </Panel>
      </div>

      <div>
        <h2 className="font-display text-xl text-ob-bone">{t("anTraffic")}</h2>
        <p className="mt-1 text-sm text-ob-smoke">{t("anTrafficNote")}</p>
      </div>

      {!a.hasTraffic ? (
        <p className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6 text-ob-smoke">
          {t("anNoTraffic")}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label={t("anPageviews")} value={num(a.pageviews)} />
            <Stat label={t("anSessions")} value={num(a.sessions)} />
            <Stat label={t("anConversion")} value={pct(a.conversion)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title={t("anTopPaths")}>
              <BarList points={a.topPaths} format={num} />
            </Panel>
            <Panel title={t("anTrafficByCountry")}>
              <BarList
                points={a.trafficByCountry}
                format={num}
                labelFor={countryLabel}
              />
            </Panel>
          </div>
          <Panel title={t("anByLocale")}>
            <BarList points={a.trafficByLocale} format={num} />
          </Panel>
        </>
      )}
    </div>
  );
}
