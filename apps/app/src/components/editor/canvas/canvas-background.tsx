import type { CharMetrics, Viewport } from "@wiretext/engine";

export const CanvasBackground = ({
  text,
  viewport,
  metrics,
  originCol,
  originRow,
}: {
  text: string;
  viewport: Viewport;
  metrics: CharMetrics;
  originCol: number;
  originRow: number;
}) => (
  <>
    {/* Infinite grid background dots */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-grid-dot) 1px, transparent 1px)",
        backgroundPosition: `${viewport.panX}px ${viewport.panY}px`,
        backgroundSize: `${metrics.charWidth * viewport.zoom}px ${metrics.lineHeight * viewport.zoom}px`,
      }}
    />

    {/* Pre-rendered text (shifted by grid origin for negative positions) */}
    <pre
      className="pointer-events-none absolute m-0 p-0 leading-[1.5]"
      style={{
        color: "var(--color-text)",
        fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
        fontSize: `${14 * viewport.zoom}px`,
        left: viewport.panX + originCol * metrics.charWidth * viewport.zoom,
        top: viewport.panY + originRow * metrics.lineHeight * viewport.zoom,
      }}
    >
      {text}
    </pre>
  </>
);
