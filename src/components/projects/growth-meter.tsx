"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PlantDefs, PlantBody, Soil } from "@/components/landing/plant-art";

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

const TOP = 44; // y de la copa a 100%
const BASE = 170; // línea del suelo
const SPAN = BASE - TOP;

/**
 * Árbol de meta: una planta REALISTA (hojas con volumen, tallo leñoso→verde,
 * tierra y floración dorada) que crece con el financiamiento. A 0% apenas la
 * semilla en la tierra; a 100% florecida. El crecimiento se revela de abajo
 * hacia arriba (clip), con halo cálido que crece y micro-balanceo en reposo.
 * Estático y digno bajo prefers-reduced-motion. Sin rojo (disciplina de marca).
 */
export function GrowthMeter({
  progress,
  className,
  ariaLabel,
}: {
  progress: number;
  className?: string;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const p = clamp(progress);
  const h = SPAN * p;
  const y = BASE - h;

  return (
    <svg
      viewBox="0 0 160 220"
      className={className}
      role="img"
      aria-label={ariaLabel ?? `Crecimiento del proyecto: ${Math.round(p * 100)}%`}
    >
      <PlantDefs id={uid} />
      <clipPath id={`${uid}-grow`}>
        {reduce ? (
          <rect x={0} y={y} width={160} height={h} />
        ) : (
          <motion.rect
            x={0}
            width={160}
            initial={{ y: BASE, height: 0 }}
            whileInView={{ y, height: h }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.5, ease: EASE }}
          />
        )}
      </clipPath>

      {/* Halo cálido que crece con la etapa (dorado, nunca rojo). */}
      <motion.circle
        cx={80}
        cy={116}
        r={72}
        fill={`url(#${uid}-halo)`}
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 0.55 + p * 0.6, opacity: 0.4 + p * 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      <Soil id={uid} />
      {/* Semilla asomando en la tierra (ancla la etapa temprana). */}
      <ellipse cx={80} cy={166} rx={5.5} ry={7} fill={`url(#${uid}-soil)`} />

      {/* La planta crece revelándose de abajo hacia arriba. */}
      <motion.g
        clipPath={`url(#${uid}-grow)`}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        animate={reduce ? undefined : { rotate: [-1.4, 1.4, -1.4] }}
        transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
      >
        <PlantBody id={uid} />
      </motion.g>
    </svg>
  );
}
