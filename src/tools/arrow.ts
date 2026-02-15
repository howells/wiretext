import type { ArrowObject } from "@/engine/types";
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

  if (adx > ady * 2) {
    return { col: endCol, row: startRow };
  }
  if (ady > adx * 2) {
    return { col: startCol, row: endRow };
  }
  const dist = Math.min(adx, ady);
  return {
    col: startCol + dist * Math.sign(dx),
    row: startRow + dist * Math.sign(dy),
  };
}

export const arrowTool: ToolHandler = {
  name: "arrow",
  cursor: "crosshair",

  onMouseDown(col, row) {
    dragStart = { col, row };
    const state = useEditorStore.getState();
    state.setDraft({
      id: "__draft__",
      type: "arrow",
      position: { col, row },
      endPosition: { col, row },
      zIndex: state.objects.length,
      layerId: state.activeLayerId,
    } as ArrowObject);
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    const end = snapDirection(dragStart.col, dragStart.row, col, row);
    const state = useEditorStore.getState();
    state.setDraft({
      id: "__draft__",
      type: "arrow",
      position: { col: dragStart.col, row: dragStart.row },
      endPosition: end,
      zIndex: state.objects.length,
      layerId: state.activeLayerId,
    } as ArrowObject);
  },

  onMouseUp(col, row) {
    if (!dragStart) {
      return;
    }
    const end = snapDirection(dragStart.col, dragStart.row, col, row);
    const state = useEditorStore.getState();
    state.setDraft(null);

    if (end.col !== dragStart.col || end.row !== dragStart.row) {
      state.addObject({
        type: "arrow",
        position: { col: dragStart.col, row: dragStart.row },
        endPosition: end,
        zIndex: state.objects.length,
        layerId: state.activeLayerId,
      });
    }

    dragStart = null;
    state.setActiveTool("select");
  },
};
