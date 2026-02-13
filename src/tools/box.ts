import type { BoxObject } from "@/engine/types";
import { useEditorStore } from "@/store";
import type { ToolHandler } from "./types";

let dragStart: { col: number; row: number } | null = null;

function makeDraftBox(
	startCol: number,
	startRow: number,
	endCol: number,
	endRow: number,
): Omit<BoxObject, "id"> {
	return {
		type: "box",
		position: {
			col: Math.min(startCol, endCol),
			row: Math.min(startRow, endRow),
		},
		width: Math.max(3, Math.abs(endCol - startCol) + 1),
		height: Math.max(3, Math.abs(endRow - startRow) + 1),
		borderStyle: "single",
		zIndex: useEditorStore.getState().objects.length,
	};
}

export const boxTool: ToolHandler = {
	name: "box",
	cursor: "crosshair",

	onMouseDown(col, row) {
		dragStart = { col, row };
		useEditorStore.getState().setDraft({
			...makeDraftBox(col, row, col, row),
			id: "__draft__",
		} as BoxObject);
	},

	onMouseMove(col, row) {
		if (!dragStart) return;
		useEditorStore.getState().setDraft({
			...makeDraftBox(dragStart.col, dragStart.row, col, row),
			id: "__draft__",
		} as BoxObject);
	},

	onMouseUp(col, row) {
		if (!dragStart) return;
		useEditorStore.getState().setDraft(null);
		useEditorStore
			.getState()
			.addObject(makeDraftBox(dragStart.col, dragStart.row, col, row));
		dragStart = null;
	},
};
