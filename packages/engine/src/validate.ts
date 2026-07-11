import { displayWidth } from "./char-width";
import type { MinimalObject } from "./defaults";
import { getComponentMinWidth } from "./min-width";

export interface ContentWidthError {
  message: string;
  path: ["width"];
}

/** Validate that an explicitly provided width can fit the object's content. */
export const validateContentWidth = (
  obj: MinimalObject
): ContentWidthError[] => {
  if (
    obj.type === "text" ||
    obj.type === "line" ||
    obj.type === "arrow" ||
    obj.type === "connector"
  ) {
    return [];
  }

  if (obj.width === undefined) {
    return [];
  }

  if (obj.type === "box") {
    if (obj.label === undefined || obj.label.length === 0) {
      return [];
    }
    const lines = obj.label.split("\n");
    const widest = Math.max(...lines.map((l) => displayWidth(l)));
    const minWidth = widest + 4;
    if (obj.width < minWidth) {
      return [
        {
          message: `box width ${obj.width} is too small for label '${obj.label}' (minimum: ${minWidth})`,
          path: ["width"],
        },
      ];
    }
    return [];
  }

  // component
  const minWidth = getComponentMinWidth(obj);
  if (obj.width < minWidth) {
    const context =
      obj.label !== undefined && obj.label.length > 0
        ? `label '${obj.label}'`
        : `${obj.componentType} content`;
    return [
      {
        message: `${obj.componentType} width ${obj.width} is too small for ${context} (minimum: ${minWidth})`,
        path: ["width"],
      },
    ];
  }

  return [];
};
