import type { ArrowObject, LineObject, WireObject } from "@/engine/types";
import { hasRectBounds } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;
let dragTarget: string | null = null;
let resizeHandle: string | null = null;
let endpointHandle: "start" | "end" | null = null;
let marqueeActive = false;
let marqueeShift = false;
let originalPosition: { col: number; row: number } | null = null;
let originalEndPosition: { col: number; row: number } | null = null;
let originalSize: { width: number; height: number } | null = null;

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

function hitTest(
  col: number,
  row: number,
  objects: WireObject[]
): WireObject | null {
  const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);
  for (const obj of sorted) {
    if (isPointInObject(col, row, obj)) {
      return obj;
    }
  }
  return null;
}

function isPointInObject(col: number, row: number, obj: WireObject): boolean {
  switch (obj.type) {
    case "box":
    case "component":
      return (
        col >= obj.position.col &&
        col < obj.position.col + obj.width &&
        row >= obj.position.row &&
        row < obj.position.row + obj.height
      );
    case "text": {
      const lines = obj.content.split("\n");
      const maxWidth = Math.max(...lines.map((l) => l.length), 1);
      return (
        col >= obj.position.col &&
        col < obj.position.col + maxWidth &&
        row >= obj.position.row &&
        row < obj.position.row + lines.length
      );
    }
    case "line":
    case "arrow": {
      const { col: c1, row: r1 } = obj.position;
      const { col: c2, row: r2 } = obj.endPosition;
      if (r1 === r2) {
        return row === r1 && col >= Math.min(c1, c2) && col <= Math.max(c1, c2);
      }
      if (c1 === c2) {
        return col === c1 && row >= Math.min(r1, r2) && row <= Math.max(r1, r2);
      }
      // Diagonal: check if point lies on the line path (within 1 cell tolerance)
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
    default:
      return false;
  }
}

export function getResizeHandle(
  col: number,
  row: number,
  obj: WireObject
): ResizeHandle | null {
  if (!hasRectBounds(obj)) {
    return null;
  }
  const { col: bCol, row: bRow } = obj.position;
  const right = bCol + obj.width - 1;
  const bottom = bRow + obj.height - 1;

  // 1-cell hit zone around each edge (resize check runs before hit-test so this is sufficient)
  const onLeft = col >= bCol - 1 && col <= bCol;
  const onRight = col >= right && col <= right + 1;
  const onTop = row >= bRow - 1 && row <= bRow;
  const onBottom = row >= bottom && row <= bottom + 1;
  const inColRange = col >= bCol - 1 && col <= right + 1;
  const inRowRange = row >= bRow - 1 && row <= bottom + 1;

  // Corners first (must be in both edge zones)
  if (onTop && onLeft) {
    return "nw";
  }
  if (onTop && onRight) {
    return "ne";
  }
  if (onBottom && onLeft) {
    return "sw";
  }
  if (onBottom && onRight) {
    return "se";
  }
  // Edges (must be on edge zone AND within range on the other axis)
  if (onTop && inColRange) {
    return "n";
  }
  if (onBottom && inColRange) {
    return "s";
  }
  if (onRight && inRowRange) {
    return "e";
  }
  if (onLeft && inRowRange) {
    return "w";
  }
  return null;
}

export function getResizeCursor(handle: ResizeHandle): string {
  return HANDLE_CURSORS[handle];
}

/** Get the bounding rect for any object in grid coordinates */
function getObjectBounds(obj: WireObject) {
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
  maxRow: number
): boolean {
  const b = getObjectBounds(obj);
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
  for (const obj of state.objects) {
    if (!state.selection.has(obj.id)) {
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

export const selectTool: ToolHandler = {
  name: "select",
  cursor: "default",

  onMouseDown(col, row, e) {
    const state = useEditorStore.getState();

    // Check resize/endpoint handles on selected objects FIRST (before general hit test)
    for (const obj of state.objects) {
      if (!state.selection.has(obj.id)) {
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
          return;
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
          return;
        }
      }
    }

    const hit = hitTest(col, row, state.objects);

    if (!hit) {
      if (!e.shiftKey) {
        state.clearSelection();
      }
      state.setEditingLabelId(null);
      // Start marquee selection
      marqueeActive = true;
      marqueeShift = e.shiftKey;
      dragStart = { col, row };
      dragTarget = null;
      state.setMarquee({
        startCol: col,
        startRow: row,
        endCol: col,
        endRow: row,
      });
      return;
    }

    // Double-click → enter editing mode
    if (e.detail === 2) {
      if (hit.type === "text") {
        state.setEditingTextId(hit.id);
        state.selectObject(hit.id);
        return;
      }
      if (hit.type === "box") {
        state.setEditingLabelId(hit.id);
        state.selectObject(hit.id);
        return;
      }
      // Only allow label editing on components that have a single centered label
      if (hit.type === "component") {
        const noInlineEdit = new Set(["tabs", "navbar", "table", "progress"]);
        if (!noInlineEdit.has(hit.componentType)) {
          state.setEditingLabelId(hit.id);
          state.selectObject(hit.id);
          return;
        }
      }
    }

    // Select (shift for toggle)
    state.selectObject(hit.id, e.shiftKey);
    state.setEditingLabelId(null);
    dragStart = { col, row };
    dragTarget = hit.id;
    resizeHandle = null;
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    const state = useEditorStore.getState();

    // Marquee selection drag
    if (marqueeActive) {
      state.setMarquee({
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
      const deltaCol = col - dragStart.col;
      const deltaRow = row - dragStart.row;

      let newCol = originalPosition.col;
      let newRow = originalPosition.row;
      let newW = originalSize.width;
      let newH = originalSize.height;

      if (resizeHandle.includes("e")) {
        newW = Math.max(3, originalSize.width + deltaCol);
      }
      if (resizeHandle.includes("w")) {
        newW = Math.max(3, originalSize.width - deltaCol);
        newCol = originalPosition.col + (originalSize.width - newW);
      }
      if (resizeHandle.includes("s")) {
        newH = Math.max(3, originalSize.height + deltaRow);
      }
      if (resizeHandle.includes("n")) {
        newH = Math.max(3, originalSize.height - deltaRow);
        newRow = originalPosition.row + (originalSize.height - newH);
      }

      const obj = state.objects.find((o) => o.id === dragTarget);
      if (obj && hasRectBounds(obj)) {
        state.setDraft({
          ...obj,
          position: { col: newCol, row: newRow },
          width: newW,
          height: newH,
        });
      }
      return;
    }

    // Endpoint drag mode for lines/arrows
    if (endpointHandle && originalPosition && originalEndPosition) {
      const deltaCol = col - dragStart.col;
      const deltaRow = row - dragStart.row;
      const obj = state.objects.find((o) => o.id === dragTarget);
      if (obj && hasLineEnds(obj)) {
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
        state.setDraft({
          ...obj,
          position: newPos,
          endPosition: newEnd,
        });
      }
      return;
    }

    // Move mode
    const deltaCol = col - dragStart.col;
    const deltaRow = row - dragStart.row;
    if (deltaCol === 0 && deltaRow === 0) {
      return;
    }

    dragStart = { col, row };
    state.moveSelection(deltaCol, deltaRow);
  },

  onMouseUp(_col, _row) {
    const state = useEditorStore.getState();

    // Finalize marquee selection
    if (marqueeActive && dragStart) {
      const m = state.marquee;
      if (m) {
        const minCol = Math.min(m.startCol, m.endCol);
        const maxCol = Math.max(m.startCol, m.endCol);
        const minRow = Math.min(m.startRow, m.endRow);
        const maxRow = Math.max(m.startRow, m.endRow);
        // Only select if the marquee has some area
        if (maxCol > minCol || maxRow > minRow) {
          const hits = state.objects.filter((obj) =>
            objectIntersectsRect(obj, minCol, minRow, maxCol + 1, maxRow + 1)
          );
          const ids = new Set(hits.map((o) => o.id));
          if (marqueeShift) {
            // Add to existing selection
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
      return;
    }

    if (resizeHandle && dragTarget && originalPosition && originalSize) {
      const draft = state.draft;
      if (draft && hasRectBounds(draft)) {
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
    }

    if (endpointHandle && dragTarget) {
      const draft = state.draft;
      if (draft && hasLineEnds(draft)) {
        state.setDraft(null);
        state.updateObject(dragTarget, {
          position: draft.position,
          endPosition: draft.endPosition,
        } as Partial<WireObject>);
      }
    }

    dragStart = null;
    dragTarget = null;
    resizeHandle = null;
    endpointHandle = null;
    originalPosition = null;
    originalEndPosition = null;
    originalSize = null;
  },
};
