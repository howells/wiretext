import {
  computeConnectorPath,
  getAttachmentPoint,
  getCenter,
  getDistributedAttachmentPoint,
  getExitDirection,
} from "./connector-routing";
import type {
  ConnectorPath,
  RectObject,
  RoutingRect,
} from "./connector-routing";
import type {
  ConnectorObject,
  ConnectorSide,
  GridPoint,
  WireObject,
} from "./types";
import { hasRectBounds } from "./types";

const ALL_SIDES: readonly ConnectorSide[] = ["top", "bottom", "left", "right"];

const resolveClosestSide = (dx: number, dy: number): ConnectorSide => {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
};

const sideAxis = (side: ConnectorSide): "horizontal" | "vertical" =>
  side === "left" || side === "right" ? "horizontal" : "vertical";

const getRect = (obj: RectObject): RoutingRect => ({
  col: obj.position.col,
  height: obj.height,
  row: obj.position.row,
  width: obj.width,
});

const getGapDistances = (
  fromRect: RoutingRect,
  toRect: RoutingRect
): { horizontalGap: number; verticalGap: number } => {
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
};

const rangesOverlap = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean => aStart < bEnd && bStart < aEnd;

const countBends = (points: GridPoint[]): number => {
  let bends = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (!prev || !curr || !next) {
      continue;
    }
    const inVertical = prev.col === curr.col;
    const outVertical = curr.col === next.col;
    if (inVertical !== outVertical) {
      bends += 1;
    }
  }
  return bends;
};

const totalPathLength = (points: GridPoint[]): number => {
  let length = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) {
      continue;
    }
    length += Math.abs(to.col - from.col) + Math.abs(to.row - from.row);
  }
  return length;
};

const scorePathGeometry = (points: GridPoint[]): number =>
  totalPathLength(points) + countBends(points) * 8;

const scoreAxisPreference = (
  side: ConnectorSide,
  axis: "horizontal" | "vertical"
): number => (sideAxis(side) === axis ? 0 : 20);

const scoreDirectionalPreference = (
  side: ConnectorSide,
  preferredPositive: ConnectorSide,
  preferredNegative: ConnectorSide,
  delta: number
): number => {
  const preferredSide = delta >= 0 ? preferredPositive : preferredNegative;
  return side === preferredSide ? 0 : 10;
};

const scoreVerticalFlowPreference = (
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dy: number
): number =>
  scoreAxisPreference(fromSide, "vertical") +
  scoreAxisPreference(toSide, "vertical") +
  scoreDirectionalPreference(fromSide, "bottom", "top", dy) +
  scoreDirectionalPreference(toSide, "top", "bottom", dy);

const scoreHorizontalFlowPreference = (
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dx: number
): number =>
  scoreAxisPreference(fromSide, "horizontal") +
  scoreAxisPreference(toSide, "horizontal") +
  scoreDirectionalPreference(fromSide, "right", "left", dx) +
  scoreDirectionalPreference(toSide, "left", "right", dx);

const scoreFallbackPreference = (
  fromSide: ConnectorSide,
  toSide: ConnectorSide,
  dx: number,
  dy: number
): number => {
  const fallbackFrom = resolveClosestSide(dx, dy);
  const fallbackTo = resolveClosestSide(-dx, -dy);
  return (fromSide === fallbackFrom ? 0 : 6) + (toSide === fallbackTo ? 0 : 6);
};

/**
 * Cost of routing a connector out of `fromSide` and into `toSide`; lower wins.
 *
 * Combines path geometry (total length plus a per-bend penalty) with
 * directional preferences that favour the natural flow between the two rects —
 * vertical sides when they are stacked, horizontal sides when side by side,
 * and a closest-side fallback when neither gap dominates.
 */
const scoreSidePair = (
  fromObj: RectObject,
  toObj: RectObject,
  fromSide: ConnectorSide,
  toSide: ConnectorSide
): number => {
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
};

/** Resolve "auto" sides based on relative positions of two objects.
 *  Each side is computed independently — pinning one does not affect the other. */
export const resolveAutoSides = (
  fromObj: RectObject,
  toObj: RectObject,
  fromSide?: ConnectorSide,
  toSide?: ConnectorSide
): { fromSide: ConnectorSide; toSide: ConnectorSide } => {
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
          score,
          toSide: candidateTo,
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
};

/** Find a rect-bounded object by ID. */
const findRectObject = (
  id: string,
  objects: readonly WireObject[]
): RectObject | undefined => {
  for (const obj of objects) {
    if (obj.id === id && hasRectBounds(obj)) {
      return obj;
    }
  }
  return undefined;
};

const connectorFamilyDirection = (
  anchor: RectObject,
  peers: readonly RectObject[],
  mode: "outgoing" | "incoming"
): ConnectorSide | null => {
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
};

const sortFamilyBySide = (
  anchor: RectObject,
  peers: readonly RectObject[],
  side: ConnectorSide
): RectObject[] => {
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
};

const getOutgoingFamily = (
  connector: ConnectorObject,
  objects: readonly WireObject[],
  fromObj: RectObject
): { peers: RectObject[]; side: ConnectorSide } | null => {
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
};

const getIncomingFamily = (
  connector: ConnectorObject,
  objects: readonly WireObject[],
  toObj: RectObject
): { peers: RectObject[]; side: ConnectorSide } | null => {
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
};

/** Resolve a connector into a renderable path, or null if endpoints are missing. */
export const resolveConnectorPath = (
  connector: ConnectorObject,
  objects: readonly WireObject[]
): ConnectorPath | null => {
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
    if (slotIndex !== -1) {
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
    if (slotIndex !== -1) {
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
    height: fromObj.height,
    row: fromObj.position.row,
    width: fromObj.width,
  };
  const toRect: RoutingRect = {
    col: toObj.position.col,
    height: toObj.height,
    row: toObj.position.row,
    width: toObj.width,
  };

  return computeConnectorPath(
    fromPoint,
    toPoint,
    fromDir,
    toDir,
    fromRect,
    toRect
  );
};
