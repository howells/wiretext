import { getContentBounds } from "./bounds";
import type { GridSize, WireObject } from "./types";

/**
 * Shift all objects by the given column/row delta.
 * Returns a new array — does not mutate originals.
 */
export function shiftObjects(
  objects: readonly WireObject[],
  deltaCol: number,
  deltaRow: number,
): WireObject[] {
  if (deltaCol === 0 && deltaRow === 0) {
    return objects.map((o) => ({ ...o }));
  }

  return objects.map((obj) => {
    const shifted = {
      ...obj,
      position: {
        col: obj.position.col + deltaCol,
        row: obj.position.row + deltaRow,
      },
    };
    if ("endPosition" in obj) {
      return {
        ...shifted,
        endPosition: {
          col: obj.endPosition.col + deltaCol,
          row: obj.endPosition.row + deltaRow,
        },
      } as WireObject;
    }
    return shifted as WireObject;
  });
}

/**
 * Ensure at least `padding` cells of empty space on the top and left edges.
 * Only shifts objects that are closer than `padding` to the origin.
 */
export function addPadding(
  objects: readonly WireObject[],
  padding = 1,
): WireObject[] {
  if (objects.length === 0) {
    return [];
  }

  const bounds = getContentBounds(objects);
  if (!bounds) {
    return [];
  }

  const deltaCol = bounds.minCol < padding ? padding - bounds.minCol : 0;
  const deltaRow = bounds.minRow < padding ? padding - bounds.minRow : 0;

  if (deltaCol === 0 && deltaRow === 0) {
    return objects.map((o) => ({ ...o }));
  }

  return shiftObjects(objects, deltaCol, deltaRow);
}

/**
 * Prepare objects for tight export: shift content to start at (padding, padding)
 * and return a grid sized to exactly fit the content with padding on all sides.
 */
export function prepareForExport(
  objects: readonly WireObject[],
  padding = 1,
): { objects: WireObject[]; gridSize: GridSize } {
  if (objects.length === 0) {
    return { objects: [], gridSize: { cols: 1, rows: 1 } };
  }

  const bounds = getContentBounds(objects);
  if (!bounds) {
    return { objects: [], gridSize: { cols: 1, rows: 1 } };
  }

  const shifted = shiftObjects(
    objects,
    padding - bounds.minCol,
    padding - bounds.minRow,
  );

  return {
    objects: shifted,
    gridSize: {
      cols: bounds.maxCol - bounds.minCol + padding * 2,
      rows: bounds.maxRow - bounds.minRow + padding * 2,
    },
  };
}
