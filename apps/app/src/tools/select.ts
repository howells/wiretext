import type {
  ArrowObject,
  ConnectorObject,
  GridPoint,
  Layer,
  LineObject,
  WireObject,
} from "@wiretext/engine";
import {
  BORDERLESS_COMPONENTS,
  getConnectorBounds,
  getObjectBounds,
  getResizeConstraint,
  hasRectBounds,
  resolveConnectorPath,
} from "@wiretext/engine";
import type { MouseEvent as ReactMouseEvent } from "react";
import { computeSnap, type BoundingRect } from "@/lib/snap";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

function getMinSize(obj: WireObject): { minW: number; minH: number } {
  if (
    obj.type === "component" &&
    BORDERLESS_COMPONENTS.has(obj.componentType)
  ) {
    return { minW: 1, minH: 1 };
  }
  return { minW: 3, minH: 3 };
}

/** Get the set of layer IDs that should be excluded from interaction */
function getExcludedLayerIds(layers: Layer[]): Set<string> {
  return new Set(layers.filter((l) => !l.visible || l.locked).map((l) => l.id));
}

function getSelectionBounds(objects: WireObject[]): BoundingRect {
  let minCol = Infinity;
  let minRow = Infinity;
  let maxCol = -Infinity;
  let maxRow = -Infinity;
  for (const obj of objects) {
    const b = getObjectBounds(obj);
    minCol = Math.min(minCol, b.col);
    minRow = Math.min(minRow, b.row);
    maxCol = Math.max(maxCol, b.col + b.width);
    maxRow = Math.max(maxRow, b.row + b.height);
  }
  return {
    col: minCol,
    row: minRow,
    width: maxCol - minCol,
    height: maxRow - minRow,
  };
}

let dragStart: { col: number; row: number } | null = null;
let dragTarget: string | null = null;
let resizeHandle: string | null = null;
let endpointHandle: "start" | "end" | null = null;
let marqueeActive = false;
let marqueeShift = false;
let originalPosition: { col: number; row: number } | null = null;
let originalEndPosition: { col: number; row: number } | null = null;
let originalSize: { width: number; height: number } | null = null;
/** True when the user clicked an already-selected object (without Shift) */
let deferredDeselect: string | null = null;
/** True when the mouse moved during a drag (used to decide deferred deselect) */
let didDrag = false;
/** Aggregate bounds of the selection at drag start (for snap computation) */
let dragOriginBounds: BoundingRect | null = null;
/** Cumulative raw (unsnapped) displacement from drag origin */
let rawDelta = { col: 0, row: 0 };
/** Last snapped total displacement actually applied */
let appliedDelta = { col: 0, row: 0 };

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

export function hitTest(
  col: number,
  row: number,
  objects: WireObject[],
  layers: Layer[]
): WireObject | null {
  const excluded = getExcludedLayerIds(layers);
  const interactable = objects.filter((obj) => !excluded.has(obj.layerId));
  const sorted = [...interactable].sort((a, b) => b.zIndex - a.zIndex);
  for (const obj of sorted) {
    if (isPointInObject(col, row, obj, objects)) {
      return obj;
    }
  }
  return null;
}

/** Check if a point lies on an axis-aligned segment between two grid points.
 *  tolerance adds a hit-test buffer in grid cells around the segment. */
function isPointOnSegment(
  col: number,
  row: number,
  a: GridPoint,
  b: GridPoint,
  tolerance = 0
): boolean {
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
}

function isPointInRect(
  col: number,
  row: number,
  pos: { col: number; row: number },
  width: number,
  height: number
): boolean {
  return (
    col >= pos.col &&
    col < pos.col + width &&
    row >= pos.row &&
    row < pos.row + height
  );
}

function isPointOnLine(
  col: number,
  row: number,
  obj: LineObject | ArrowObject
): boolean {
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
  for (let i = 0; i <= steps; i++) {
    const lc = c1 + Math.round((dc * i) / steps);
    const lr = r1 + Math.round((dr * i) / steps);
    if (Math.abs(col - lc) <= 1 && Math.abs(row - lr) <= 1) {
      return true;
    }
  }
  return false;
}

function isPointOnConnector(
  col: number,
  row: number,
  obj: ConnectorObject,
  allObjects: readonly WireObject[]
): boolean {
  const path = resolveConnectorPath(obj, allObjects);
  if (!path || path.points.length < 2) {
    return false;
  }
  for (let i = 0; i < path.points.length - 1; i++) {
    if (isPointOnSegment(col, row, path.points[i], path.points[i + 1], 1)) {
      return true;
    }
  }
  return false;
}

function isPointInObject(
  col: number,
  row: number,
  obj: WireObject,
  allObjects?: readonly WireObject[]
): boolean {
  switch (obj.type) {
    case "box":
    case "component":
      return isPointInRect(col, row, obj.position, obj.width, obj.height);
    case "text": {
      const lines = obj.content.split("\n");
      const maxWidth = Math.max(...lines.map((l) => l.length), 1);
      return isPointInRect(col, row, obj.position, maxWidth, lines.length);
    }
    case "line":
    case "arrow":
      return isPointOnLine(col, row, obj);
    case "connector":
      return allObjects ? isPointOnConnector(col, row, obj, allObjects) : false;
    default:
      return false;
  }
}

interface EdgeFlags {
  inColRange: boolean;
  inRowRange: boolean;
  onBottom: boolean;
  onLeft: boolean;
  onRight: boolean;
  onTop: boolean;
}

function computeEdgeFlags(
  col: number,
  row: number,
  bCol: number,
  bRow: number,
  right: number,
  bottom: number
): EdgeFlags {
  return {
    onLeft: col >= bCol - 1 && col <= bCol,
    onRight: col >= right && col <= right + 1,
    onTop: row >= bRow - 1 && row <= bRow,
    onBottom: row >= bottom && row <= bottom + 1,
    inColRange: col >= bCol - 1 && col <= right + 1,
    inRowRange: row >= bRow - 1 && row <= bottom + 1,
  };
}

function resolveCorner(f: EdgeFlags): ResizeHandle | null {
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
}

function resolveEdge(f: EdgeFlags): ResizeHandle | null {
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
}

export function getResizeHandle(
  col: number,
  row: number,
  obj: WireObject
): ResizeHandle | null {
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
  // Fixed-height components only allow horizontal resize
  if (constraint === "horizontal") {
    const vertical = handle.includes("n") || handle.includes("s");
    if (vertical && !handle.includes("e") && !handle.includes("w")) {
      return null;
    }
    // Convert corner handles to horizontal-only
    if (handle === "ne" || handle === "se") {
      return "e";
    }
    if (handle === "nw" || handle === "sw") {
      return "w";
    }
  }
  return handle;
}

export function getResizeCursor(handle: ResizeHandle): string {
  return HANDLE_CURSORS[handle];
}

/** Get the bounding rect for any object in grid coordinates */
function getLocalObjectBounds(
  obj: WireObject,
  allObjects?: readonly WireObject[]
) {
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
      return {
        col: minCol,
        row: minRow,
        width: Math.max(obj.position.col, obj.endPosition.col) - minCol + 1,
        height: Math.max(obj.position.row, obj.endPosition.row) - minRow + 1,
      };
    }
    case "connector":
      if (allObjects) {
        return getConnectorBounds(obj, allObjects);
      }
      return {
        col: obj.position.col,
        row: obj.position.row,
        width: 1,
        height: 1,
      };
    default:
      return { col: 0, row: 0, width: 0, height: 0 };
  }
}

/** Check if an object's bounds intersect with a marquee rectangle */
function objectIntersectsRect(
  obj: WireObject,
  minCol: number,
  minRow: number,
  maxCol: number,
  maxRow: number,
  allObjects?: readonly WireObject[]
): boolean {
  const b = getLocalObjectBounds(obj, allObjects);
  return (
    b.col < maxCol &&
    b.col + b.width > minCol &&
    b.row < maxRow &&
    b.row + b.height > minRow
  );
}

function hasLineEnds(obj: WireObject): obj is LineObject | ArrowObject {
  return obj.type === "line" || obj.type === "arrow";
}

/** Check if a point is near a line/arrow endpoint (within 1 cell) */
function getEndpointHandle(
  col: number,
  row: number,
  obj: LineObject | ArrowObject
): "start" | "end" | null {
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
}

/** Check if a grid point is over a resize/endpoint handle of any selected object */
export function getHoveredHandle(
  col: number,
  row: number
): ResizeHandle | "endpoint" | null {
  const state = useEditorStore.getState();
  if (state.activeTool !== "select") {
    return null;
  }
  const excluded = getExcludedLayerIds(state.layers);
  for (const obj of state.objects) {
    if (!state.selection.has(obj.id) || excluded.has(obj.layerId)) {
      continue;
    }
    if (hasRectBounds(obj)) {
      const handle = getResizeHandle(col, row, obj);
      if (handle) {
        return handle;
      }
    }
    if (hasLineEnds(obj)) {
      const ep = getEndpointHandle(col, row, obj);
      if (ep) {
        return "endpoint";
      }
    }
  }
  return null;
}

// --- onMouseDown helpers ---

/** Try to initiate a resize or endpoint drag on a selected object */
function tryHandleDrag(
  col: number,
  row: number,
  state: ReturnType<typeof useEditorStore.getState>
): boolean {
  const excluded = getExcludedLayerIds(state.layers);
  for (const obj of state.objects) {
    if (!state.selection.has(obj.id) || excluded.has(obj.layerId)) {
      continue;
    }
    if (hasRectBounds(obj)) {
      const handle = getResizeHandle(col, row, obj);
      if (handle) {
        resizeHandle = handle;
        dragStart = { col, row };
        dragTarget = obj.id;
        originalPosition = { ...obj.position };
        originalSize = { width: obj.width, height: obj.height };
        return true;
      }
    }
    if (hasLineEnds(obj)) {
      const ep = getEndpointHandle(col, row, obj);
      if (ep) {
        endpointHandle = ep;
        dragStart = { col, row };
        dragTarget = obj.id;
        originalPosition = { ...obj.position };
        originalEndPosition = { ...obj.endPosition };
        return true;
      }
    }
  }
  return false;
}

const NO_INLINE_EDIT = new Set(["tabs", "navbar", "table", "progress"]);

/** Handle double-click editing on text/box/component objects */
function tryDoubleClickEdit(
  hit: WireObject,
  state: ReturnType<typeof useEditorStore.getState>
): boolean {
  if (hit.type === "text") {
    state.setEditingTextId(hit.id);
    state.selectObject(hit.id);
    return true;
  }
  if (hit.type === "box") {
    state.setEditingLabelId(hit.id);
    state.selectObject(hit.id);
    return true;
  }
  if (hit.type === "component" && !NO_INLINE_EDIT.has(hit.componentType)) {
    state.setEditingLabelId(hit.id);
    state.selectObject(hit.id);
    return true;
  }
  if (hit.type === "connector") {
    state.setEditingLabelId(hit.id);
    state.selectObject(hit.id);
    return true;
  }
  return false;
}

function startMarquee(
  col: number,
  row: number,
  e: ReactMouseEvent,
  state: ReturnType<typeof useEditorStore.getState>
) {
  if (!e.shiftKey) {
    state.clearSelection();
  }
  state.setEditingLabelId(null);
  marqueeActive = true;
  marqueeShift = e.shiftKey;
  dragStart = { col, row };
  dragTarget = null;
  state.setMarquee({ startCol: col, startRow: row, endCol: col, endRow: row });
}

// --- onMouseMove helpers ---

function handleResizeMove(col: number, row: number) {
  if (!(originalPosition && originalSize && dragStart)) {
    return;
  }
  const deltaCol = col - dragStart.col;
  const deltaRow = row - dragStart.row;

  let newCol = originalPosition.col;
  let newRow = originalPosition.row;
  let newW = originalSize.width;
  let newH = originalSize.height;

  const state = useEditorStore.getState();
  const obj = state.objects.find((o) => o.id === dragTarget);
  const { minW, minH } = obj ? getMinSize(obj) : { minW: 3, minH: 3 };

  if (resizeHandle?.includes("e")) {
    newW = Math.max(minW, originalSize.width + deltaCol);
  }
  if (resizeHandle?.includes("w")) {
    newW = Math.max(minW, originalSize.width - deltaCol);
    newCol = originalPosition.col + (originalSize.width - newW);
  }
  if (resizeHandle?.includes("s")) {
    newH = Math.max(minH, originalSize.height + deltaRow);
  }
  if (resizeHandle?.includes("n")) {
    newH = Math.max(minH, originalSize.height - deltaRow);
    newRow = originalPosition.row + (originalSize.height - newH);
  }
  if (obj && hasRectBounds(obj)) {
    // Fixed-height components keep their original height
    if (getResizeConstraint(obj) === "horizontal") {
      newH = originalSize.height;
      newRow = originalPosition.row;
    }
    state.setDraft({
      ...obj,
      position: { col: newCol, row: newRow },
      width: newW,
      height: newH,
    });
  }
}

function handleEndpointMove(col: number, row: number) {
  if (!(originalPosition && originalEndPosition && dragStart)) {
    return;
  }
  const deltaCol = col - dragStart.col;
  const deltaRow = row - dragStart.row;
  const state = useEditorStore.getState();
  const obj = state.objects.find((o) => o.id === dragTarget);
  if (!(obj && hasLineEnds(obj))) {
    return;
  }
  const newPos =
    endpointHandle === "start"
      ? {
          col: originalPosition.col + deltaCol,
          row: originalPosition.row + deltaRow,
        }
      : obj.position;
  const newEnd =
    endpointHandle === "end"
      ? {
          col: originalEndPosition.col + deltaCol,
          row: originalEndPosition.row + deltaRow,
        }
      : obj.endPosition;
  state.setDraft({ ...obj, position: newPos, endPosition: newEnd });
}

// --- onMouseUp helpers ---

/** Expand a set of hit object IDs to include all members of their groups */
function expandHitsToGroups(
  hits: WireObject[],
  allObjects: WireObject[],
  excluded: Set<string>
): Set<string> {
  const ids = new Set(hits.map((o) => o.id));
  const groupIds = new Set<string>();
  for (const obj of hits) {
    if (obj.groupId) {
      groupIds.add(obj.groupId);
    }
  }
  if (groupIds.size > 0) {
    for (const obj of allObjects) {
      if (
        obj.groupId &&
        groupIds.has(obj.groupId) &&
        !excluded.has(obj.layerId)
      ) {
        ids.add(obj.id);
      }
    }
  }
  return ids;
}

function finalizeMarquee() {
  const state = useEditorStore.getState();
  const m = state.marquee;
  if (m) {
    const minCol = Math.min(m.startCol, m.endCol);
    const maxCol = Math.max(m.startCol, m.endCol);
    const minRow = Math.min(m.startRow, m.endRow);
    const maxRow = Math.max(m.startRow, m.endRow);
    if (maxCol > minCol || maxRow > minRow) {
      const excluded = getExcludedLayerIds(state.layers);
      const hits = state.objects.filter(
        (obj) =>
          !excluded.has(obj.layerId) &&
          objectIntersectsRect(
            obj,
            minCol,
            minRow,
            maxCol + 1,
            maxRow + 1,
            state.objects
          )
      );
      const ids = expandHitsToGroups(hits, state.objects, excluded);
      if (marqueeShift) {
        for (const id of state.selection) {
          ids.add(id);
        }
      }
      state.setSelection(ids);
    }
  }
  state.setMarquee(null);
  marqueeActive = false;
  marqueeShift = false;
  dragStart = null;
}

function finalizeResize() {
  const state = useEditorStore.getState();
  const draft = state.draft;
  if (!(draft && hasRectBounds(draft) && dragTarget)) {
    return;
  }
  state.setDraft(null);
  state.resizeObject(dragTarget, draft.width, draft.height);
  const obj = state.objects.find((o) => o.id === dragTarget);
  if (
    obj &&
    (obj.position.col !== draft.position.col ||
      obj.position.row !== draft.position.row)
  ) {
    state.moveObject(
      dragTarget,
      draft.position.col - obj.position.col,
      draft.position.row - obj.position.row
    );
  }
}

function finalizeEndpoint() {
  const state = useEditorStore.getState();
  const draft = state.draft;
  if (!(draft && hasLineEnds(draft) && dragTarget)) {
    return;
  }
  state.setDraft(null);
  state.updateObject(dragTarget, {
    position: draft.position,
    endPosition: draft.endPosition,
  } as Partial<WireObject>);
}

function resetDragState() {
  dragStart = null;
  dragTarget = null;
  resizeHandle = null;
  endpointHandle = null;
  originalPosition = null;
  originalEndPosition = null;
  originalSize = null;
  deferredDeselect = null;
  didDrag = false;
  // Snap cleanup
  dragOriginBounds = null;
  rawDelta = { col: 0, row: 0 };
  appliedDelta = { col: 0, row: 0 };
  useEditorStore.getState().setSnapGuides({ cols: [], rows: [] });
}

// --- Tool handler ---

export const selectTool: ToolHandler = {
  name: "select",
  cursor: "default",

  onMouseDown(col, row, e) {
    const state = useEditorStore.getState();

    if (tryHandleDrag(col, row, state)) {
      return;
    }

    const hit = hitTest(col, row, state.objects, state.layers);

    if (!hit) {
      startMarquee(col, row, e, state);
      return;
    }

    if (e.detail === 2 && tryDoubleClickEdit(hit, state)) {
      return;
    }

    const alreadySelected = state.selection.has(hit.id);

    if (e.shiftKey) {
      // Shift+click always toggles immediately
      state.selectObject(hit.id, true);
    } else if (alreadySelected) {
      // Clicking an already-selected object: preserve multi-selection for drag.
      // If the user doesn't drag, we'll narrow to this object on mouseUp.
      deferredDeselect = hit.id;
    } else {
      // Clicking an unselected object: select it (replacing selection)
      state.selectObject(hit.id);
    }

    // Alt+click: duplicate selection in-place, then drag the clones
    if (e.altKey && !e.shiftKey) {
      const freshState = useEditorStore.getState();
      freshState.duplicateSelection(0, 0);
      deferredDeselect = null;
    }

    state.setEditingLabelId(null);
    didDrag = false;
    dragStart = { col, row };
    dragTarget = hit.id;
    resizeHandle = null;

    // Capture selection bounds for snap
    const snapState = useEditorStore.getState();
    const selObjects = snapState.objects.filter(
      (o) => snapState.selection.has(o.id) && o.type !== "connector"
    );
    if (selObjects.length > 0) {
      dragOriginBounds = getSelectionBounds(selObjects);
    } else {
      dragOriginBounds = null;
    }
    rawDelta = { col: 0, row: 0 };
    appliedDelta = { col: 0, row: 0 };
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }

    if (marqueeActive) {
      useEditorStore.getState().setMarquee({
        startCol: dragStart.col,
        startRow: dragStart.row,
        endCol: col,
        endRow: row,
      });
      return;
    }

    if (!dragTarget) {
      return;
    }

    if (resizeHandle && originalPosition && originalSize) {
      handleResizeMove(col, row);
      return;
    }

    if (endpointHandle && originalPosition && originalEndPosition) {
      handleEndpointMove(col, row);
      return;
    }

    const deltaCol = col - dragStart.col;
    const deltaRow = row - dragStart.row;
    if (deltaCol === 0 && deltaRow === 0) {
      return;
    }

    didDrag = true;
    deferredDeselect = null;
    dragStart = { col, row };

    // Accumulate raw (unsnapped) displacement
    rawDelta = { col: rawDelta.col + deltaCol, row: rawDelta.row + deltaRow };

    const state = useEditorStore.getState();

    let snappedTotal = { col: rawDelta.col, row: rawDelta.row };

    if (state.snapEnabled && dragOriginBounds) {
      // Build proposed bounds at raw position
      const proposedBounds: BoundingRect = {
        col: dragOriginBounds.col + rawDelta.col,
        row: dragOriginBounds.row + rawDelta.row,
        width: dragOriginBounds.width,
        height: dragOriginBounds.height,
      };

      // Collect snap targets: all non-selected, non-connector, visible+unlocked objects
      const excluded = getExcludedLayerIds(state.layers);
      const otherBounds: BoundingRect[] = [];
      for (const obj of state.objects) {
        if (
          state.selection.has(obj.id) ||
          obj.type === "connector" ||
          excluded.has(obj.layerId)
        ) {
          continue;
        }
        const b = getObjectBounds(obj);
        otherBounds.push({
          col: b.col,
          row: b.row,
          width: b.width,
          height: b.height,
        });
      }

      const snap = computeSnap(proposedBounds, otherBounds, 1);
      snappedTotal = {
        col: rawDelta.col + snap.deltaCol,
        row: rawDelta.row + snap.deltaRow,
      };

      // Update guide lines
      const cols = snap.guides
        .filter((g) => g.axis === "col")
        .map((g) => g.position);
      const rows = snap.guides
        .filter((g) => g.axis === "row")
        .map((g) => g.position);
      state.setSnapGuides({ cols, rows });
    } else {
      state.setSnapGuides({ cols: [], rows: [] });
    }

    // Compute incremental move from what was already applied
    const moveCol = snappedTotal.col - appliedDelta.col;
    const moveRow = snappedTotal.row - appliedDelta.row;
    appliedDelta = snappedTotal;

    if (moveCol !== 0 || moveRow !== 0) {
      state.moveSelection(moveCol, moveRow);
    }
  },

  onMouseUp(_col, _row) {
    if (marqueeActive && dragStart) {
      finalizeMarquee();
      return;
    }

    if (resizeHandle && dragTarget && originalPosition && originalSize) {
      finalizeResize();
    }

    if (endpointHandle && dragTarget) {
      finalizeEndpoint();
    }

    // Deferred deselect: clicked an already-selected object without dragging,
    // so now narrow the selection down to just that object.
    if (deferredDeselect && !didDrag) {
      useEditorStore.getState().selectObject(deferredDeselect);
    }

    resetDragState();
  },
};
