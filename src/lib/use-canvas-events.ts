"use client";

import { useEditorStore } from "@/store";
import { arrowTool } from "@/tools/arrow";
import { boxTool } from "@/tools/box";
import { lineTool } from "@/tools/line";
import { selectTool } from "@/tools/select";
import { textTool } from "@/tools/text";
import type { ToolHandler } from "@/tools/types";
import { useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

const toolMap: Record<string, ToolHandler> = {
	select: selectTool,
	box: boxTool,
	text: textTool,
	line: lineTool,
	arrow: arrowTool,
};

function getActiveHandler(): ToolHandler | null {
	const activeTool = useEditorStore.getState().activeTool;
	return toolMap[activeTool] ?? null;
}

export function useCanvasEvents() {
	const activeTool = useEditorStore((s) => s.activeTool);

	const onMouseDown = useCallback(
		(col: number, row: number, e: ReactMouseEvent) => {
			getActiveHandler()?.onMouseDown?.(col, row, e);
		},
		[],
	);

	const onMouseMove = useCallback(
		(col: number, row: number, e: ReactMouseEvent) => {
			getActiveHandler()?.onMouseMove?.(col, row, e);
		},
		[],
	);

	const onMouseUp = useCallback(
		(col: number, row: number, e: ReactMouseEvent) => {
			getActiveHandler()?.onMouseUp?.(col, row, e);
		},
		[],
	);

	const cursor = toolMap[activeTool]?.cursor ?? "default";

	return { onMouseDown, onMouseMove, onMouseUp, cursor };
}
