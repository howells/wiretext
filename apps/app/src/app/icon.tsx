import { ImageResponse } from "next/og";

export const size = { height: 32, width: 32 };
export const contentType = "image/png";

const icon = () =>
  new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0a0a0f",
        border: "2px solid #6c8aff",
        borderRadius: 6,
        display: "flex",
        height: 32,
        justifyContent: "center",
        width: 32,
      }}
    >
      <span
        style={{
          color: "#e0e0e8",
          fontFamily: "monospace",
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        W
      </span>
    </div>,
    { ...size }
  );

export default icon;
