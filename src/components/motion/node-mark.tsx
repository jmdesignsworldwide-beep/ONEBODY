"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const NODES = [
  { cx: 24, cy: 8 },
  { cx: 40, cy: 24 },
  { cx: 24, cy: 40 },
  { cx: 8, cy: 24 },
];

/**
 * NodeMark — el nodo de convergencia (logo de ONEBODY): cuatro puntos que
 * convergen a un centro. Marca para secciones de unión/comunidad.
 *
 * Entrada (en viewport, una vez): los cuatro nodos nacen del centro y viajan a
 * su posición con stagger de 120ms; las líneas se trazan con stroke-dashoffset.
 * Reposo: el nodo central late suave (scale 1→1.08→1, 4s). Negro de marca
 * (currentColor) — nunca rojo. Estático bajo prefers-reduced-motion.
 */
export function NodeMark({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  const line = (x2: number, y2: number, i: number) =>
    reduce ? (
      <line
        key={`l${i}`}
        x1={24}
        y1={24}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.4}
      />
    ) : (
      <motion.line
        key={`l${i}`}
        x1={24}
        y1={24}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.4}
        pathLength={1}
        strokeDasharray="1 1"
        initial={{ strokeDashoffset: 1 }}
        whileInView={{ strokeDashoffset: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
      />
    );

  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {line(24, 8, 0)}
      {line(40, 24, 1)}
      {line(24, 40, 2)}
      {line(8, 24, 3)}
      {NODES.map((n, i) =>
        reduce ? (
          <circle key={i} cx={n.cx} cy={n.cy} r={3} fill="currentColor" />
        ) : (
          <motion.circle
            key={i}
            r={3}
            fill="currentColor"
            initial={{ cx: 24, cy: 24, opacity: 0 }}
            whileInView={{ cx: n.cx, cy: n.cy, opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
          />
        ),
      )}
      <motion.circle
        cx={24}
        cy={24}
        r={4}
        fill="currentColor"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  );
}
