import { nanoid } from "nanoid";
import { getObjectBounds } from "./bounds";
import { COMPONENT_BY_TYPE } from "./components";
import type {
  AlertType,
  BorderStyle,
  ComponentType,
  FillStyle,
  GridPoint,
  GridSize,
  Layer,
  ListStyle,
  WireObject,
} from "./types";

interface MinimalBase {
  id?: string;
  position?: GridPoint;
  zIndex?: number;
  layerId?: string;
  name?: string;
  annotation?: string;
  groupId?: string;
}

export interface MinimalBox extends MinimalBase {
  type: "box";
  width?: number;
  height?: number;
  borderStyle?: BorderStyle;
  fill?: FillStyle;
  label?: string;
}

export interface MinimalText extends MinimalBase {
  type: "text";
  content: string;
}

export interface MinimalLine extends MinimalBase {
  type: "line";
  endPosition: GridPoint;
}

export interface MinimalArrow extends MinimalBase {
  type: "arrow";
  endPosition: GridPoint;
  startHead?: boolean;
  endHead?: boolean;
}

export interface MinimalComponent extends MinimalBase {
  type: "component";
  componentType: ComponentType;
  width?: number;
  height?: number;
  borderStyle?: BorderStyle;
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

export type MinimalObject =
  | MinimalBox
  | MinimalText
  | MinimalLine
  | MinimalArrow
  | MinimalComponent;

/** Fill default values for minimal wire objects and create a default layer. */
export function fillDefaults(objects: MinimalObject[]): {
  objects: WireObject[];
  layer: Layer;
} {
  const layerId = nanoid();
  const layer: Layer = {
    id: layerId,
    name: "Layer 1",
    visible: true,
    locked: false,
  };

  const filled: WireObject[] = [];

  for (let index = 0; index < objects.length; index++) {
    const obj = objects[index];
    const base = {
      id: obj.id ?? nanoid(),
      position: obj.position ?? { col: 0, row: 0 },
      zIndex: obj.zIndex ?? index,
      layerId: obj.layerId ?? layerId,
      name: obj.name,
      annotation: obj.annotation,
      groupId: obj.groupId,
    };

    switch (obj.type) {
      case "box":
        filled.push({
          ...base,
          type: "box",
          width: obj.width ?? 10,
          height: obj.height ?? 5,
          borderStyle: obj.borderStyle ?? "single",
          fill: obj.fill,
          label: obj.label,
        });
        break;
      case "text":
        filled.push({
          ...base,
          type: "text",
          content: obj.content,
        });
        break;
      case "line":
        filled.push({
          ...base,
          type: "line",
          endPosition: obj.endPosition,
        });
        break;
      case "arrow":
        filled.push({
          ...base,
          type: "arrow",
          endPosition: obj.endPosition,
          startHead: obj.startHead,
          endHead: obj.endHead,
        });
        break;
      case "component": {
        const def = COMPONENT_BY_TYPE[obj.componentType];
        filled.push({
          ...base,
          type: "component",
          componentType: obj.componentType,
          width: obj.width ?? def.defaultWidth,
          height: obj.height ?? def.defaultHeight,
          borderStyle: obj.borderStyle ?? "single",
          fill: obj.fill,
          label: obj.label,
          icon: obj.icon,
          checked: obj.checked,
          progress: obj.progress,
          columns: obj.columns,
          tabs: obj.tabs,
          navItems: obj.navItems,
          alertType: obj.alertType,
          items: obj.items,
          separator: obj.separator,
          listStyle: obj.listStyle,
          activeStep: obj.activeStep,
          value: obj.value,
          maxValue: obj.maxValue,
        });
        break;
      }
      default:
        break;
    }
  }

  return { objects: filled, layer };
}

/** Compute tight grid bounds for rendering, with configurable padding. */
export function computeRenderGridSize(
  objects: WireObject[],
  padding = 2
): GridSize {
  let maxCol = 0;
  let maxRow = 0;

  for (const obj of objects) {
    const bounds = getObjectBounds(obj);
    maxCol = Math.max(maxCol, bounds.col + bounds.width);
    maxRow = Math.max(maxRow, bounds.row + bounds.height);
  }

  return {
    cols: Math.max(maxCol + padding, 1),
    rows: Math.max(maxRow + padding, 1),
  };
}
