// Configuración de Supabase leída de variables de entorno. Resiliente: si las
// llaves no están cargadas (p. ej. antes de configurarlas en Vercel), la app
// sigue renderizando con estados vacíos en lugar de romperse.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
