"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { WallEntry } from "@/lib/supabase/types";

/**
 * Muro de donantes en tiempo real (Sección 5.1). Suscripción realtime de
 * Supabase: cuando entra una donación, aparece arriba y el nodo late — sin
 * recarga. Respeta el anonimato (el nombre ya viene resuelto de `public_wall`).
 */
export function DonorWall({ initial }: { initial: WallEntry[] }) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [entries, setEntries] = useState<WallEntry[]>(initial);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel("public_wall_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_wall" },
        (payload) => {
          const row = payload.new as WallEntry;
          setEntries((prev) => {
            if (prev.some((e) => e.id === row.id)) return prev;
            return [row, ...prev].slice(0, 12);
          });
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
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Section className="border-t border-ob-ash/20 bg-ob-carbon">
      <Container>
        <SectionHeading eyebrow={t("wallEyebrow")} title={t("wallTitle")} />

        <div className="mt-12 divide-y divide-ob-ash/20 border-t border-ob-ash/20">
          {entries.length === 0 ? (
            <p className="py-8 text-lg text-ob-smoke">{t("wallEmpty")}</p>
          ) : (
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-ob-bone">
                      <span className="font-medium">{e.display_name}</span>{" "}
                      <span className="text-ob-smoke">{t("gave")}</span>{" "}
                      <span className="tabular text-ob-bone">
                        {money(e.amount_usd)}
                      </span>
                    </p>
                    {e.project_title && (
                      <p className="truncate text-sm text-ob-smoke">
                        {e.project_title}
                      </p>
                    )}
                  </div>
                  {e.country_code && (
                    <span className="shrink-0 text-xs uppercase tracking-widest text-ob-ash">
                      {e.country_code}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Container>
    </Section>
  );
}
