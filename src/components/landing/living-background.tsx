"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Atmósfera ambiental cálida detrás de TODO el sitio. No son íconos ni cosas
 * flotando (eso abarata): es profundidad y luz cálida en movimiento lentísimo,
 * que se siente más de lo que se nota.
 *
 * - Halos de gradiente cálidos (marfil, durazno, rosa muy tenue) en deriva de
 *   20–30s. Nunca rojo (disciplina del rojo).
 * - Parallax muy leve: la capa se desplaza más lento que el contenido al hacer
 *   scroll (sensación de espacio, sin notarse como "efecto").
 * - Tinte cálido que crece hacia el cierre (como luz natural que entra).
 * - El grano de película va en <body class="grain"> (no es movimiento).
 * Estático y hermoso bajo prefers-reduced-motion.
 */
export function LivingBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Parallax leve (~6%): la atmósfera se queda un poco atrás del contenido.
  const drift = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  // Velo cálido que aparece hacia el final del descenso (luz que entra).
  const warmOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.06, 0.14]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={{ y: reduce ? undefined : drift }}
      >
        {/* Halos cálidos en deriva lentísima (todos no-rojos). */}
        <div
          className={`absolute left-[72%] top-[10%] size-[560px] max-w-full -translate-x-1/2 rounded-full opacity-70 blur-[150px] ${reduce ? "" : "ob-aurora-1"}`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,226,190,0.6), transparent 70%)",
          }}
        />
        <div
          className={`absolute left-[10%] top-[52%] size-[540px] max-w-full -translate-x-1/2 rounded-full opacity-60 blur-[160px] ${reduce ? "" : "ob-aurora-2"}`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,184,142,0.28), transparent 70%)",
          }}
        />
        <div
          className={`absolute left-[48%] top-[88%] size-[600px] max-w-full -translate-x-1/2 rounded-full opacity-50 blur-[160px] ${reduce ? "" : "ob-aurora-3"}`}
          style={{
            background:
              "radial-gradient(circle, rgba(232,158,158,0.16), transparent 70%)",
          }}
        />
      </motion.div>

      {/* Tinte cálido de cierre (amanecer): luz ambiental esperanzadora. */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: reduce ? 0.1 : warmOpacity,
          background:
            "linear-gradient(to top, rgba(224,150,110,0.5), transparent 45%)",
        }}
      />
    </div>
  );
}
