import type {
  CharMetrics,
  GridPoint,
  Viewport,
  WireObject,
} from "@wiretext/engine";
import { getConnectorBounds, getObjectBounds } from "@wiretext/engine";

export function screenToGrid(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  metrics: CharMetrics,
): GridPoint {
  const worldX = (screenX - viewport.panX) / viewport.zoom;
  const worldY = (screenY - viewport.panY) / viewport.zoom;
  return {
    col: Math.floor(worldX / metrics.charWidth),
    row: Math.floor(worldY / metrics.lineHeight),
  };
}

export function gridToScreen(
  col: number,
  row: number,
  viewport: Viewport,
  metrics: CharMetrics,
): { x: number; y: number } {
  return {
    x: col * metrics.charWidth * viewport.zoom + viewport.panX,
    y: row * metrics.lineHeight * viewport.zoom + viewport.panY,
  };
}

/**
 * Shift objects so all positions are non-negative for the compose grid.
 * Returns the shifted objects and the original grid origin (minimum col/row).
 * When no objects have negative positions, returns them unmodified.
 */
export function shiftObjectsForRender(objects: WireObject[]): {
  renderObjects: WireObject[];
  originCol: number;
  originRow: number;
} {
  let oCol = 0;
  let oRow = 0;
  for (const obj of objects) {
    oCol = Math.min(oCol, obj.position.col);
    oRow = Math.min(oRow, obj.position.row);
    if (obj.type === "line" || obj.type === "arrow") {
      oCol = Math.min(oCol, obj.endPosition.col);
      oRow = Math.min(oRow, obj.endPosition.row);
    }
  }
  if (oCol >= 0 && oRow >= 0) {
    return { renderObjects: objects, originCol: 0, originRow: 0 };
  }
  const dCol = -oCol;
  const dRow = -oRow;
  const shifted = objects.map((obj) => {
    const s = {
      ...obj,
      position: { col: obj.position.col + dCol, row: obj.position.row + dRow },
    };
    if ((s.type === "line" || s.type === "arrow") && "endPosition" in obj) {
      return {
        ...s,
        endPosition: {
          col: obj.endPosition.col + dCol,
          row: obj.endPosition.row + dRow,
        },
      };
    }
    return s;
  }) as WireObject[];
  return { renderObjects: shifted, originCol: oCol, originRow: oRow };
}

/**
 * Compute a viewport that centers all objects within the given canvas area.
 * Keeps zoom at 1 unless content is too large to fit, in which case it zooms out.
 */
export function fitViewport(
  objects: WireObject[],
  canvasWidth: number,
  canvasHeight: number,
  metrics: CharMetrics,
): Viewport {
  if (objects.length === 0) {
    return { panX: 0, panY: 0, zoom: 1 };
  }

  let minCol = Number.POSITIVE_INFINITY;
  let minRow = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;

  for (const obj of objects) {
    const bounds =
      obj.type === "connector"
        ? getConnectorBounds(obj, objects)
        : getObjectBounds(obj);
    minCol = Math.min(minCol, bounds.col);
    minRow = Math.min(minRow, bounds.row);
    maxCol = Math.max(maxCol, bounds.col + bounds.width);
    maxRow = Math.max(maxRow, bounds.row + bounds.height);
  }

  const contentWidth = (maxCol - minCol) * metrics.charWidth;
  const contentHeight = (maxRow - minRow) * metrics.lineHeight;

  const PADDING = 60;
  const availW = canvasWidth - PADDING * 2;
  const availH = canvasHeight - PADDING * 2;

  // Only zoom out if content doesn't fit; never zoom in past 1
  const zoom = Math.max(
    0.25,
    Math.min(1, Math.min(availW / contentWidth, availH / contentHeight)),
  );

  const scaledW = contentWidth * zoom;
  const scaledH = contentHeight * zoom;

  const panX = (canvasWidth - scaledW) / 2 - minCol * metrics.charWidth * zoom;
  const panY =
    (canvasHeight - scaledH) / 2 - minRow * metrics.lineHeight * zoom;

  return { panX, panY, zoom };
}
