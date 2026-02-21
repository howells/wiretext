import type { BoxObject } from "@wiretext/engine";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

function makeDraftBox(
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): Omit<BoxObject, "id"> {
  const state = useEditorStore.getState();
  return {
    type: "box",
    position: {
      col: Math.min(startCol, endCol),
      row: Math.min(startRow, endRow),
    },
    width: Math.max(3, Math.abs(endCol - startCol) + 1),
    height: Math.max(3, Math.abs(endRow - startRow) + 1),
    borderStyle: "single",
    zIndex: state.objects.length,
    layerId: state.activeLayerId,
  };
}

export const boxTool: ToolHandler = {
  name: "box",
  cursor: "crosshair",

  onMouseDown(col, row) {
    dragStart = { col, row };
    useEditorStore.getState().setDraft({
      ...makeDraftBox(col, row, col, row),
      id: "__draft__",
    } as BoxObject);
  },

  onMouseMove(col, row) {
    if (!dragStart) {
      return;
    }
    useEditorStore.getState().setDraft({
      ...makeDraftBox(dragStart.col, dragStart.row, col, row),
      id: "__draft__",
    } as BoxObject);
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
        type: "box",
        position: { col: dragStart.col, row: dragStart.row },
        width: 16,
        height: 5,
        borderStyle: "single",
        zIndex: state.objects.length,
        layerId: state.activeLayerId,
      });
    }

    dragStart = null;
    state.setActiveTool("select");
  },
};
