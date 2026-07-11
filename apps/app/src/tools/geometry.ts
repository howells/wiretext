import {
  BORDERLESS_COMPONENTS,
  getConnectorBounds,
  getObjectBounds,
  getResizeConstraint,
  hasRectBounds,
  resolveConnectorPath,
} from "@wiretext/engine";
import type {
  ArrowObject,
  ConnectorObject,
  GridPoint,
  Layer,
  LineObject,
  WireObject,
} from "@wiretext/engine";

import type { BoundingRect } from "@/lib/snap";

// Every function here works in grid coordinates (integer col/row cells), never
// screen pixels. Pointer events are converted to col/row by screenToGrid in
// lib/coordinates.ts before reaching hit-testing; nothing here touches the
// viewport pan/zoom.

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  e: "ew-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  nw: "nwse-resize",
  s: "ns-resize",
  se: "nwse-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

export const getMinSize = (obj: WireObject): { minW: number; minH: number } => {
  if (
    obj.type === "component" &&
    BORDERLESS_COMPONENTS.has(obj.componentType)
  ) {
    return { minH: 1, minW: 1 };
  }
  return { minH: 3, minW: 3 };
};

/** Get the set of layer IDs that should be excluded from interaction */
export const getExcludedLayerIds = (layers: Layer[]): Set<string> =>
  new Set(layers.filter((l) => !l.visible || l.locked).map((l) => l.id));

export const getSelectionBounds = (objects: WireObject[]): BoundingRect => {
  let minCol = Number.POSITIVE_INFINITY;
  let minRow = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  for (const obj of objects) {
    const b = getObjectBounds(obj);
    minCol = Math.min(minCol, b.col);
    minRow = Math.min(minRow, b.row);
    maxCol = Math.max(maxCol, b.col + b.width);
    maxRow = Math.max(maxRow, b.row + b.height);
  }
  return {
    col: minCol,
    height: maxRow - minRow,
    row: minRow,
    width: maxCol - minCol,
  };
};

/** Check if a point lies on an axis-aligned segment between two grid points.
 *  tolerance adds a hit-test buffer in grid cells around the segment. */
const isPointOnSegment = (
  col: number,
  row: number,
  a: GridPoint,
  b: GridPoint,
  tolerance = 0
): boolean => {
  if (a.row === b.row) {
    return (
      Math.abs(row - a.row) <= tolerance &&
      col >= Math.min(a.col, b.col) - tolerance &&
      col <= Math.max(a.col, b.col) + tolerance
    );
  }
  if (a.col === b.col) {
    return (
      Math.abs(col - a.col) <= tolerance &&
      row >= Math.min(a.row, b.row) - tolerance &&
      row <= Math.max(a.row, b.row) + tolerance
    );
  }
  return false;
};

const isPointInRect = (
  col: number,
  row: number,
  pos: { col: number; row: number },
  width: number,
  height: number
): boolean =>
  col >= pos.col &&
  col < pos.col + width &&
  row >= pos.row &&
  row < pos.row + height;

const isPointOnLine = (
  col: number,
  row: number,
  obj: LineObject | ArrowObject
): boolean => {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;
  if (r1 === r2) {
    return row === r1 && col >= Math.min(c1, c2) && col <= Math.max(c1, c2);
  }
  if (c1 === c2) {
    return col === c1 && row >= Math.min(r1, r2) && row <= Math.max(r1, r2);
  }
  const dc = c2 - c1;
  const dr = r2 - r1;
  const steps = Math.max(Math.abs(dc), Math.abs(dr));
  for (let i = 0; i <= steps; i += 1) {
    const lc = c1 + Math.round((dc * i) / steps);
    const lr = r1 + Math.round((dr * i) / steps);
    if (Math.abs(col - lc) <= 1 && Math.abs(row - lr) <= 1) {
      return true;
    }
  }
  return false;
};

const isPointOnConnector = (
  col: number,
  row: number,
  obj: ConnectorObject,
  allObjects: readonly WireObject[]
): boolean => {
  const path = resolveConnectorPath(obj, allObjects);
  if (!path || path.points.length < 2) {
    return false;
  }
  for (let i = 0; i < path.points.length - 1; i += 1) {
    const start = path.points[i];
    const end = path.points[i + 1];
    if (start && end && isPointOnSegment(col, row, start, end, 1)) {
      return true;
    }
  }
  return false;
};

/**
 * Whether a grid cell counts as "on" an object, per object type. The test is
 * area-based for shapes with a fill (box/component/text hit their interior rect,
 * with text sized from its content) and proximity-based for strokes: lines and
 * arrows allow a 1-cell slop around the rasterized segment, connectors a 1-cell
 * tolerance around each routed segment. Connector testing needs `allObjects` to
 * resolve endpoints into a path, and returns false without it.
 */
const isPointInObject = (
  col: number,
  row: number,
  obj: WireObject,
  allObjects?: readonly WireObject[]
): boolean => {
  switch (obj.type) {
    case "box":
    case "component": {
      return isPointInRect(col, row, obj.position, obj.width, obj.height);
    }
    case "text": {
      const lines = obj.content.split("\n");
      const maxWidth = Math.max(...lines.map((l) => l.length), 1);
      return isPointInRect(col, row, obj.position, maxWidth, lines.length);
    }
    case "line":
    case "arrow": {
      return isPointOnLine(col, row, obj);
    }
    case "connector": {
      return allObjects ? isPointOnConnector(col, row, obj, allObjects) : false;
    }
    default: {
      return false;
    }
  }
};

/**
 * Topmost object under a grid cell, or null. Objects on hidden or locked layers
 * are excluded from interaction, and the remainder are tested from highest
 * zIndex down so the first hit is the visually frontmost object.
 */
export const hitTest = (
  col: number,
  row: number,
  objects: WireObject[],
  layers: Layer[]
): WireObject | null => {
  const excluded = getExcludedLayerIds(layers);
  const interactable = objects.filter((obj) => !excluded.has(obj.layerId));
  const sorted = [...interactable].toSorted((a, b) => b.zIndex - a.zIndex);
  for (const obj of sorted) {
    if (isPointInObject(col, row, obj, objects)) {
      return obj;
    }
  }
  return null;
};

interface EdgeFlags {
  inColRange: boolean;
  inRowRange: boolean;
  onBottom: boolean;
  onLeft: boolean;
  onRight: boolean;
  onTop: boolean;
}

const computeEdgeFlags = (
  col: number,
  row: number,
  bCol: number,
  bRow: number,
  right: number,
  bottom: number
): EdgeFlags => ({
  inColRange: col >= bCol - 1 && col <= right + 1,
  inRowRange: row >= bRow - 1 && row <= bottom + 1,
  onBottom: row >= bottom && row <= bottom + 1,
  onLeft: col >= bCol - 1 && col <= bCol,
  onRight: col >= right && col <= right + 1,
  onTop: row >= bRow - 1 && row <= bRow,
});

const resolveCorner = (f: EdgeFlags): ResizeHandle | null => {
  if (f.onTop && f.onLeft) {
    return "nw";
  }
  if (f.onTop && f.onRight) {
    return "ne";
  }
  if (f.onBottom && f.onLeft) {
    return "sw";
  }
  if (f.onBottom && f.onRight) {
    return "se";
  }
  return null;
};

const resolveEdge = (f: EdgeFlags): ResizeHandle | null => {
  if (f.onTop && f.inColRange) {
    return "n";
  }
  if (f.onBottom && f.inColRange) {
    return "s";
  }
  if (f.onRight && f.inRowRange) {
    return "e";
  }
  if (f.onLeft && f.inRowRange) {
    return "w";
  }
  return null;
};

/**
 * Which resize handle (if any) a grid cell falls on for a rectangular object.
 *
 * Edges are given a 1-cell-wide grab band just inside and outside the bounds
 * (see computeEdgeFlags); a cell in two bands at once resolves to the corner.
 * Objects without rect bounds or with a "none" resize constraint return null.
 * A "horizontal" constraint (e.g. a component that only stretches sideways)
 * suppresses the pure n/s handles and collapses corner grabs to e/w.
 */
export const getResizeHandle = (
  col: number,
  row: number,
  obj: WireObject
): ResizeHandle | null => {
  if (!hasRectBounds(obj)) {
    return null;
  }
  const constraint = getResizeConstraint(obj);
  if (constraint === "none") {
    return null;
  }
  const { col: bCol, row: bRow } = obj.position;
  const flags = computeEdgeFlags(
    col,
    row,
    bCol,
    bRow,
    bCol + obj.width - 1,
    bRow + obj.height - 1
  );
  const handle = resolveCorner(flags) ?? resolveEdge(flags);
  if (!handle) {
    return null;
  }
  if (constraint === "horizontal") {
    const vertical = handle.includes("n") || handle.includes("s");
    if (vertical && !handle.includes("e") && !handle.includes("w")) {
      return null;
    }
    if (handle === "ne" || handle === "se") {
      return "e";
    }
    if (handle === "nw" || handle === "sw") {
      return "w";
    }
  }
  return handle;
};

export const getResizeCursor = (handle: ResizeHandle): string =>
  HANDLE_CURSORS[handle];

/** Get the bounding rect for any object in grid coordinates */
const getLocalObjectBounds = (
  obj: WireObject,
  allObjects?: readonly WireObject[]
) => {
  switch (obj.type) {
    case "box":
    case "component": {
      return {
        col: obj.position.col,
        height: obj.height,
        row: obj.position.row,
        width: obj.width,
      };
    }
    case "text": {
      const lines = obj.content.split("\n");
      return {
        col: obj.position.col,
        height: lines.length || 1,
        row: obj.position.row,
        width: Math.max(...lines.map((l) => l.length), 1),
      };
    }
    case "line":
    case "arrow": {
      const minCol = Math.min(obj.position.col, obj.endPosition.col);
      const minRow = Math.min(obj.position.row, obj.endPosition.row);
      return {
        col: minCol,
        height: Math.max(obj.position.row, obj.endPosition.row) - minRow + 1,
        row: minRow,
        width: Math.max(obj.position.col, obj.endPosition.col) - minCol + 1,
      };
    }
    case "connector": {
      if (allObjects) {
        return getConnectorBounds(obj, allObjects);
      }
      return {
        col: obj.position.col,
        height: 1,
        row: obj.position.row,
        width: 1,
      };
    }
    default: {
      return { col: 0, height: 0, row: 0, width: 0 };
    }
  }
};

/** Check if an object's bounds intersect with a marquee rectangle */
export const objectIntersectsRect = (
  obj: WireObject,
  minCol: number,
  minRow: number,
  maxCol: number,
  maxRow: number,
  allObjects?: readonly WireObject[]
): boolean => {
  const b = getLocalObjectBounds(obj, allObjects);
  return (
    b.col < maxCol &&
    b.col + b.width > minCol &&
    b.row < maxRow &&
    b.row + b.height > minRow
  );
};

export const hasLineEnds = (obj: WireObject): obj is LineObject | ArrowObject =>
  obj.type === "line" || obj.type === "arrow";

/** Check if a point is near a line/arrow endpoint (within 1 cell) */
export const getEndpointHandle = (
  col: number,
  row: number,
  obj: LineObject | ArrowObject
): "start" | "end" | null => {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;
  // Check end first so dragging overlapping endpoints prefers the arrowhead
  if (Math.abs(col - c2) <= 1 && Math.abs(row - r2) <= 1) {
    return "end";
  }
  if (Math.abs(col - c1) <= 1 && Math.abs(row - r1) <= 1) {
    return "start";
  }
  return null;
};
