import { nanoid } from "nanoid";
import { getObjectBounds } from "./bounds";
import { COMPONENT_BY_TYPE } from "./components";
import { getComponentMinWidth } from "./min-width";
import type {
  AlertType,
  BorderStyle,
  ComponentType,
  ConnectorSide,
  FillStyle,
  GridPoint,
  GridSize,
  IconPosition,
  Layer,
  ListStyle,
  ObjectId,
  TextAlign,
  WireObject,
} from "./types";

interface MinimalBase {
  annotation?: string;
  groupId?: string;
  id?: string;
  layerId?: string;
  name?: string;
  position?: GridPoint;
  zIndex?: number;
}

export interface MinimalBox extends MinimalBase {
  borderStyle?: BorderStyle;
  fill?: FillStyle;
  height?: number;
  label?: string;
  type: "box";
  width?: number;
}

export interface MinimalText extends MinimalBase {
  content: string;
  type: "text";
}

export interface MinimalLine extends MinimalBase {
  endPosition: GridPoint;
  type: "line";
}

export interface MinimalArrow extends MinimalBase {
  endHead?: boolean;
  endPosition: GridPoint;
  startHead?: boolean;
  type: "arrow";
}

export interface MinimalComponent extends MinimalBase {
  activeStep?: number;
  alertType?: AlertType;
  align?: TextAlign;
  body?: string;
  borderStyle?: BorderStyle;
  checked?: boolean;
  columns?: string[];
  componentType: ComponentType;
  fill?: FillStyle;
  filterable?: boolean;
  height?: number;
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
  width?: number;
}

export interface MinimalConnector extends MinimalBase {
  endHead?: boolean;
  fromId: ObjectId;
  fromSide?: ConnectorSide;
  label?: string;
  startHead?: boolean;
  toId: ObjectId;
  toSide?: ConnectorSide;
  type: "connector";
}

export type MinimalObject =
  | MinimalBox
  | MinimalText
  | MinimalLine
  | MinimalArrow
  | MinimalComponent
  | MinimalConnector;

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
          width:
            obj.width ?? Math.max(def.defaultWidth, getComponentMinWidth(obj)),
          height: obj.height ?? def.defaultHeight,
          borderStyle: obj.borderStyle ?? "single",
          fill: obj.fill,
          label: obj.label,
          icon: obj.icon,
          align: obj.align,
          iconPosition: obj.iconPosition,
          checked: obj.checked,
          progress: obj.progress,
          columns: obj.columns,
          rows: obj.rows,
          filterable: obj.filterable,
          tabs: obj.tabs,
          navItems: obj.navItems,
          alertType: obj.alertType,
          items: obj.items,
          separator: obj.separator,
          listStyle: obj.listStyle,
          activeStep: obj.activeStep,
          value: obj.value,
          maxValue: obj.maxValue,
          body: obj.body,
        });
        break;
      }
      case "connector":
        filled.push({
          ...base,
          type: "connector",
          fromId: obj.fromId,
          toId: obj.toId,
          fromSide: obj.fromSide,
          toSide: obj.toSide,
          startHead: obj.startHead,
          endHead: obj.endHead,
          label: obj.label,
        });
        break;
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
