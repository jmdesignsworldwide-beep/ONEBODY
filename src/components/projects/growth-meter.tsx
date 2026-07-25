"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Brote de proyecto (Sección 4.2): una planta que crece con el financiamiento.
 * A 0% apenas una semilla con raíces; a 100% florecida. Line-art en negro de
 * marca (sin rojo). Se dibuja al entrar en viewport; estático bajo reduce-motion.
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
  const p = clamp(progress);
  const rootsR = clamp(p / 0.35);
  const stemR = clamp((p - 0.2) / 0.45);
  const leavesR = clamp((p - 0.55) / 0.45);

  const stroke = "var(--color-ob-bone)";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: "1 1",
  };
  const path = (d: string, reveal: number, delay: number) => (
    <motion.path
      d={d}
      {...common}
      initial={reduce ? false : { strokeDashoffset: 1 }}
      whileInView={{ strokeDashoffset: 1 - reveal }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      style={reduce ? { strokeDashoffset: 1 - reveal } : undefined}
    />
  );

  return (
    <svg
      viewBox="0 0 120 168"
      className={className}
      role="img"
      aria-label={ariaLabel ?? `Crecimiento: ${Math.round(p * 100)}%`}
    >
      <line x1="16" y1="110" x2="104" y2="110" stroke="var(--color-ob-ash)" strokeWidth="1.5" />
      {path("M60 110 C 58 126, 40 132, 30 152", rootsR, 0)}
      {path("M60 110 C 62 128, 80 134, 92 152", rootsR, 0.05)}
      {path("M60 110 C 60 130, 60 142, 60 158", rootsR, 0.1)}
      {path("M60 110 C 57 86, 63 62, 60 42", stemR, 0.15)}
      {path("M60 78 C 40 72, 30 84, 36 98 C 50 96, 60 88, 60 78 Z", leavesR, 0.28)}
      {path("M60 62 C 80 56, 90 68, 84 82 C 70 80, 60 72, 60 62 Z", leavesR, 0.34)}
      {path("M60 42 C 54 34, 55 24, 60 18 C 65 24, 66 34, 60 42 Z", leavesR, 0.4)}
      <motion.circle
        cx="60" cy="110" r="4" fill="var(--color-ob-bone)"
        initial={reduce ? false : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE }}
      />
    </svg>
  );
}
