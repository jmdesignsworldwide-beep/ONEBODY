"use client";

import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

/** Santiago de los Caballeros, RD. */
const SANTIAGO = { lat: 19.45, lng: -70.7 };

/** Centroides aproximados por código de país (ISO-2) para ubicar donaciones. */
const COUNTRY: Record<string, [number, number]> = {
  DO: [19.0, -70.7], US: [39, -98], CA: [56, -106], MX: [23, -102],
  ES: [40, -3.7], FR: [46, 2], DE: [51, 10], IT: [42, 12], GB: [54, -2],
  NL: [52, 5], PT: [39.5, -8], BR: [-10, -55], AR: [-38, -63], CO: [4, -73],
  CL: [-33, -71], PE: [-10, -76], VE: [8, -66], PR: [18.2, -66.5], HT: [19, -72.3],
  CN: [35, 105], JP: [36, 138], KR: [37, 128], IN: [22, 79], RU: [61, 90],
  PL: [52, 20], AU: [-25, 134], ZA: [-29, 24], NG: [9, 8], EG: [26, 30],
  AE: [24, 54], SA: [24, 45], MA: [32, -6], KE: [0, 38], PH: [13, 122],
};

/** Ciudades para los "blooms" de demostración (nunca luce muerto). */
const DEMO: [number, number][] = [
  [40, -3.7], [48.8, 2.3], [51.5, -0.1], [40.7, -74], [19.4, -99.1],
  [-23.5, -46.6], [-34.6, -58.4], [4.7, -74], [35.7, 139.7], [37.5, 127],
  [28.6, 77.2], [-33.9, 18.4], [55.7, 37.6], [30, 31.2], [-33.8, 151.2],
];

function toVec(lat: number, lng: number): [number, number, number] {
  const p = (lat * Math.PI) / 180;
  const l = (lng * Math.PI) / 180;
  return [Math.cos(p) * Math.cos(l), Math.sin(p), Math.cos(p) * Math.sin(l)];
}

type Bloom = { v: [number, number, number]; t: number };
type Arc = { a: [number, number, number]; b: [number, number, number]; t: number };

export function GlobeScene({ ariaLabel }: { ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv0 = canvasRef.current;
    if (!cv0) return;
    const cv = cv0;
    const ctx0 = cv.getContext("2d");
    if (!ctx0) return;
    const g = ctx0;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Esfera de puntos (fibonacci) — globo de luz, ligero.
    const N = 1500;
    const pts: [number, number, number][] = [];
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gold * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    const santiago = toVec(SANTIAGO.lat, SANTIAGO.lng);

    let W = 0, H = 0, cx = 0, cy = 0, R = 0, dpr = 1;
    function resize() {
      const rect = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.42;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const blooms: Bloom[] = [];
    const arcs: Arc[] = [];
    function spawn(lat: number, lng: number) {
      const v = toVec(lat, lng);
      blooms.push({ v, t: 0 });
      arcs.push({ a: v, b: santiago, t: 0 });
      if (blooms.length > 30) blooms.shift();
      if (arcs.length > 30) arcs.shift();
    }

    function rot(v: [number, number, number], a: number): [number, number, number] {
      const [x, y, z] = v;
      return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
    }

    function draw(angle: number) {
      g.clearRect(0, 0, W, H);
      // puntos del globo
      for (const p of pts) {
        const [x, y, z] = rot(p, angle);
        if (z < -0.15) continue;
        const depth = (z + 1) / 2; // 0 atrás .. 1 frente
        const sx = cx + x * R;
        const sy = cy - y * R;
        g.beginPath();
        g.fillStyle = `rgba(40,36,32,${0.12 + depth * 0.5})`;
        g.arc(sx, sy, 0.7 + depth * 1.0, 0, Math.PI * 2);
        g.fill();
      }
      // arcos de donación hacia Santiago
      for (const arc of arcs) {
        const Ω = Math.acos(Math.max(-1, Math.min(1, arc.a[0] * arc.b[0] + arc.a[1] * arc.b[1] + arc.a[2] * arc.b[2])));
        const steps = 26;
        const head = Math.min(1, arc.t / 1.1);
        g.beginPath();
        let started = false;
        for (let i = 0; i <= steps; i++) {
          const tt = i / steps;
          if (tt > head) break;
          const s = Ω < 1e-3 ? arc.a : (() => {
            const s1 = Math.sin((1 - tt) * Ω) / Math.sin(Ω);
            const s2 = Math.sin(tt * Ω) / Math.sin(Ω);
            return [
              arc.a[0] * s1 + arc.b[0] * s2,
              arc.a[1] * s1 + arc.b[1] * s2,
              arc.a[2] * s1 + arc.b[2] * s2,
            ] as [number, number, number];
          })();
          const lift = 1 + 0.16 * Math.sin(Math.PI * tt);
          const [x, y, z] = rot([s[0] * lift, s[1] * lift, s[2] * lift], angle);
          if (z < -0.1) { started = false; continue; }
          const sx = cx + x * R, sy = cy - y * R;
          if (!started) { g.moveTo(sx, sy); started = true; } else g.lineTo(sx, sy);
        }
        g.strokeStyle = `rgba(224,43,32,${0.5 * (1 - arc.t / 1.6)})`;
        g.lineWidth = 1.4;
        g.stroke();
      }
      // blooms (anillos que crecen)
      for (const b of blooms) {
        const [x, y, z] = rot(b.v, angle);
        if (z < -0.05) continue;
        const sx = cx + x * R, sy = cy - y * R;
        const rr = b.t * 26;
        const a = Math.max(0, 1 - b.t / 1.4);
        g.beginPath();
        g.strokeStyle = `rgba(224,43,32,${a * 0.7})`;
        g.lineWidth = 1.5;
        g.arc(sx, sy, 3 + rr, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.fillStyle = `rgba(224,43,32,${a})`;
        g.arc(sx, sy, 2.4, 0, Math.PI * 2);
        g.fill();
      }
      // Santiago: latido rojo permanente
      {
        const [x, y, z] = rot(santiago, angle);
        if (z >= -0.05) {
          const sx = cx + x * R, sy = cy - y * R;
          const pulse = 0.5 + 0.5 * Math.sin(angle * 6);
          g.beginPath();
          g.fillStyle = `rgba(224,43,32,${0.18 + pulse * 0.22})`;
          g.arc(sx, sy, 6 + pulse * 5, 0, Math.PI * 2);
          g.fill();
          g.beginPath();
          g.fillStyle = "rgb(224,43,32)";
          g.arc(sx, sy, 3, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    // reduced-motion: un solo fotograma estático, digno.
    if (reduce) {
      draw(-0.6);
      spawn(40, -3.7); spawn(35.7, 139.7); spawn(-23.5, -46.6);
      draw(-0.6);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let angle = 0;
    let demoTimer = 0;
    let visible = true;

    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e?.isIntersecting;
        if (visible && !raf) { last = 0; raf = requestAnimationFrame(loop); }
      },
      { threshold: 0.05 },
    );
    io.observe(cv);

    function loop(ts: number) {
      if (!visible) { raf = 0; return; }
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts;
      angle += dt * ((2 * Math.PI) / 40); // ~40s/vuelta
      for (const b of blooms) b.t += dt;
      for (const a of arcs) a.t += dt;
      while (blooms.length && blooms[0]!.t > 1.6) blooms.shift();
      while (arcs.length && arcs[0]!.t > 1.7) arcs.shift();
      demoTimer += dt;
      if (demoTimer > 2.8) {
        demoTimer = 0;
        const c = DEMO[Math.floor((angle * 1000) % DEMO.length)]!;
        spawn(c[0], c[1]);
      }
      draw(angle);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // Realtime: cada donación florece sobre su país y viaja a Santiago.
    const supabase = getBrowserClient();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    if (supabase) {
      channel = supabase
        .channel("globe_wall_feed")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "public_wall" },
          (payload) => {
            const cc = (payload.new as { country_code?: string }).country_code;
            const coord = cc ? COUNTRY[cc.toUpperCase()] : undefined;
            if (coord) spawn(coord[0], coord[1]);
            else spawn(SANTIAGO.lat + (Math.sin(angle) * 6), SANTIAGO.lng + Math.cos(angle) * 6);
          },
        )
        .subscribe();
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className="h-full w-full"
    />
  );
}
