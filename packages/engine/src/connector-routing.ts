import type {
  BoxObject,
  ComponentObject,
  ConnectorSide,
  GridPoint,
} from "./types";

/** A rect-bounded object (box or component) that connectors can attach to. */
export type RectObject = BoxObject | ComponentObject;

/** The computed path for a connector: an ordered list of grid points forming orthogonal segments. */
export interface ConnectorPath {
  points: GridPoint[];
}

/** Bounding rect passed to the router for gap-aware routing. */
export interface RoutingRect {
  col: number;
  height: number;
  row: number;
  width: number;
}

/** Direction a connector exits or enters a side. */
export type Direction = "up" | "down" | "left" | "right";

/** Clearance: how far past the attachment point to extend before turning. */
const CLEARANCE = 2;

export const getCenter = (obj: RectObject): GridPoint => ({
  col: obj.position.col + Math.floor(obj.width / 2),
  row: obj.position.row + Math.floor(obj.height / 2),
});

/** Get the exit direction for a given side. */
export const getExitDirection = (side: ConnectorSide): Direction => {
  const directions: Record<ConnectorSide, Direction> = {
    bottom: "down",
    left: "left",
    right: "right",
    top: "up",
  };
  return directions[side];
};

/** Compute the attachment point one cell outside the box border. */
export const getAttachmentPoint = (
  obj: RectObject,
  side: ConnectorSide
): GridPoint => {
  const { col, row } = obj.position;
  switch (side) {
    case "top": {
      return { col: col + Math.floor(obj.width / 2), row: row - 1 };
    }
    case "bottom": {
      return { col: col + Math.floor(obj.width / 2), row: row + obj.height };
    }
    case "left": {
      return { col: col - 1, row: row + Math.floor(obj.height / 2) };
    }
    case "right": {
      return { col: col + obj.width, row: row + Math.floor(obj.height / 2) };
    }
    default: {
      return side satisfies never;
    }
  }
};

export const getDistributedAttachmentPoint = (
  obj: RectObject,
  side: ConnectorSide,
  slotIndex: number,
  slotCount: number
): GridPoint => {
  if (slotCount <= 1) {
    return getAttachmentPoint(obj, side);
  }

  const distribute = (start: number, end: number): number => {
    if (end <= start) {
      return Math.floor((start + end) / 2);
    }
    const span = end - start;
    return start + Math.round(((slotIndex + 1) * span) / (slotCount + 1));
  };

  const { col, row } = obj.position;

  switch (side) {
    case "top": {
      return { col: distribute(col + 1, col + obj.width - 2), row: row - 1 };
    }
    case "bottom": {
      return {
        col: distribute(col + 1, col + obj.width - 2),
        row: row + obj.height,
      };
    }
    case "left": {
      return { col: col - 1, row: distribute(row + 1, row + obj.height - 2) };
    }
    case "right": {
      return {
        col: col + obj.width,
        row: distribute(row + 1, row + obj.height - 2),
      };
    }
    default: {
      return side satisfies never;
    }
  }
};

const OPPOSITE: Record<Direction, Direction> = {
  down: "up",
  left: "right",
  right: "left",
  up: "down",
};

/** Check if two directions are opposite. */
const areOpposite = (a: Direction, b: Direction): boolean => OPPOSITE[a] === b;

/** Check if two directions are on the same axis. */
const sameAxis = (a: Direction, b: Direction): boolean => {
  const vertical = a === "up" || a === "down";
  const bVertical = b === "up" || b === "down";
  return vertical === bVertical;
};

/** Check if moving from `from` to `target` goes in the given direction. */
const isAligned = (
  dir: Direction,
  from: GridPoint,
  target: GridPoint
): boolean => {
  switch (dir) {
    case "up": {
      return target.row <= from.row;
    }
    case "down": {
      return target.row >= from.row;
    }
    case "left": {
      return target.col <= from.col;
    }
    case "right": {
      return target.col >= from.col;
    }
    default: {
      return dir satisfies never;
    }
  }
};

/** Compute the midpoint column between two boxes' horizontal spans. */
const gapMidCol = (
  fromRect: RoutingRect,
  toRect: RoutingRect,
  fromCol: number,
  toCol: number
): number => {
  const fromRight = fromRect.col + fromRect.width;
  const toLeft = toRect.col;
  const fromLeft = fromRect.col;
  const toRight = toRect.col + toRect.width;

  if (toLeft > fromRight) {
    // Target is to the right — gap between source right edge and target left edge
    return Math.floor((fromRight + toLeft) / 2);
  }
  if (fromLeft > toRight) {
    // Target is to the left — gap between target right edge and source left edge
    return Math.floor((toRight + fromLeft) / 2);
  }
  // Boxes overlap horizontally — fall back to attachment midpoint
  return Math.floor((fromCol + toCol) / 2);
};

/** Compute the midpoint row between two boxes' vertical spans. */
const gapMidRow = (
  fromRect: RoutingRect,
  toRect: RoutingRect,
  fromRow: number,
  toRow: number
): number => {
  const fromBottom = fromRect.row + fromRect.height;
  const toTop = toRect.row;
  const fromTop = fromRect.row;
  const toBottom = toRect.row + toRect.height;

  if (toTop > fromBottom) {
    // Target is below — gap between source bottom edge and target top edge
    return Math.floor((fromBottom + toTop) / 2);
  }
  if (fromTop > toBottom) {
    // Target is above — gap between target bottom edge and source top edge
    return Math.floor((toBottom + fromTop) / 2);
  }
  // Boxes overlap vertically — fall back to attachment midpoint
  return Math.floor((fromRow + toRow) / 2);
};

const isSamePoint = (a: GridPoint, b: GridPoint): boolean =>
  a.col === b.col && a.row === b.row;

const areCollinear = (a: GridPoint, b: GridPoint, c: GridPoint): boolean =>
  (a.col === b.col && b.col === c.col) || (a.row === b.row && b.row === c.row);

const normalizeConnectorPoints = (
  points: readonly GridPoint[]
): GridPoint[] => {
  if (points.length <= 2) {
    return [...points];
  }

  const deduped: GridPoint[] = [];
  for (const point of points) {
    const prev = deduped.at(-1);
    if (!(prev && isSamePoint(prev, point))) {
      deduped.push(point);
    }
  }

  if (deduped.length <= 2) {
    return deduped;
  }

  const [first, ...rest] = deduped;
  if (!first) {
    return [];
  }

  const normalized: GridPoint[] = [first];
  for (let i = 0; i < rest.length - 1; i += 1) {
    const prev = normalized.at(-1);
    const curr = rest[i];
    const next = rest[i + 1];

    if (prev && curr && next && !areCollinear(prev, curr, next)) {
      normalized.push(curr);
    }
  }

  const last = deduped.at(-1);
  if (last) {
    normalized.push(last);
  }

  return normalized;
};

/**
 * Case 1: Opposite directions — straight line or Z-route.
 * Exit bottom → Entry top (or vice versa), exit right → entry left, etc.
 */
const computeOppositeRoute = (
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction
): ConnectorPath => {
  const isVertical = fromDir === "up" || fromDir === "down";

  if (isVertical) {
    if (from.col === to.col) {
      // Straight vertical line
      return { points: [from, to] };
    }
    // Z-route: vertical → horizontal → vertical
    const midRow = Math.floor((from.row + to.row) / 2);
    return {
      points: [
        from,
        { col: from.col, row: midRow },
        { col: to.col, row: midRow },
        to,
      ],
    };
  }

  // Horizontal opposite
  if (from.row === to.row) {
    // Straight horizontal line
    return { points: [from, to] };
  }
  // Z-route: horizontal → vertical → horizontal
  const midCol = Math.floor((from.col + to.col) / 2);
  return {
    points: [
      from,
      { col: midCol, row: from.row },
      { col: midCol, row: to.row },
      to,
    ],
  };
};

/**
 * Case 2: Perpendicular directions.
 *
 * When box rects are provided, always uses a 5-point route through the gap
 * between the two boxes, avoiding segments that hug box edges.
 *
 * Without rects, falls back to a simple L-route (if aligned) or a 5-point
 * snake using the attachment-point midpoint.
 */
const computePerpendicularRoute = (
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction,
  fromRect?: RoutingRect,
  toRect?: RoutingRect
): ConnectorPath => {
  const fromVertical = fromDir === "up" || fromDir === "down";

  if (fromVertical) {
    // Without rects: try simple L-route if aligned
    if (!(fromRect && toRect)) {
      const corner: GridPoint = { col: from.col, row: to.row };
      if (isAligned(fromDir, from, corner)) {
        return { points: [from, corner, to] };
      }
    }

    // 5-point route: exit → clearance → gap midpoint → target row → target
    const offsetRow =
      fromDir === "up" ? from.row - CLEARANCE : from.row + CLEARANCE;
    const midCol =
      fromRect && toRect
        ? gapMidCol(fromRect, toRect, from.col, to.col)
        : Math.floor((from.col + to.col) / 2);
    return {
      points: [
        from,
        { col: from.col, row: offsetRow },
        { col: midCol, row: offsetRow },
        { col: midCol, row: to.row },
        to,
      ],
    };
  }

  // From exits horizontally
  if (!(fromRect && toRect)) {
    const corner: GridPoint = { col: to.col, row: from.row };
    if (isAligned(fromDir, from, corner)) {
      return { points: [from, corner, to] };
    }
  }

  // 5-point route: exit → clearance → gap midpoint → target col → target
  const offsetCol =
    fromDir === "left" ? from.col - CLEARANCE : from.col + CLEARANCE;
  const midRow =
    fromRect && toRect
      ? gapMidRow(fromRect, toRect, from.row, to.row)
      : Math.floor((from.row + to.row) / 2);
  return {
    points: [
      from,
      { col: offsetCol, row: from.row },
      { col: offsetCol, row: midRow },
      { col: to.col, row: midRow },
      to,
    ],
  };
};

/**
 * Case 3: Parallel directions — U-route (3 bends).
 * Both exit the same direction (e.g., both exit right, or both exit bottom).
 */
const computeParallelRoute = (
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction
): ConnectorPath => {
  const isVertical = fromDir === "up" || fromDir === "down";
  const isPositive = fromDir === "down" || fromDir === "right";

  if (isVertical) {
    // Both exit up or both exit down
    // Route: go out in fromDir, horizontal to align with to.col, come back to to
    const offsetRow = isPositive
      ? Math.max(from.row, to.row) + 2
      : Math.min(from.row, to.row) - 2;
    return {
      points: [
        from,
        { col: from.col, row: offsetRow },
        { col: to.col, row: offsetRow },
        to,
      ],
    };
  }

  // Both exit left or both exit right
  const offsetCol = isPositive
    ? Math.max(from.col, to.col) + 2
    : Math.min(from.col, to.col) - 2;
  return {
    points: [
      from,
      { col: offsetCol, row: from.row },
      { col: offsetCol, row: to.row },
      to,
    ],
  };
};

/**
 * Compute the orthogonal path between two attachment points.
 *
 * Returns an ordered list of grid points. Consecutive points form
 * horizontal or vertical segments. Corner characters are placed
 * at points where direction changes.
 */
export const computeConnectorPath = (
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction,
  toDir: Direction,
  fromRect?: RoutingRect,
  toRect?: RoutingRect
): ConnectorPath => {
  let raw: ConnectorPath;
  if (areOpposite(fromDir, toDir)) {
    // Case 1: facing each other on the same axis
    raw = computeOppositeRoute(from, to, fromDir);
  } else if (sameAxis(fromDir, toDir)) {
    // Case 3: same direction (U-route)
    raw = computeParallelRoute(from, to, fromDir);
  } else {
    // Case 2: perpendicular directions
    raw = computePerpendicularRoute(from, to, fromDir, fromRect, toRect);
  }
  return { points: normalizeConnectorPoints(raw.points) };
};

const CORNER_CHARS: Record<string, string> = {
  "down-left": "┘",
  "down-right": "└",
  "left-down": "┌",
  "left-up": "└",
  "right-down": "┐",
  "right-up": "┘",
  "up-left": "┐",
  "up-right": "┌",
};

/** Get the corner character for a direction change. */
export const getCornerChar = (fromDir: Direction, toDir: Direction): string =>
  CORNER_CHARS[`${fromDir}-${toDir}`] ?? "+";

/** Determine the direction from point A to point B (must be axis-aligned). */
export const getSegmentDirection = (
  from: GridPoint,
  to: GridPoint
): Direction => {
  if (to.col > from.col) {
    return "right";
  }
  if (to.col < from.col) {
    return "left";
  }
  if (to.row > from.row) {
    return "down";
  }
  return "up";
};
