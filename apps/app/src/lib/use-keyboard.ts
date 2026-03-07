"use client";

import type { ToolType } from "@wiretext/engine";
import { getEffectiveGridSize } from "@wiretext/engine";
import { useEffect } from "react";
import {
  composeSelectionToText,
  composeToText,
  copyToClipboard,
} from "@/lib/clipboard";
import { useEditorStore } from "@/store";

const TOOL_KEYS: Record<string, ToolType> = {
  v: "select",
  b: "box",
  t: "text",
  l: "line",
  a: "arrow",
  c: "connector",
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
      // Copy selected objects to internal clipboard + system clipboard (selection only)
      state.copySelection();
      const text = composeSelectionToText(state.objects, state.selection);
      copyToClipboard(text);
    } else {
      // No selection: copy full canvas to system clipboard
      const effectiveGridSize = getEffectiveGridSize(
        state.objects,
        state.gridSize
      );
      const text = composeToText(
        state.objects,
        effectiveGridSize,
        state.layers
      );
      copyToClipboard(text);
    }
    return true;
  }
  return false;
}

function handleCut(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "x") {
    e.preventDefault();
    const state = useEditorStore.getState();
    if (state.selection.size > 0) {
      const text = composeSelectionToText(state.objects, state.selection);
      copyToClipboard(text);
      state.cutSelection();
    }
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

function handleSelectAll(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "a") {
    e.preventDefault();
    useEditorStore.getState().selectAll();
    return true;
  }
  return false;
}

function handleGroup(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "g" && !e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().groupSelection();
    return true;
  }
  return false;
}

function handleUngroup(e: KeyboardEvent, key: string): boolean {
  if ((e.metaKey || e.ctrlKey) && key === "g" && e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().ungroupSelection();
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
  // Close context menu first
  if (state.contextMenu) {
    state.setContextMenu(null);
    return true;
  }
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

export function handleArrowKeys(e: KeyboardEvent, key: string): boolean {
  if (
    key !== "arrowup" &&
    key !== "arrowdown" &&
    key !== "arrowleft" &&
    key !== "arrowright"
  ) {
    return false;
  }
  const state = useEditorStore.getState();
  if (state.selection.size === 0) {
    return false;
  }
  e.preventDefault();
  const step = e.shiftKey ? 5 : 1;
  switch (key) {
    case "arrowup":
      state.moveSelection(0, -step);
      break;
    case "arrowdown":
      state.moveSelection(0, step);
      break;
    case "arrowleft":
      state.moveSelection(-step, 0);
      break;
    case "arrowright":
      state.moveSelection(step, 0);
      break;
    default:
      break;
  }
  return true;
}

function handleZOrder(e: KeyboardEvent, key: string): boolean {
  if (key !== "]" && key !== "[") {
    return false;
  }
  const state = useEditorStore.getState();
  if (state.selection.size === 0) {
    return false;
  }
  e.preventDefault();
  const ids = [...state.selection];
  if ((e.metaKey || e.ctrlKey) && key === "]") {
    state.bringToFront(ids);
  } else if ((e.metaKey || e.ctrlKey) && key === "[") {
    state.sendToBack(ids);
  } else if (key === "]") {
    state.bringForward(ids);
  } else {
    state.sendBackward(ids);
  }
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

function handleToggleSnap(e: KeyboardEvent, key: string): boolean {
  if (!(e.metaKey || e.ctrlKey || e.altKey) && key === ";") {
    e.preventDefault();
    useEditorStore.getState().toggleSnap();
    return true;
  }
  return false;
}

export function useKeyboard(onToggleExport?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      handleToolShortcut(e, key) ||
        handleDelete(e, key) ||
        handleUndo(e, key) ||
        handleRedo(e, key) ||
        handleSelectAll(e, key) ||
        handleUngroup(e, key) ||
        handleGroup(e, key) ||
        handleCopy(e, key) ||
        handleCut(e, key) ||
        handlePaste(e, key) ||
        handleDuplicate(e, key) ||
        handleZOrder(e, key) ||
        handleArrowKeys(e, key) ||
        handleExport(e, key, onToggleExport) ||
        handleEscape(e, key) ||
        handleToggleSidebar(e, key) ||
        handleToggleSnap(e, key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleExport]);
}
