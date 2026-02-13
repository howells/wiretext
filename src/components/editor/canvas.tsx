"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { compose, gridToString } from "@/engine/compose";
import type { WireObject } from "@/engine/types";
import { hasRectBounds } from "@/engine/types";
import { gridToScreen, screenToGrid } from "@/lib/coordinates";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useEditorStore } from "@/store";

function getObjectBounds(obj: WireObject): {
  col: number;
  row: number;
  width: number;
  height: number;
} {
  switch (obj.type) {
    case "box":
    case "component":
      return {
        col: obj.position.col,
        row: obj.position.row,
        width: obj.width,
        height: obj.height,
      };
    case "text": {
      const lines = obj.content.split("\n");
      return {
        col: obj.position.col,
        row: obj.position.row,
        width: Math.max(...lines.map((l) => l.length), 1),
        height: lines.length || 1,
      };
    }
    case "line":
    case "arrow": {
      const minCol = Math.min(obj.position.col, obj.endPosition.col);
      const minRow = Math.min(obj.position.row, obj.endPosition.row);
      const maxCol = Math.max(obj.position.col, obj.endPosition.col);
      const maxRow = Math.max(obj.position.row, obj.endPosition.row);
      return {
        col: minCol,
        row: minRow,
        width: maxCol - minCol + 1,
        height: maxRow - minRow + 1,
      };
    }
    default:
      return { col: 0, row: 0, width: 0, height: 0 };
  }
}

interface CanvasProps {
  onMouseDown?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseMove?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseUp?: (col: number, row: number, e: ReactMouseEvent) => void;
  onGridHover?: (col: number, row: number) => void;
}

export function Canvas({
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onGridHover,
}: CanvasProps) {
  const metrics = useCharMetrics();
  const objects = useEditorStore((s) => s.objects);
  const draft = useEditorStore((s) => s.draft);
  const gridSize = useEditorStore((s) => s.gridSize);
  const viewport = useEditorStore((s) => s.viewport);
  const selection = useEditorStore((s) => s.selection);
  const panViewport = useEditorStore((s) => s.panViewport);
  const zoomViewport = useEditorStore((s) => s.zoomViewport);

  const overlayRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const spaceHeld = useRef(false);

  // Compose all objects + draft
  const allObjects: WireObject[] = draft ? [...objects, draft] : objects;
  const grid = compose(allObjects, gridSize);
  const text = gridToString(grid);

  const getGridPoint = useCallback(
    (e: ReactMouseEvent) => {
      if (!(metrics && overlayRef.current)) {
        return null;
      }
      const rect = overlayRef.current.getBoundingClientRect();
      return screenToGrid(
        e.clientX - rect.left,
        e.clientY - rect.top,
        viewport,
        metrics
      );
    },
    [metrics, viewport]
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      // Middle-click or space+click → pan
      if (e.button === 1 || (e.button === 0 && spaceHeld.current)) {
        isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }

      const pt = getGridPoint(e);
      if (pt) {
        onMouseDown?.(pt.col, pt.row, e);
      }
    },
    [getGridPoint, onMouseDown]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPan.current.x;
        const dy = e.clientY - lastPan.current.y;
        panViewport(dx, dy);
        lastPan.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const pt = getGridPoint(e);
      if (pt) {
        onMouseMove?.(pt.col, pt.row, e);
        onGridHover?.(pt.col, pt.row);
      }
    },
    [getGridPoint, onMouseMove, onGridHover, panViewport]
  );

  const handleMouseUp = useCallback(
    (e: ReactMouseEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }

      const pt = getGridPoint(e);
      if (pt) {
        onMouseUp?.(pt.col, pt.row, e);
      }
    },
    [getGridPoint, onMouseUp]
  );

  const handleWheel = useCallback(
    (e: ReactWheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomViewport(delta, e.clientX, e.clientY);
      } else {
        panViewport(-e.deltaX, -e.deltaY);
      }
    },
    [panViewport, zoomViewport]
  );

  // Track space key for pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") {
          return;
        }
        spaceHeld.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  if (!metrics) {
    return null;
  }

  const gridPixelWidth = gridSize.cols * metrics.charWidth;
  const gridPixelHeight = gridSize.rows * metrics.lineHeight;

  // Build selection overlay rects with handle info
  const HANDLE_SIZE = 7;
  const HALF = HANDLE_SIZE / 2;
  const PAD = 5; // padding between object edge and bounding box
  const INSET = 4; // how far inside the bounding box handles sit

  const selectionRects = objects
    .filter((obj) => selection.has(obj.id))
    .map((obj) => {
      const bounds = getObjectBounds(obj);
      const topLeft = gridToScreen(bounds.col, bounds.row, viewport, metrics);
      const w = bounds.width * metrics.charWidth * viewport.zoom + PAD * 2;
      const h = bounds.height * metrics.lineHeight * viewport.zoom + PAD * 2;
      return {
        id: obj.id,
        x: topLeft.x - PAD,
        y: topLeft.y - PAD,
        w,
        h,
        resizable: hasRectBounds(obj),
      };
    });

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      {/* Grid background dots */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: viewport.panX,
          top: viewport.panY,
          width: gridPixelWidth * viewport.zoom,
          height: gridPixelHeight * viewport.zoom,
          backgroundImage:
            "radial-gradient(circle, var(--color-grid-dot) 1px, transparent 1px)",
          backgroundSize: `${metrics.charWidth * viewport.zoom}px ${metrics.lineHeight * viewport.zoom}px`,
        }}
      />

      {/* Pre-rendered text */}
      <pre
        className="pointer-events-none absolute m-0 p-0 leading-[1.5]"
        style={{
          fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
          fontSize: `${14 * viewport.zoom}px`,
          left: viewport.panX,
          top: viewport.panY,
          color: "var(--color-text)",
        }}
      >
        {text}
      </pre>

      {/* Selection overlays + resize handles */}
      {selectionRects.map((rect) => (
        <div
          className="pointer-events-none absolute rounded-sm"
          key={rect.id}
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            border: "1px solid var(--color-selection-border)",
            background: "var(--color-selection)",
          }}
        >
          {rect.resizable &&
            [
              // Corners (inset inside the bounding box)
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
              // Edge midpoints (inset)
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
            ].map((h) => (
              <div
                key={h.key}
                style={{
                  position: "absolute",
                  left: h.left,
                  top: h.top,
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  background: "var(--color-accent)",
                  border: "1px solid var(--color-bg)",
                  borderRadius: "50%",
                }}
              />
            ))}
        </div>
      ))}

      {/* Mouse overlay */}
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        ref={overlayRef}
        role="application"
      />
    </div>
  );
}
