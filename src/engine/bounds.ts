import type { WireObject } from "./types";

export interface ObjectBounds {
  col: number;
  row: number;
  width: number;
  height: number;
}

export function getObjectBounds(obj: WireObject): ObjectBounds {
  switch (obj.type) {
    case "box":
    case "component":
      return {
        col: obj.position.col,
        row: obj.position.row,
        width: obj.width,
        height: obj.height,
      };
    case "text": {
      const lines = obj.content.split("\n");
      return {
        col: obj.position.col,
        row: obj.position.row,
        width: Math.max(...lines.map((l) => l.length), 1),
        height: lines.length || 1,
      };
    }
    case "line":
    case "arrow": {
      const minCol = Math.min(obj.position.col, obj.endPosition.col);
      const minRow = Math.min(obj.position.row, obj.endPosition.row);
      const maxCol = Math.max(obj.position.col, obj.endPosition.col);
      const maxRow = Math.max(obj.position.row, obj.endPosition.row);
      return {
        col: minCol,
        row: minRow,
        width: maxCol - minCol + 1,
        height: maxRow - minRow + 1,
      };
    }
    default:
      return { col: 0, row: 0, width: 0, height: 0 };
  }
}
