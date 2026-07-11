export interface BoundingRect {
  col: number;
  height: number;
  row: number;
  width: number;
}

export interface SnapGuide {
  axis: "col" | "row";
  position: number;
}

export interface SnapResult {
  deltaCol: number;
  deltaRow: number;
  guides: SnapGuide[];
}

type Axis = "col" | "row";
type RefLabel = "start" | "end" | "center";

/** Priority for tiebreaking: center beats same-edge beats cross-edge. */
type AlignKind = "center" | "same" | "cross";

const KIND_PRIORITY: Record<AlignKind, number> = {
  center: 0,
  cross: 2,
  same: 1,
};

const LABELS: readonly RefLabel[] = ["start", "end", "center"];

const refPoints = (
  b: BoundingRect,
  axis: Axis
): { start: number; end: number; center: number } => {
  if (axis === "col") {
    return {
      center: b.col + Math.floor(b.width / 2),
      end: b.col + b.width - 1,
      start: b.col,
    };
  }
  return {
    center: b.row + Math.floor(b.height / 2),
    end: b.row + b.height - 1,
    start: b.row,
  };
};

const alignKind = (d: RefLabel, t: RefLabel): AlignKind => {
  if (d === "center" && t === "center") {
    return "center";
  }
  if (d === t) {
    return "same";
  }
  return "cross";
};

const findBestSnap = (
  dragged: BoundingRect,
  others: readonly BoundingRect[],
  axis: Axis,
  threshold: number
): { delta: number; position: number } | null => {
  const dragRef = refPoints(dragged, axis);
  let best: { delta: number; position: number; kind: AlignKind } | null = null;

  for (const other of others) {
    const targetRef = refPoints(other, axis);
    for (const dLabel of LABELS) {
      for (const tLabel of LABELS) {
        const delta = targetRef[tLabel] - dragRef[dLabel];
        if (Math.abs(delta) > threshold) {
          continue;
        }
        const kind = alignKind(dLabel, tLabel);
        if (
          best === null ||
          Math.abs(delta) < Math.abs(best.delta) ||
          (Math.abs(delta) === Math.abs(best.delta) &&
            KIND_PRIORITY[kind] < KIND_PRIORITY[best.kind])
        ) {
          best = { delta, kind, position: targetRef[tLabel] };
        }
      }
    }
  }

  return best ? { delta: best.delta, position: best.position } : null;
};

const collectGuides = (
  dragged: BoundingRect,
  others: readonly BoundingRect[],
  axis: Axis,
  chosenDelta: number
): SnapGuide[] => {
  const dragRef = refPoints(dragged, axis);
  const positions = new Set<number>();
  const snappedDrag = {
    center: dragRef.center + chosenDelta,
    end: dragRef.end + chosenDelta,
    start: dragRef.start + chosenDelta,
  };

  for (const other of others) {
    const targetRef = refPoints(other, axis);
    for (const tLabel of LABELS) {
      for (const dLabel of LABELS) {
        if (snappedDrag[dLabel] === targetRef[tLabel]) {
          positions.add(targetRef[tLabel]);
        }
      }
    }
  }

  return [...positions].map((position) => ({ axis, position }));
};

/**
 * Alignment snapping for a dragged object against its neighbours.
 *
 * The col and row axes snap independently. On each axis the dragged rect's three
 * reference points (start / center / end edge) are compared to every neighbour's
 * three, and the nearest pairing within `threshold` cells wins; ties break by
 * smallest offset, then by kind (center-to-center > matching edges > crossing
 * edges, per KIND_PRIORITY). The returned deltaCol/deltaRow are the snap
 * correction to add to the drag, and `guides` are the lines to draw at every
 * reference point that lands exactly on a neighbour after that correction.
 */
export const computeSnap = (
  draggedBounds: BoundingRect,
  otherBounds: readonly BoundingRect[],
  threshold: number
): SnapResult => {
  if (otherBounds.length === 0) {
    return { deltaCol: 0, deltaRow: 0, guides: [] };
  }

  const colSnap = findBestSnap(draggedBounds, otherBounds, "col", threshold);
  const rowSnap = findBestSnap(draggedBounds, otherBounds, "row", threshold);
  const deltaCol = colSnap?.delta ?? 0;
  const deltaRow = rowSnap?.delta ?? 0;

  const guides: SnapGuide[] = [
    ...(colSnap
      ? collectGuides(draggedBounds, otherBounds, "col", deltaCol)
      : []),
    ...(rowSnap
      ? collectGuides(draggedBounds, otherBounds, "row", deltaRow)
      : []),
  ];

  return { deltaCol, deltaRow, guides };
};
