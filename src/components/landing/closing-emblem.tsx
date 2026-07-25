"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * Escena 6 — la marca resuelve completa y late una vez al entrar en viewport.
 * El punto que tú agregas al cuerpo.
 */
export function ClosingEmblem() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="mx-auto mb-10 w-fit"
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      whileInView={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, scale: [0.9, 1.08, 1] }
      }
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], times: [0, 0.6, 1] }}
    >
      <Image
        src="/onebody-emblem.png"
        alt=""
        width={512}
        height={512}
        className="h-20 w-20 drop-shadow-[0_16px_45px_rgba(224,43,32,0.25)] md:h-24 md:w-24"
      />
    </motion.div>
  );
}
