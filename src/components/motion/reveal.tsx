"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Easing por defecto del sistema (expo-out — se siente caro, Sección 2.5).
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Revela un bloque al entrar en viewport: fade + deslizamiento sutil hacia
 * arriba, una sola vez. Bajo prefers-reduced-motion, sólo hace fade (sin
 * transform). Todo lo que entra en viewport tiene entrada (Sección 2.5).
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Reduced-motion: contenido visible de inmediato, sin depender del scroll ni
  // de JS para revelarse (consistente con RevealHeading; robusto ante error #9).
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Contenedor que escalona la entrada de sus hijos `StaggerItem`. */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  // Reduced-motion: visible de inmediato, sin espera de scroll (igual que Reveal).
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
