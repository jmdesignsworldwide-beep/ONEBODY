"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Fondo vivo de la landing (Sección 6):
 * 6.1 — halos orgánicos que derivan lentísimo (CSS, coste casi cero).
 * 6.2 — tinte reactivo al scroll: el color cuenta la historia junto al viaje
 *        (cielo claro arriba → tierra cálida abajo → amanecer al cierre).
 * Todo detrás del contenido, sin capturar eventos. Estático bajo reduce-motion.
 */
export function LivingBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Velo cálido que aparece hacia el final del descenso (amanecer).
  const warmOpacity = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.05, 0.16]);
  // Sutil oscurecimiento del cielo en el primer tramo (aire).
  const skyOpacity = useTransform(scrollYProgress, [0, 0.25], [0.06, 0]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 6.1 — halos en deriva */}
      <div
        className={`absolute left-[70%] top-[12%] size-[560px] max-w-full -translate-x-1/2 rounded-full opacity-50 blur-[140px] ${reduce ? "" : "ob-aurora-1"}`}
        style={{
          background:
            "radial-gradient(circle, var(--color-ob-red-glow), transparent 70%)",
        }}
      />
      <div
        className={`absolute left-[12%] top-[60%] size-[520px] max-w-full -translate-x-1/2 rounded-full opacity-40 blur-[150px] ${reduce ? "" : "ob-aurora-2"}`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,150,100,0.22), transparent 70%)",
        }}
      />
      <div
        className={`absolute left-[45%] top-[92%] size-[600px] max-w-full -translate-x-1/2 rounded-full opacity-40 blur-[150px] ${reduce ? "" : "ob-aurora-3"}`}
        style={{
          background:
            "radial-gradient(circle, rgba(120,110,150,0.14), transparent 70%)",
        }}
      />

      {/* 6.2 — tinte reactivo al scroll */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: reduce ? 0.08 : skyOpacity,
          background:
            "linear-gradient(to bottom, rgba(150,170,200,0.5), transparent 40%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: reduce ? 0.1 : warmOpacity,
          background:
            "linear-gradient(to top, rgba(224,120,80,0.5), transparent 45%)",
        }}
      />
    </div>
  );
}
