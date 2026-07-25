"use client";

import { useEffect, useId, useRef } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useInView,
  animate,
} from "motion/react";
import { PlantDefs, GrowingPlant, EASE } from "@/components/landing/plant-art";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Árbol de meta: una planta REALISTA que crece con el financiamiento. El
 * crecimiento es orgánico —el tallo sube y cada hoja se despliega desde su
 * base— sin ninguna línea de recorte. A 0% apenas la semilla; a 100% florecida.
 * Al entrar en viewport, la planta crece hasta el % actual (~1.5s). Estático y
 * digno bajo prefers-reduced-motion. Sin rojo (disciplina de marca).
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
  const grow = useMotionValue(reduce ? p : 0);
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  useEffect(() => {
    if (reduce) {
      grow.set(p);
      return;
    }
    if (!inView) return;
    const controls = animate(grow, p, { duration: 1.5, ease: EASE });
    return () => controls.stop();
  }, [inView, p, reduce, grow]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 160 220"
      className={className}
      role="img"
      aria-label={ariaLabel ?? `Crecimiento del proyecto: ${Math.round(p * 100)}%`}
    >
      <PlantDefs id={uid} />
      <GrowingPlant id={uid} progress={grow} sway={!reduce} />
    </svg>
  );
}
