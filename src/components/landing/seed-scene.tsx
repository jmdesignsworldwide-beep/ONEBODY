"use client";

import { useId, useRef } from "react";
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
import { PlantDefs, PlantBody, Soil } from "./plant-art";

const BASE = 170;
const SPAN = 126;

/**
 * Escena 4 — La semilla. Un descenso de scroll siembra una planta REALISTA: la
 * semilla cae a la tierra y, al bajar, la planta crece de abajo hacia arriba
 * (hojas con volumen, tallo leñoso→verde, floración dorada) con un halo cálido.
 * Sin rojo (disciplina de marca). Reemplaza el line-art anterior, que se veía
 * "hecho por computadora".
 *
 * No secuestra el scroll: el lienzo queda `sticky` mientras el usuario recorre
 * la pista (220vh) a su propio ritmo. Bajo reduce-motion, la planta se muestra
 * ya crecida, estática y digna.
 */
export function SeedScene() {
  const t = useTranslations("Landing");
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: p } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // La semilla cae hasta la tierra; luego la planta crece con el scroll.
  const seedY = useTransform(p, [0, 0.18], [30, 166]);
  const seedO = useTransform(p, [0.16, 0.24], [1, 0]);
  const growY = useTransform(p, [0.2, 1], [BASE, BASE - SPAN]);
  const growH = useTransform(p, [0.2, 1], [0, SPAN]);
  const haloO = useTransform(p, [0.3, 1], [0, 0.9]);

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
            viewBox="0 0 160 220"
            className="mt-6 h-[52dvh] max-h-[460px] w-auto"
            aria-hidden
          >
            <PlantDefs id={uid} />
            <clipPath id={`${uid}-grow`}>
              {reduce ? (
                <rect x={0} y={BASE - SPAN} width={160} height={SPAN} />
              ) : (
                <motion.rect x={0} width={160} y={growY} height={growH} />
              )}
            </clipPath>

            {/* Halo cálido que crece con el descenso (dorado, nunca rojo). */}
            <motion.circle
              cx={80}
              cy={116}
              r={78}
              fill={`url(#${uid}-halo)`}
              style={{ opacity: reduce ? 0.8 : haloO }}
            />

            <Soil id={uid} />
            {/* Semilla que cae a la tierra. */}
            <motion.ellipse
              cx={80}
              cy={reduce ? 166 : seedY}
              rx={5.5}
              ry={7}
              fill={`url(#${uid}-soil)`}
              style={{ opacity: reduce ? 0 : seedO }}
            />

            {/* La planta crece revelándose de abajo hacia arriba. */}
            <g clipPath={`url(#${uid}-grow)`}>
              <PlantBody id={uid} />
            </g>
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
