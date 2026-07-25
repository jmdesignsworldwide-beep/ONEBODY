"use client";

/**
 * Arte de planta realista, compartido por el árbol de meta (GrowthMeter) y la
 * escena de la semilla (SeedScene). En vez de line-art fino (que se ve "hecho
 * por computadora"), son formas RELLENAS con degradado y sombreado: hojas con
 * volumen, tallo con grosor leñoso→verde, tierra cálida y una floración dorada.
 * Todo por código, sin assets. Verdes cálidos que armonizan con el marfil; el
 * rojo de marca se respeta (no aparece aquí).
 *
 * viewBox de referencia: 0 0 160 220 · base (suelo) en y=170.
 */

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

export type Leaf = { bx: number; by: number; tx: number; ty: number; w: number };

/** Hojas de abajo (anchas) hacia arriba (pequeñas), alternando lados. */
export const LEAVES: Leaf[] = [
  { bx: 78, by: 150, tx: 34, ty: 141, w: 15 },
  { bx: 82, by: 144, tx: 126, ty: 133, w: 15 },
  { bx: 79, by: 122, tx: 41, ty: 105, w: 13 },
  { bx: 81, by: 114, tx: 119, ty: 99, w: 13 },
  { bx: 79, by: 96, tx: 52, ty: 77, w: 11 },
  { bx: 81, by: 90, tx: 108, ty: 73, w: 11 },
  { bx: 80, by: 74, tx: 66, ty: 55, w: 8.5 },
  { bx: 80, by: 72, tx: 94, ty: 53, w: 8.5 },
];

export const STEM_D =
  "M77 170 C 75.5 130, 78 96, 79 66 C 79.5 60, 80.5 60, 81 66 C 82 96, 84.5 130, 83 170 Z";
export const SOIL_BACK = "M20 170 Q80 152 140 170 Q80 188 20 170 Z";
export const SOIL_FRONT = "M30 171 Q80 160 130 171 Q80 182 30 171 Z";

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

/** Una hoja rellena con su nervadura central más clara. */
function LeafShape({ id, leaf }: { id: string; leaf: Leaf }) {
  const mid = `M${leaf.bx} ${leaf.by} Q ${(leaf.bx + leaf.tx) / 2} ${
    (leaf.by + leaf.ty) / 2
  }, ${leaf.tx} ${leaf.ty}`;
  return (
    <g>
      <path d={leafPath(leaf.bx, leaf.by, leaf.tx, leaf.ty, leaf.w)} fill={`url(#${id}-leaf)`} />
      <path
        d={mid}
        fill="none"
        stroke="#e7f0c8"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </g>
  );
}

/** La floración dorada de la copa (aparece al llegar arriba). NO roja. */
function Bloom({ id, cx, cy }: { id: string; cx: number; cy: number }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return (
      <ellipse
        key={i}
        cx={cx + Math.cos(a) * 6}
        cy={cy + Math.sin(a) * 6}
        rx={5.4}
        ry={3.1}
        fill={`url(#${id}-bloom)`}
        transform={`rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * 6} ${
          cy + Math.sin(a) * 6
        })`}
      />
    );
  });
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={3.4} fill="#c9821f" />
    </g>
  );
}

/**
 * El cuerpo de la planta (tallo → hojas → floración). El suelo se dibuja aparte
 * porque no debe recortarse con el crecimiento. Pensado para ir DENTRO de un
 * grupo con clip que revela de abajo hacia arriba.
 */
export function PlantBody({ id }: { id: string }) {
  return (
    <g filter={`url(#${id}-soft)`}>
      <path d={STEM_D} fill={`url(#${id}-stem)`} />
      {LEAVES.map((leaf, i) => (
        <LeafShape key={i} id={id} leaf={leaf} />
      ))}
      <Bloom id={id} cx={80} cy={58} />
    </g>
  );
}

/** El montículo de tierra (siempre visible, no se recorta). */
export function Soil({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx={80} cy={182} rx={48} ry={6} fill="rgba(40,28,12,0.14)" />
      <path d={SOIL_BACK} fill={`url(#${id}-soil)`} />
      <path d={SOIL_FRONT} fill="#3f2b19" fillOpacity="0.55" />
    </g>
  );
}
