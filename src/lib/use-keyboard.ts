"use client";

import type { ToolType } from "@/engine/types";
import { composeToText, copyToClipboard } from "@/lib/clipboard";
import { useEditorStore } from "@/store";
import { useEffect } from "react";

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
			if (tag === "INPUT" || tag === "TEXTAREA") return;

			const key = e.key.toLowerCase();

			// Tool shortcuts
			if (!e.metaKey && !e.ctrlKey && TOOL_KEYS[key]) {
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

			// Copy: Cmd+C
			if ((e.metaKey || e.ctrlKey) && key === "c") {
				e.preventDefault();
				const state = useEditorStore.getState();
				const text = composeToText(state.objects, state.gridSize);
				copyToClipboard(text);
				return;
			}

			// Export: Cmd+E
			if ((e.metaKey || e.ctrlKey) && key === "e") {
				e.preventDefault();
				onToggleExport?.();
				return;
			}

			// Escape: deselect and exit editing
			if (key === "escape") {
				e.preventDefault();
				useEditorStore.getState().clearSelection();
				useEditorStore.getState().setEditingTextId(null);
				useEditorStore.getState().setActiveTool("select");
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onToggleExport]);
}
