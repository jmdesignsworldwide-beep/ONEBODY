"use client";

// Fallback global (si falla el propio layout raíz). Debe incluir <html>/<body>.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#0A0A0A",
          color: "#EDEAE3",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ fontSize: "1.5rem" }}>Algo no salió como esperábamos</p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "9999px",
            background: "#EDEAE3",
            color: "#0A0A0A",
            border: "none",
            padding: "0.75rem 1.75rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
