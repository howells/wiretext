import type { ConnectorObject, WireObject } from "@wiretext/engine";
import { hasRectBounds } from "@wiretext/engine";
import { useEditorStore } from "@/store";
import { hitTest } from "./select";
import type { ToolHandler } from "./types";

let fromObject: WireObject | null = null;

/** Find a box or component under the cursor */
function findRectTarget(col: number, row: number): WireObject | null {
  const state = useEditorStore.getState();
  const hit = hitTest(col, row, state.objects, state.layers);
  if (hit && hasRectBounds(hit)) {
    return hit;
  }
  return null;
}

/** Get the center point of a rect-bounded object */
function getCenter(obj: WireObject): { col: number; row: number } {
  if (obj.type === "box" || obj.type === "component") {
    return {
      col: obj.position.col + Math.floor(obj.width / 2),
      row: obj.position.row + Math.floor(obj.height / 2),
    };
  }
  return obj.position;
}

export const connectorTool: ToolHandler = {
  name: "connector",
  cursor: "crosshair",

  onMouseDown(col, row) {
    fromObject = findRectTarget(col, row);
    if (fromObject) {
      // Show a direction arrow from source center to cursor
      const center = getCenter(fromObject);
      const state = useEditorStore.getState();
      state.setDraft({
        id: "__draft__",
        type: "arrow",
        position: center,
        endPosition: { col, row },
        zIndex: 9999,
        layerId: state.activeLayerId,
      } as WireObject);
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
        id: "__draft__",
        type: "connector",
        fromId: fromObject.id,
        toId: toTarget.id,
        position: { col: 0, row: 0 },
        zIndex: 9999,
        layerId: state.activeLayerId,
      } as ConnectorObject);
    } else {
      // Over empty space — show a direction arrow from source center
      const center = getCenter(fromObject);
      state.setDraft({
        id: "__draft__",
        type: "arrow",
        position: center,
        endPosition: { col, row },
        zIndex: 9999,
        layerId: state.activeLayerId,
      } as WireObject);
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
        type: "connector",
        fromId: fromObject.id,
        toId: toTarget.id,
        position: { col: 0, row: 0 },
        zIndex: state.objects.length,
        layerId: state.activeLayerId,
      });
    }
    fromObject = null;
  },
};
