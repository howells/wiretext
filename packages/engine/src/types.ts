export type ObjectId = string;
export type LayerId = string;

/** A cell on the character grid. Coordinates are 0-based; `col` is the x-axis, `row` the y-axis. */
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
  | "progress"
  | "icon"
  | "image"
  | "divider"
  | "toggle"
  | "alert"
  | "breadcrumb"
  | "avatar"
  | "list"
  | "stepper"
  | "rating"
  | "skeleton";

export type AlertType = "info" | "warning" | "error" | "success";
export type ListStyle = "bullet" | "number" | "dash";
export type TextAlign = "center" | "left";
export type IconPosition = "left" | "right";

export interface Layer {
  id: LayerId;
  locked: boolean;
  name: string;
  visible: boolean;
}

export interface BaseObject {
  annotation?: string;
  groupId?: string;
  id: ObjectId;
  layerId: LayerId;
  name?: string;
  position: GridPoint;
  zIndex: number;
}

export interface BoxObject extends BaseObject {
  borderStyle: BorderStyle;
  fill?: FillStyle;
  height: number;
  label?: string;
  type: "box";
  width: number;
}

export interface TextObject extends BaseObject {
  content: string;
  type: "text";
}

export interface LineObject extends BaseObject {
  endPosition: GridPoint;
  type: "line";
}

export interface ArrowObject extends BaseObject {
  endHead?: boolean;
  endPosition: GridPoint;
  startHead?: boolean;
  type: "arrow";
}

export type ConnectorSide = "top" | "bottom" | "left" | "right";

export interface ConnectorObject extends BaseObject {
  endHead?: boolean;
  fromId: ObjectId;
  fromSide?: ConnectorSide;
  label?: string;
  startHead?: boolean;
  toId: ObjectId;
  toSide?: ConnectorSide;
  type: "connector";
}

export interface ComponentObject extends BaseObject {
  activeStep?: number;
  alertType?: AlertType;
  align?: TextAlign;
  body?: string;
  borderStyle: BorderStyle;
  checked?: boolean;
  columns?: string[];
  componentType: ComponentType;
  fill?: FillStyle;
  filterable?: boolean;
  height: number;
  icon?: string;
  iconPosition?: IconPosition;
  items?: string[];
  label?: string;
  listStyle?: ListStyle;
  maxValue?: number;
  navItems?: string[];
  progress?: number;
  rows?: string[][];
  separator?: string;
  tabs?: string[];
  type: "component";
  value?: number;
  width: number;
}

export type WireObject =
  | BoxObject
  | TextObject
  | LineObject
  | ArrowObject
  | ComponentObject
  | ConnectorObject;

/** Distributive Omit that preserves discriminated unions */
export type NewWireObject =
  | Omit<BoxObject, "id">
  | Omit<TextObject, "id">
  | Omit<LineObject, "id">
  | Omit<ArrowObject, "id">
  | Omit<ComponentObject, "id">
  | Omit<ConnectorObject, "id">;

/** Type guard for objects with rectangular bounds (box, component) */
export const hasRectBounds = (
  obj: WireObject
): obj is BoxObject | ComponentObject =>
  obj.type === "box" || obj.type === "component";

export type ResizeConstraint = "both" | "horizontal" | "none";

const FIXED_HEIGHT_COMPONENTS = new Set([
  "button",
  "input",
  "select",
  "checkbox",
  "radio",
  "navbar",
  "progress",
  "divider",
  "toggle",
  "breadcrumb",
  "rating",
  "stepper",
  "avatar",
]);

/** Determine what resize axes are allowed for an object */
export const getResizeConstraint = (obj: WireObject): ResizeConstraint => {
  if (obj.type === "connector") {
    return "none";
  }
  if (obj.type !== "component") {
    return "both";
  }
  if (obj.componentType === "icon") {
    return "none";
  }
  if (FIXED_HEIGHT_COMPONENTS.has(obj.componentType)) {
    return "horizontal";
  }
  return "both";
};

export type ToolType =
  | "select"
  | "box"
  | "text"
  | "line"
  | "arrow"
  | "connector";

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

/** Pixel dimensions of one grid cell, used to map grid coordinates to screen space (distinct from the display-column widths in char-width.ts). */
export interface CharMetrics {
  charWidth: number;
  lineHeight: number;
}

export interface Selection {
  objectIds: Set<ObjectId>;
}
