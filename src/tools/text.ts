import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let creating = false;

export const textTool: ToolHandler = {
  name: "text",
  cursor: "text",

  onMouseDown(col, row) {
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

    const obj = state.addObject({
      type: "text",
      position: { col, row },
      content: "",
      zIndex: state.objects.length,
    });

    state.setEditingTextId(obj.id);
    state.selectObject(obj.id);
  },
};
