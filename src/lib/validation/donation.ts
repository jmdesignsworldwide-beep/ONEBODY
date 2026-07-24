import { z } from "zod";

/**
 * Validación y sanitización de la donación en el borde (Sección 9.4). Se aplica
 * en el servidor SIEMPRE, no sólo en UI. El anonimato controla la visibilidad
 * pública; el sistema siempre registra quién donó (requisito legal, Sección 5.3).
 */
export const donationSchema = z.object({
  amountUsd: z.coerce
    .number()
    .int("El monto debe ser un número entero.")
    .min(1, "El monto mínimo es 1 USD.")
    .max(1_000_000, "Monto demasiado alto."),
  projectId: z.string().uuid().nullish(),
  recurring: z.boolean().default(false),
  donorName: z.string().trim().min(1, "Ingresa tu nombre.").max(120),
  donorEmail: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
  isAnonymous: z.boolean().default(false),
  message: z.string().trim().max(500).optional().nullable(),
  locale: z.string().min(2).max(5),
});

export type DonationInput = z.infer<typeof donationSchema>;

export const PRESET_AMOUNTS = [25, 50, 100, 250] as const;
