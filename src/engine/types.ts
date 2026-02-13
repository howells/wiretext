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
export type FillStyle = "solid" | "transparent";

export type ComponentType =
  | "button"
  | "input"
  | "select"
  | "checkbox"
  | "radio"
  | "table"
  | "modal"
  | "browser"
  | "card"
  | "navbar"
  | "tabs"
  | "progress";

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
  fill?: FillStyle;
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

export interface ComponentObject extends BaseObject {
  type: "component";
  componentType: ComponentType;
  width: number;
  height: number;
  borderStyle: BorderStyle;
  fill?: FillStyle;
  label?: string;
  checked?: boolean;
  progress?: number;
  columns?: string[];
  tabs?: string[];
  navItems?: string[];
}

export type WireObject =
  | BoxObject
  | TextObject
  | LineObject
  | ArrowObject
  | ComponentObject;

/** Distributive Omit that preserves discriminated unions */
export type NewWireObject =
  | Omit<BoxObject, "id">
  | Omit<TextObject, "id">
  | Omit<LineObject, "id">
  | Omit<ArrowObject, "id">
  | Omit<ComponentObject, "id">;

/** Type guard for objects with rectangular bounds (box, component) */
export function hasRectBounds(
  obj: WireObject
): obj is BoxObject | ComponentObject {
  return obj.type === "box" || obj.type === "component";
}

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
