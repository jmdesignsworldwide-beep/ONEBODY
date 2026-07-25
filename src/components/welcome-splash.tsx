"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Pantalla de bienvenida premium: se muestra una sola vez por sesión, con una
 * entrada elegante del logo y un desvanecido suave hacia el sitio. Respeta
 * prefers-reduced-motion y se puede saltar con un clic.
 */
export function WelcomeSplash() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ob_welcomed")) return;
      sessionStorage.setItem("ob_welcomed", "1");
    } catch {
      // sin sessionStorage: se muestra igualmente, sin romper.
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), reduce ? 900 : 2100);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ob-splash"
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-ob-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE } }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[460px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[130px]"
            style={{ background: "var(--color-ob-red-glow)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.86, y: reduce ? 0 : 8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.8, ease: EASE },
            }}
            className="relative px-8"
          >
            <Image
              src="/onebody-logo.png"
              alt="ONE BODY — Meant to be one"
              width={1446}
              height={397}
              priority
              className="h-16 w-auto md:h-24"
            />
          </motion.div>

          {!reduce && (
            <motion.span
              aria-hidden
              className="mt-12 h-px w-44 origin-left rounded-full bg-ob-red/70"
              initial={{ scaleX: 0, opacity: 0.4 }}
              animate={{
                scaleX: 1,
                opacity: 1,
                transition: { duration: 1.7, ease: "easeInOut" },
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
