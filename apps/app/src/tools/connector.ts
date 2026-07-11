import type { WireObject } from "@wiretext/engine";
import { hasRectBounds } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import { hitTest } from "./select";
import type { ToolHandler } from "./types";

let fromObject: WireObject | null = null;

/** Find a box or component under the cursor */
const findRectTarget = (col: number, row: number): WireObject | null => {
  const state = useEditorStore.getState();
  const hit = hitTest(col, row, state.objects, state.layers);
  if (hit && hasRectBounds(hit)) {
    return hit;
  }
  return null;
};

/** Get the center point of a rect-bounded object */
const getCenter = (obj: WireObject): { col: number; row: number } => {
  if (obj.type === "box" || obj.type === "component") {
    return {
      col: obj.position.col + Math.floor(obj.width / 2),
      row: obj.position.row + Math.floor(obj.height / 2),
    };
  }
  return obj.position;
};

export const connectorTool: ToolHandler = {
  cursor: "crosshair",
  name: "connector",
  onMouseDown(col, row) {
    fromObject = findRectTarget(col, row);
    if (fromObject) {
      // Show a direction arrow from source center to cursor
      const center = getCenter(fromObject);
      const state = useEditorStore.getState();
      state.setDraft({
        endPosition: { col, row },
        id: "__draft__",
        layerId: state.activeLayerId,
        position: center,
        type: "arrow",
        zIndex: 9999,
      });
    }
  },
  onMouseMove(col, row) {
    if (!fromObject) {
      return;
    }
    const state = useEditorStore.getState();
    const toTarget = findRectTarget(col, row);

    if (toTarget && toTarget.id !== fromObject.id) {
      // Hovering over a valid target — show the real orthogonal connector
      state.setDraft({
        fromId: fromObject.id,
        id: "__draft__",
        layerId: state.activeLayerId,
        position: { col: 0, row: 0 },
        toId: toTarget.id,
        type: "connector",
        zIndex: 9999,
      });
    } else {
      // Over empty space — show a direction arrow from source center
      const center = getCenter(fromObject);
      state.setDraft({
        endPosition: { col, row },
        id: "__draft__",
        layerId: state.activeLayerId,
        position: center,
        type: "arrow",
        zIndex: 9999,
      });
    }
  },
  onMouseUp(col, row) {
    const state = useEditorStore.getState();
    state.setDraft(null);

    if (!fromObject) {
      return;
    }
    const toTarget = findRectTarget(col, row);
    if (toTarget && toTarget.id !== fromObject.id) {
      state.addObject({
        fromId: fromObject.id,
        layerId: state.activeLayerId,
        position: { col: 0, row: 0 },
        toId: toTarget.id,
        type: "connector",
        zIndex: state.objects.length,
      });
    }
    fromObject = null;
  },
};
