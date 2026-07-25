"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";

/**
 * Escena 4 — La semilla. Un descenso de scroll dibuja la planta: la semilla
 * cae, las raíces se extienden, el tallo sube y las hojas se abren. Todo en
 * negro de marca (sin rojo), line-art por stroke-dashoffset — ligero.
 *
 * No secuestra el scroll: el lienzo queda `sticky` mientras el usuario recorre
 * la pista (220vh) a su propio ritmo. Bajo reduce-motion, la planta se muestra
 * ya crecida, estática y digna.
 */
export function SeedScene() {
  const t = useTranslations("Landing");
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: p } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const seedY = useTransform(p, [0, 0.16], [50, 300]);
  const seedO = useTransform(p, [0.16, 0.24], [1, 0]);
  const roots = useTransform(p, [0.14, 0.44], [1, 0]);
  const stem = useTransform(p, [0.4, 0.72], [1, 0]);
  const leaves = useTransform(p, [0.66, 1], [1, 0]);

  const stroke = "var(--color-ob-bone)";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: "1 1",
  };

  return (
    <section ref={trackRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden">
        <Container className="flex flex-col items-center text-center">
          <Reveal y={8}>
            <span className="text-xs uppercase tracking-[0.25em] text-ob-smoke">
              {t("seedEyebrow")}
            </span>
          </Reveal>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.8rem,4.5vw,3rem)] text-ob-bone">
            <RevealHeading delay={0.1}>{t("seedTitle")}</RevealHeading>
          </h2>

          <svg
            viewBox="0 0 400 520"
            className="mt-6 h-[52dvh] max-h-[460px] w-auto"
            aria-hidden
          >
            {/* suelo */}
            <line
              x1="60" y1="310" x2="340" y2="310"
              stroke="var(--color-ob-ash)" strokeWidth="2"
            />
            {/* raíces */}
            <motion.path
              d="M200 310 C 198 342, 156 352, 128 402"
              style={{ strokeDashoffset: reduce ? 0 : roots }}
              {...common}
            />
            <motion.path
              d="M200 310 C 202 346, 246 356, 278 406"
              style={{ strokeDashoffset: reduce ? 0 : roots }}
              {...common}
            />
            <motion.path
              d="M200 310 C 200 350, 200 384, 200 436"
              style={{ strokeDashoffset: reduce ? 0 : roots }}
              {...common}
            />
            {/* tallo */}
            <motion.path
              d="M200 310 C 195 258, 205 206, 200 150"
              style={{ strokeDashoffset: reduce ? 0 : stem }}
              {...common}
            />
            {/* hojas */}
            <motion.path
              d="M200 232 C 158 222, 138 248, 150 276 C 182 272, 200 258, 200 232 Z"
              style={{ strokeDashoffset: reduce ? 0 : leaves }}
              {...common}
            />
            <motion.path
              d="M200 200 C 242 190, 264 214, 252 242 C 220 238, 200 224, 200 200 Z"
              style={{ strokeDashoffset: reduce ? 0 : leaves }}
              {...common}
            />
            <motion.path
              d="M200 150 C 188 136, 190 116, 200 104 C 210 116, 212 136, 200 150 Z"
              style={{ strokeDashoffset: reduce ? 0 : leaves }}
              {...common}
            />
            {/* semilla que cae */}
            <motion.ellipse
              cx="200"
              cy={reduce ? 300 : seedY}
              rx="9"
              ry="12"
              fill="var(--color-ob-bone)"
              style={{ opacity: reduce ? 0 : seedO }}
            />
          </svg>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ob-smoke">
              {t("seedBody")}
            </p>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
