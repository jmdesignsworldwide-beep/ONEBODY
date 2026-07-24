import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// ---------------------------------------------------------------------------
// Cabeceras de seguridad (Sección 9.5) — endurecidas en la Tanda 16 (auditoría).
// Content-Security-Policy estricta: bloquea scripts externos, framing, plugins,
// y limita las conexiones al propio origen y a Supabase. `connect-src` incluye
// el origen REST (https) y el de tiempo real (wss) de Supabase para el muro en
// vivo. `img-src https:` permite portadas de proyecto servidas desde cualquier
// origen (las fija un editor). `script-src 'unsafe-inline'` es un residuo
// aceptado: Next App Router inyecta scripts de arranque en línea y no se
// propaga un nonce a través del middleware de next-intl; el riesgo real de XSS
// es mínimo porque la app NO renderiza HTML provisto por el usuario (React
// escapa todo; no hay dangerouslySetInnerHTML).
// ---------------------------------------------------------------------------
function supabaseOrigin(): { https: string; wss: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return { https: "", wss: "" };
  try {
    const host = new URL(url).host;
    return { https: `https://${host}`, wss: `wss://${host}` };
  } catch {
    return { https: "", wss: "" };
  }
}

const sb = supabaseOrigin();
const isDev = process.env.NODE_ENV === "development";

const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  // 'unsafe-eval' sólo en desarrollo (React Fast Refresh); nunca en producción.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${sb.https} ${sb.wss}`.trim(),
  `manifest-src 'self'`,
  `worker-src 'self'`,
  `frame-src 'self'`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Los dominios de Supabase Storage se añaden en la Tanda 2.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
