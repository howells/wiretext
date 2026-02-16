import type { LineObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

/**
 * Snap to horizontal, vertical, or visual diagonal.
 * Monospace chars are ~2x taller than wide, so a visual 45° diagonal
 * needs a 2:1 col:row ratio to look correct on screen.
 */
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

  // If mostly horizontal → snap to horizontal
  if (adx > ady * 3) {
    return { col: endCol, row: startRow };
  }
  // If mostly vertical → snap to vertical
  if (ady * 2 > adx * 3) {
    return { col: startCol, row: endRow };
  }
  // Diagonal: 2 cols per 1 row for visual 45°
  const rowDist = Math.min(Math.floor(adx / 2), ady);
  return {
    col: startCol + rowDist * 2 * Math.sign(dx),
    row: startRow + rowDist * Math.sign(dy),
  };
}

export const lineTool: ToolHandler = {
  name: "line",
  cursor: "crosshair",

  onMouseDown(col, row) {
    dragStart = { col, row };
    const state = useEditorStore.getState();
    state.setDraft({
      id: "__draft__",
      type: "line",
      position: { col, row },
      endPosition: { col, row },
      zIndex: state.objects.length,
      layerId: state.activeLayerId,
    } as LineObject);
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    const end = snapDirection(dragStart.col, dragStart.row, col, row);
    const state = useEditorStore.getState();
    state.setDraft({
      id: "__draft__",
      type: "line",
      position: { col: dragStart.col, row: dragStart.row },
      endPosition: end,
      zIndex: state.objects.length,
      layerId: state.activeLayerId,
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
        layerId: state.activeLayerId,
      });
    }

    dragStart = null;
    state.setActiveTool("select");
  },
};
