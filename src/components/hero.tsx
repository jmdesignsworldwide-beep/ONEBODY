"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// El canvas de convergencia se carga dinámicamente, nunca en el bundle
// inicial (Sección 10).
const BrandNode = dynamic(
  () => import("./brand-node").then((m) => m.BrandNode),
  {
    ssr: false,
    loading: () => <div className="size-[260px]" aria-hidden />,
  },
);

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden pt-16">
      {/* Halo rojo tenue detrás del nodo — parte del sistema de marca. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "var(--color-ob-red-glow)" }}
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-xs uppercase tracking-[0.25em] text-ob-smoke"
          >
            {t("eyebrow")}
          </motion.p>

          <h1 className="mt-6 font-display text-[clamp(3rem,9vw,6.5rem)] text-ob-bone">
            {[t("titleLine1"), t("titleLine2")].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: "0.6em" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
            className="mt-8 max-w-md text-lg leading-relaxed text-ob-smoke"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/donar"
              className="rounded-full bg-ob-red px-8 py-3.5 text-base font-semibold text-ob-white shadow-[0_0_28px_var(--color-ob-red-glow)] transition-colors hover:bg-ob-red-deep"
            >
              {t("cta")}
            </Link>
            <Link
              href="/proyectos"
              className="rounded-full border border-ob-ash px-8 py-3.5 text-base font-medium text-ob-bone transition-colors hover:border-ob-bone"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.3 }}
          className="mx-auto flex items-center justify-center"
        >
          <BrandNode size={300} />
        </motion.div>
      </div>
    </section>
  );
}
