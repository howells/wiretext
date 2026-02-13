export type ObjectId = string;

export interface GridPoint {
	col: number;
	row: number;
}

export interface GridSize {
	cols: number;
	rows: number;
}

export type BorderStyle = "single" | "double" | "rounded" | "heavy";

export interface BaseObject {
	id: ObjectId;
	position: GridPoint;
	zIndex: number;
	annotation?: string;
}

export interface BoxObject extends BaseObject {
	type: "box";
	width: number;
	height: number;
	borderStyle: BorderStyle;
	label?: string;
}

export interface TextObject extends BaseObject {
	type: "text";
	content: string;
}

export interface LineObject extends BaseObject {
	type: "line";
	endPosition: GridPoint;
}

export interface ArrowObject extends BaseObject {
	type: "arrow";
	endPosition: GridPoint;
}

export type WireObject = BoxObject | TextObject | LineObject | ArrowObject;

/** Distributive Omit that preserves discriminated unions */
export type NewWireObject =
	| Omit<BoxObject, "id">
	| Omit<TextObject, "id">
	| Omit<LineObject, "id">
	| Omit<ArrowObject, "id">;

export type ToolType = "select" | "box" | "text" | "line" | "arrow";

export interface Viewport {
	panX: number;
	panY: number;
	zoom: number;
}

export interface CharMetrics {
	charWidth: number;
	lineHeight: number;
}

export interface Selection {
	objectIds: Set<ObjectId>;
}
