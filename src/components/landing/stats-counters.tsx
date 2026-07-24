"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { PublicStats } from "@/lib/supabase/types";

function useCountUp(target: number, active: boolean, instant: boolean) {
  const [value, setValue] = useState(instant ? target : 0);
  useEffect(() => {
    if (!active) return;
    if (instant) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const dur = 1100;
    function tick(t: number) {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, instant]);
  return value;
}

function Stat({
  value,
  label,
  format,
  active,
  instant,
}: {
  value: number;
  label: string;
  format: (n: number) => string;
  active: boolean;
  instant: boolean;
}) {
  const v = useCountUp(value, active, instant);
  return (
    <div className="flex flex-col gap-2">
      <span className="tabular font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-ob-bone">
        {format(v)}
      </span>
      <span className="text-sm uppercase tracking-[0.15em] text-ob-smoke">
        {label}
      </span>
    </div>
  );
}

export function StatsCounters({ stats }: { stats: PublicStats }) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const num = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4"
    >
      <Stat value={stats.total_raised_usd} label={t("labelRaised")} format={money} active={inView} instant={reduce} />
      <Stat value={stats.donation_count} label={t("labelDonations")} format={num} active={inView} instant={reduce} />
      <Stat value={stats.donor_count} label={t("labelDonors")} format={num} active={inView} instant={reduce} />
      <Stat value={stats.country_count} label={t("labelCountries")} format={num} active={inView} instant={reduce} />
    </div>
  );
}
