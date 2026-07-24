"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * SISTEMA DE CONVERGENCIA — elemento firma (Sección 6).
 *
 * El logo de ONEBODY es cuatro puntos convergiendo en un centro. Esta
 * visualización es ese gesto, ejecutado por las donaciones reales. No es una
 * barra de progreso.
 *
 * - 0%: partículas dispersas en los bordes, tenues, grises, en deriva lenta.
 * - progreso creciente: migran al centro, adquieren el rojo, densifican; el
 *   nodo se insinúa y crece del centro hacia afuera.
 * - donación en vivo (`pulseSignal`): un pulso entra desde el borde con estela
 *   y trayectoria acelerada; onda expansiva al llegar. Algo que *llegó*.
 * - 100%: colapsan en el nodo perfecto, destello, un latido, y queda como
 *   marca terminada. Sin confeti.
 *
 * Requisitos cumplidos: rAF con delta-time (independiente del framerate),
 * IntersectionObserver (pausa fuera de viewport), prefers-reduced-motion
 * (estado final estático), ≤400 partículas, tres tamaños, equivalente textual.
 */

export type ConvergenceVariant = "hero" | "card" | "inline";

const RED = { r: 224, g: 43, b: 32 };
const SMOKE = { r: 138, g: 138, b: 138 };

const PRESETS: Record<
  ConvergenceVariant,
  { count: number; dot: number; core: number; px: number }
> = {
  hero: { count: 320, dot: 1.7, core: 5, px: 440 },
  card: { count: 160, dot: 1.5, core: 4, px: 240 },
  inline: { count: 64, dot: 1.2, core: 3, px: 100 },
};

type Particle = {
  hx: number; // hogar (borde)
  hy: number;
  tx: number; // objetivo (nodo)
  ty: number;
  threshold: number; // progreso al que se "engancha"
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

  // Sincroniza el progreso objetivo sin reinicializar el canvas.
  useEffect(() => {
    targetRef.current = Math.max(0, Math.min(1, progress));
  }, [progress]);

  // Dispara un pulso de donación cuando cambia la señal.
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
    const armR = S * 0.34;

    // Cuatro brazos hacia arriba/derecha/abajo/izquierda (el motivo del nodo).
    const dirs = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    const particles: Particle[] = Array.from({ length: preset.count }).map(
      (_, i) => {
        const dir = dirs[i % 4]!;
        // Sesgo hacia el centro: el nodo se llena de dentro hacia afuera.
        const t = Math.pow(Math.random(), 0.7);
        const jitter = (Math.random() - 0.5) * S * 0.05;
        const perp = { x: -dir.y, y: dir.x };
        const tx = cx + dir.x * t * armR + perp.x * jitter;
        const ty = cy + dir.y * t * armR + perp.y * jitter;
        const edgeAngle = Math.random() * Math.PI * 2;
        const edgeR = S * (0.55 + Math.random() * 0.5);
        return {
          hx: cx + Math.cos(edgeAngle) * edgeR,
          hy: cy + Math.sin(edgeAngle) * edgeR,
          tx,
          ty,
          threshold: t, // engancha según distancia al centro
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

    function mix(a: typeof RED, b: typeof RED, k: number) {
      return `rgb(${Math.round(a.r + (b.r - a.r) * k)},${Math.round(
        a.g + (b.g - a.g) * k,
      )},${Math.round(a.b + (b.b - a.b) * k)})`;
    }
    function easeOut(x: number) {
      return 1 - Math.pow(1 - x, 3);
    }

    function frame(time: number) {
      if (!ctx) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;

      // Aproxima el progreso actual al objetivo (o autoplay hacia 1).
      const goal = autoplay ? 1 : targetRef.current;
      if (!prefersReduced) cur += (goal - cur) * Math.min(1, dt * 2.2);
      else cur = goal;
      const p = Math.max(0, Math.min(1, cur));
      const complete = p > 0.995;

      ctx.clearRect(0, 0, S, S);

      // Líneas del nodo (aparecen cerca del final).
      if (p > 0.75) {
        const a = (p - 0.75) / 0.25;
        ctx.strokeStyle = `rgba(224,43,32,${0.22 * a})`;
        ctx.lineWidth = 1;
        for (const d of dirs) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + d.x * armR, cy + d.y * armR);
          ctx.stroke();
        }
      }

      // Partículas.
      for (const pt of particles) {
        const locked = p >= pt.threshold;
        // k: 0 en el borde (deriva), 1 asentado en el nodo.
        const k = locked
          ? easeOut(Math.min(1, (p - pt.threshold) / 0.15 + 0.35))
          : 0;
        const drift = prefersReduced ? 0 : Math.sin(time / 950 + pt.seed) * 1.6;
        const bx = pt.hx + drift;
        const by = pt.hy + Math.cos(time / 1100 + pt.seed) * 1.6;
        const x = bx + (pt.tx - bx) * k;
        const y = by + (pt.ty - by) * k;

        ctx.globalAlpha = 0.28 + k * 0.6;
        ctx.fillStyle = k > 0.4 ? mix(SMOKE, RED, Math.min(1, (k - 0.4) / 0.6)) : `rgb(138,138,138)`;
        const r = preset.dot * (0.8 + k * 0.7);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Pulsos de donación (borde → centro con estela) y ondas.
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pl = pulses[i]!;
        pl.t += dt / 0.8;
        const e = easeOut(Math.min(1, pl.t));
        const x = pl.sx + (cx - pl.sx) * e;
        const y = pl.sy + (cy - pl.sy) * e;
        // estela
        const tailX = pl.sx + (cx - pl.sx) * easeOut(Math.max(0, pl.t - 0.12));
        const tailY = pl.sy + (cy - pl.sy) * easeOut(Math.max(0, pl.t - 0.12));
        ctx.strokeStyle = "rgba(224,43,32,0.5)";
        ctx.lineWidth = preset.dot * 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "rgb(224,43,32)";
        ctx.beginPath();
        ctx.arc(x, y, preset.dot * 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (pl.t >= 1) {
          ripples.push({ r: 0, a: 0.5 });
          flash = Math.max(flash, 0.7);
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
        ctx.strokeStyle = `rgba(224,43,32,${rp.a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Destello al completar (una vez).
      if (complete && settledPulse === 0) {
        settledPulse = 1;
        flash = Math.max(flash, 1);
      }
      if (flash > 0) flash = Math.max(0, flash - dt * 1.6);

      // Nodo central: crece con el progreso, late al completar, se asienta.
      const beat = complete && !prefersReduced ? 1 + Math.sin(time / 620) * 0.05 : 1;
      const coreR = preset.core * (0.4 + p * 0.6) * beat;
      const glowR = coreR * (3.2 + flash * 2.5);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(224,43,32,${0.35 + flash * 0.5})`);
      glow.addColorStop(1, "rgba(224,43,32,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgb(224,43,32)";
      ctx.globalAlpha = 0.5 + p * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Ambiente continuo mientras esté visible (deriva + latido). El
      // IntersectionObserver detiene el bucle por completo fuera de viewport.
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

    // Pausa completa fuera de viewport.
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

    // Primer frame (cubre también el estado estático de reduced-motion).
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
