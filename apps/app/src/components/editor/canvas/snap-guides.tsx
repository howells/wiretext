import type { CharMetrics, Viewport } from "@wiretext/engine";

import { gridToScreen } from "@/lib/coordinates";

export const SnapGuides = ({
  guides,
  viewport,
  metrics,
}: {
  guides: { cols: number[]; rows: number[] };
  viewport: Viewport;
  metrics: CharMetrics;
}) => (
  <>
    {guides.cols.map((col) => {
      const pos = gridToScreen(col, 0, viewport, metrics);
      return (
        <div
          className="pointer-events-none absolute top-0 bottom-0"
          key={`snap-col-${col}`}
          style={{
            backgroundColor: "var(--color-snap-guide, #3b82f6)",
            left: pos.x,
            opacity: 0.6,
            width: 1,
          }}
        />
      );
    })}
    {guides.rows.map((row) => {
      const pos = gridToScreen(0, row, viewport, metrics);
      return (
        <div
          className="pointer-events-none absolute right-0 left-0"
          key={`snap-row-${row}`}
          style={{
            backgroundColor: "var(--color-snap-guide, #3b82f6)",
            height: 1,
            opacity: 0.6,
            top: pos.y,
          }}
        />
      );
    })}
  </>
);
