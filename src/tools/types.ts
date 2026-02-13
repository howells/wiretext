import type { MouseEvent as ReactMouseEvent } from "react";

export interface ToolHandler {
	name: string;
	cursor: string;
	onMouseDown?: (col: number, row: number, e: ReactMouseEvent) => void;
	onMouseMove?: (col: number, row: number, e: ReactMouseEvent) => void;
	onMouseUp?: (col: number, row: number, e: ReactMouseEvent) => void;
}
