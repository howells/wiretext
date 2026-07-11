import type { CharMetrics, Viewport } from "@wiretext/engine";

import { gridToScreen } from "@/lib/coordinates";

interface Marquee {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export const MarqueeOverlay = ({
  marquee,
  viewport,
  metrics,
}: {
  marquee: Marquee;
  viewport: Viewport;
  metrics: CharMetrics;
}) => {
  const p1 = gridToScreen(
    marquee.startCol,
    marquee.startRow,
    viewport,
    metrics
  );
  const p2 = gridToScreen(marquee.endCol, marquee.endRow, viewport, metrics);
  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        background: "var(--color-selection)",
        border: "1px dashed var(--color-selection-border)",
        height: h,
        left: x,
        top: y,
        width: w,
      }}
    />
  );
};
