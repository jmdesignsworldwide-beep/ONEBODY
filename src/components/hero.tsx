"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { MarkAssembly } from "@/components/landing/mark-assembly";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Hero");
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden pt-16">
      {/* El fondo vivo de la landing (LivingBackground) aporta el halo ambiental. */}

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-ob-smoke">
              {t("eyebrow")}
            </p>
          </motion.div>

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
            <Magnetic>
              <Button href="/donar" variant="donate" size="lg">
                {t("cta")}
              </Button>
            </Magnetic>
            <Button href="/proyectos" variant="secondary" size="lg">
              {t("ctaSecondary")}
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative mx-auto flex aspect-square w-[300px] max-w-full items-center justify-center md:w-[420px]"
        >
          {/* Ensamblaje de la marca: puntos dispersos convergen y se disuelven
              en el emblema — "muchos miembros" que se hacen "un cuerpo". */}
          <MarkAssembly />
          <motion.div
            className="relative flex w-full items-center justify-center"
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
          >
            {/* El emblema nítido cristaliza cuando la tinta termina de ensamblar. */}
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 1.7 }}
              className="flex w-full items-center justify-center"
            >
              <Image
                src="/onebody-emblem.png"
                alt="Emblema ONE BODY: cuatro personas unidas en torno a un centro."
                width={512}
                height={512}
                priority
                className="w-[62%] min-w-[170px] drop-shadow-[0_20px_55px_rgba(224,43,32,0.22)]"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
