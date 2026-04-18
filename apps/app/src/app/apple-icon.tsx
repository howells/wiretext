import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40,
        border: "6px solid #6c8aff",
      }}
    >
      <span
        style={{
          color: "#e0e0e8",
          fontSize: 100,
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
