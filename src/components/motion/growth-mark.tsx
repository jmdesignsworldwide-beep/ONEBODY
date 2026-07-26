"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const LEAF_L = "M24 28 C16 26 12 20 14 14 C20 14 25 20 24 28 Z";
const LEAF_R = "M24 22 C32 20 36 15 34 9 C28 9 23 15 24 22 Z";

/**
 * GrowthMark — el brote: un tallo con dos hojas. Marca para secciones de
 * donación/impacto/crecimiento.
 *
 * Entrada (en viewport, una vez): el tallo se dibuja de abajo hacia arriba
 * (stroke-dashoffset, ~800ms), luego las hojas se despliegan con un pequeño
 * scale desde su base (stagger 150ms). Reposo: balanceo mínimo del conjunto
 * (rotate -2°→2°, 5s, origen en la base) como brisa. Negro de marca
 * (currentColor) — nunca rojo. Estático bajo prefers-reduced-motion.
 */
export function GrowthMark({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  const stem = reduce ? (
    <path
      d="M24 44 C24 34 24 24 24 14"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
    />
  ) : (
    <motion.path
      d="M24 44 C24 34 24 24 24 14"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
      pathLength={1}
      strokeDasharray="1 1"
      initial={{ strokeDashoffset: 1 }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: EASE }}
    />
  );

  const leaf = (d: string, ox: number, oy: number, delay: number) =>
    reduce ? (
      <path d={d} fill="currentColor" opacity={0.85} />
    ) : (
      <motion.path
        d={d}
        fill="currentColor"
        opacity={0.85}
        style={{ transformBox: "view-box", transformOrigin: `${ox}px ${oy}px` }}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.85 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: EASE, delay }}
      />
    );

  const inner = (
    <>
      {stem}
      {leaf(LEAF_L, 24, 28, 0.8)}
      {leaf(LEAF_R, 24, 22, 0.95)}
    </>
  );

  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {reduce ? (
        inner
      ) : (
        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "24px 44px" }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        >
          {inner}
        </motion.g>
      )}
    </svg>
  );
}
