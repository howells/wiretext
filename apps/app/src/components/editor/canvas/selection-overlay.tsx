import type { ResizeConstraint } from "@wiretext/engine";

const HANDLE_SIZE = 7;
const HALF = HANDLE_SIZE / 2;
// How far inside the bounding box handles sit
const INSET = 4;

interface SelectionRect {
  h: number;
  id: string;
  resize: ResizeConstraint;
  w: number;
  x: number;
  y: number;
}

interface EndpointHandle {
  key: string;
  x: number;
  y: number;
}

export const SelectionOverlay = ({
  rects,
  endpoints,
}: {
  rects: SelectionRect[];
  endpoints: EndpointHandle[];
}) => (
  <>
    {rects.map((rect) => (
      <div
        className="pointer-events-none absolute rounded-sm"
        key={rect.id}
        style={{
          background: "var(--color-selection)",
          border: "1px solid var(--color-selection-border)",
          height: rect.h,
          left: rect.x,
          top: rect.y,
          width: rect.w,
        }}
      >
        {rect.resize !== "none" &&
          [
            { key: "nw", left: INSET, top: INSET },
            { key: "ne", left: rect.w - INSET - HANDLE_SIZE, top: INSET },
            {
              key: "sw",
              left: INSET,
              top: rect.h - INSET - HANDLE_SIZE,
            },
            {
              key: "se",
              left: rect.w - INSET - HANDLE_SIZE,
              top: rect.h - INSET - HANDLE_SIZE,
            },
            { key: "n", left: rect.w / 2 - HALF, top: INSET },
            {
              key: "s",
              left: rect.w / 2 - HALF,
              top: rect.h - INSET - HANDLE_SIZE,
            },
            { key: "w", left: INSET, top: rect.h / 2 - HALF },
            {
              key: "e",
              left: rect.w - INSET - HANDLE_SIZE,
              top: rect.h / 2 - HALF,
            },
          ]
            .filter((h) => {
              if (rect.resize === "both") {
                return true;
              }
              return h.key === "e" || h.key === "w";
            })
            .map((h) => (
              <div
                key={h.key}
                style={{
                  background: "var(--color-accent)",
                  border: "1px solid var(--color-bg)",
                  borderRadius: "50%",
                  height: HANDLE_SIZE,
                  left: h.left,
                  position: "absolute",
                  top: h.top,
                  width: HANDLE_SIZE,
                }}
              />
            ))}
      </div>
    ))}
    {endpoints.map((ep) => (
      <div
        className="pointer-events-none absolute"
        key={ep.key}
        style={{
          background: "var(--color-accent)",
          border: "1px solid var(--color-bg)",
          borderRadius: "50%",
          height: HANDLE_SIZE,
          left: ep.x - HALF,
          top: ep.y - HALF,
          width: HANDLE_SIZE,
        }}
      />
    ))}
  </>
);
