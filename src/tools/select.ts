import type { WireObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;
let dragTarget: string | null = null;
let resizeHandle: string | null = null; // "nw","ne","sw","se"
let originalPosition: { col: number; row: number } | null = null;
let originalSize: { width: number; height: number } | null = null;

function hitTest(
	col: number,
	row: number,
	objects: WireObject[],
): WireObject | null {
	// Reverse z-order: highest zIndex first
	const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);
	for (const obj of sorted) {
		if (isPointInObject(col, row, obj)) {
			return obj;
		}
	}
	return null;
}

function isPointInObject(col: number, row: number, obj: WireObject): boolean {
	switch (obj.type) {
		case "box":
			return (
				col >= obj.position.col &&
				col < obj.position.col + obj.width &&
				row >= obj.position.row &&
				row < obj.position.row + obj.height
			);
		case "text": {
			const lines = obj.content.split("\n");
			const maxWidth = Math.max(...lines.map((l) => l.length), 1);
			return (
				col >= obj.position.col &&
				col < obj.position.col + maxWidth &&
				row >= obj.position.row &&
				row < obj.position.row + lines.length
			);
		}
		case "line":
		case "arrow": {
			const { col: c1, row: r1 } = obj.position;
			const { col: c2, row: r2 } = obj.endPosition;
			if (r1 === r2) {
				return row === r1 && col >= Math.min(c1, c2) && col <= Math.max(c1, c2);
			}
			if (c1 === c2) {
				return col === c1 && row >= Math.min(r1, r2) && row <= Math.max(r1, r2);
			}
			return false;
		}
	}
}

function getResizeHandle(
	col: number,
	row: number,
	obj: WireObject,
): string | null {
	if (obj.type !== "box") return null;
	const { col: bCol, row: bRow } = obj.position;
	const right = bCol + obj.width - 1;
	const bottom = bRow + obj.height - 1;

	const onLeft = col === bCol;
	const onRight = col === right;
	const onTop = row === bRow;
	const onBottom = row === bottom;

	if (onTop && onLeft) return "nw";
	if (onTop && onRight) return "ne";
	if (onBottom && onLeft) return "sw";
	if (onBottom && onRight) return "se";
	return null;
}

export const selectTool: ToolHandler = {
	name: "select",
	cursor: "default",

	onMouseDown(col, row, e) {
		const state = useEditorStore.getState();
		const hit = hitTest(col, row, state.objects);

		if (!hit) {
			state.clearSelection();
			dragStart = null;
			dragTarget = null;
			return;
		}

		// Check for resize handle on selected boxes
		if (state.selection.has(hit.id)) {
			const handle = getResizeHandle(col, row, hit);
			if (handle && hit.type === "box") {
				resizeHandle = handle;
				dragStart = { col, row };
				dragTarget = hit.id;
				originalPosition = { ...hit.position };
				originalSize = { width: hit.width, height: hit.height };
				return;
			}
		}

		// Select (shift for toggle)
		state.selectObject(hit.id, e.shiftKey);
		dragStart = { col, row };
		dragTarget = hit.id;
		resizeHandle = null;
	},

	onMouseMove(col, row) {
		if (!dragStart || !dragTarget) return;
		const state = useEditorStore.getState();

		if (resizeHandle && originalPosition && originalSize) {
			// Resize mode
			const deltaCol = col - dragStart.col;
			const deltaRow = row - dragStart.row;

			let newCol = originalPosition.col;
			let newRow = originalPosition.row;
			let newW = originalSize.width;
			let newH = originalSize.height;

			if (resizeHandle.includes("e")) {
				newW = Math.max(3, originalSize.width + deltaCol);
			}
			if (resizeHandle.includes("w")) {
				newW = Math.max(3, originalSize.width - deltaCol);
				newCol = originalPosition.col + (originalSize.width - newW);
			}
			if (resizeHandle.includes("s")) {
				newH = Math.max(3, originalSize.height + deltaRow);
			}
			if (resizeHandle.includes("n")) {
				newH = Math.max(3, originalSize.height - deltaRow);
				newRow = originalPosition.row + (originalSize.height - newH);
			}

			// Update position and size without pushing history on every move
			const obj = state.objects.find((o) => o.id === dragTarget);
			if (obj && obj.type === "box") {
				state.setDraft({
					...obj,
					position: { col: newCol, row: newRow },
					width: newW,
					height: newH,
				});
			}
			return;
		}

		// Move mode
		const deltaCol = col - dragStart.col;
		const deltaRow = row - dragStart.row;
		if (deltaCol === 0 && deltaRow === 0) return;

		// Live preview via draft: move all selected objects
		// We'll do this by temporarily updating positions
		dragStart = { col, row };
		state.moveSelection(deltaCol, deltaRow);
	},

	onMouseUp(_col, _row) {
		const state = useEditorStore.getState();

		if (resizeHandle && dragTarget && originalPosition && originalSize) {
			// Finalize resize
			const draft = state.draft;
			if (draft && draft.type === "box") {
				state.setDraft(null);
				state.resizeObject(dragTarget, draft.width, draft.height);
				// Also update position if it changed
				const obj = state.objects.find((o) => o.id === dragTarget);
				if (
					obj &&
					(obj.position.col !== draft.position.col ||
						obj.position.row !== draft.position.row)
				) {
					state.moveObject(
						dragTarget,
						draft.position.col - obj.position.col,
						draft.position.row - obj.position.row,
					);
				}
			}
		}

		dragStart = null;
		dragTarget = null;
		resizeHandle = null;
		originalPosition = null;
		originalSize = null;
	},
};
