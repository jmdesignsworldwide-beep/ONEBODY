"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Zarcillo (Sección 4.3): una tendrila diminuta que se dibuja sola junto a cada
 * título al entrar en viewport — el hilo conector a escala mínima. Negro de
 * marca. Estática (ya dibujada) bajo reduce-motion.
 */
export function Tendril({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const common = {
    fill: "none",
    stroke: "var(--color-ob-bone)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: "1 1",
  };
  return (
    <svg
      viewBox="0 0 44 40"
      className={className ?? "h-6 w-6 text-ob-bone"}
      aria-hidden
    >
      {/* tallo curvo */}
      <motion.path
        d="M22 39 C 22 30, 13 27, 15 18 C 16.5 11, 25 12, 24 5"
        {...common}
        initial={reduce ? false : { strokeDashoffset: 1 }}
        whileInView={{ strokeDashoffset: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        style={reduce ? { strokeDashoffset: 0 } : undefined}
      />
      {/* hojita */}
      <motion.path
        d="M15 18 C 6 15, 4 21, 8 26 C 14 25, 16 22, 15 18 Z"
        {...common}
        initial={reduce ? false : { strokeDashoffset: 1 }}
        whileInView={{ strokeDashoffset: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
        style={reduce ? { strokeDashoffset: 0 } : undefined}
      />
    </svg>
  );
}
