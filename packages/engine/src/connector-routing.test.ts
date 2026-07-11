import { describe, expect, it } from "vitest";

import type { RoutingRect } from "./connector-routing";
import {
  computeConnectorPath,
  getAttachmentPoint,
  getCornerChar,
  getSegmentDirection,
} from "./connector-routing";
import { must } from "./test-utils";
import type { BoxObject } from "./types";

const makeBox = (
  id: string,
  col: number,
  row: number,
  width = 10,
  height = 5
): BoxObject => ({
  borderStyle: "single",
  height,
  id,
  layerId: "layer-1",
  position: { col, row },
  type: "box",
  width,
  zIndex: 0,
});

describe("getAttachmentPoint", () => {
  const box = makeBox("a", 5, 3, 10, 5);

  it("computes top attachment (one cell above border)", () => {
    const pt = getAttachmentPoint(box, "top");
    // col 5 + floor(10/2) = 10, row 3-1 = 2
    expect(pt).toEqual({ col: 10, row: 2 });
  });

  it("computes bottom attachment (one cell below border)", () => {
    const pt = getAttachmentPoint(box, "bottom");
    // row 3+5 = 8
    expect(pt).toEqual({ col: 10, row: 8 });
  });

  it("computes left attachment (one cell left of border)", () => {
    const pt = getAttachmentPoint(box, "left");
    // col 5-1 = 4, row 3+floor(5/2) = 5
    expect(pt).toEqual({ col: 4, row: 5 });
  });

  it("computes right attachment (one cell right of border)", () => {
    const pt = getAttachmentPoint(box, "right");
    // col 5+10 = 15
    expect(pt).toEqual({ col: 15, row: 5 });
  });

  it("uses Math.floor for odd dimensions", () => {
    const oddBox = makeBox("a", 0, 0, 7, 9);
    const top = getAttachmentPoint(oddBox, "top");
    // floor(7/2) = 3
    expect(top.col).toBe(3);
    const left = getAttachmentPoint(oddBox, "left");
    // floor(9/2) = 4
    expect(left.row).toBe(4);
  });
});

describe("computeConnectorPath", () => {
  describe("straight routes (opposite directions, aligned)", () => {
    it("vertical straight: bottom to top, same column", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 5, row: 15 },
        "down",
        "up"
      );
      expect(path.points).toEqual([
        { col: 5, row: 5 },
        { col: 5, row: 15 },
      ]);
    });

    it("horizontal straight: right to left, same row", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 20, row: 5 },
        "right",
        "left"
      );
      expect(path.points).toEqual([
        { col: 5, row: 5 },
        { col: 20, row: 5 },
      ]);
    });
  });

  describe("Z-routes (opposite directions, offset)", () => {
    it("vertical Z: bottom to top, different columns", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "down",
        "up"
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      // midpoint row
      expect(path.points[1]).toEqual({ col: 5, row: 10 });
      expect(path.points[2]).toEqual({ col: 15, row: 10 });
      expect(path.points[3]).toEqual({ col: 15, row: 15 });
    });

    it("horizontal Z: right to left, different rows", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 20, row: 15 },
        "right",
        "left"
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      // midpoint col
      expect(path.points[1]).toEqual({ col: 12, row: 5 });
      expect(path.points[2]).toEqual({ col: 12, row: 15 });
      expect(path.points[3]).toEqual({ col: 20, row: 15 });
    });
  });

  describe("L-routes (perpendicular directions)", () => {
    it("down exit, left entry: corner at (from.col, to.row)", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "down",
        "right"
      );
      expect(path.points).toHaveLength(3);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      expect(path.points[1]).toEqual({ col: 5, row: 15 });
      expect(path.points[2]).toEqual({ col: 15, row: 15 });
    });

    it("right exit, up entry: corner at (to.col, from.row)", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "right",
        "down"
      );
      expect(path.points).toHaveLength(3);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      expect(path.points[1]).toEqual({ col: 15, row: 5 });
      expect(path.points[2]).toEqual({ col: 15, row: 15 });
    });
  });

  describe("snake routes (perpendicular, backward first segment)", () => {
    it("up exit but target is below-right: 5-point snake", () => {
      // fromDir=up, target at (15,15), from at (5,5)
      // Naive L-corner would be at (5, 15) — that's DOWN from (5,5), not up → snake
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "up",
        "down"
      );
      // opposite route, Z-shape
      expect(path.points).toHaveLength(4);
    });

    it("up exit, perpendicular toDir, target below: 5-point snake", () => {
      // fromDir=up, toDir=right, from=(5,5), to=(15,15)
      // Naive L-corner at (5,15) is DOWN from (5,5) — not aligned with "up"
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "up",
        "right"
      );
      expect(path.points).toHaveLength(5);
      // First point exits upward
      expect(path.points[1]?.row).toBeLessThan(5);
      expect(path.points[1]?.col).toBe(5);
      // Last point is the target
      expect(path.points[4]).toEqual({ col: 15, row: 15 });
    });

    it("left exit, perpendicular toDir, target to the right: 5-point snake", () => {
      // fromDir=left, toDir=down, from=(5,5), to=(15,15)
      // Naive L-corner at (15,5) is RIGHT from (5,5) — not aligned with "left"
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "left",
        "down"
      );
      expect(path.points).toHaveLength(5);
      // First point exits leftward
      expect(path.points[1]?.col).toBeLessThan(5);
      expect(path.points[1]?.row).toBe(5);
      // Last point is the target
      expect(path.points[4]).toEqual({ col: 15, row: 15 });
    });

    it("down exit, perpendicular toDir, target above: 5-point snake", () => {
      // fromDir=down, toDir=left, from=(5,15), to=(15,5)
      // Naive L-corner at (5,5) is UP from (5,15) — not aligned with "down"
      const path = computeConnectorPath(
        { col: 5, row: 15 },
        { col: 15, row: 5 },
        "down",
        "left"
      );
      expect(path.points).toHaveLength(5);
      // First point exits downward
      expect(path.points[1]?.row).toBeGreaterThan(15);
      expect(path.points[1]?.col).toBe(5);
    });

    it("right exit, perpendicular toDir, target to the left: 5-point snake", () => {
      // fromDir=right, toDir=up, from=(15,5), to=(5,15)
      // Naive L-corner at (5,5) is LEFT from (15,5) — not aligned with "right"
      const path = computeConnectorPath(
        { col: 15, row: 5 },
        { col: 5, row: 15 },
        "right",
        "up"
      );
      expect(path.points).toHaveLength(5);
      // First point exits rightward
      expect(path.points[1]?.col).toBeGreaterThan(15);
      expect(path.points[1]?.row).toBe(5);
    });
  });

  describe("box-aware perpendicular routes (with rects)", () => {
    it("always uses 5-point route when rects are provided, even if L is aligned", () => {
      // fromDir=down, toDir=right → L would be aligned (target is below-right)
      // But with rects, should use 5-point route through gap between boxes
      const fromRect: RoutingRect = { col: 0, height: 10, row: 0, width: 20 };
      const toRect: RoutingRect = { col: 30, height: 10, row: 12, width: 15 };
      // bottom attachment of source
      const from = { col: 10, row: 10 };
      // left attachment of target
      const to = { col: 29, row: 17 };
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect
      );
      expect(path.points).toHaveLength(5);
    });

    it("places vertical segment between box edges (target to the right)", () => {
      // Source at col 0..20, target at col 30..45
      // Gap: 20..30, midCol should be 25
      const fromRect: RoutingRect = { col: 0, height: 10, row: 0, width: 20 };
      const toRect: RoutingRect = { col: 30, height: 10, row: 12, width: 15 };
      // bottom of source
      const from = { col: 10, row: 10 };
      // left of target
      const to = { col: 29, row: 17 };
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect
      );
      // The vertical segment is at points[2] and points[3], both at midCol
      const midCol = path.points[2]?.col;
      // floor((20 + 30) / 2)
      expect(midCol).toBe(25);
      expect(path.points[3]?.col).toBe(midCol);
    });

    it("places horizontal segment between box edges (target below)", () => {
      // Source at row 0..10, target at row 20..30
      // Gap: 10..20, midRow should be 15
      const fromRect: RoutingRect = { col: 0, height: 10, row: 0, width: 10 };
      const toRect: RoutingRect = { col: 15, height: 10, row: 20, width: 10 };
      // right of source
      const from = { col: 10, row: 5 };
      // top of target
      const to = { col: 20, row: 19 };
      const path = computeConnectorPath(
        from,
        to,
        "right",
        "up",
        fromRect,
        toRect
      );
      const midRow = path.points[2]?.row;
      // floor((10 + 20) / 2)
      expect(midRow).toBe(15);
      expect(path.points[3]?.row).toBe(midRow);
    });

    it("uses 2-cell clearance from attachment point for first turn", () => {
      const fromRect: RoutingRect = { col: 0, height: 10, row: 0, width: 20 };
      const toRect: RoutingRect = { col: 30, height: 10, row: 12, width: 15 };
      // bottom of source
      const from = { col: 10, row: 10 };
      // left of target
      const to = { col: 29, row: 17 };
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect
      );
      // First turn should be 2 cells below attachment point
      expect(path.points[1]).toEqual({ col: 10, row: 12 });
    });

    it("falls back to attachment midpoint when boxes overlap horizontally", () => {
      // Source col 0..20, target col 10..25 — overlap!
      const fromRect: RoutingRect = { col: 0, height: 10, row: 0, width: 20 };
      const toRect: RoutingRect = { col: 10, height: 10, row: 20, width: 15 };
      const from = { col: 10, row: 10 };
      const to = { col: 9, row: 25 };
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect
      );
      // Should fall back to floor((10 + 9) / 2) = 9
      const midCol = path.points[2]?.col;
      expect(midCol).toBe(9);
    });
  });

  describe("U-routes (parallel directions, same direction)", () => {
    it("both exit right", () => {
      const path = computeConnectorPath(
        { col: 10, row: 5 },
        { col: 10, row: 15 },
        "right",
        "right"
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 10, row: 5 });
      // Should go right to max col + 2
      expect(must(path.points[1]).col).toBe(12);
      expect(must(path.points[1]).row).toBe(5);
      expect(must(path.points[2]).col).toBe(12);
      expect(must(path.points[2]).row).toBe(15);
      expect(path.points[3]).toEqual({ col: 10, row: 15 });
    });

    it("both exit left", () => {
      const path = computeConnectorPath(
        { col: 10, row: 5 },
        { col: 15, row: 15 },
        "left",
        "left"
      );
      expect(path.points).toHaveLength(4);
      // Should go left to min col - 2
      // min(10,15) - 2
      expect(must(path.points[1]).col).toBe(8);
    });

    it("both exit down", () => {
      const path = computeConnectorPath(
        { col: 5, row: 10 },
        { col: 15, row: 10 },
        "down",
        "down"
      );
      expect(path.points).toHaveLength(4);
      // Should go down to max row + 2
      // max(10,10) + 2
      expect(must(path.points[1]).row).toBe(12);
    });

    it("both exit up", () => {
      const path = computeConnectorPath(
        { col: 5, row: 10 },
        { col: 15, row: 8 },
        "up",
        "up"
      );
      expect(path.points).toHaveLength(4);
      // Should go up to min row - 2
      // min(10,8) - 2
      expect(must(path.points[1]).row).toBe(6);
    });
  });
});

describe("getCornerChar", () => {
  it("down then right = └", () => {
    expect(getCornerChar("down", "right")).toBe("└");
  });

  it("down then left = ┘", () => {
    expect(getCornerChar("down", "left")).toBe("┘");
  });

  it("up then right = ┌", () => {
    expect(getCornerChar("up", "right")).toBe("┌");
  });

  it("up then left = ┐", () => {
    expect(getCornerChar("up", "left")).toBe("┐");
  });

  it("right then down = ┐", () => {
    expect(getCornerChar("right", "down")).toBe("┐");
  });

  it("right then up = ┘", () => {
    expect(getCornerChar("right", "up")).toBe("┘");
  });

  it("left then down = ┌", () => {
    expect(getCornerChar("left", "down")).toBe("┌");
  });

  it("left then up = └", () => {
    expect(getCornerChar("left", "up")).toBe("└");
  });
});

describe("getSegmentDirection", () => {
  it("right", () => {
    expect(getSegmentDirection({ col: 0, row: 0 }, { col: 5, row: 0 })).toBe(
      "right"
    );
  });
  it("left", () => {
    expect(getSegmentDirection({ col: 5, row: 0 }, { col: 0, row: 0 })).toBe(
      "left"
    );
  });
  it("down", () => {
    expect(getSegmentDirection({ col: 0, row: 0 }, { col: 0, row: 5 })).toBe(
      "down"
    );
  });
  it("up", () => {
    expect(getSegmentDirection({ col: 0, row: 5 }, { col: 0, row: 0 })).toBe(
      "up"
    );
  });
});
