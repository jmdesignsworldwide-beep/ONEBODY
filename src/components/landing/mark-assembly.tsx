"use client";

import { useEffect, useRef } from "react";

const EMBLEM_SRC = "/onebody-emblem.png";

/**
 * Escena 1 — Ensamblaje de la marca (versión cinematográfica).
 *
 * Cientos de partículas de tinta vuelan desde los bordes describiendo curvas y
 * se ENSAMBLAN en la silueta real del emblema ONEBODY (muestreada del PNG):
 * "muchos miembros" que literalmente forman "un cuerpo". Estelas de movimiento
 * (composición destination-out sobre canvas transparente), llegada escalonada y
 * con swoop, y al final el emblema nítido cristaliza encima mientras la tinta se
 * disuelve. Sin rojo — la marca (roja) reaparece solo en el emblema final.
 *
 * Se salta por completo bajo prefers-reduced-motion (el emblema aparece directo).
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

    let W = 0, H = 0, dpr = 1, base = 0, cx = 0, cy = 0;
    function resize() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      base = Math.min(W, H);
      cx = W / 2; cy = H / 2;
    }
    resize();

    // Silueta objetivo: coords normalizadas [-0.5, 0.5] muestreadas del emblema.
    let norm: Array<[number, number]> = [];
    function fallbackNorm() {
      // Anillo suave (nunca una cruz) si el PNG no carga.
      const out: Array<[number, number]> = [];
      for (let i = 0; i < 600; i++) {
        const a = Math.random() * Math.PI * 2;
        const rad = 0.16 * (0.4 + Math.random() * 0.8);
        out.push([Math.cos(a) * rad, Math.sin(a) * rad]);
      }
      norm = out;
    }

    type P = {
      sx: number; sy: number; cxp: number; cyp: number;
      tx: number; ty: number; d: number; dur: number; sz: number;
    };
    let ps: P[] = [];
    let raf = 0;
    let start = 0;

    const clamp = (t: number) => Math.max(0, Math.min(1, t));
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    function build() {
      const N = base < 360 ? 300 : 560;
      const emblemPx = base * 0.62;
      ps = [];
      for (let i = 0; i < N; i++) {
        const pick = norm[(Math.random() * norm.length) | 0] ?? [0, 0];
        const nu = pick[0], nv = pick[1];
        const tx = cx + nu * emblemPx;
        const ty = cy + nv * emblemPx;
        // Origen: fuera del encuadre, en un ángulo aleatorio.
        const a = Math.random() * Math.PI * 2;
        const sr = base * (0.46 + Math.random() * 0.18);
        const sx = cx + Math.cos(a) * sr;
        const sy = cy + Math.sin(a) * sr;
        // Punto de control perpendicular: la partícula entra en curva (swoop).
        const mx = (sx + tx) / 2, my = (sy + ty) / 2;
        const nx = -(ty - sy), ny = tx - sx;
        const nl = Math.hypot(nx, ny) || 1;
        const swoop = (Math.random() - 0.5) * sr * 1.05;
        ps.push({
          sx, sy,
          cxp: mx + (nx / nl) * swoop,
          cyp: my + (ny / nl) * swoop,
          tx, ty,
          d: Math.random() * 0.55,
          dur: 0.9 + Math.random() * 0.5,
          sz: 0.7 + Math.random() * 1.4,
        });
      }
    }

    const HOLD = 2.0;      // hasta aquí las partículas mantienen la silueta
    const FADE = 0.95;     // disolución posterior

    function frame(ts: number) {
      if (!start) start = ts;
      const t = (ts - start) / 1000;

      // Estela: rebaja el alfa de lo ya dibujado sin tocar la transparencia.
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";

      if (t < HOLD) {
        for (const p of ps) {
          const pr = clamp((t - p.d) / p.dur);
          if (pr <= 0) continue;
          const e = easeOut(pr);
          const mt = 1 - e;
          // Bézier cuadrática origen → control → destino.
          const x = mt * mt * p.sx + 2 * mt * e * p.cxp + e * e * p.tx;
          const y = mt * mt * p.sy + 2 * mt * e * p.cyp + e * e * p.ty;
          const alpha = Math.min(1, pr * 1.7) * 0.92;
          g.beginPath();
          g.fillStyle = `rgba(27,24,21,${alpha})`;
          g.arc(x, y, p.sz * (0.55 + pr * 0.75), 0, Math.PI * 2);
          g.fill();
        }
        raf = requestAnimationFrame(frame);
      } else if (t < HOLD + FADE) {
        // Solo se aplica la estela (destination-out): la silueta se disuelve.
        raf = requestAnimationFrame(frame);
      } else {
        g.clearRect(0, 0, W, H);
      }
    }

    let cancelled = false;
    function go() {
      if (cancelled) return;
      build();
      raf = requestAnimationFrame(frame);
    }

    const img = new window.Image();
    img.onload = () => {
      const s = 110;
      const oc = document.createElement("canvas");
      oc.width = s; oc.height = s;
      const octx = oc.getContext("2d");
      if (!octx) { fallbackNorm(); go(); return; }
      octx.drawImage(img, 0, 0, s, s);
      let data: Uint8ClampedArray;
      try {
        data = octx.getImageData(0, 0, s, s).data;
      } catch {
        fallbackNorm(); go(); return;
      }
      const out: Array<[number, number]> = [];
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          if ((data[(y * s + x) * 4 + 3] ?? 0) > 130) {
            out.push([x / s - 0.5, y / s - 0.5]);
          }
        }
      }
      if (out.length < 80) fallbackNorm();
      else norm = out;
      go();
    };
    img.onerror = () => { fallbackNorm(); go(); };
    img.src = EMBLEM_SRC;

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
