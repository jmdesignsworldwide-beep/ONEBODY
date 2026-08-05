"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { PublicStats, WallEntry } from "@/lib/supabase/types";

/**
 * Contador que sube de forma suave. Al activarse cuenta de 0 al valor; cuando el
 * objetivo cambia en vivo (entra una donación real), anima desde el valor actual
 * al nuevo — sin reiniciar desde 0.
 */
function useCountUp(target: number, active: boolean, instant: boolean) {
  const [value, setValue] = useState(instant ? target : 0);
  const fromRef = useRef(instant ? target : 0);
  useEffect(() => {
    if (!active) return;
    if (instant) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    let start = 0;
    const dur = from === 0 ? 1100 : 700;
    function tick(t: number) {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      setValue(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
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
  live,
}: {
  value: number;
  label: string;
  format: (n: number) => string;
  active: boolean;
  instant: boolean;
  /** Cambia cada vez que una donación real actualiza esta cifra → destello. */
  live: number;
}) {
  const v = useCountUp(value, active, instant);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span
        key={live}
        className={
          "tabular truncate font-display text-[clamp(1.9rem,5.2vw,4rem)] leading-none text-ob-bone" +
          (live > 0 ? " ob-liveflash" : "")
        }
      >
        {format(v)}
      </span>
      <span className="text-xs uppercase tracking-[0.15em] text-ob-smoke sm:text-sm">
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

  // Cifras vivas: parten de las del servidor y suben cuando entra una donación
  // real (realtime de `public_wall`, sólo datos públicos).
  const [raised, setRaised] = useState(stats.total_raised_usd);
  const [donations, setDonations] = useState(stats.donation_count);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel("live_stats_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_wall" },
        (payload) => {
          const row = payload.new as WallEntry;
          setRaised((r) => r + Number(row.amount_usd || 0));
          setDonations((d) => d + 1);
          setBump((b) => b + 1);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(n);
  const num = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);

  const flash = reduce ? 0 : bump;

  return (
    <div ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
      <Stat value={raised} label={t("labelRaised")} format={money} active={inView} instant={reduce} live={flash} />
      <Stat value={donations} label={t("labelDonations")} format={num} active={inView} instant={reduce} live={flash} />
      <Stat value={stats.donor_count} label={t("labelDonors")} format={num} active={inView} instant={reduce} live={0} />
      <Stat value={stats.country_count} label={t("labelCountries")} format={num} active={inView} instant={reduce} live={0} />
    </div>
  );
}
