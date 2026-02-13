import type { LineObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

/** Snap to horizontal, vertical, or 45° diagonal */
function snapDirection(
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): { col: number; row: number } {
  const dx = endCol - startCol;
  const dy = endRow - startRow;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  // If mostly horizontal (angle < ~22.5°) → snap to horizontal
  if (adx > ady * 2) {
    return { col: endCol, row: startRow };
  }
  // If mostly vertical (angle > ~67.5°) → snap to vertical
  if (ady > adx * 2) {
    return { col: startCol, row: endRow };
  }
  // Otherwise snap to 45° diagonal
  const dist = Math.min(adx, ady);
  return {
    col: startCol + dist * Math.sign(dx),
    row: startRow + dist * Math.sign(dy),
  };
}

export const lineTool: ToolHandler = {
  name: "line",
  cursor: "crosshair",

  onMouseDown(col, row) {
    dragStart = { col, row };
    useEditorStore.getState().setDraft({
      id: "__draft__",
      type: "line",
      position: { col, row },
      endPosition: { col, row },
      zIndex: useEditorStore.getState().objects.length,
    } as LineObject);
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    const end = snapDirection(dragStart.col, dragStart.row, col, row);
    useEditorStore.getState().setDraft({
      id: "__draft__",
      type: "line",
      position: { col: dragStart.col, row: dragStart.row },
      endPosition: end,
      zIndex: useEditorStore.getState().objects.length,
    } as LineObject);
  },

  onMouseUp(col, row) {
    if (!dragStart) {
      return;
    }
    const end = snapDirection(dragStart.col, dragStart.row, col, row);
    const state = useEditorStore.getState();
    state.setDraft(null);

    // Only create if there's actual length
    if (end.col !== dragStart.col || end.row !== dragStart.row) {
      state.addObject({
        type: "line",
        position: { col: dragStart.col, row: dragStart.row },
        endPosition: end,
        zIndex: state.objects.length,
      });
    }

    dragStart = null;
    state.setActiveTool("select");
  },
};
