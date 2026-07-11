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
  a: "arrow",
  b: "box",
  c: "connector",
  l: "line",
  t: "text",
  v: "select",
};

const handleToolShortcut = (e: KeyboardEvent, key: string): boolean => {
  if (!(e.metaKey || e.ctrlKey) && TOOL_KEYS[key]) {
    e.preventDefault();
    useEditorStore.getState().setActiveTool(TOOL_KEYS[key]);
    return true;
  }
  return false;
};

const handleDelete = (e: KeyboardEvent, key: string): boolean => {
  if (key === "delete" || key === "backspace") {
    e.preventDefault();
    useEditorStore.getState().deleteSelection();
    return true;
  }
  return false;
};

const handleUndo = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "z" && !e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().undo();
    return true;
  }
  return false;
};

const handleRedo = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "z" && e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().redo();
    return true;
  }
  return false;
};

const handleCopy = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "c") {
    e.preventDefault();
    const state = useEditorStore.getState();
    let text: string;
    if (state.selection.size > 0) {
      // Copy selected objects to internal clipboard + system clipboard (selection only)
      state.copySelection();
      text = composeSelectionToText(state.objects, state.selection);
    } else {
      // No selection: copy full canvas to system clipboard
      const effectiveGridSize = getEffectiveGridSize(
        state.objects,
        state.gridSize
      );
      text = composeToText(state.objects, effectiveGridSize, state.layers);
    }
    void copyToClipboard(text);
    return true;
  }
  return false;
};

const handleCut = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "x") {
    e.preventDefault();
    const state = useEditorStore.getState();
    if (state.selection.size > 0) {
      const text = composeSelectionToText(state.objects, state.selection);
      void copyToClipboard(text);
      state.cutSelection();
    }
    return true;
  }
  return false;
};

const handlePaste = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "v") {
    e.preventDefault();
    useEditorStore.getState().pasteClipboard();
    return true;
  }
  return false;
};

const handleDuplicate = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "d") {
    e.preventDefault();
    useEditorStore.getState().duplicateSelection();
    return true;
  }
  return false;
};

const handleExport = (
  e: KeyboardEvent,
  key: string,
  onToggleExport?: () => void
): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "e") {
    e.preventDefault();
    onToggleExport?.();
    return true;
  }
  return false;
};

const handleSelectAll = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "a") {
    e.preventDefault();
    useEditorStore.getState().selectAll();
    return true;
  }
  return false;
};

const handleGroup = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "g" && !e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().groupSelection();
    return true;
  }
  return false;
};

const handleUngroup = (e: KeyboardEvent, key: string): boolean => {
  if ((e.metaKey || e.ctrlKey) && key === "g" && e.shiftKey) {
    e.preventDefault();
    useEditorStore.getState().ungroupSelection();
    return true;
  }
  return false;
};

const handleEscape = (e: KeyboardEvent, key: string): boolean => {
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
};

export const handleArrowKeys = (
  e: Pick<KeyboardEvent, "preventDefault" | "shiftKey">,
  key: string
): boolean => {
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
    case "arrowup": {
      state.moveSelection(0, -step);
      break;
    }
    case "arrowdown": {
      state.moveSelection(0, step);
      break;
    }
    case "arrowleft": {
      state.moveSelection(-step, 0);
      break;
    }
    case "arrowright": {
      state.moveSelection(step, 0);
      break;
    }
    default: {
      break;
    }
  }
  return true;
};

const handleZOrder = (e: KeyboardEvent, key: string): boolean => {
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
};

const handleToggleSidebar = (e: KeyboardEvent, key: string): boolean => {
  if (!(e.metaKey || e.ctrlKey) && key === "p") {
    e.preventDefault();
    useEditorStore.getState().toggleSidebar();
    return true;
  }
  return false;
};

const handleToggleSnap = (e: KeyboardEvent, key: string): boolean => {
  if (!(e.metaKey || e.ctrlKey || e.altKey) && key === ";") {
    e.preventDefault();
    useEditorStore.getState().toggleSnap();
    return true;
  }
  return false;
};

/**
 * Global keyboard shortcut handler for the editor, active for the component's
 * lifetime. Keystrokes originating in inputs/textareas/selects/contentEditable
 * are ignored so typing never triggers a shortcut. Handlers are tried in order
 * and the first to claim the key wins (it returns true and stops the chain), so
 * more specific combos are listed before the plain-letter tool shortcuts.
 *
 * Bindings (mod = ⌘ on macOS / Ctrl elsewhere):
 *   v/b/l/a/t/c            select / box / line / arrow / text / connector tool
 *   Delete·Backspace       delete selection
 *   mod+Z / mod+Shift+Z    undo / redo
 *   mod+A                  select all        mod+C·X·V   copy / cut / paste
 *   mod+D                  duplicate         mod+G·⇧G    group / ungroup
 *   mod+E                  toggle export (via onToggleExport)
 *   [ / ]                  send backward / bring forward  (+mod → to back/front)
 *   arrows                 nudge selection 1 cell (Shift → 5)
 *   Escape                 cancel: context menu → pending component → clear all
 *   p                      toggle sidebar    ;   toggle snapping
 */
export const useKeyboard = (onToggleExport?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { target } = e;
      if (target instanceof HTMLElement) {
        const isFormTag =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT";
        if (isFormTag || target.isContentEditable) {
          return;
        }
      }

      const key = e.key.toLowerCase();

      const handlers: ((ev: KeyboardEvent, k: string) => boolean)[] = [
        handleToolShortcut,
        handleDelete,
        handleUndo,
        handleRedo,
        handleSelectAll,
        handleUngroup,
        handleGroup,
        handleCopy,
        handleCut,
        handlePaste,
        handleDuplicate,
        handleZOrder,
        handleArrowKeys,
        (ev, k) => handleExport(ev, k, onToggleExport),
        handleEscape,
        handleToggleSidebar,
        handleToggleSnap,
      ];

      for (const handler of handlers) {
        if (handler(e, key)) {
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onToggleExport]);
};
