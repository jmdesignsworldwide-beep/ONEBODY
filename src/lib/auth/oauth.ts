// Metadatos de los proveedores OAuth soportados. Compartido por el botón
// (cliente) y por la server action / callback (servidor). Sin secretos: las
// credenciales de cada proveedor viven EXCLUSIVAMENTE en el dashboard de
// Supabase → Authentication → Providers, nunca en el código ni en el cliente.

export const OAUTH_PROVIDERS = ["google", "apple", "facebook"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Proveedores que se muestran en la pantalla. Se controla con la variable de
 * entorno pública `NEXT_PUBLIC_AUTH_PROVIDERS` (lista separada por comas). Si no
 * está definida, se muestran los tres — así el diseño es visible en el preview
 * aunque las credenciales aún no estén configuradas en Supabase. La directora
 * puede restringirla a los proveedores ya configurados cuando quiera.
 */
export function enabledOAuthProviders(): OAuthProvider[] {
  const raw = process.env.NEXT_PUBLIC_AUTH_PROVIDERS?.trim();
  if (!raw) return [...OAUTH_PROVIDERS];
  const set = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(isOAuthProvider);
  return OAUTH_PROVIDERS.filter((p) => set.includes(p));
}
