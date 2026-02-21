import type {
  BoxObject,
  ComponentObject,
  ConnectorObject,
  ConnectorSide,
  GridPoint,
  WireObject,
} from "./types";
import { hasRectBounds } from "./types";

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
type Direction = "up" | "down" | "left" | "right";

function getCenter(obj: RectObject): GridPoint {
  return {
    col: obj.position.col + Math.floor(obj.width / 2),
    row: obj.position.row + Math.floor(obj.height / 2),
  };
}

function resolveClosestSide(dx: number, dy: number): ConnectorSide {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

/** Resolve "auto" sides based on relative positions of two objects.
 *  Each side is computed independently — pinning one does not affect the other. */
export function resolveAutoSides(
  fromObj: RectObject,
  toObj: RectObject,
  fromSide?: ConnectorSide,
  toSide?: ConnectorSide
): { fromSide: ConnectorSide; toSide: ConnectorSide } {
  if (fromSide && toSide) {
    return { fromSide, toSide };
  }

  const fromCenter = getCenter(fromObj);
  const toCenter = getCenter(toObj);
  const dx = toCenter.col - fromCenter.col;
  const dy = toCenter.row - fromCenter.row;

  const autoFromSide = resolveClosestSide(dx, dy);
  const autoToSide = resolveClosestSide(-dx, -dy);

  return {
    fromSide: fromSide ?? autoFromSide,
    toSide: toSide ?? autoToSide,
  };
}

/** Compute the attachment point one cell outside the box border. */
export function getAttachmentPoint(
  obj: RectObject,
  side: ConnectorSide
): GridPoint {
  const { col, row } = obj.position;
  switch (side) {
    case "top":
      return { col: col + Math.floor(obj.width / 2), row: row - 1 };
    case "bottom":
      return { col: col + Math.floor(obj.width / 2), row: row + obj.height };
    case "left":
      return { col: col - 1, row: row + Math.floor(obj.height / 2) };
    case "right":
      return { col: col + obj.width, row: row + Math.floor(obj.height / 2) };
    default:
      throw new Error(`Unexpected side: ${side satisfies never}`);
  }
}

/** Get the exit direction for a given side. */
function getExitDirection(side: ConnectorSide): Direction {
  const directions: Record<ConnectorSide, Direction> = {
    top: "up",
    bottom: "down",
    left: "left",
    right: "right",
  };
  return directions[side];
}

/** Check if two directions are opposite. */
function areOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

/** Check if two directions are on the same axis. */
function sameAxis(a: Direction, b: Direction): boolean {
  const vertical = a === "up" || a === "down";
  const bVertical = b === "up" || b === "down";
  return vertical === bVertical;
}

/**
 * Compute the orthogonal path between two attachment points.
 *
 * Returns an ordered list of grid points. Consecutive points form
 * horizontal or vertical segments. Corner characters are placed
 * at points where direction changes.
 */
export function computeConnectorPath(
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction,
  toDir: Direction,
  fromRect?: RoutingRect,
  toRect?: RoutingRect
): ConnectorPath {
  // Case 1: Opposite directions on the same axis (facing each other)
  if (areOpposite(fromDir, toDir)) {
    return computeOppositeRoute(from, to, fromDir);
  }

  // Case 2: Perpendicular directions
  if (!sameAxis(fromDir, toDir)) {
    return computePerpendicularRoute(
      from,
      to,
      fromDir,
      toDir,
      fromRect,
      toRect
    );
  }

  // Case 3: Same direction (U-route)
  return computeParallelRoute(from, to, fromDir, toDir);
}

/**
 * Case 1: Opposite directions — straight line or Z-route.
 * Exit bottom → Entry top (or vice versa), exit right → entry left, etc.
 */
function computeOppositeRoute(
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction
): ConnectorPath {
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
}

/** Check if moving from `from` to `target` goes in the given direction. */
function isAligned(
  dir: Direction,
  from: GridPoint,
  target: GridPoint
): boolean {
  switch (dir) {
    case "up":
      return target.row <= from.row;
    case "down":
      return target.row >= from.row;
    case "left":
      return target.col <= from.col;
    case "right":
      return target.col >= from.col;
    default:
      throw new Error(`Unexpected direction: ${dir satisfies never}`);
  }
}

/** Clearance: how far past the attachment point to extend before turning. */
const CLEARANCE = 1;

/** Compute the midpoint column between two boxes' horizontal spans. */
function gapMidCol(
  fromRect: RoutingRect,
  toRect: RoutingRect,
  fromCol: number,
  toCol: number
): number {
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
}

/** Compute the midpoint row between two boxes' vertical spans. */
function gapMidRow(
  fromRect: RoutingRect,
  toRect: RoutingRect,
  fromRow: number,
  toRow: number
): number {
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
}

/**
 * Case 2: Perpendicular directions.
 *
 * When box rects are provided, always uses a 5-point route through the gap
 * between the two boxes, avoiding segments that hug box edges.
 *
 * Without rects, falls back to a simple L-route (if aligned) or a 5-point
 * snake using the attachment-point midpoint.
 */
function computePerpendicularRoute(
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction,
  _toDir: Direction,
  fromRect?: RoutingRect,
  toRect?: RoutingRect
): ConnectorPath {
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
}

/**
 * Case 3: Parallel directions — U-route (3 bends).
 * Both exit the same direction (e.g., both exit right, or both exit bottom).
 */
function computeParallelRoute(
  from: GridPoint,
  to: GridPoint,
  fromDir: Direction,
  _toDir: Direction
): ConnectorPath {
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
}

/** Find a rect-bounded object by ID. */
function findRectObject(
  id: string,
  objects: readonly WireObject[]
): RectObject | undefined {
  for (const obj of objects) {
    if (obj.id === id && hasRectBounds(obj)) {
      return obj;
    }
  }
  return undefined;
}

/** Resolve a connector into a renderable path, or null if endpoints are missing. */
export function resolveConnectorPath(
  connector: ConnectorObject,
  objects: readonly WireObject[]
): ConnectorPath | null {
  const fromObj = findRectObject(connector.fromId, objects);
  const toObj = findRectObject(connector.toId, objects);

  if (!(fromObj && toObj)) {
    return null;
  }

  const { fromSide, toSide } = resolveAutoSides(
    fromObj,
    toObj,
    connector.fromSide,
    connector.toSide
  );

  const fromPoint = getAttachmentPoint(fromObj, fromSide);
  const toPoint = getAttachmentPoint(toObj, toSide);
  const fromDir = getExitDirection(fromSide);
  const toDir = getExitDirection(toSide);

  const fromRect: RoutingRect = {
    col: fromObj.position.col,
    row: fromObj.position.row,
    width: fromObj.width,
    height: fromObj.height,
  };
  const toRect: RoutingRect = {
    col: toObj.position.col,
    row: toObj.position.row,
    width: toObj.width,
    height: toObj.height,
  };

  return computeConnectorPath(
    fromPoint,
    toPoint,
    fromDir,
    toDir,
    fromRect,
    toRect
  );
}

/** Get the corner character for a direction change. */
export function getCornerChar(fromDir: Direction, toDir: Direction): string {
  // fromDir = direction we're traveling, toDir = direction we turn to
  if (fromDir === "down" && toDir === "right") {
    return "└";
  }
  if (fromDir === "down" && toDir === "left") {
    return "┘";
  }
  if (fromDir === "up" && toDir === "right") {
    return "┌";
  }
  if (fromDir === "up" && toDir === "left") {
    return "┐";
  }
  if (fromDir === "right" && toDir === "down") {
    return "┐";
  }
  if (fromDir === "right" && toDir === "up") {
    return "┘";
  }
  if (fromDir === "left" && toDir === "down") {
    return "┌";
  }
  if (fromDir === "left" && toDir === "up") {
    return "└";
  }
  return "+"; // fallback — should never happen
}

/** Determine the direction from point A to point B (must be axis-aligned). */
export function getSegmentDirection(from: GridPoint, to: GridPoint): Direction {
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
}
