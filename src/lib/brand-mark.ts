/** SVG del nodo de convergencia ONEBODY (marca). Fuente única para iconos PNG
 *  generados con next/og y para usos server-side. Fondo negro, nodo rojo. */
export const BRAND_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0A0A0A"/>
  <g stroke="#E02B20" stroke-width="10" stroke-linecap="round">
    <line x1="256" y1="256" x2="256" y2="150"/>
    <line x1="256" y1="256" x2="362" y2="256"/>
    <line x1="256" y1="256" x2="256" y2="362"/>
    <line x1="256" y1="256" x2="150" y2="256"/>
  </g>
  <g fill="#E02B20">
    <circle cx="256" cy="150" r="22"/>
    <circle cx="362" cy="256" r="22"/>
    <circle cx="256" cy="362" r="22"/>
    <circle cx="150" cy="256" r="22"/>
    <circle cx="256" cy="256" r="30"/>
  </g>
</svg>`;

export function brandMarkDataUri(): string {
  return `data:image/svg+xml,${encodeURIComponent(BRAND_MARK_SVG)}`;
}
