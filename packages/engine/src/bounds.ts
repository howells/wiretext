import { resolveConnectorPath } from "./connector-scoring";
import type { ConnectorObject, WireObject } from "./types";

export interface ObjectBounds {
  col: number;
  height: number;
  row: number;
  width: number;
}

export interface ContentBounds {
  maxCol: number;
  maxRow: number;
  minCol: number;
  minRow: number;
}

/**
 * Axis-aligned bounding box of a single object, in grid cells.
 *
 * Connectors return a 1×1 placeholder at their position because their real
 * extent depends on the full object array — use {@link getConnectorBounds}.
 */
export const getObjectBounds = (obj: WireObject): ObjectBounds => {
  switch (obj.type) {
    case "box":
    case "component": {
      return {
        col: obj.position.col,
        height: obj.height,
        row: obj.position.row,
        width: obj.width,
      };
    }
    case "text": {
      const lines = obj.content.split("\n");
      return {
        col: obj.position.col,
        height: lines.length || 1,
        row: obj.position.row,
        width: Math.max(...lines.map((l) => l.length), 1),
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
        height: maxRow - minRow + 1,
        row: minRow,
        width: maxCol - minCol + 1,
      };
    }
    case "connector": {
      // Connector bounds require the full objects array to resolve paths.
      // Return a minimal 1x1 bounds at the connector's position.
      // For accurate bounds, use getConnectorBounds() with the objects array.
      return {
        col: obj.position.col,
        height: 1,
        row: obj.position.row,
        width: 1,
      };
    }
    default: {
      return { col: 0, height: 0, row: 0, width: 0 };
    }
  }
};

/**
 * Tight bounding box enclosing every object, or null when the array is empty.
 *
 * `minCol`/`minRow` are inclusive; `maxCol`/`maxRow` are exclusive edges
 * (an object's `col + width`), so `maxCol - minCol` is the content width.
 */
export const getContentBounds = (
  objects: readonly WireObject[]
): ContentBounds | null => {
  if (objects.length === 0) {
    return null;
  }

  let minCol = Number.POSITIVE_INFINITY;
  let minRow = Number.POSITIVE_INFINITY;
  let maxCol = 0;
  let maxRow = 0;

  for (const obj of objects) {
    const b = getObjectBounds(obj);
    if (b.col < minCol) {
      minCol = b.col;
    }
    if (b.row < minRow) {
      minRow = b.row;
    }
    const endCol = b.col + b.width;
    const endRow = b.row + b.height;
    if (endCol > maxCol) {
      maxCol = endCol;
    }
    if (endRow > maxRow) {
      maxRow = endRow;
    }
  }

  return { maxCol, maxRow, minCol, minRow };
};

/** Compute accurate bounds for a connector by resolving its path. */
export const getConnectorBounds = (
  connector: ConnectorObject,
  objects: readonly WireObject[]
): ObjectBounds => {
  const path = resolveConnectorPath(connector, objects);
  if (!path || path.points.length === 0) {
    return {
      col: connector.position.col,
      height: 1,
      row: connector.position.row,
      width: 1,
    };
  }

  let minCol = Number.POSITIVE_INFINITY;
  let minRow = Number.POSITIVE_INFINITY;
  let maxCol = 0;
  let maxRow = 0;

  for (const pt of path.points) {
    if (pt.col < minCol) {
      minCol = pt.col;
    }
    if (pt.row < minRow) {
      minRow = pt.row;
    }
    if (pt.col > maxCol) {
      maxCol = pt.col;
    }
    if (pt.row > maxRow) {
      maxRow = pt.row;
    }
  }

  return {
    col: minCol,
    height: maxRow - minRow + 1,
    row: minRow,
    width: maxCol - minCol + 1,
  };
};
