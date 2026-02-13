"use client";

import { useEffect } from "react";
import type { ToolType } from "@/engine/types";
import { composeToText, copyToClipboard } from "@/lib/clipboard";
import { useEditorStore } from "@/store";

const TOOL_KEYS: Record<string, ToolType> = {
  v: "select",
  b: "box",
  t: "text",
  l: "line",
  a: "arrow",
};

export function useKeyboard(onToggleExport?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();

      // Tool shortcuts
      if (!(e.metaKey || e.ctrlKey) && TOOL_KEYS[key]) {
        e.preventDefault();
        useEditorStore.getState().setActiveTool(TOOL_KEYS[key]);
        return;
      }

      // Delete
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        useEditorStore.getState().deleteSelection();
        return;
      }

      // Undo: Cmd+Z
      if ((e.metaKey || e.ctrlKey) && key === "z" && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
        return;
      }

      // Redo: Cmd+Shift+Z
      if ((e.metaKey || e.ctrlKey) && key === "z" && e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().redo();
        return;
      }

      // Copy: Cmd+C — copy selected objects (or full grid text if nothing selected)
      if ((e.metaKey || e.ctrlKey) && key === "c") {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.selection.size > 0) {
          state.copySelection();
          // Also put text on system clipboard for external paste
          const text = composeToText(state.objects, state.gridSize);
          copyToClipboard(text);
        } else {
          const text = composeToText(state.objects, state.gridSize);
          copyToClipboard(text);
        }
        return;
      }

      // Paste: Cmd+V
      if ((e.metaKey || e.ctrlKey) && key === "v") {
        e.preventDefault();
        useEditorStore.getState().pasteClipboard();
        return;
      }

      // Duplicate: Cmd+D
      if ((e.metaKey || e.ctrlKey) && key === "d") {
        e.preventDefault();
        useEditorStore.getState().duplicateSelection();
        return;
      }

      // Export: Cmd+E
      if ((e.metaKey || e.ctrlKey) && key === "e") {
        e.preventDefault();
        onToggleExport?.();
        return;
      }

      // Escape: clear pending component, deselect and exit editing
      if (key === "escape") {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.pendingComponent) {
          state.setPendingComponent(null);
          return;
        }
        state.clearSelection();
        state.setEditingTextId(null);
        state.setEditingLabelId(null);
        state.setActiveTool("select");
        return;
      }

      // P: toggle sidebar
      if (!(e.metaKey || e.ctrlKey) && key === "p") {
        e.preventDefault();
        useEditorStore.getState().toggleSidebar();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleExport]);
}
