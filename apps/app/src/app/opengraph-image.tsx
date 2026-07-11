import { ImageResponse } from "next/og";

export const alt = "Wiretext — Unicode wireframe design tool";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const openGraphImage = () =>
  new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        height: "100%",
        justifyContent: "center",
        padding: 80,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          color: "#6c8aff",
          display: "flex",
          flexDirection: "column",
          fontSize: 48,
          letterSpacing: 2,
          lineHeight: 1.2,
          marginBottom: 48,
        }}
      >
        <span>┌──────────────────────┐</span>
        <span>│ │</span>
        <span>│ Wiretext │</span>
        <span>│ │</span>
        <span>└──────────────────────┘</span>
      </div>
      <div
        style={{
          color: "#6a6a80",
          fontSize: 32,
          letterSpacing: 1,
        }}
      >
        Wireframe with text
      </div>
    </div>,
    { ...size }
  );

export default openGraphImage;
