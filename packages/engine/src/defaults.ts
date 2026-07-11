import { nanoid } from "nanoid";

import { getObjectBounds } from "./bounds";
import { COMPONENT_BY_TYPE } from "./components";
import { getComponentMinWidth } from "./min-width";
import type {
  AlertType,
  BaseObject,
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

/** Build a single fully-defaulted wire object from its minimal form. */
const fillObject = (
  obj: MinimalObject,
  base: BaseObject
): WireObject | null => {
  switch (obj.type) {
    case "box": {
      return {
        ...base,
        borderStyle: obj.borderStyle ?? "single",
        fill: obj.fill,
        height: obj.height ?? 5,
        label: obj.label,
        type: "box",
        width: obj.width ?? 10,
      };
    }
    case "text": {
      return { ...base, content: obj.content, type: "text" };
    }
    case "line": {
      return { ...base, endPosition: obj.endPosition, type: "line" };
    }
    case "arrow": {
      return {
        ...base,
        endHead: obj.endHead,
        endPosition: obj.endPosition,
        startHead: obj.startHead,
        type: "arrow",
      };
    }
    case "component": {
      const def = COMPONENT_BY_TYPE[obj.componentType];
      return {
        ...base,
        activeStep: obj.activeStep,
        alertType: obj.alertType,
        align: obj.align,
        body: obj.body,
        borderStyle: obj.borderStyle ?? "single",
        checked: obj.checked,
        columns: obj.columns,
        componentType: obj.componentType,
        fill: obj.fill,
        filterable: obj.filterable,
        height: obj.height ?? def.defaultHeight,
        icon: obj.icon,
        iconPosition: obj.iconPosition,
        items: obj.items,
        label: obj.label,
        listStyle: obj.listStyle,
        maxValue: obj.maxValue,
        navItems: obj.navItems,
        progress: obj.progress,
        rows: obj.rows,
        separator: obj.separator,
        tabs: obj.tabs,
        type: "component",
        value: obj.value,
        width:
          obj.width ?? Math.max(def.defaultWidth, getComponentMinWidth(obj)),
      };
    }
    case "connector": {
      return {
        ...base,
        endHead: obj.endHead,
        fromId: obj.fromId,
        fromSide: obj.fromSide,
        label: obj.label,
        startHead: obj.startHead,
        toId: obj.toId,
        toSide: obj.toSide,
        type: "connector",
      };
    }
    default: {
      return null;
    }
  }
};

/**
 * Expand minimal wire objects into fully-defaulted ones under a fresh layer.
 *
 * Missing `id`s are generated, `position` defaults to the origin, and `zIndex`
 * defaults to the object's index so declaration order becomes paint order.
 * Component sizes fall back to the per-type defaults (never below the content
 * min width). All objects are assigned the returned default layer.
 */
export const fillDefaults = (
  objects: MinimalObject[]
): { objects: WireObject[]; layer: Layer } => {
  const layerId = nanoid();
  const layer: Layer = {
    id: layerId,
    locked: false,
    name: "Layer 1",
    visible: true,
  };

  const filled: WireObject[] = [];

  for (let index = 0; index < objects.length; index += 1) {
    const obj = objects[index];
    if (!obj) {
      continue;
    }
    const base: BaseObject = {
      annotation: obj.annotation,
      groupId: obj.groupId,
      id: obj.id ?? nanoid(),
      layerId: obj.layerId ?? layerId,
      name: obj.name,
      position: obj.position ?? { col: 0, row: 0 },
      zIndex: obj.zIndex ?? index,
    };

    const result = fillObject(obj, base);
    if (result) {
      filled.push(result);
    }
  }

  return { layer, objects: filled };
};

/** Compute tight grid bounds for rendering, with configurable padding. */
export const computeRenderGridSize = (
  objects: WireObject[],
  padding = 2
): GridSize => {
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
};
