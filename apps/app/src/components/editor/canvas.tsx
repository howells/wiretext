"use client";

import type { ResizeConstraint, WireObject } from "@wiretext/engine";
import {
  compose,
  getConnectorBounds,
  getEffectiveGridSize,
  getObjectBounds,
  getResizeConstraint,
  gridToString,
  hasRectBounds,
} from "@wiretext/engine";
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { gridToScreen, screenToGrid } from "@/lib/coordinates";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useEditorStore } from "@/store";
import { hitTest } from "@/tools/select";

interface CanvasProps {
  onGridHover?: (col: number, row: number) => void;
  onMouseDown?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseMove?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseUp?: (col: number, row: number, e: ReactMouseEvent) => void;
}

export function Canvas({
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onGridHover,
}: CanvasProps) {
  const metrics = useCharMetrics();
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const draft = useEditorStore((s) => s.draft);
  const gridSize = useEditorStore((s) => s.gridSize);
  const viewport = useEditorStore((s) => s.viewport);
  const selection = useEditorStore((s) => s.selection);
  const marquee = useEditorStore((s) => s.marquee);
  const panViewport = useEditorStore((s) => s.panViewport);
  const zoomViewport = useEditorStore((s) => s.zoomViewport);

  const overlayRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const spaceHeld = useRef(false);

  // Compose all objects + draft
  const allObjects = draft ? [...objects, draft] : objects;
  const effectiveGridSize = useMemo(
    () => getEffectiveGridSize(allObjects, gridSize),
    [allObjects, gridSize]
  );
  const grid = compose(allObjects, effectiveGridSize, layers);
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
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomViewport(delta, e.clientX, e.clientY);
      } else {
        panViewport(-e.deltaX, -e.deltaY);
      }
    },
    [panViewport, zoomViewport]
  );

  // Attach wheel handler as non-passive so preventDefault() works
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Track space key for pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const target = e.target as HTMLElement;
        const tag = target?.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target?.isContentEditable
        ) {
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

  const gridPixelWidth = effectiveGridSize.cols * metrics.charWidth;
  const gridPixelHeight = effectiveGridSize.rows * metrics.lineHeight;

  // Build selection overlay rects with handle info
  const HANDLE_SIZE = 7;
  const HALF = HANDLE_SIZE / 2;
  const PAD = 5; // padding between object edge and bounding box
  const INSET = 4; // how far inside the bounding box handles sit

  const selectedObjects = objects.filter((obj) => selection.has(obj.id));

  const selectionRects = selectedObjects.map((obj) => {
    const bounds =
      obj.type === "connector"
        ? getConnectorBounds(obj, objects)
        : getObjectBounds(obj);
    const topLeft = gridToScreen(bounds.col, bounds.row, viewport, metrics);
    const w = bounds.width * metrics.charWidth * viewport.zoom + PAD * 2;
    const h = bounds.height * metrics.lineHeight * viewport.zoom + PAD * 2;
    return {
      id: obj.id,
      x: topLeft.x - PAD,
      y: topLeft.y - PAD,
      w,
      h,
      resize: hasRectBounds(obj)
        ? getResizeConstraint(obj)
        : ("none" as ResizeConstraint),
    };
  });

  // Endpoint handles for selected lines/arrows
  const endpointHandles = selectedObjects
    .filter(
      (obj): obj is Extract<WireObject, { type: "line" | "arrow" }> =>
        obj.type === "line" || obj.type === "arrow"
    )
    .flatMap((obj) => {
      const startPos = gridToScreen(
        obj.position.col,
        obj.position.row,
        viewport,
        metrics
      );
      const endPos = gridToScreen(
        obj.endPosition.col,
        obj.endPosition.row,
        viewport,
        metrics
      );
      return [
        { key: `${obj.id}-start`, x: startPos.x, y: startPos.y },
        { key: `${obj.id}-end`, x: endPos.x, y: endPos.y },
      ];
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
          {rect.resize !== "none" &&
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
            ]
              .filter((h) => {
                if (rect.resize === "both") {
                  return true;
                }
                // horizontal-only: show only e/w handles
                return h.key === "e" || h.key === "w";
              })
              .map((h) => (
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

      {/* Endpoint handles for lines/arrows */}
      {endpointHandles.map((ep) => (
        <div
          className="pointer-events-none absolute"
          key={ep.key}
          style={{
            left: ep.x - HALF,
            top: ep.y - HALF,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: "var(--color-accent)",
            border: "1px solid var(--color-bg)",
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Marquee selection rectangle */}
      {marquee &&
        (() => {
          const p1 = gridToScreen(
            marquee.startCol,
            marquee.startRow,
            viewport,
            metrics
          );
          const p2 = gridToScreen(
            marquee.endCol,
            marquee.endRow,
            viewport,
            metrics
          );
          const x = Math.min(p1.x, p2.x);
          const y = Math.min(p1.y, p2.y);
          const w = Math.abs(p2.x - p1.x);
          const h = Math.abs(p2.y - p1.y);
          return (
            <div
              className="pointer-events-none absolute"
              style={{
                left: x,
                top: y,
                width: w,
                height: h,
                border: "1px dashed var(--color-selection-border)",
                background: "var(--color-selection)",
              }}
            />
          );
        })()}

      {/* Mouse overlay */}
      <div
        className="absolute inset-0"
        onContextMenu={(e) => {
          e.preventDefault();
          const pt = getGridPoint(e);
          if (!pt) {
            return;
          }
          const state = useEditorStore.getState();
          const hit = hitTest(pt.col, pt.row, state.objects, state.layers);
          const targetObjectId = hit?.id ?? null;
          // If right-clicked an object that's not selected, select it (+ group)
          if (targetObjectId && !state.selection.has(targetObjectId)) {
            state.selectObject(targetObjectId);
          }
          state.setContextMenu({ x: e.clientX, y: e.clientY, targetObjectId });
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={overlayRef}
        role="none"
      />
    </div>
  );
}
