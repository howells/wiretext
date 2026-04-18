import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: "2px solid #6c8aff",
      }}
    >
      <span
        style={{
          color: "#e0e0e8",
          fontSize: 20,
          fontFamily: "monospace",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        W
      </span>
    </div>,
    { ...size },
  );
}
