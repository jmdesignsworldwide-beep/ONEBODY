import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/supabase/server-auth";
import { getMyProfile, getMySupportedProjects } from "@/lib/account-queries";

export default async function DashboardPage() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const user = await getCurrentUser();
  const [profile, supported] = await Promise.all([
    getMyProfile(),
    getMySupportedProjects(),
  ]);

  const name =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email ||
    "";
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const since = profile?.first_donation_at ?? profile?.created_at ?? null;
  const months = since
    ? Math.max(
        0,
        Math.round(
          (Date.parse(new Date().toISOString()) - Date.parse(since)) /
            (30 * 24 * 3600 * 1000),
        ),
      )
    : 0;

  const count = profile?.donation_count ?? 0;
  const total = Number(profile?.total_donated_usd ?? 0);
  const badges = [
    count >= 1 && t("badgeFirst"),
    count >= 3 && t("badgeSustainer"),
    total >= 100 && t("badgeBuilder"),
    supported.length >= 3 && t("badgeConnector"),
  ].filter(Boolean) as string[];

  const stats = [
    { label: t("statTotal"), value: money(total) },
    { label: t("statDonations"), value: String(count) },
    { label: t("statProjects"), value: String(supported.length) },
    { label: t("statMonths"), value: String(months) },
  ];

  return (
    <div>
      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ob-bone">
        {t("welcome", { name })}
      </h1>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-5"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-ob-smoke">
              {s.label}
            </p>
            <p className="tabular mt-2 font-display text-3xl text-ob-bone">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {badges.length > 0 && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
            {t("badgesTitle")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-ob-ash bg-ob-carbon px-4 py-1.5 text-sm text-ob-bone"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
