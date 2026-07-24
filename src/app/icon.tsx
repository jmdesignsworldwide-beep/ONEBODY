import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Favicon/PWA en PNG generado desde la marca (next/og, sin dependencias nativas).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <img width={512} height={512} src={brandMarkDataUri()} alt="" />
      </div>
    ),
    size,
  );
}
