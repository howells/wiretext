import type { MouseEvent as ReactMouseEvent } from "react";
import type { Layer, TextObject, WireObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let creating = false;

/** Find the topmost text object at a grid position */
function hitTestText(
  col: number,
  row: number,
  objects: WireObject[],
  layers: Layer[]
): TextObject | null {
  const excluded = new Set(
    layers.filter((l) => !l.visible || l.locked).map((l) => l.id)
  );
  const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);
  for (const obj of sorted) {
    if (obj.type !== "text" || excluded.has(obj.layerId)) {
      continue;
    }
    const lines = obj.content.split("\n");
    const maxWidth = Math.max(...lines.map((l) => l.length), 1);
    if (
      col >= obj.position.col &&
      col < obj.position.col + maxWidth &&
      row >= obj.position.row &&
      row < obj.position.row + lines.length
    ) {
      return obj;
    }
  }
  return null;
}

export const textTool: ToolHandler = {
  name: "text",
  cursor: "text",

  onMouseDown(col: number, row: number, e: ReactMouseEvent) {
    // Guard against double-fire (React Strict Mode / event replay)
    if (creating) {
      return;
    }
    creating = true;
    queueMicrotask(() => {
      creating = false;
    });

    const state = useEditorStore.getState();

    // If already editing, exit editing first
    if (state.editingTextId) {
      state.setEditingTextId(null);
      return;
    }

    // Click on an existing text object → select it, double-click → edit it
    const hit = hitTestText(col, row, state.objects, state.layers);
    if (hit) {
      if (e.detail >= 2) {
        state.setEditingTextId(hit.id);
      }
      state.selectObject(hit.id);
      return;
    }

    const obj = state.addObject({
      type: "text",
      position: { col, row },
      content: "",
      zIndex: state.objects.length,
      layerId: state.activeLayerId,
    });

    state.setEditingTextId(obj.id);
    state.selectObject(obj.id);
  },
};
