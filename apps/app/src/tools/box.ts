import type { BoxObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

const makeDraftBox = (
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): Omit<BoxObject, "id"> => {
  const state = useEditorStore.getState();
  return {
    borderStyle: "single",
    height: Math.max(3, Math.abs(endRow - startRow) + 1),
    layerId: state.activeLayerId,
    position: {
      col: Math.min(startCol, endCol),
      row: Math.min(startRow, endRow),
    },
    type: "box",
    width: Math.max(3, Math.abs(endCol - startCol) + 1),
    zIndex: state.objects.length,
  };
};

export const boxTool: ToolHandler = {
  cursor: "crosshair",
  name: "box",
  onMouseDown(col, row) {
    dragStart = { col, row };
    useEditorStore.getState().setDraft({
      ...makeDraftBox(col, row, col, row),
      id: "__draft__",
    });
  },
  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    useEditorStore.getState().setDraft({
      ...makeDraftBox(dragStart.col, dragStart.row, col, row),
      id: "__draft__",
    });
  },
  onMouseUp(col, row) {
    if (!dragStart) {
      return;
    }
    const state = useEditorStore.getState();
    state.setDraft(null);

    // If clicked without dragging, use a larger default size
    const didDrag =
      Math.abs(col - dragStart.col) > 1 || Math.abs(row - dragStart.row) > 1;
    if (didDrag) {
      state.addObject(makeDraftBox(dragStart.col, dragStart.row, col, row));
    } else {
      state.addObject({
        borderStyle: "single",
        height: 5,
        layerId: state.activeLayerId,
        position: { col: dragStart.col, row: dragStart.row },
        type: "box",
        width: 16,
        zIndex: state.objects.length,
      });
    }

    dragStart = null;
    state.setActiveTool("select");
  },
};
