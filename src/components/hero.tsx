"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Hero3D } from "@/components/landing/hero-3d";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden pt-16">
      {/* El fondo vivo de la landing (LivingBackground) aporta el halo ambiental. */}

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-xs uppercase tracking-[0.25em] text-ob-smoke"
          >
            {t("eyebrow")}
          </motion.p>

          <h1 className="mt-6 font-display text-[clamp(3rem,9vw,6.5rem)] font-bold text-ob-bone">
            {[t("titleLine1"), t("titleLine2")].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.05em]">
                <motion.span
                  className={`block ${i === 1 ? "ob-gradient-text" : ""}`}
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
            <Button href="/donar" variant="donate" size="lg">
              {t("cta")}
            </Button>
            <Button href="/proyectos" variant="secondary" size="lg">
              {t("ctaSecondary")}
            </Button>
          </motion.div>
        </div>

        {/* Escenario 3D. El texto y el botón de arriba son HTML normal y nunca
            dependen de este lienzo para ser visibles o clicables. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto aspect-square w-[320px] max-w-full md:w-[480px]"
        >
          <Hero3D />
        </motion.div>
      </div>
    </section>
  );
}
