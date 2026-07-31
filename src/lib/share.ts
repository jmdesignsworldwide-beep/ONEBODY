// Construye los enlaces de intención de compartir de cada red. Sin SDKs: solo
// URLs estándar (wa.me, Facebook sharer, X intent, mailto). Seguro en cliente y
// servidor. La URL del proyecto debe llegar ABSOLUTA y pública.

export type ShareNetwork = "whatsapp" | "facebook" | "x" | "email";

export type ShareTarget = {
  key: ShareNetwork;
  href: string;
};

/**
 * Enlaces de compartir para una URL + mensaje ya compuestos.
 * - WhatsApp: mensaje + enlace (deep-link a la app en móvil).
 * - Facebook: solo la URL (Facebook toma título/descripción del Open Graph).
 * - X: texto + url separados (X arma su propia tarjeta).
 * - Email: asunto + cuerpo con el enlace.
 */
export function shareTargets(
  url: string,
  text: string,
  subject: string,
): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const textAndUrl = encodeURIComponent(`${text} ${url}`);
  const body = encodeURIComponent(`${text}\n\n${url}`);
  return [
    { key: "whatsapp", href: `https://wa.me/?text=${textAndUrl}` },
    { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { key: "x", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { key: "email", href: `mailto:?subject=${encodeURIComponent(subject)}&body=${body}` },
  ];
}
