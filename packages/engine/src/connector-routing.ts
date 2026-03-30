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
const ALL_SIDES: readonly ConnectorSide[] = ["top", "bottom", "left", "right"];

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

function sideAxis(side: ConnectorSide): "horizontal" | "vertical" {
  return side === "left" || side === "right" ? "horizontal" : "vertical";
}

function getRect(obj: RectObject): RoutingRect {
  return {
    col: obj.position.col,
    row: obj.position.row,
    width: obj.width,
    height: obj.height,
  };
}

function getGapDistances(
  fromRect: RoutingRect,
  toRect: RoutingRect
): { horizontalGap: number; verticalGap: number } {
  const fromRight = fromRect.col + fromRect.width;
  const toRight = toRect.col + toRect.width;
  const fromBottom = fromRect.row + fromRect.height;
  const toBottom = toRect.row + toRect.height;

  const horizontalGap = Math.max(
    0,
    toRect.col - fromRight,
    fromRect.col - toRight
  );
  const verticalGap = Math.max(
    0,
    toRect.row - fromBottom,
    fromRect.row - toBottom
  );

  return { horizontalGap, verticalGap };
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function countBends(points: GridPoint[]): number {
  let bends = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const inVertical = prev.col === curr.col;
    const outVertical = curr.col === next.col;
    if (inVertical !== outVertical) {
      bends++;
    }
  }
  return bends;
}

function totalPathLength(points: GridPoint[]): number {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    length += Math.abs(to.col - from.col) + Math.abs(to.row - from.row);
  }
  return length;
}

function scorePathGeometry(points: GridPoint[]): number {
  return totalPathLength(points) + countBends(points) * 8;
}

function scoreAxisPreference(
  side: ConnectorSide,
  axis: "horizontal" | "vertical"
): number {
  return sideAxis(side) === axis ? 0 : 20;
}

function scoreDirectionalPreference(
  side: ConnectorSide,
  preferredPositive: ConnectorSide,
  preferredNegative: ConnectorSide,
  delta: number
): number {
  const preferredSide = delta >= 0 ? preferredPositive : preferredNegative;
  return side === preferredSide ? 0 : 10;
}

function scoreVerticalFlowPreference(
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dy: number
): number {
  return (
    scoreAxisPreference(fromSide, "vertical") +
    scoreAxisPreference(toSide, "vertical") +
    scoreDirectionalPreference(fromSide, "bottom", "top", dy) +
    scoreDirectionalPreference(toSide, "top", "bottom", dy)
  );
}

function scoreHorizontalFlowPreference(
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dx: number
): number {
  return (
    scoreAxisPreference(fromSide, "horizontal") +
    scoreAxisPreference(toSide, "horizontal") +
    scoreDirectionalPreference(fromSide, "right", "left", dx) +
    scoreDirectionalPreference(toSide, "left", "right", dx)
  );
}

function scoreFallbackPreference(
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dx: number,
  dy: number
): number {
  const fallbackFrom = resolveClosestSide(dx, dy);
  const fallbackTo = resolveClosestSide(-dx, -dy);
  return (fromSide === fallbackFrom ? 0 : 6) + (toSide === fallbackTo ? 0 : 6);
}

function scoreSidePair(
  fromObj: RectObject,
  toObj: RectObject,
  fromSide: ConnectorSide,
  toSide: ConnectorSide
): number {
  const fromRect = getRect(fromObj);
  const toRect = getRect(toObj);
  const fromCenter = getCenter(fromObj);
  const toCenter = getCenter(toObj);
  const dx = toCenter.col - fromCenter.col;
  const dy = toCenter.row - fromCenter.row;
  const horizontalOverlap = rangesOverlap(
    fromRect.col,
    fromRect.col + fromRect.width,
    toRect.col,
    toRect.col + toRect.width
  );
  const verticalOverlap = rangesOverlap(
    fromRect.row,
    fromRect.row + fromRect.height,
    toRect.row,
    toRect.row + toRect.height
  );
  const { horizontalGap, verticalGap } = getGapDistances(fromRect, toRect);
  const fromPoint = getAttachmentPoint(fromObj, fromSide);
  const toPoint = getAttachmentPoint(toObj, toSide);
  const path = computeConnectorPath(
    fromPoint,
    toPoint,
    getExitDirection(fromSide),
    getExitDirection(toSide),
    fromRect,
    toRect
  );

  let score = scorePathGeometry(path.points);

  const expectVertical =
    verticalGap > 0 && (horizontalOverlap || verticalGap >= horizontalGap);
  const expectHorizontal =
    horizontalGap > 0 && (verticalOverlap || horizontalGap > verticalGap);

  if (expectVertical) {
    score += scoreVerticalFlowPreference(fromSide, toSide, dy);
  }

  if (expectHorizontal) {
    score += scoreHorizontalFlowPreference(fromSide, toSide, dx);
  }

  if (!(expectVertical || expectHorizontal)) {
    score += scoreFallbackPreference(fromSide, toSide, dx, dy);
  }

  return score;
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

  const fromCandidates = fromSide ? [fromSide] : ALL_SIDES;
  const toCandidates = toSide ? [toSide] : ALL_SIDES;

  let best:
    | {
        fromSide: ConnectorSide;
        score: number;
        toSide: ConnectorSide;
      }
    | undefined;

  for (const candidateFrom of fromCandidates) {
    for (const candidateTo of toCandidates) {
      const score = scoreSidePair(fromObj, toObj, candidateFrom, candidateTo);
      if (!best || score < best.score) {
        best = {
          fromSide: candidateFrom,
          toSide: candidateTo,
          score,
        };
      }
    }
  }

  if (!best) {
    const fromCenter = getCenter(fromObj);
    const toCenter = getCenter(toObj);
    const dx = toCenter.col - fromCenter.col;
    const dy = toCenter.row - fromCenter.row;
    return {
      fromSide: fromSide ?? resolveClosestSide(dx, dy),
      toSide: toSide ?? resolveClosestSide(-dx, -dy),
    };
  }

  return {
    fromSide: best.fromSide,
    toSide: best.toSide,
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

function getDistributedAttachmentPoint(
  obj: RectObject,
  side: ConnectorSide,
  slotIndex: number,
  slotCount: number
): GridPoint {
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
    case "top":
      return { col: distribute(col + 1, col + obj.width - 2), row: row - 1 };
    case "bottom":
      return {
        col: distribute(col + 1, col + obj.width - 2),
        row: row + obj.height,
      };
    case "left":
      return { col: col - 1, row: distribute(row + 1, row + obj.height - 2) };
    case "right":
      return {
        col: col + obj.width,
        row: distribute(row + 1, row + obj.height - 2),
      };
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
  const normalize = (path: ConnectorPath): ConnectorPath => ({
    points: normalizeConnectorPoints(path.points),
  });

  // Case 1: Opposite directions on the same axis (facing each other)
  if (areOpposite(fromDir, toDir)) {
    return normalize(computeOppositeRoute(from, to, fromDir));
  }

  // Case 2: Perpendicular directions
  if (!sameAxis(fromDir, toDir)) {
    return normalize(
      computePerpendicularRoute(from, to, fromDir, toDir, fromRect, toRect)
    );
  }

  // Case 3: Same direction (U-route)
  return normalize(computeParallelRoute(from, to, fromDir, toDir));
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
const CLEARANCE = 2;

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

function isSamePoint(a: GridPoint, b: GridPoint): boolean {
  return a.col === b.col && a.row === b.row;
}

function areCollinear(a: GridPoint, b: GridPoint, c: GridPoint): boolean {
  return (
    (a.col === b.col && b.col === c.col) || (a.row === b.row && b.row === c.row)
  );
}

function normalizeConnectorPoints(points: readonly GridPoint[]): GridPoint[] {
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
  for (let i = 0; i < rest.length - 1; i++) {
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
}

function connectorFamilyDirection(
  anchor: RectObject,
  peers: readonly RectObject[],
  mode: "outgoing" | "incoming"
): ConnectorSide | null {
  if (peers.length < 2) {
    return null;
  }

  const anchorCenter = getCenter(anchor);
  const deltas = peers.map((peer) => {
    const center = getCenter(peer);
    return {
      dx: center.col - anchorCenter.col,
      dy: center.row - anchorCenter.row,
    };
  });

  const allBelow = deltas.every(({ dy }) => dy > 0);
  const allAbove = deltas.every(({ dy }) => dy < 0);
  const allRight = deltas.every(({ dx }) => dx > 0);
  const allLeft = deltas.every(({ dx }) => dx < 0);

  if (allBelow) {
    return mode === "outgoing" ? "bottom" : "top";
  }
  if (allAbove) {
    return mode === "outgoing" ? "top" : "bottom";
  }
  if (allRight) {
    return mode === "outgoing" ? "right" : "left";
  }
  if (allLeft) {
    return mode === "outgoing" ? "left" : "right";
  }

  return null;
}

function sortFamilyBySide(
  anchor: RectObject,
  peers: readonly RectObject[],
  side: ConnectorSide
): RectObject[] {
  const anchorCenter = getCenter(anchor);
  const sorted = [...peers];

  sorted.sort((a, b) => {
    const centerA = getCenter(a);
    const centerB = getCenter(b);

    if (side === "top" || side === "bottom") {
      if (centerA.col !== centerB.col) {
        return centerA.col - centerB.col;
      }
      return centerA.row - centerB.row;
    }

    if (centerA.row !== centerB.row) {
      return centerA.row - centerB.row;
    }

    return (
      Math.abs(centerA.col - anchorCenter.col) -
      Math.abs(centerB.col - anchorCenter.col)
    );
  });

  return sorted;
}

function getOutgoingFamily(
  connector: ConnectorObject,
  objects: readonly WireObject[],
  fromObj: RectObject
): { peers: RectObject[]; side: ConnectorSide } | null {
  if (connector.fromSide) {
    return null;
  }

  const siblingConnectors = objects.filter(
    (obj): obj is ConnectorObject =>
      obj.type === "connector" &&
      obj.fromId === connector.fromId &&
      !obj.fromSide
  );

  const peers = siblingConnectors
    .map((candidate) => findRectObject(candidate.toId, objects))
    .filter((obj): obj is RectObject => Boolean(obj));

  const side = connectorFamilyDirection(fromObj, peers, "outgoing");
  if (!side) {
    return null;
  }

  return { peers, side };
}

function getIncomingFamily(
  connector: ConnectorObject,
  objects: readonly WireObject[],
  toObj: RectObject
): { peers: RectObject[]; side: ConnectorSide } | null {
  if (connector.toSide) {
    return null;
  }

  const siblingConnectors = objects.filter(
    (obj): obj is ConnectorObject =>
      obj.type === "connector" && obj.toId === connector.toId && !obj.toSide
  );

  const peers = siblingConnectors
    .map((candidate) => findRectObject(candidate.fromId, objects))
    .filter((obj): obj is RectObject => Boolean(obj));

  const side = connectorFamilyDirection(toObj, peers, "incoming");
  if (!side) {
    return null;
  }

  return { peers, side };
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

  let { fromSide, toSide } = resolveAutoSides(
    fromObj,
    toObj,
    connector.fromSide,
    connector.toSide
  );

  const outgoingFamily = getOutgoingFamily(connector, objects, fromObj);
  if (outgoingFamily) {
    fromSide = outgoingFamily.side;
  }

  const incomingFamily = getIncomingFamily(connector, objects, toObj);
  if (incomingFamily) {
    toSide = incomingFamily.side;
  }

  let fromPoint = getAttachmentPoint(fromObj, fromSide);
  if (outgoingFamily) {
    const orderedPeers = sortFamilyBySide(
      fromObj,
      outgoingFamily.peers,
      outgoingFamily.side
    );
    const slotIndex = orderedPeers.findIndex((peer) => peer.id === toObj.id);
    if (slotIndex >= 0) {
      fromPoint = getDistributedAttachmentPoint(
        fromObj,
        fromSide,
        slotIndex,
        orderedPeers.length
      );
    }
  }

  let toPoint = getAttachmentPoint(toObj, toSide);
  if (incomingFamily) {
    const orderedPeers = sortFamilyBySide(
      toObj,
      incomingFamily.peers,
      incomingFamily.side
    );
    const slotIndex = orderedPeers.findIndex((peer) => peer.id === fromObj.id);
    if (slotIndex >= 0) {
      toPoint = getDistributedAttachmentPoint(
        toObj,
        toSide,
        slotIndex,
        orderedPeers.length
      );
    }
  }

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
