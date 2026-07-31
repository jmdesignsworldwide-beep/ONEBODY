"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "@/i18n/navigation";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Transición de página suave: al navegar, el contenido entra con un fundido de
 * opacidad. SÓLO opacidad → CLS 0 y sin containing-block para elementos fixed
 * (la barra móvil y el menú de compartir siguen anclados). Bajo
 * prefers-reduced-motion se pasa de largo (sin animación).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
