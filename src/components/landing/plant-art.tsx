"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

/**
 * Arte de planta realista, compartido por el árbol de meta (GrowthMeter) y la
 * escena de la semilla (SeedScene). Formas RELLENAS con degradado y sombreado:
 * hojas con volumen, tallo leñoso→verde, tierra cálida y floración dorada.
 *
 * El crecimiento es ORGÁNICO: en vez de recortar la planta con una línea recta
 * (que cortaba las hojas por la mitad), cada parte crece escalándose desde su
 * base — el tallo sube y cada hoja se despliega en secuencia. Se maneja con un
 * único MotionValue `progress` (0→1), así sirve tanto para el % de meta como
 * para el scroll. Verdes cálidos que armonizan con el marfil; sin rojo.
 *
 * viewBox de referencia: 0 0 160 220 · base (suelo) en y=170.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Almendra de hoja con nervadura, de la base (bx,by) a la punta (tx,ty). */
export function leafPath(
  bx: number,
  by: number,
  tx: number,
  ty: number,
  w: number,
) {
  const dx = tx - bx;
  const dy = ty - by;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const c1x = bx + ux * len * 0.3 + px * w;
  const c1y = by + uy * len * 0.3 + py * w;
  const c2x = bx + ux * len * 0.72 + px * w * 0.62;
  const c2y = by + uy * len * 0.72 + py * w * 0.62;
  const c3x = bx + ux * len * 0.72 - px * w * 0.62;
  const c3y = by + uy * len * 0.72 - py * w * 0.62;
  const c4x = bx + ux * len * 0.3 - px * w;
  const c4y = by + uy * len * 0.3 - py * w;
  return `M${bx} ${by} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${bx} ${by} Z`;
}

export type Leaf = {
  bx: number;
  by: number;
  tx: number;
  ty: number;
  w: number;
  th: number;
};

/** Hojas de abajo (anchas, antes) hacia arriba (pequeñas, después). `th` es el
 * umbral de progreso en que cada hoja empieza a desplegarse. */
export const LEAVES: Leaf[] = [
  { bx: 78, by: 150, tx: 34, ty: 141, w: 15, th: 0.12 },
  { bx: 82, by: 144, tx: 126, ty: 133, w: 15, th: 0.17 },
  { bx: 79, by: 122, tx: 41, ty: 105, w: 13, th: 0.33 },
  { bx: 81, by: 114, tx: 119, ty: 99, w: 13, th: 0.38 },
  { bx: 79, by: 96, tx: 52, ty: 77, w: 11, th: 0.53 },
  { bx: 81, by: 90, tx: 108, ty: 73, w: 11, th: 0.58 },
  { bx: 80, by: 74, tx: 66, ty: 55, w: 8.5, th: 0.72 },
  { bx: 80, by: 72, tx: 94, ty: 53, w: 8.5, th: 0.76 },
];

export const STEM_D =
  "M77 170 C 75.5 130, 78 96, 79 66 C 79.5 60, 80.5 60, 81 66 C 82 96, 84.5 130, 83 170 Z";
const SOIL_BACK = "M20 170 Q80 152 140 170 Q80 188 20 170 Z";
const SOIL_FRONT = "M30 171 Q80 160 130 171 Q80 182 30 171 Z";

/** Degradados y filtro suave, con ids únicos por instancia. */
export function PlantDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6f9245" />
        <stop offset="0.55" stopColor="#7c6238" />
        <stop offset="1" stopColor="#5f4227" />
      </linearGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bcd487" />
        <stop offset="0.5" stopColor="#82a94e" />
        <stop offset="1" stopColor="#557f34" />
      </linearGradient>
      <linearGradient id={`${id}-soil`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8a6440" />
        <stop offset="1" stopColor="#523823" />
      </linearGradient>
      <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="rgba(233,183,84,0.42)" />
        <stop offset="0.55" stopColor="rgba(233,183,84,0.14)" />
        <stop offset="1" stopColor="rgba(233,183,84,0)" />
      </radialGradient>
      <radialGradient id={`${id}-bloom`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#f4d78a" />
        <stop offset="1" stopColor="#e0a63f" />
      </radialGradient>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow
          dx="0"
          dy="1.4"
          stdDeviation="1.6"
          floodColor="#3a2a12"
          floodOpacity="0.28"
        />
      </filter>
    </defs>
  );
}

/** Una hoja que se despliega (escala desde su base) al pasar su umbral. */
function AnimatedLeaf({
  id,
  leaf,
  progress,
}: {
  id: string;
  leaf: Leaf;
  progress: MotionValue<number>;
}) {
  const scale = useTransform(progress, [leaf.th, leaf.th + 0.18], [0, 1], {
    clamp: true,
  });
  const mid = `M${leaf.bx} ${leaf.by} Q ${(leaf.bx + leaf.tx) / 2} ${
    (leaf.by + leaf.ty) / 2
  }, ${leaf.tx} ${leaf.ty}`;
  return (
    <motion.g
      style={{
        scale,
        transformBox: "view-box",
        transformOrigin: `${leaf.bx}px ${leaf.by}px`,
      }}
    >
      <path
        d={leafPath(leaf.bx, leaf.by, leaf.tx, leaf.ty, leaf.w)}
        fill={`url(#${id}-leaf)`}
      />
      <path
        d={mid}
        fill="none"
        stroke="#e7f0c8"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

/** El tallo, que sube escalándose desde la base del suelo. */
function AnimatedStem({
  id,
  progress,
}: {
  id: string;
  progress: MotionValue<number>;
}) {
  const scaleY = useTransform(progress, [0, 0.82], [0.05, 1], { clamp: true });
  return (
    <motion.path
      d={STEM_D}
      fill={`url(#${id}-stem)`}
      style={{
        scaleY,
        transformBox: "view-box",
        transformOrigin: "80px 170px",
      }}
    />
  );
}

/** La floración dorada de la copa (aparece al final). NO roja. */
function AnimatedBloom({
  id,
  progress,
  cx,
  cy,
}: {
  id: string;
  progress: MotionValue<number>;
  cx: number;
  cy: number;
}) {
  const scale = useTransform(progress, [0.85, 1], [0, 1], { clamp: true });
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    const ex = cx + Math.cos(a) * 6;
    const ey = cy + Math.sin(a) * 6;
    return (
      <ellipse
        key={i}
        cx={ex}
        cy={ey}
        rx={5.4}
        ry={3.1}
        fill={`url(#${id}-bloom)`}
        transform={`rotate(${(a * 180) / Math.PI} ${ex} ${ey})`}
      />
    );
  });
  return (
    <motion.g
      style={{
        scale,
        transformBox: "view-box",
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      {petals}
      <circle cx={cx} cy={cy} r={3.4} fill="#c9821f" />
    </motion.g>
  );
}

/** El montículo de tierra (siempre visible, no crece). */
export function Soil({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx={80} cy={182} rx={48} ry={6} fill="rgba(40,28,12,0.14)" />
      <path d={SOIL_BACK} fill={`url(#${id}-soil)`} />
      <path d={SOIL_FRONT} fill="#3f2b19" fillOpacity="0.55" />
    </g>
  );
}

/**
 * Planta que crece orgánicamente con `progress` (0→1): tallo que sube, hojas
 * que se despliegan en secuencia y floración final. Sin recortes ni líneas.
 * Incluye halo cálido que crece y un balanceo mínimo en reposo (si `sway`).
 */
export function GrowingPlant({
  id,
  progress,
  sway = true,
}: {
  id: string;
  progress: MotionValue<number>;
  sway?: boolean;
}) {
  const haloScale = useTransform(progress, [0, 1], [0.55, 1.15]);
  const haloOpacity = useTransform(progress, [0, 1], [0.25, 1]);
  return (
    <>
      <motion.circle
        cx={80}
        cy={116}
        r={72}
        fill={`url(#${id}-halo)`}
        style={{
          scale: haloScale,
          opacity: haloOpacity,
          transformBox: "view-box",
          transformOrigin: "80px 116px",
        }}
      />
      <Soil id={id} />
      {/* Semilla asomando en la tierra (ancla la etapa temprana). */}
      <ellipse cx={80} cy={166} rx={5.5} ry={7} fill={`url(#${id}-soil)`} />
      <motion.g
        animate={sway ? { rotate: [-1.4, 1.4, -1.4] } : undefined}
        transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
        style={{ transformBox: "view-box", transformOrigin: "80px 170px" }}
      >
        <g filter={`url(#${id}-soft)`}>
          <AnimatedStem id={id} progress={progress} />
          {LEAVES.map((leaf, i) => (
            <AnimatedLeaf key={i} id={id} leaf={leaf} progress={progress} />
          ))}
          <AnimatedBloom id={id} progress={progress} cx={80} cy={58} />
        </g>
      </motion.g>
    </>
  );
}

export { EASE };
