"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Tier } from "./hero-canvas";

const HeroCanvas = dynamic(() => import("./hero-canvas"), {
  ssr: false,
  loading: () => <StaticMark />,
});

/**
 * Respaldo 2D digno: el emblema sobre la atmósfera marfil. Sirve como
 * placeholder de Suspense mientras carga el 3D, como fallback de gama baja y
 * como render de prefers-reduced-motion (pose fija, sin movimiento).
 */
function StaticMark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.85), rgba(245,243,240,0) 70%)",
        }}
      />
      <Image
        src="/onebody-emblem.png"
        alt="Emblema ONE BODY: cuatro nodos unidos en torno a un centro."
        width={512}
        height={512}
        priority
        className="w-[58%] min-w-[170px] drop-shadow-[0_20px_55px_rgba(224,43,32,0.2)]"
      />
    </div>
  );
}

type Mode = "loading" | "static" | "3d";

function detectTier(): Tier | null {
  if (typeof window === "undefined") return null;
  // WebGL disponible?
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return null;
  } catch {
    return null;
  }
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 820px)").matches;
  // Gama muy baja → respaldo 2D estático (nunca un canvas trabado).
  if (cores <= 2 || (mem !== undefined && mem <= 2)) return null;
  // Móvil / táctil → nivel ligero (menos partículas, sin DOF).
  if (coarse || narrow) return "low";
  return "high";
}

/**
 * Hero 3D (Parte B). Carga diferida total: el texto y el botón de donar
 * (HTML encima) son visibles e interactivos desde el segundo cero — este
 * lienzo nunca los bloquea. Detecta capacidad, respeta reduced-motion y pausa
 * el render loop cuando sale del viewport (IntersectionObserver).
 */
export function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("loading");
  const [tier, setTier] = useState<Tier>("high");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMode("static");
      return;
    }
    const t = detectTier();
    if (!t) {
      setMode("static");
      return;
    }
    setTier(t);
    setMode("3d");
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || mode !== "3d") return;
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry?.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden"
    >
      {/* Atmósfera: degradado radial muy sutil, sensación de luz ambiental. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(255,255,255,0.6), rgba(245,243,240,0) 75%)",
        }}
      />
      {mode === "3d" ? <HeroCanvas tier={tier} paused={paused} /> : <StaticMark />}
    </div>
  );
}
