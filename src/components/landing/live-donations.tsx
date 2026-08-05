"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { WallEntry } from "@/lib/supabase/types";

/**
 * Notificaciones flotantes de donación en vivo (estilo Shein). Prioriza
 * donaciones REALES (realtime de `public_wall`, sólo columnas públicas — nunca
 * email ni datos sensibles); cuando hay pocas, rota ejemplos para que nunca se
 * vea muerto. Una a la vez, con pausas. La X cierra por lo que resta de la
 * sesión (estado en memoria, no localStorage). Respeta prefers-reduced-motion.
 */

// Estado de sesión en memoria: si el usuario cierra, no vuelve a mostrarse.
let dismissedSession = false;

type Notif = { name: string | null; amount: number; project: string | null };

// Ejemplos del cliente (NO tocan la tabla real ni los totales). Nombres
// reconocibles + anónimos (name null → "Alguien"), montos y proyectos variados.
const EXAMPLES: Notif[] = [
  { name: "Elena V.", amount: 50, project: "Una casa para la familia Reyes" },
  { name: "Sofía L.", amount: 25, project: "Desayunos en el hospital infantil" },
  { name: "Kenji T.", amount: 100, project: "Clases de inglés gratuitas" },
  { name: "Luca R.", amount: 250, project: "Medicinas para quien lo necesita" },
  { name: "Hans B.", amount: 500, project: "Fondos de proyectos" },
  { name: "Familia Peralta", amount: 75, project: "Desayunos en las calles" },
  { name: "Wei Z.", amount: 1000, project: "Viviendas para familias vulnerables" },
  { name: "Marie D.", amount: 40, project: "Apoyo a adolescentes embarazadas" },
  { name: "Ana Gómez", amount: 60, project: null },
  { name: null, amount: 30, project: "Gastos operativos del mes" },
  { name: null, amount: 200, project: "Donaciones en comunidades" },
];

function toNotif(e: WallEntry): Notif {
  return { name: e.display_name, amount: Number(e.amount_usd), project: e.project_title };
}

export function LiveDonations({ initial }: { initial: WallEntry[] }) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState<Notif | null>(null);
  const [dismissed, setDismissed] = useState(dismissedSession);

  // Cola de donaciones reales con prioridad (semilla + inserciones realtime).
  const realQueue = useRef<Notif[]>(initial.map(toNotif));
  const lastExample = useRef<number>(-1);

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  // Realtime: cada donación real entra a la cola con prioridad. `public_wall`
  // sólo expone columnas públicas seguras.
  useEffect(() => {
    if (dismissed) return;
    const supabase = getBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel("live_donations_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_wall" },
        (payload) => {
          realQueue.current.unshift(toNotif(payload.new as WallEntry));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dismissed]);

  // Rotación: mostrar una, esperar ~4.5s, ocultar, pausa ~3–6s, siguiente.
  useEffect(() => {
    if (dismissed) return;
    let mounted = true;
    let tShow: ReturnType<typeof setTimeout>;
    let tGap: ReturnType<typeof setTimeout>;

    function pick(): Notif {
      if (realQueue.current.length) return realQueue.current.shift() as Notif;
      let i = Math.floor(Math.random() * EXAMPLES.length);
      if (i === lastExample.current) i = (i + 1) % EXAMPLES.length;
      lastExample.current = i;
      return EXAMPLES[i] as Notif;
    }

    function cycle() {
      if (!mounted) return;
      setCurrent(pick());
      tShow = setTimeout(() => {
        if (!mounted) return;
        setCurrent(null);
        tGap = setTimeout(cycle, 3000 + Math.random() * 3000);
      }, 4500);
    }

    tGap = setTimeout(cycle, 1600);
    return () => {
      mounted = false;
      clearTimeout(tShow);
      clearTimeout(tGap);
    };
  }, [dismissed]);

  function close() {
    dismissedSession = true;
    setDismissed(true);
    setCurrent(null);
  }

  if (dismissed) return null;

  const enter = reduce ? { opacity: 0 } : { opacity: 0, y: 24 };
  const exit = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 w-[min(320px,calc(100vw-2rem))]">
      <AnimatePresence>
        {current && (
          <motion.div
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            exit={exit}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative rounded-2xl border border-ob-ash bg-ob-white/95 p-4 pr-9 shadow-[0_12px_40px_-12px_rgba(20,16,12,0.28)] backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={close}
              aria-label={t("liveClose")}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-ob-smoke transition-colors hover:bg-ob-sand hover:text-ob-bone"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="text-sm leading-snug text-ob-bone">
              {t("liveNotif", {
                name: current.name ?? t("someone"),
                amount: money(current.amount),
              })}
            </p>
            {current.project && (
              <p className="mt-1 truncate text-xs text-ob-smoke">
                {current.project}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
