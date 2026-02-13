import type { LineObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

function snapToAxis(
	startCol: number,
	startRow: number,
	endCol: number,
	endRow: number,
): { col: number; row: number } {
	const dx = Math.abs(endCol - startCol);
	const dy = Math.abs(endRow - startRow);
	// Snap to whichever axis has greater delta
	if (dx >= dy) {
		return { col: endCol, row: startRow };
	}
	return { col: startCol, row: endRow };
}

export const lineTool: ToolHandler = {
	name: "line",
	cursor: "crosshair",

	onMouseDown(col, row) {
		dragStart = { col, row };
		useEditorStore.getState().setDraft({
			id: "__draft__",
			type: "line",
			position: { col, row },
			endPosition: { col, row },
			zIndex: useEditorStore.getState().objects.length,
		} as LineObject);
	},

	onMouseMove(col, row) {
		if (!dragStart) return;
		const end = snapToAxis(dragStart.col, dragStart.row, col, row);
		useEditorStore.getState().setDraft({
			id: "__draft__",
			type: "line",
			position: { col: dragStart.col, row: dragStart.row },
			endPosition: end,
			zIndex: useEditorStore.getState().objects.length,
		} as LineObject);
	},

	onMouseUp(col, row) {
		if (!dragStart) return;
		const end = snapToAxis(dragStart.col, dragStart.row, col, row);

		useEditorStore.getState().setDraft(null);

		// Only create if there's actual length
		if (end.col !== dragStart.col || end.row !== dragStart.row) {
			useEditorStore.getState().addObject({
				type: "line",
				position: { col: dragStart.col, row: dragStart.row },
				endPosition: end,
				zIndex: useEditorStore.getState().objects.length,
			});
		}

		dragStart = null;
	},
};
