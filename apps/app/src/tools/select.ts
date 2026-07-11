import {
  getObjectBounds,
  getResizeConstraint,
  hasRectBounds,
} from "@wiretext/engine";
import type { WireObject } from "@wiretext/engine";
import type { MouseEvent as ReactMouseEvent } from "react";

import { computeSnap } from "@/lib/snap";
import type { BoundingRect } from "@/lib/snap";
import { useEditorStore } from "@/store";

import {
  getEndpointHandle,
  getExcludedLayerIds,
  getMinSize,
  getResizeHandle,
  getSelectionBounds,
  hasLineEnds,
  hitTest,
  objectIntersectsRect,
} from "./geometry";
import type { ResizeHandle } from "./geometry";
import type { ToolHandler } from "./types";

export { getResizeCursor, hitTest } from "./geometry";
export type { ResizeHandle } from "./geometry";

type EditorState = ReturnType<typeof useEditorStore.getState>;

let dragStart: { col: number; row: number } | null = null;
let dragTarget: string | null = null;
let resizeHandle: ResizeHandle | null = null;
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

/** Check if a grid point is over a resize/endpoint handle of any selected object */
export const getHoveredHandle = (
  col: number,
  row: number
): ResizeHandle | "endpoint" | null => {
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
};

// --- onMouseDown helpers ---

/** Try to initiate a resize or endpoint drag on a selected object */
const tryHandleDrag = (
  col: number,
  row: number,
  state: EditorState
): boolean => {
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
        originalSize = { height: obj.height, width: obj.width };
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
};

const NO_INLINE_EDIT = new Set(["tabs", "navbar", "table", "progress"]);

/** Handle double-click editing on text/box/component objects */
const tryDoubleClickEdit = (hit: WireObject, state: EditorState): boolean => {
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
};

const startMarquee = (
  col: number,
  row: number,
  e: ReactMouseEvent,
  state: EditorState
) => {
  if (!e.shiftKey) {
    state.clearSelection();
  }
  state.setEditingLabelId(null);
  marqueeActive = true;
  marqueeShift = e.shiftKey;
  dragStart = { col, row };
  dragTarget = null;
  state.setMarquee({ endCol: col, endRow: row, startCol: col, startRow: row });
};

// --- onMouseMove helpers ---

const handleResizeMove = (col: number, row: number) => {
  if (!(originalPosition && originalSize && dragStart)) {
    return;
  }
  const handle = resizeHandle;
  if (handle === null) {
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
  const { minW, minH } = obj ? getMinSize(obj) : { minH: 3, minW: 3 };

  if (handle.includes("e")) {
    newW = Math.max(minW, originalSize.width + deltaCol);
  }
  if (handle.includes("w")) {
    newW = Math.max(minW, originalSize.width - deltaCol);
    newCol = originalPosition.col + (originalSize.width - newW);
  }
  if (handle.includes("s")) {
    newH = Math.max(minH, originalSize.height + deltaRow);
  }
  if (handle.includes("n")) {
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
      height: newH,
      position: { col: newCol, row: newRow },
      width: newW,
    });
  }
};

const handleEndpointMove = (col: number, row: number) => {
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
  state.setDraft({ ...obj, endPosition: newEnd, position: newPos });
};

/** Resolve the snapped total displacement and update guide lines. */
const applyDragSnap = (state: EditorState): { col: number; row: number } => {
  if (!(state.snapEnabled && dragOriginBounds)) {
    state.setSnapGuides({ cols: [], rows: [] });
    return { col: rawDelta.col, row: rawDelta.row };
  }

  const proposedBounds: BoundingRect = {
    col: dragOriginBounds.col + rawDelta.col,
    height: dragOriginBounds.height,
    row: dragOriginBounds.row + rawDelta.row,
    width: dragOriginBounds.width,
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
      height: b.height,
      row: b.row,
      width: b.width,
    });
  }

  const snap = computeSnap(proposedBounds, otherBounds, 1);
  const cols = snap.guides
    .filter((g) => g.axis === "col")
    .map((g) => g.position);
  const rows = snap.guides
    .filter((g) => g.axis === "row")
    .map((g) => g.position);
  state.setSnapGuides({ cols, rows });

  return {
    col: rawDelta.col + snap.deltaCol,
    row: rawDelta.row + snap.deltaRow,
  };
};

// --- onMouseUp helpers ---

/** Expand a set of hit object IDs to include all members of their groups */
const expandHitsToGroups = (
  hits: WireObject[],
  allObjects: WireObject[],
  excluded: Set<string>
): Set<string> => {
  const ids = new Set(hits.map((o) => o.id));
  const groupIds = new Set<string>();
  for (const obj of hits) {
    if (obj.groupId !== undefined && obj.groupId !== "") {
      groupIds.add(obj.groupId);
    }
  }
  if (groupIds.size > 0) {
    for (const obj of allObjects) {
      if (
        obj.groupId !== undefined &&
        obj.groupId !== "" &&
        groupIds.has(obj.groupId) &&
        !excluded.has(obj.layerId)
      ) {
        ids.add(obj.id);
      }
    }
  }
  return ids;
};

const finalizeMarquee = () => {
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
};

const finalizeResize = () => {
  const state = useEditorStore.getState();
  const { draft } = state;
  if (
    !(draft && hasRectBounds(draft) && dragTarget !== null && dragTarget !== "")
  ) {
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
};

const finalizeEndpoint = () => {
  const state = useEditorStore.getState();
  const { draft } = state;
  if (
    !(draft && hasLineEnds(draft) && dragTarget !== null && dragTarget !== "")
  ) {
    return;
  }
  state.setDraft(null);
  state.updateObject(dragTarget, {
    endPosition: draft.endPosition,
    position: draft.position,
  });
};

const resetDragState = () => {
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
};

// --- Tool handler ---

export const selectTool: ToolHandler = {
  cursor: "default",
  name: "select",
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
    dragOriginBounds =
      selObjects.length > 0 ? getSelectionBounds(selObjects) : null;
    rawDelta = { col: 0, row: 0 };
    appliedDelta = { col: 0, row: 0 };
  },
  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }

    if (marqueeActive) {
      useEditorStore.getState().setMarquee({
        endCol: col,
        endRow: row,
        startCol: dragStart.col,
        startRow: dragStart.row,
      });
      return;
    }

    if (dragTarget === null || dragTarget === "") {
      return;
    }

    if (resizeHandle !== null && originalPosition && originalSize) {
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
    const snappedTotal = applyDragSnap(state);

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

    if (resizeHandle !== null) {
      finalizeResize();
    }

    if (endpointHandle !== null) {
      finalizeEndpoint();
    }

    // Deferred deselect: clicked an already-selected object without dragging,
    // so now narrow the selection down to just that object.
    if (deferredDeselect !== null && deferredDeselect !== "" && !didDrag) {
      useEditorStore.getState().selectObject(deferredDeselect);
    }

    resetDragState();
  },
};
