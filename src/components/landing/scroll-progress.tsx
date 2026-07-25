"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Barra de progreso del viaje de scroll: una línea fina en el negro de marca
 * que se llena a medida que el usuario desciende. Sutil, siempre encima del
 * nav. No captura el scroll — solo lo refleja.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-ob-bone/80"
    />
  );
}
