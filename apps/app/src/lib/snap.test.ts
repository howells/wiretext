import { describe, expect, it } from "vitest";
import { type BoundingRect, computeSnap } from "./snap";

function rect(
  col: number,
  row: number,
  width: number,
  height: number
): BoundingRect {
  return { col, row, width, height };
}

// ─── computeSnap ──────────────────────────────────────

describe("computeSnap", () => {
  // ─── No snap scenarios ────────────────────────────

  it("returns no snap when all objects are far apart (beyond threshold)", () => {
    const dragged = rect(0, 0, 5, 3);
    const others = [rect(100, 100, 5, 3)];
    const result = computeSnap(dragged, others, 2);

    expect(result.deltaCol).toBe(0);
    expect(result.deltaRow).toBe(0);
    expect(result.guides).toEqual([]);
  });

  it("returns zero adjustment and no guides for empty otherBounds", () => {
    const dragged = rect(5, 5, 10, 10);
    const result = computeSnap(dragged, [], 5);

    expect(result.deltaCol).toBe(0);
    expect(result.deltaRow).toBe(0);
    expect(result.guides).toEqual([]);
  });

  it("returns no snap when threshold is 0 and objects do not exactly align", () => {
    const dragged = rect(0, 0, 5, 3);
    const others = [rect(10, 10, 5, 3)];
    const result = computeSnap(dragged, others, 0);

    expect(result.deltaCol).toBe(0);
    expect(result.deltaRow).toBe(0);
    expect(result.guides).toEqual([]);
  });

  // ─── Left-to-left alignment ───────────────────────

  it("snaps left edge to left edge", () => {
    // dragged: col=9, width=5 → left=9, right=13, center=11
    // target:  col=10, width=8 → left=10, right=17, center=14
    // left-to-left: 10-9=1 (same, abs=1) — closest on col axis
    const dragged = rect(9, 0, 5, 3);
    const target = rect(10, 20, 8, 4);
    const result = computeSnap(dragged, [target], 2);

    expect(result.deltaCol).toBe(1);
    expect(result.guides).toContainEqual({ axis: "col", position: 10 });
  });

  // ─── Right-to-right alignment ─────────────────────

  it("snaps right edge to right edge", () => {
    // dragged: col=10, width=5 → left=10, right=14, center=12
    // target:  col=20, width=6 → left=20, right=25, center=23
    // right-to-right: 25-14=11 — too far
    // Use threshold that isolates right-to-right:
    // dragged: col=10, width=7 → left=10, right=16, center=13
    // target:  col=8,  width=10 → left=8, right=17, center=13
    // right-to-right: 17-16=1 (same, abs=1)
    // center-to-center: 13-13=0 (center, abs=0) — this beats it
    //
    // To isolate right-to-right, use objects where only right edges are close:
    // dragged: col=0, width=10 → left=0, right=9, center=5
    // target:  col=3, width=8  → left=3, right=10, center=7
    // right-to-right: 10-9=1 (same, abs=1)
    // left-to-left: 3-0=3 (same, abs=3)
    // center-to-center: 7-5=2 (center, abs=2)
    // left-to-right(cross): 10-0=10, right-to-left: 3-9=-6, etc.
    // Winner: right-to-right delta=1 beats center-to-center delta=2
    const dragged = rect(0, 0, 10, 3);
    const target = rect(3, 20, 8, 4);
    const result = computeSnap(dragged, [target], 1);

    expect(result.deltaCol).toBe(1); // 10 - 9
    expect(result.guides).toContainEqual({ axis: "col", position: 10 });
  });

  // ─── Top-to-top alignment ─────────────────────────

  it("snaps top edge to top edge", () => {
    // dragged: row=9, height=7 → top=9, bottom=15, center=12
    // target:  row=10, height=20 → top=10, bottom=29, center=20
    // top-to-top: 10-9=1 (same, abs=1) — WINNER
    // All other combos have abs > 1:
    //   bottom-to-top: 10-15=-5, center-to-top: 10-12=-2
    //   top-to-bottom: 29-9=20, bottom-to-bottom: 29-15=14
    //   top-to-center: 20-9=11, center-to-center: 20-12=8
    //   bottom-to-center: 20-15=5, center-to-bottom: 29-12=17
    const dragged = rect(0, 9, 5, 7);
    const target = rect(20, 10, 8, 20);
    const result = computeSnap(dragged, [target], 1);

    expect(result.deltaRow).toBe(1); // 10 - 9
    expect(result.guides).toContainEqual({ axis: "row", position: 10 });
  });

  // ─── Bottom-to-bottom alignment ───────────────────

  it("snaps bottom edge to bottom edge", () => {
    // dragged: row=0, height=10 → top=0, bottom=9, center=5
    // target:  row=3, height=8  → top=3, bottom=10, center=7
    // bottom-to-bottom: 10-9=1 (same, abs=1)
    // center-to-center: 7-5=2 (center, abs=2)
    // top-to-top: 3-0=3 (same, abs=3)
    // Winner: bottom-to-bottom delta=1
    const dragged = rect(0, 0, 5, 10);
    const target = rect(20, 3, 8, 8);
    const result = computeSnap(dragged, [target], 1);

    expect(result.deltaRow).toBe(1); // 10 - 9
    expect(result.guides).toContainEqual({ axis: "row", position: 10 });
  });

  // ─── Center-to-center horizontal ──────────────────

  it("snaps center-to-center horizontally", () => {
    // dragged: col=0, width=10 → left=0, right=9, center=5
    // target:  col=50, width=12 → left=50, right=61, center=56
    // All edges far apart, only use threshold=1 with:
    // dragged: col=0, width=10 → center=5
    // target:  col=2, width=8  → center=6
    // center-to-center: 6-5=1 (center, abs=1)
    // left-to-left: 2-0=2, right-to-right: 9-9=0 — right-right wins at 0!
    //
    // Need centers close, edges far:
    // dragged: col=0, width=11 → left=0, right=10, center=5
    // target:  col=1, width=9  → left=1, right=9,  center=5
    // center-to-center: 0 — yes, but also right-to-right: 9-10=-1, left-to-left: 1-0=1
    // center-to-center at 0 wins
    const dragged = rect(0, 0, 11, 3);
    const target = rect(1, 20, 9, 3);
    const result = computeSnap(dragged, [target], 1);

    // center-to-center: 5-5=0 (center kind, preferred)
    expect(result.deltaCol).toBe(0);
    expect(result.guides).toContainEqual({ axis: "col", position: 5 });
  });

  // ─── Center-to-center vertical ────────────────────

  it("snaps center-to-center vertically", () => {
    // dragged: row=0, height=11 → top=0, bottom=10, center=5
    // target:  row=1, height=9  → top=1, bottom=9,  center=5
    // center-to-center: 5-5=0 (center kind, best)
    const dragged = rect(0, 0, 3, 11);
    const target = rect(20, 1, 3, 9);
    const result = computeSnap(dragged, [target], 1);

    expect(result.deltaRow).toBe(0);
    expect(result.guides).toContainEqual({ axis: "row", position: 5 });
  });

  // ─── Cross-edge snaps ─────────────────────────────

  it("snaps dragged left edge to target right edge", () => {
    // dragged: col=8, width=5 → left=8, right=12, center=10
    // target:  col=0, width=10 → left=0, right=9, center=5
    // left-to-right(cross): 9-8=1 (cross, abs=1)
    // center-to-center: 5-10=-5 — far
    // right-to-right: 9-12=-3 — far
    // Winner: left-to-right delta=1
    const dragged = rect(8, 0, 5, 3);
    const target = rect(0, 20, 10, 4);
    const result = computeSnap(dragged, [target], 2);

    expect(result.deltaCol).toBe(1); // 9 - 8
    expect(result.guides).toContainEqual({ axis: "col", position: 9 });
  });

  it("snaps dragged top edge to target bottom edge", () => {
    // dragged: row=8, height=3 → top=8, bottom=10, center=9
    // target:  row=0, height=10 → top=0, bottom=9, center=5
    // top-to-bottom(cross): 9-8=1 (cross, abs=1)
    // center-to-center: 5-9=-4 — far
    // bottom-to-bottom: 9-10=-1 (same, abs=1) — tied but same beats cross
    // So winner is actually bottom-to-bottom with delta=-1
    //
    // To isolate cross-edge, make sure no same-edge is within threshold:
    // dragged: row=8, height=5 → top=8, bottom=12, center=10
    // target:  row=0, height=10 → top=0, bottom=9, center=5
    // top-to-bottom(cross): 9-8=1 (cross, abs=1)
    // bottom-to-bottom: 9-12=-3 — far
    // center-to-center: 5-10=-5 — far
    // top-to-top: 0-8=-8 — far
    // Winner: top-to-bottom delta=1
    const dragged = rect(0, 8, 5, 5);
    const target = rect(20, 0, 4, 10);
    const result = computeSnap(dragged, [target], 2);

    expect(result.deltaRow).toBe(1); // 9 - 8
    expect(result.guides).toContainEqual({ axis: "row", position: 9 });
  });

  // ─── Simultaneous snap on both axes ───────────────

  it("snaps on both axes simultaneously", () => {
    // dragged: col=9, width=5 → left=9, right=13, center=11
    // target:  col=10, width=8 → left=10, right=17, center=14
    // Col left-to-left: 10-9=1 (same, abs=1) — WINNER on col
    // All other col combos: right-to-left=10-13=-3, center-to-center=14-11=3, etc.
    //
    // dragged: row=14, height=7 → top=14, bottom=20, center=17
    // target:  row=15, height=20 → top=15, bottom=34, center=25
    // Row top-to-top: 15-14=1 (same, abs=1) — WINNER on row
    // All other row combos: bottom-to-top=15-20=-5, center-to-top=15-17=-2, etc.
    const dragged = rect(9, 14, 5, 7);
    const target = rect(10, 15, 8, 20);
    const result = computeSnap(dragged, [target], 1);

    expect(result.deltaCol).toBe(1);
    expect(result.deltaRow).toBe(1);
    expect(result.guides).toContainEqual({ axis: "col", position: 10 });
    expect(result.guides).toContainEqual({ axis: "row", position: 15 });
  });

  // ─── Multiple guide lines ─────────────────────────

  it("returns multiple guides when aligned with multiple objects at same coordinate", () => {
    // dragged: col=19, width=5 → left=19, right=23, center=21
    // target1: col=20, width=30 → left=20, right=49, center=35
    // target2: col=20, width=40 → left=20, right=59, center=40
    // left-to-left: 20-19=1 (same, abs=1) — WINNER for both targets
    // center-to-left: 20-21=-1 (cross, abs=1) — tied but same beats cross
    const dragged = rect(19, 5, 5, 3);
    const target1 = rect(20, 0, 30, 3);
    const target2 = rect(20, 30, 40, 4);
    const result = computeSnap(dragged, [target1, target2], 1);

    expect(result.deltaCol).toBe(1);
    const colGuides = result.guides.filter((g) => g.axis === "col");
    expect(colGuides.length).toBeGreaterThanOrEqual(1);
    expect(colGuides).toContainEqual({ axis: "col", position: 20 });
  });

  // ─── Closest snap wins ────────────────────────────

  it("picks the closest snap when multiple candidates exist at different distances", () => {
    // dragged: col=20, width=6 → left=20, right=25, center=23
    // target1: col=22, width=30 → left=22 → left-to-left delta=2 (same)
    // target2: col=21, width=30 → left=21 → left-to-left delta=1 (same, closer)
    // With threshold=2, target2's left-left at delta=1 beats target1's at delta=2
    const dragged = rect(20, 0, 6, 3);
    const target1 = rect(22, 20, 30, 3);
    const target2 = rect(21, 40, 30, 3);
    const result = computeSnap(dragged, [target1, target2], 2);

    expect(result.deltaCol).toBe(1);
    expect(result.guides).toContainEqual({ axis: "col", position: 21 });
  });

  // ─── Single-cell objects ──────────────────────────

  it("handles single-cell objects (1x1 bounds)", () => {
    // 1x1: left=right=center=col, top=bottom=center=row
    // dragged: col=5, row=5, all ref points = 5 on each axis
    // target:  col=6, row=6, all ref points = 6 on each axis
    // delta = 1 on both axes
    const dragged = rect(5, 5, 1, 1);
    const target = rect(6, 6, 1, 1);
    const result = computeSnap(dragged, [target], 2);

    expect(result.deltaCol).toBe(1);
    expect(result.deltaRow).toBe(1);
  });

  // ─── Exact alignment ──────────────────────────────

  it("produces guide lines on exact alignment (delta = 0)", () => {
    // dragged left=10, target left=10 → delta=0
    const dragged = rect(10, 10, 5, 3);
    const target = rect(10, 20, 8, 4);
    const result = computeSnap(dragged, [target], 2);

    expect(result.deltaCol).toBe(0);
    expect(result.guides).toContainEqual({ axis: "col", position: 10 });
  });

  // ─── Tiebreaker: center-to-center preferred ──────

  it("prefers center-to-center over same-edge when distance is equal", () => {
    // dragged: col=0, width=10 → left=0, right=9, center=5
    // target:  col=3, width=4  → left=3, right=6, center=5
    // center-to-center: 5-5=0 (center, abs=0) — wins
    // left-to-left: 3-0=3 (same, abs=3)
    const dragged = rect(0, 0, 10, 3);
    const target = rect(3, 20, 4, 3);
    const result = computeSnap(dragged, [target], 3);

    expect(result.deltaCol).toBe(0);
    expect(result.guides).toContainEqual({ axis: "col", position: 5 });
  });

  // ─── Does not mutate inputs ───────────────────────

  it("does not mutate input bounds", () => {
    const dragged = rect(9, 14, 5, 3);
    const others = [rect(10, 15, 8, 4)];
    const draggedCopy = { ...dragged };
    const othersCopy = [{ ...others[0] }];

    computeSnap(dragged, others, 2);

    expect(dragged).toEqual(draggedCopy);
    expect(others).toEqual(othersCopy);
  });
});
