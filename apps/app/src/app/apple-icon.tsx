import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };
export const contentType = "image/png";

const appleIcon = () =>
  new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0a0a0f",
        border: "6px solid #6c8aff",
        borderRadius: 40,
        display: "flex",
        height: 180,
        justifyContent: "center",
        width: 180,
      }}
    >
      <span
        style={{
          color: "#e0e0e8",
          fontFamily: "monospace",
          fontSize: 100,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        W
      </span>
    </div>,
    { ...size }
  );

export default appleIcon;
