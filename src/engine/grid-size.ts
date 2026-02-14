import { getObjectBounds } from "./bounds";
import type { GridSize, WireObject } from "./types";

const DEFAULT_PADDING = 20;
const MAX_GRID_DIMENSION = 2000;

/**
 * Compute the effective grid size needed to contain all objects plus padding.
 * Returns the larger of the computed size and the provided minimum.
 */
export function getEffectiveGridSize(
  objects: WireObject[],
  minSize: GridSize,
  padding = DEFAULT_PADDING
): GridSize {
  if (objects.length === 0) {
    return minSize;
  }

  let maxCol = 0;
  let maxRow = 0;

  for (const obj of objects) {
    const bounds = getObjectBounds(obj);
    const endCol = bounds.col + bounds.width;
    const endRow = bounds.row + bounds.height;
    if (endCol > maxCol) {
      maxCol = endCol;
    }
    if (endRow > maxRow) {
      maxRow = endRow;
    }
  }

  const cols = Math.min(
    Math.max(maxCol + padding, minSize.cols),
    MAX_GRID_DIMENSION
  );
  const rows = Math.min(
    Math.max(maxRow + padding, minSize.rows),
    MAX_GRID_DIMENSION
  );

  return { cols, rows };
}
