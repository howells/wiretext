"use client";

import {
  compose,
  getConnectorBounds,
  getEffectiveGridSize,
  getObjectBounds,
  getResizeConstraint,
  gridToString,
  hasRectBounds,
} from "@wiretext/engine";
import type {
  CharMetrics,
  GridSize,
  Layer,
  Viewport,
  WireObject,
} from "@wiretext/engine";
import { useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { CanvasBackground } from "@/components/editor/canvas/canvas-background";
import { MarqueeOverlay } from "@/components/editor/canvas/marquee-overlay";
import { SelectionOverlay } from "@/components/editor/canvas/selection-overlay";
import { SnapGuides } from "@/components/editor/canvas/snap-guides";
import {
  gridToScreen,
  screenToGrid,
  shiftObjectsForRender,
} from "@/lib/coordinates";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useViewportGestures } from "@/lib/use-viewport-gestures";
import { useEditorStore } from "@/store";
import { hitTest } from "@/tools/select";

interface CanvasProps {
  onGridHover?: (col: number, row: number) => void;
  onMouseDown?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseMove?: (col: number, row: number, e: ReactMouseEvent) => void;
  onMouseUp?: (col: number, row: number, e: ReactMouseEvent) => void;
}

// Padding between object edge and bounding box
const PAD = 5;

// Compose all objects + draft, shifting negative positions into valid grid space
const composeCanvasText = (
  objects: WireObject[],
  draft: WireObject | null,
  gridSize: GridSize,
  layers: Layer[]
) => {
  const allObjects = draft ? [...objects, draft] : objects;
  const { renderObjects, originCol, originRow } =
    shiftObjectsForRender(allObjects);
  const effectiveGridSize = getEffectiveGridSize(renderObjects, gridSize);
  const grid = compose(renderObjects, effectiveGridSize, layers);
  return { originCol, originRow, text: gridToString(grid) };
};

// Build selection overlay rects with handle info
const buildSelectionRects = (
  selectedObjects: WireObject[],
  objects: WireObject[],
  viewport: Viewport,
  metrics: CharMetrics
) =>
  selectedObjects.map((obj) => {
    const bounds =
      obj.type === "connector"
        ? getConnectorBounds(obj, objects)
        : getObjectBounds(obj);
    const topLeft = gridToScreen(bounds.col, bounds.row, viewport, metrics);
    const w = bounds.width * metrics.charWidth * viewport.zoom + PAD * 2;
    const h = bounds.height * metrics.lineHeight * viewport.zoom + PAD * 2;
    return {
      h,
      id: obj.id,
      resize: hasRectBounds(obj) ? getResizeConstraint(obj) : "none",
      w,
      x: topLeft.x - PAD,
      y: topLeft.y - PAD,
    };
  });

// Endpoint handles for selected lines/arrows
const buildEndpointHandles = (
  selectedObjects: WireObject[],
  viewport: Viewport,
  metrics: CharMetrics
) => {
  const endpointHandles: { key: string; x: number; y: number }[] = [];
  for (const obj of selectedObjects) {
    if (obj.type !== "line" && obj.type !== "arrow") {
      continue;
    }
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
    endpointHandles.push(
      { key: `${obj.id}-start`, x: startPos.x, y: startPos.y },
      { key: `${obj.id}-end`, x: endPos.x, y: endPos.y }
    );
  }
  return endpointHandles;
};

const getGridPointFrom = (
  e: ReactMouseEvent,
  overlay: HTMLDivElement | null,
  viewport: Viewport,
  metrics: CharMetrics | null
) => {
  if (!(metrics && overlay)) {
    return null;
  }
  const rect = overlay.getBoundingClientRect();
  return screenToGrid(
    e.clientX - rect.left,
    e.clientY - rect.top,
    viewport,
    metrics
  );
};

const openContextMenu = (col: number, row: number, x: number, y: number) => {
  const state = useEditorStore.getState();
  const hit = hitTest(col, row, state.objects, state.layers);
  const targetObjectId = hit?.id ?? null;
  if (
    targetObjectId !== null &&
    targetObjectId !== "" &&
    !state.selection.has(targetObjectId)
  ) {
    state.selectObject(targetObjectId);
  }
  state.setContextMenu({ targetObjectId, x, y });
};

export const Canvas = ({
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onGridHover,
}: CanvasProps) => {
  const metrics = useCharMetrics();
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const draft = useEditorStore((s) => s.draft);
  const gridSize = useEditorStore((s) => s.gridSize);
  const viewport = useEditorStore((s) => s.viewport);
  const selection = useEditorStore((s) => s.selection);
  const marquee = useEditorStore((s) => s.marquee);
  const snapGuides = useEditorStore((s) => s.snapGuides);

  const { bind, isPanning, spaceHeld } = useViewportGestures();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const { originCol, originRow, text } = composeCanvasText(
    objects,
    draft,
    gridSize,
    layers
  );

  const getGridPoint = (e: ReactMouseEvent) =>
    getGridPointFrom(e, overlayRef.current, viewport, metrics);

  const handleMouseDown = (e: ReactMouseEvent) => {
    // Pan handled by useViewportGestures
    if (isPanning.current || e.button === 1 || spaceHeld.current) {
      return;
    }
    const pt = getGridPoint(e);
    if (pt) {
      onMouseDown?.(pt.col, pt.row, e);
    }
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (isPanning.current) {
      return;
    }
    const pt = getGridPoint(e);
    if (pt) {
      onMouseMove?.(pt.col, pt.row, e);
      onGridHover?.(pt.col, pt.row);
    }
  };

  const handleMouseUp = (e: ReactMouseEvent) => {
    if (isPanning.current) {
      return;
    }
    const pt = getGridPoint(e);
    if (pt) {
      onMouseUp?.(pt.col, pt.row, e);
    }
  };

  if (!metrics) {
    return null;
  }

  const selectedObjects = objects.filter((obj) => selection.has(obj.id));

  const selectionRects = buildSelectionRects(
    selectedObjects,
    objects,
    viewport,
    metrics
  );

  const endpointHandles = buildEndpointHandles(
    selectedObjects,
    viewport,
    metrics
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      <CanvasBackground
        metrics={metrics}
        originCol={originCol}
        originRow={originRow}
        text={text}
        viewport={viewport}
      />

      {/* Selection overlays + resize handles + endpoint handles */}
      <SelectionOverlay endpoints={endpointHandles} rects={selectionRects} />

      {/* Marquee selection rectangle */}
      {marquee && (
        <MarqueeOverlay
          marquee={marquee}
          metrics={metrics}
          viewport={viewport}
        />
      )}

      {/* Snap alignment guide lines */}
      <SnapGuides guides={snapGuides} metrics={metrics} viewport={viewport} />

      {/* Mouse + gesture overlay */}
      <div
        {...bind()}
        className="absolute inset-0 touch-none"
        data-gesture-root=""
        onContextMenu={(e) => {
          e.preventDefault();
          const pt = getGridPoint(e);
          if (!pt) {
            return;
          }
          openContextMenu(pt.col, pt.row, e.clientX, e.clientY);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={overlayRef}
        role="none"
      />
    </div>
  );
};
