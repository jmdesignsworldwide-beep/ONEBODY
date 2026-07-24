import type { DayPoint, Point } from "@/lib/admin/analytics-queries";

/** Lista de barras horizontales monocromas. `format` da el valor legible. */
export function BarList({
  points,
  format,
  labelFor,
}: {
  points: Point[];
  format: (n: number) => string;
  labelFor?: (label: string) => string;
}) {
  const max = points.reduce((m, p) => Math.max(m, p.value), 0) || 1;
  if (points.length === 0)
    return <p className="text-sm text-ob-smoke">—</p>;
  return (
    <ul className="space-y-2.5">
      {points.map((p) => (
        <li key={p.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ob-bone">
              {labelFor ? labelFor(p.label) : p.label}
            </span>
            <span className="tabular shrink-0 text-ob-smoke">
              {format(p.value)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ob-ash/30">
            <div
              className="h-full rounded-full bg-ob-bone/70"
              style={{ width: `${Math.max(2, (p.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Área/serie temporal en SVG (viewBox responsivo). Acento rojo: es la misión. */
export function AreaChart({
  points,
  format,
}: {
  points: DayPoint[];
  format: (n: number) => string;
}) {
  const W = 720;
  const H = 160;
  const P = 4;
  const max = points.reduce((m, p) => Math.max(m, p.value), 0) || 1;
  const n = points.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * (W - P * 2) + P);
  const y = (v: number) => H - P - (v / max) * (H - P * 2);

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const area = `${P},${H - P} ${line} ${W - P},${H - P}`;
  const total = points.reduce((s, p) => s + p.value, 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="tabular font-display text-2xl text-ob-bone">
          {format(total)}
        </span>
        <span className="text-xs uppercase tracking-widest text-ob-smoke">
          {n}d
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-40 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <polygon points={area} fill="var(--color-ob-red)" opacity="0.12" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--color-ob-red)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
