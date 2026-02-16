export type ObjectId = string;
export type LayerId = string;

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

export interface Layer {
  id: LayerId;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface BaseObject {
  id: ObjectId;
  position: GridPoint;
  zIndex: number;
  layerId: LayerId;
  name?: string;
  annotation?: string;
  groupId?: string;
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
  startHead?: boolean;
  endHead?: boolean;
}

export interface ComponentObject extends BaseObject {
  type: "component";
  componentType: ComponentType;
  width: number;
  height: number;
  borderStyle: BorderStyle;
  fill?: FillStyle;
  label?: string;
  icon?: string;
  checked?: boolean;
  progress?: number;
  columns?: string[];
  tabs?: string[];
  navItems?: string[];
  alertType?: AlertType;
  items?: string[];
  separator?: string;
  listStyle?: ListStyle;
  activeStep?: number;
  value?: number;
  maxValue?: number;
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
export function getResizeConstraint(obj: WireObject): ResizeConstraint {
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
