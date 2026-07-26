"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * SISTEMA DE CONVERGENCIA — indicador de meta.
 *
 * "Muchos miembros, un cuerpo": partículas dispersas convergen desde un anillo
 * hacia un único nodo central que se llena de dentro hacia afuera con el
 * progreso. RADIAL (nunca una cruz) y en TINTA de marca (sin rojo — disciplina
 * del rojo; el rojo se reserva al logo y a donar).
 *
 * - progreso creciente: las partículas migran al centro y densifican el nodo.
 * - donación en vivo (`pulseSignal`): un pulso entra desde el borde con estela
 *   y onda expansiva al llegar.
 * - rAF con delta-time, IntersectionObserver (pausa fuera de viewport),
 *   prefers-reduced-motion (estado final estático).
 */

export type ConvergenceVariant = "hero" | "card" | "inline";

const INK = { r: 42, g: 38, b: 33 };

const PRESETS: Record<
  ConvergenceVariant,
  { count: number; dot: number; core: number; px: number }
> = {
  hero: { count: 320, dot: 1.7, core: 6, px: 440 },
  card: { count: 160, dot: 1.5, core: 4.5, px: 240 },
  inline: { count: 64, dot: 1.2, core: 3, px: 100 },
};

type Particle = {
  hx: number; // hogar (borde)
  hy: number;
  tx: number; // objetivo (dentro del nodo)
  ty: number;
  threshold: number; // progreso al que se "engancha" (radial: dentro primero)
  seed: number;
};

type Pulse = { t: number; sx: number; sy: number };
type Ripple = { r: number; a: number };

export function ConvergenceCanvas({
  progress = 0,
  variant = "hero",
  autoplay = false,
  pulseSignal = 0,
  className,
  ariaLabel,
}: {
  progress?: number;
  variant?: ConvergenceVariant;
  autoplay?: boolean;
  pulseSignal?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(progress);
  const pulseRef = useRef(pulseSignal);
  const spawnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    targetRef.current = Math.max(0, Math.min(1, progress));
  }, [progress]);

  useEffect(() => {
    if (pulseSignal !== pulseRef.current) {
      pulseRef.current = pulseSignal;
      spawnRef.current?.();
    }
  }, [pulseSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const preset = PRESETS[variant];
    const cssSize = canvas.clientWidth || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    ctx.scale(dpr, dpr);

    const S = cssSize;
    const cx = S / 2;
    const cy = S / 2;
    const nodeR = S * 0.32;

    // Objetivos distribuidos uniformemente en un DISCO (nunca una cruz).
    const particles: Particle[] = Array.from({ length: preset.count }).map(
      () => {
        const ang = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random()) * nodeR; // uniforme en el disco
        const edgeAngle = Math.random() * Math.PI * 2;
        const edgeR = S * (0.55 + Math.random() * 0.5);
        return {
          hx: cx + Math.cos(edgeAngle) * edgeR,
          hy: cy + Math.sin(edgeAngle) * edgeR,
          tx: cx + Math.cos(ang) * rr,
          ty: cy + Math.sin(ang) * rr,
          threshold: rr / nodeR, // el nodo se llena de dentro hacia afuera
          seed: Math.random() * Math.PI * 2,
        };
      },
    );

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pulses: Pulse[] = [];
    const ripples: Ripple[] = [];
    let flash = 0;

    spawnRef.current = () => {
      if (prefersReduced) return;
      const angle = Math.random() * Math.PI * 2;
      const edgeR = S * 0.62;
      pulses.push({
        t: 0,
        sx: cx + Math.cos(angle) * edgeR,
        sy: cy + Math.sin(angle) * edgeR,
      });
    };

    let cur = prefersReduced ? targetRef.current : autoplay ? 0 : targetRef.current;
    let raf = 0;
    let last = 0;
    let visible = true;
    let settledPulse = 0;

    function easeOut(x: number) {
      return 1 - Math.pow(1 - x, 3);
    }

    function frame(time: number) {
      if (!ctx) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;

      const goal = autoplay ? 1 : targetRef.current;
      if (!prefersReduced) cur += (goal - cur) * Math.min(1, dt * 2.2);
      else cur = goal;
      const p = Math.max(0, Math.min(1, cur));
      const complete = p > 0.995;

      ctx.clearRect(0, 0, S, S);

      // Partículas de tinta convergiendo al nodo.
      for (const pt of particles) {
        const locked = p >= pt.threshold;
        const k = locked
          ? easeOut(Math.min(1, (p - pt.threshold) / 0.15 + 0.35))
          : 0;
        const drift = prefersReduced ? 0 : Math.sin(time / 950 + pt.seed) * 1.6;
        const bx = pt.hx + drift;
        const by = pt.hy + Math.cos(time / 1100 + pt.seed) * 1.6;
        const x = bx + (pt.tx - bx) * k;
        const y = by + (pt.ty - by) * k;

        ctx.globalAlpha = 0.18 + k * 0.62;
        ctx.fillStyle = `rgb(${INK.r},${INK.g},${INK.b})`;
        const r = preset.dot * (0.8 + k * 0.6);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Pulsos de donación (borde → centro con estela) y ondas, en tinta.
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pl = pulses[i]!;
        pl.t += dt / 0.8;
        const e = easeOut(Math.min(1, pl.t));
        const x = pl.sx + (cx - pl.sx) * e;
        const y = pl.sy + (cy - pl.sy) * e;
        const tailX = pl.sx + (cx - pl.sx) * easeOut(Math.max(0, pl.t - 0.12));
        const tailY = pl.sy + (cy - pl.sy) * easeOut(Math.max(0, pl.t - 0.12));
        ctx.strokeStyle = "rgba(42,38,33,0.45)";
        ctx.lineWidth = preset.dot * 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "rgb(42,38,33)";
        ctx.beginPath();
        ctx.arc(x, y, preset.dot * 1.5, 0, Math.PI * 2);
        ctx.fill();
        if (pl.t >= 1) {
          ripples.push({ r: 0, a: 0.4 });
          flash = Math.max(flash, 0.6);
          pulses.splice(i, 1);
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]!;
        rp.r += dt * S * 0.9;
        rp.a -= dt * 1.1;
        if (rp.a <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(42,38,33,${rp.a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (complete && settledPulse === 0) {
        settledPulse = 1;
        flash = Math.max(flash, 0.9);
      }
      if (flash > 0) flash = Math.max(0, flash - dt * 1.6);

      // Nodo central de tinta: crece con el progreso; halo cálido (no rojo).
      const beat = complete && !prefersReduced ? 1 + Math.sin(time / 620) * 0.05 : 1;
      const coreR = preset.core * (0.4 + p * 0.6) * beat;
      const glowR = coreR * (3 + flash * 2.5);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(233,183,84,${0.16 + flash * 0.3})`);
      glow.addColorStop(1, "rgba(233,183,84,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${INK.r},${INK.g},${INK.b})`;
      ctx.globalAlpha = 0.55 + p * 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (visible && !prefersReduced) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    }

    function start() {
      if (raf === 0 && !prefersReduced) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) start();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    if (prefersReduced) {
      last = 0;
      frame(0);
    } else {
      start();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      spawnRef.current = null;
    };
  }, [variant, autoplay]);

  const label =
    ariaLabel ??
    `Convergencia de la meta: ${Math.round(Math.max(0, Math.min(1, progress)) * 100)}% completado.`;

  return (
    <div
      className={cn("relative aspect-square", className)}
      style={{ width: PRESETS[variant].px, maxWidth: "100%" }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        role="img"
        aria-label={label}
      />
    </div>
  );
}
