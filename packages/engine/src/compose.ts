import { displayWidth, SHADOW } from "./char-width";
import { ARROW_CHARS, LINE_CHARS } from "./characters";
import { stampComponent } from "./compose-components";
import {
  forceSetChar,
  forceStampText,
  setChar,
  stampArrow,
  stampBox,
  stampLine,
  stampText,
  stampTextObj,
  truncate,
} from "./compose-stamps";
import type { Direction } from "./connector-routing";
import { getCornerChar, getSegmentDirection } from "./connector-routing";
import { resolveConnectorPath } from "./connector-scoring";
import type {
  ConnectorObject,
  GridPoint,
  GridSize,
  Layer,
  WireObject,
} from "./types";

const createGrid = (size: GridSize): string[][] => {
  const grid: string[][] = [];
  for (let r = 0; r < size.rows; r += 1) {
    grid.push(Array.from({ length: size.cols }, () => " "));
  }
  return grid;
};

const stampConnectorSegments = (
  grid: string[][],
  points: GridPoint[]
): void => {
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) {
      continue;
    }

    if (from.row === to.row) {
      const minC = Math.min(from.col, to.col);
      const maxC = Math.max(from.col, to.col);
      for (let c = minC; c <= maxC; c += 1) {
        setChar(grid, c, from.row, LINE_CHARS.horizontal);
      }
    } else if (from.col === to.col) {
      const minR = Math.min(from.row, to.row);
      const maxR = Math.max(from.row, to.row);
      for (let r = minR; r <= maxR; r += 1) {
        setChar(grid, from.col, r, LINE_CHARS.vertical);
      }
    }
  }
};

const stampConnectorCorners = (grid: string[][], points: GridPoint[]): void => {
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (!prev || !curr || !next) {
      continue;
    }
    const inDir = getSegmentDirection(prev, curr);
    const outDir = getSegmentDirection(curr, next);
    if (inDir !== outDir) {
      const cornerChar = getCornerChar(inDir, outDir);
      forceSetChar(grid, curr.col, curr.row, cornerChar);
    }
  }
};

const CONNECTOR_ARROW_HEADS: Record<Direction, string> = {
  down: ARROW_CHARS.down,
  left: ARROW_CHARS.left,
  right: ARROW_CHARS.right,
  up: ARROW_CHARS.up,
};

const stampConnectorArrowHeads = (
  grid: string[][],
  points: GridPoint[],
  showStart: boolean,
  showEnd: boolean
): void => {
  if (showEnd && points.length >= 2) {
    const last = points.at(-1);
    const prev = points.at(-2);
    if (last && prev) {
      const dir = getSegmentDirection(prev, last);
      forceSetChar(grid, last.col, last.row, CONNECTOR_ARROW_HEADS[dir]);
    }
  }

  if (showStart && points.length >= 2) {
    const [first, next] = points;
    if (first && next) {
      const dir = getSegmentDirection(next, first);
      forceSetChar(grid, first.col, first.row, CONNECTOR_ARROW_HEADS[dir]);
    }
  }
};

/** Find the midpoint along a connector path by walking segment lengths. */
export const getConnectorMidpoint = (
  points: GridPoint[]
): {
  col: number;
  row: number;
  isHorizontal: boolean;
} => {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) {
      continue;
    }
    totalLength += Math.abs(to.col - from.col) + Math.abs(to.row - from.row);
  }

  const halfLen = totalLength / 2;
  let accumulated = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) {
      continue;
    }
    const segLen = Math.abs(to.col - from.col) + Math.abs(to.row - from.row);

    if (accumulated + segLen >= halfLen) {
      const remaining = halfLen - accumulated;
      const isHorizontal = from.row === to.row;

      if (isHorizontal) {
        const dir = to.col > from.col ? 1 : -1;
        return {
          col: from.col + dir * Math.round(remaining),
          isHorizontal,
          row: from.row,
        };
      }
      const dir = to.row > from.row ? 1 : -1;
      return {
        col: from.col,
        isHorizontal,
        row: from.row + dir * Math.round(remaining),
      };
    }
    accumulated += segLen;
  }

  const [first] = points;
  return { col: first?.col ?? 0, isHorizontal: true, row: first?.row ?? 0 };
};

const stampConnectorLabel = (
  grid: string[][],
  points: GridPoint[],
  label: string
): void => {
  const maxLabelWidth = 20;
  const lines = label.split("\n");
  const {
    col: midCol,
    row: midRow,
    isHorizontal,
  } = getConnectorMidpoint(points);

  // Vertically center the block of lines around the midpoint
  const startRow = midRow - Math.floor(lines.length / 2);

  for (const [i, line] of lines.entries()) {
    const trimmed = truncate(line, maxLabelWidth);
    const lineWidth = displayWidth(trimmed);
    if (lineWidth === 0) {
      continue;
    }
    const row = startRow + i;

    const startCol = midCol - Math.floor(lineWidth / 2);
    if (isHorizontal) {
      stampText(grid, startCol, row - 1, trimmed);
    } else {
      forceStampText(grid, startCol, row, trimmed);
    }
  }
};

const stampConnector = (
  grid: string[][],
  obj: ConnectorObject,
  allObjects: readonly WireObject[]
): void => {
  const path = resolveConnectorPath(obj, allObjects);
  if (!path || path.points.length < 2) {
    return;
  }

  const { points } = path;
  const showStart = obj.startHead === true;
  const showEnd = obj.endHead !== false;

  stampConnectorSegments(grid, points);
  stampConnectorCorners(grid, points);
  stampConnectorArrowHeads(grid, points, showStart, showEnd);

  if (obj.label !== undefined && obj.label.length > 0) {
    stampConnectorLabel(grid, points, obj.label);
  }
};

/** Sort objects for rendering: layer order first, then zIndex within layer */
const sortForRendering = (
  objects: WireObject[],
  layers: Layer[]
): WireObject[] => {
  const layerOrder = new Map<string, number>();
  for (const [i, layer] of layers.entries()) {
    layerOrder.set(layer.id, i);
  }

  // Filter out objects on hidden layers
  const hiddenLayerIds = new Set(
    layers.filter((l) => !l.visible).map((l) => l.id)
  );
  const visible = objects.filter((obj) => !hiddenLayerIds.has(obj.layerId));

  return [...visible].toSorted((a, b) => {
    const layerA = layerOrder.get(a.layerId) ?? 0;
    const layerB = layerOrder.get(b.layerId) ?? 0;
    if (layerA !== layerB) {
      return layerA - layerB;
    }
    return a.zIndex - b.zIndex;
  });
};

/**
 * Render wire objects onto a fresh character grid.
 *
 * Returns a `grid[row][col]` matrix of single-character strings sized to
 * `gridSize`. Objects are drawn back-to-front — by layer order then `zIndex`
 * when `layers` is supplied (objects on hidden layers are skipped), otherwise
 * by `zIndex` alone. Later stamps overwrite earlier cells, so paint order is
 * the z-order.
 */
export const compose = (
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string[][] => {
  const grid = createGrid(gridSize);
  const sorted = layers
    ? sortForRendering(objects, layers)
    : [...objects].toSorted((a, b) => a.zIndex - b.zIndex);

  for (const obj of sorted) {
    switch (obj.type) {
      case "box": {
        stampBox(grid, obj);
        break;
      }
      case "text": {
        stampTextObj(grid, obj);
        break;
      }
      case "line": {
        stampLine(grid, obj);
        break;
      }
      case "arrow": {
        stampArrow(grid, obj);
        break;
      }
      case "component": {
        stampComponent(grid, obj);
        break;
      }
      case "connector": {
        stampConnector(grid, obj, sorted);
        break;
      }
      default: {
        break;
      }
    }
  }

  return grid;
};

/**
 * Flatten a grid into a newline-joined string.
 *
 * Trailing blank cells are trimmed per row and wide-character shadow cells are
 * dropped, so each line's length matches what a monospace terminal displays.
 */
export const gridToString = (grid: string[][]): string =>
  grid
    .map((row) => {
      // Trim trailing spaces and shadows
      let end = row.length - 1;
      while (end >= 0 && (row[end] === " " || row[end] === SHADOW)) {
        end -= 1;
      }
      // Build string, skipping shadow cells
      let line = "";
      for (let c = 0; c <= end; c += 1) {
        if (row[c] !== SHADOW) {
          line += row[c];
        }
      }
      return line;
    })
    .join("\n");
