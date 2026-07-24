"use client";

import { useEffect, useRef } from "react";

/**
 * BrandNode — teaser del elemento firma (Sección 6).
 *
 * Partículas dispersas convergen al centro y se asientan en el nodo de la
 * marca ONEBODY: cuatro puntos hacia un centro. Esto es una muestra de
 * dirección a nivel Fundación; el sistema de convergencia completo (tres
 * tamaños, datos reales, 400 partículas, reveal de donación en vivo) se
 * construye en la Tanda 5.
 *
 * Cumple ya los requisitos base:
 * - requestAnimationFrame con delta-time (independiente del framerate)
 * - IntersectionObserver: pausa fuera de viewport
 * - prefers-reduced-motion: estado final estático, sin animación
 * - equivalente textual accesible vía aria-label del contenedor
 */

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  seed: number;
};

const RED = "#E02B20";
const SMOKE = "#8A8A8A";
const PARTICLE_COUNT = 90;

export function BrandNode({ size = 260 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const ringR = size * 0.28;

    // Cuatro anclas del nodo + centro (el motivo de la marca).
    const anchors = [
      { x: cx, y: cy - ringR },
      { x: cx + ringR, y: cy },
      { x: cx, y: cy + ringR },
      { x: cx - ringR, y: cy },
    ];

    // Distribuir partículas: cada una pertenece a una de las 4 corrientes.
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }).map(
      (_, i) => {
        const anchor = anchors[i % anchors.length]!;
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const radius = size * (0.5 + Math.random() * 0.4);
        return {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          tx: anchor.x + (Math.random() - 0.5) * 8,
          ty: anchor.y + (Math.random() - 0.5) * 8,
          seed: Math.random() * Math.PI * 2,
        };
      },
    );

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let progress = prefersReduced ? 1 : 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function draw(time: number) {
      if (!ctx) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;

      if (!prefersReduced) {
        progress = Math.min(1, progress + dt * 0.35);
      }
      // Easing expo-out para el asentamiento.
      const eased = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, size, size);

      // Líneas de convergencia (aparecen al final).
      if (eased > 0.8) {
        const a = (eased - 0.8) / 0.2;
        ctx.strokeStyle = `rgba(224, 43, 32, ${0.25 * a})`;
        ctx.lineWidth = 1;
        for (const anchor of anchors) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(anchor.x, anchor.y);
          ctx.stroke();
        }
      }

      // Partículas.
      for (const p of particles) {
        const drift = prefersReduced ? 0 : Math.sin(time / 900 + p.seed) * 1.4;
        const px = lerp(p.x, p.tx, eased) + drift * (1 - eased);
        const py = lerp(p.y, p.ty, eased) + drift * (1 - eased);

        // Gris disperso → rojo al converger.
        const mix = eased;
        ctx.fillStyle = mix > 0.55 ? RED : SMOKE;
        ctx.globalAlpha = 0.35 + eased * 0.55;
        const r = 1.1 + eased * 1.0;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Nodo central: late una vez al completar y se asienta.
      const pulse = eased >= 1 ? 1 + Math.sin(time / 600) * 0.06 : eased;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * pulse);
      glow.addColorStop(0, "rgba(224, 43, 32, 0.55)");
      glow.addColorStop(1, "rgba(224, 43, 32, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 26 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5 * pulse, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReduced && visible) {
        raf = requestAnimationFrame(draw);
      }
    }

    // Pausa completa fuera de viewport (Sección 6 / 10).
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible && !prefersReduced) {
          last = 0;
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.1 },
    );
    io.observe(canvas);

    // Primer frame (también cubre el estado estático de reduced-motion).
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Nodo ONEBODY: cuatro puntos convergiendo en un centro. Muchos miembros, un cuerpo."
    />
  );
}
