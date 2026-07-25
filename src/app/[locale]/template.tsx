"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Transición de página (Sección 9): el contenido nuevo entra con un velo suave
 * al navegar. `template.tsx` se re-monta en cada navegación, así que la entrada
 * se dispara sola. Máx 450ms — nunca hace sentir lento el sitio. Estático bajo
 * prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
