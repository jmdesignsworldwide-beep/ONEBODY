import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono de pantalla de inicio en iOS (apple-touch-icon) en PNG.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <img width={180} height={180} src={brandMarkDataUri()} alt="" />
      </div>
    ),
    size,
  );
}
