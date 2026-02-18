import { displayWidth } from "./char-width";
import type { MinimalObject } from "./defaults";
import { getComponentMinWidth } from "./min-width";

export interface ContentWidthError {
  path: ["width"];
  message: string;
}

/** Validate that an explicitly provided width can fit the object's content. */
export function validateContentWidth(obj: MinimalObject): ContentWidthError[] {
  if (obj.type === "text" || obj.type === "line" || obj.type === "arrow") {
    return [];
  }

  if (obj.width === undefined) {
    return [];
  }

  if (obj.type === "box") {
    if (!obj.label) {
      return [];
    }
    const lines = obj.label.split("\n");
    const widest = Math.max(...lines.map((l) => displayWidth(l)));
    const minWidth = widest + 4;
    if (obj.width < minWidth) {
      return [
        {
          path: ["width"],
          message: `box width ${obj.width} is too small for label '${obj.label}' (minimum: ${minWidth})`,
        },
      ];
    }
    return [];
  }

  // component
  const minWidth = getComponentMinWidth(obj);
  if (obj.width < minWidth) {
    const context = obj.label
      ? `label '${obj.label}'`
      : `${obj.componentType} content`;
    return [
      {
        path: ["width"],
        message: `${obj.componentType} width ${obj.width} is too small for ${context} (minimum: ${minWidth})`,
      },
    ];
  }

  return [];
}
