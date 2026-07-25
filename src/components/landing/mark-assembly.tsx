"use client";

import { useEffect, useRef } from "react";

/**
 * Escena 1 — Ensamblaje de la marca. Al entrar, puntos dispersos sobre el
 * marfil convergen y se disuelven en el emblema (que aparece al asentarse):
 * "muchos miembros" que se hacen "un cuerpo". Canvas 2D ligero, una sola vez.
 * Se salta bajo prefers-reduced-motion (el emblema aparece directamente).
 */
export function MarkAssembly() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv0 = ref.current;
    if (!cv0) return;
    const cv = cv0;
    const ctx0 = cv.getContext("2d");
    if (!ctx0) return;
    const g = ctx0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let W = 0, H = 0, dpr = 1;
    function resize() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const N = 120;
    const R = () => Math.min(W, H) / 2;
    type P = { sx: number; sy: number; tx: number; ty: number; d: number; red: boolean };
    const ps: P[] = [];
    function seed() {
      ps.length = 0;
      const cx = W / 2, cy = H / 2, rad = R();
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const far = rad * (1.15 + Math.random() * 0.9);
        const near = rad * (0.06 + Math.random() * 0.32);
        const ta = Math.random() * Math.PI * 2;
        ps.push({
          sx: cx + Math.cos(a) * far,
          sy: cy + Math.sin(a) * far,
          tx: cx + Math.cos(ta) * near,
          ty: cy + Math.sin(ta) * near,
          d: Math.random() * 0.5,
          red: Math.random() < 0.16,
        });
      }
    }
    seed();

    const DUR = 1.2;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    let raf = 0;
    let start = 0;

    function frame(ts: number) {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      g.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of ps) {
        const pr = Math.max(0, Math.min(1, (t - p.d) / DUR));
        if (pr < 1) alive = true;
        const e = easeOut(pr);
        const x = p.sx + (p.tx - p.sx) * e;
        const y = p.sy + (p.ty - p.sy) * e;
        const alpha = Math.sin(pr * Math.PI) * 0.9;
        if (alpha <= 0.01) continue;
        g.beginPath();
        g.fillStyle = p.red
          ? `rgba(224,43,32,${alpha})`
          : `rgba(40,36,32,${alpha * 0.85})`;
        g.arc(x, y, 1.1 + pr * 1.2, 0, Math.PI * 2);
        g.fill();
      }
      if (alive) raf = requestAnimationFrame(frame);
      else g.clearRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
