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
  same: 1,
  cross: 2,
};

const LABELS: readonly RefLabel[] = ["start", "end", "center"];

function refPoints(
  b: BoundingRect,
  axis: Axis
): { start: number; end: number; center: number } {
  if (axis === "col") {
    return {
      start: b.col,
      end: b.col + b.width - 1,
      center: b.col + Math.floor(b.width / 2),
    };
  }
  return {
    start: b.row,
    end: b.row + b.height - 1,
    center: b.row + Math.floor(b.height / 2),
  };
}

function alignKind(d: RefLabel, t: RefLabel): AlignKind {
  if (d === "center" && t === "center") {
    return "center";
  }
  if (d === t) {
    return "same";
  }
  return "cross";
}

function findBestSnap(
  dragged: BoundingRect,
  others: readonly BoundingRect[],
  axis: Axis,
  threshold: number
): { delta: number; position: number } | null {
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
          best = { delta, position: targetRef[tLabel], kind };
        }
      }
    }
  }

  return best ? { delta: best.delta, position: best.position } : null;
}

function collectGuides(
  dragged: BoundingRect,
  others: readonly BoundingRect[],
  axis: Axis,
  chosenDelta: number
): SnapGuide[] {
  const dragRef = refPoints(dragged, axis);
  const positions = new Set<number>();
  const snappedDrag = {
    start: dragRef.start + chosenDelta,
    end: dragRef.end + chosenDelta,
    center: dragRef.center + chosenDelta,
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
}

export function computeSnap(
  draggedBounds: BoundingRect,
  otherBounds: readonly BoundingRect[],
  threshold: number
): SnapResult {
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
}
