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

function handleToolShortcut(e: KeyboardEvent, key: string): boolean {
  if (!(e.metaKey || e.ctrlKey) && TOOL_KEYS[key]) {
    e.preventDefault();
    useEditorStore.getState().setActiveTool(TOOL_KEYS[key]);
    return true;
  }
  return false;
}

function handleDelete(e: KeyboardEvent, key: string): boolean {
  if (key === "delete" || key === "backspace") {
    e.preventDefault();
    useEditorStore.getState().deleteSelection();
    return true;
  }
  return false;
}

function handleUndo(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "z" && !e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().undo();
    return true;
  }
  return false;
}

function handleRedo(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "z" && e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().redo();
    return true;
  }
  return false;
}

function handleCopy(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "c") {
    e.preventDefault();
    const state = useEditorStore.getState();
    if (state.selection.size > 0) {
      state.copySelection();
    }
    const text = composeToText(state.objects, state.gridSize);
    copyToClipboard(text);
    return true;
  }
  return false;
}

function handlePaste(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "v") {
    e.preventDefault();
    useEditorStore.getState().pasteClipboard();
    return true;
  }
  return false;
}

function handleDuplicate(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "d") {
    e.preventDefault();
    useEditorStore.getState().duplicateSelection();
    return true;
  }
  return false;
}

function handleExport(
  e: KeyboardEvent,
  key: string,
  onToggleExport?: () => void
): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "e") {
    e.preventDefault();
    onToggleExport?.();
    return true;
  }
  return false;
}

function handleEscape(e: KeyboardEvent, key: string): boolean {
  if (key !== "escape") {
    return false;
  }
  e.preventDefault();
  const state = useEditorStore.getState();
  if (state.pendingComponent) {
    state.setPendingComponent(null);
    return true;
  }
  state.clearSelection();
  state.setEditingTextId(null);
  state.setEditingLabelId(null);
  state.setActiveTool("select");
  return true;
}

function handleToggleSidebar(e: KeyboardEvent, key: string): boolean {
  if (!(e.metaKey || e.ctrlKey) && key === "p") {
    e.preventDefault();
    useEditorStore.getState().toggleSidebar();
    return true;
  }
  return false;
}

export function useKeyboard(onToggleExport?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();

      handleToolShortcut(e, key) ||
        handleDelete(e, key) ||
        handleUndo(e, key) ||
        handleRedo(e, key) ||
        handleCopy(e, key) ||
        handlePaste(e, key) ||
        handleDuplicate(e, key) ||
        handleExport(e, key, onToggleExport) ||
        handleEscape(e, key) ||
        handleToggleSidebar(e, key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleExport]);
}
