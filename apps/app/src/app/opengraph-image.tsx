import { ImageResponse } from "next/og";

export const alt = "Wiretext — Unicode wireframe design tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#6c8aff",
          fontSize: 48,
          lineHeight: 1.2,
          letterSpacing: 2,
          marginBottom: 48,
        }}
      >
        <span>{"┌──────────────────────┐"}</span>
        <span>{"│                      │"}</span>
        <span>{"│      Wiretext        │"}</span>
        <span>{"│                      │"}</span>
        <span>{"└──────────────────────┘"}</span>
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#6a6a80",
          letterSpacing: 1,
        }}
      >
        Wireframe with text
      </div>
    </div>,
    { ...size },
  );
}
