"use client";

import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { buildLandPoints } from "./world-mask";

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

/** Ciudades para los "blooms" de demostración (nunca luce muerto). Cobertura
 * mundial para que se sienta que la gente dona desde todas partes. */
const DEMO: [number, number][] = [
  // América del Norte
  [40.7, -74], [34, -118.2], [41.9, -87.6], [45.5, -73.6], [19.4, -99.1],
  [25.8, -80.2], [29.8, -95.4], [37.8, -122.4],
  // Caribe y Centroamérica
  [18.5, -69.9], [18.2, -66.5], [23.1, -82.4], [14.6, -90.5], [9.9, -84.1],
  // América del Sur
  [-23.5, -46.6], [-34.6, -58.4], [4.7, -74], [-12, -77], [10.5, -66.9],
  [-33.4, -70.6], [-0.2, -78.5], [-16.5, -68.1],
  // Europa
  [40.4, -3.7], [48.8, 2.3], [51.5, -0.1], [52.5, 13.4], [41.9, 12.5],
  [52.4, 4.9], [38.7, -9.1], [55.7, 37.6], [59.3, 18.1], [53.3, -6.3],
  // África
  [-33.9, 18.4], [6.5, 3.4], [30, 31.2], [-1.3, 36.8], [14.7, -17.5],
  [33.6, -7.6], [-26.2, 28.0],
  // Asia
  [35.7, 139.7], [37.5, 127], [28.6, 77.2], [1.35, 103.8], [13.7, 100.5],
  [25.2, 55.3], [31.2, 121.5], [14.6, 121], [39.9, 116.4], [24.5, 54.4],
  // Oceanía
  [-33.8, 151.2], [-37.8, 144.9], [-36.8, 174.8],
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

    // Océano: esfera de puntos (fibonacci) muy tenue, textura sutil.
    const N = 700;
    const pts: [number, number, number][] = [];
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gold * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    // Continentes reales (Natural Earth 110m) como puntos de tierra.
    const land = buildLandPoints(0.7);
    const santiago = toVec(SANTIAGO.lat, SANTIAGO.lng);

    // Dirección de luz (arriba-izquierda-frente): da volumen de esfera real.
    const LL = Math.hypot(-0.5, 0.62, 0.7);
    const light: [number, number, number] = [-0.5 / LL, 0.62 / LL, 0.7 / LL];

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
      if (blooms.length > 60) blooms.shift();
      if (arcs.length > 60) arcs.shift();
    }
    /** Una donación de demostración desde una ciudad al azar. */
    function spawnRandom() {
      const c = DEMO[Math.floor(Math.random() * DEMO.length)]!;
      spawn(c[0], c[1]);
    }

    function rot(v: [number, number, number], a: number): [number, number, number] {
      const [x, y, z] = v;
      return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
    }

    function draw(angle: number) {
      g.clearRect(0, 0, W, H);

      // Cuerpo de la esfera: degradado cálido iluminado arriba-izquierda → volumen.
      const gx = cx - R * 0.3, gy = cy - R * 0.36;
      const body = g.createRadialGradient(gx, gy, R * 0.15, cx, cy, R * 1.02);
      body.addColorStop(0, "rgba(255,252,245,0.95)");
      body.addColorStop(0.5, "rgba(246,241,232,0.7)");
      body.addColorStop(1, "rgba(228,219,204,0.3)");
      g.beginPath();
      g.fillStyle = body;
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      // Sombra de borde: refuerza la curvatura de la esfera.
      const rim = g.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      rim.addColorStop(0, "rgba(110,95,74,0)");
      rim.addColorStop(1, "rgba(110,95,74,0.2)");
      g.beginPath();
      g.fillStyle = rim;
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      // Atmósfera: halo cálido suave por fuera del globo.
      const atm = g.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.16);
      atm.addColorStop(0, "rgba(233,183,84,0.18)");
      atm.addColorStop(1, "rgba(233,183,84,0)");
      g.beginPath();
      g.fillStyle = atm;
      g.arc(cx, cy, R * 1.16, 0, Math.PI * 2);
      g.fill();

      // Océano: puntos muy tenues (textura del agua).
      for (const p of pts) {
        const [x, y, z] = rot(p, angle);
        if (z < -0.15) continue;
        const depth = (z + 1) / 2; // 0 atrás .. 1 frente
        const lit = Math.max(0, x * light[0] + y * light[1] + z * light[2]);
        const alpha = (0.04 + depth * 0.1) * (0.4 + lit * 0.6);
        g.beginPath();
        g.fillStyle = `rgba(96,84,66,${alpha})`;
        g.arc(cx + x * R, cy - y * R, 0.5 + depth * 0.7, 0, Math.PI * 2);
        g.fill();
      }
      // Continentes reales: tinta cálida, iluminados (cara de luz más viva).
      for (const p of land) {
        const [x, y, z] = rot(p, angle);
        if (z < -0.12) continue;
        const depth = (z + 1) / 2;
        const lit = Math.max(0, x * light[0] + y * light[1] + z * light[2]);
        const alpha = (0.3 + depth * 0.5) * (0.42 + lit * 0.68);
        const gg = Math.round(lit * 34);
        g.beginPath();
        g.fillStyle = `rgba(${78 + gg},${Math.round(62 + gg * 0.5)},44,${alpha})`;
        g.arc(cx + x * R, cy - y * R, 0.7 + depth * 1.2, 0, Math.PI * 2);
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
      spawn(40, -3.7); spawn(35.7, 139.7); spawn(-23.5, -46.6);
      spawn(40.7, -74); spawn(-33.9, 18.4); spawn(28.6, 77.2);
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
      demoTimer -= dt;
      if (demoTimer <= 0) {
        // Intervalo corto y variado → sensación de donaciones constantes.
        demoTimer = 0.5 + Math.random() * 0.9;
        spawnRandom();
        // A veces, una ráfaga: dos o tres a la vez, en distintos continentes.
        if (Math.random() < 0.35) spawnRandom();
        if (Math.random() < 0.15) spawnRandom();
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
