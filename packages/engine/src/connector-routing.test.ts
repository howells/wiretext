import { describe, expect, it } from "vitest";
import type { RoutingRect } from "./connector-routing";
import {
  computeConnectorPath,
  getAttachmentPoint,
  getCornerChar,
  getSegmentDirection,
  resolveAutoSides,
  resolveConnectorPath,
} from "./connector-routing";
import type { BoxObject } from "./types";

function makeBox(
  id: string,
  col: number,
  row: number,
  width = 10,
  height = 5,
): BoxObject {
  return {
    id,
    type: "box",
    position: { col, row },
    width,
    height,
    borderStyle: "single",
    zIndex: 0,
    layerId: "layer-1",
  };
}

describe("resolveAutoSides", () => {
  it("picks bottom/top when target is below", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 0, 10);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "bottom", toSide: "top" });
  });

  it("picks top/bottom when target is above", () => {
    const from = makeBox("a", 0, 10);
    const to = makeBox("b", 0, 0);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "top", toSide: "bottom" });
  });

  it("picks right/left when target is to the right", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 20, 0);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "right", toSide: "left" });
  });

  it("picks left/right when target is to the left", () => {
    const from = makeBox("a", 20, 0);
    const to = makeBox("b", 0, 0);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "left", toSide: "right" });
  });

  it("prefers vertical when dy > dx (diagonal case)", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 5, 15);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "bottom", toSide: "top" });
  });

  it("respects pinned fromSide without affecting toSide", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 20, 0);
    // to is to the right, so auto toSide = "left" (facing from)
    const result = resolveAutoSides(from, to, "bottom");
    expect(result.fromSide).toBe("bottom");
    expect(result.toSide).toBe("left");
  });

  it("respects pinned toSide without affecting fromSide", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 0, 10);
    // to is below, so auto fromSide = "bottom" (facing to)
    const result = resolveAutoSides(from, to, undefined, "left");
    expect(result.toSide).toBe("left");
    expect(result.fromSide).toBe("bottom");
  });

  it("respects both pinned sides", () => {
    const from = makeBox("a", 0, 0);
    const to = makeBox("b", 20, 20);
    const result = resolveAutoSides(from, to, "left", "top");
    expect(result).toEqual({ fromSide: "left", toSide: "top" });
  });

  it("handles equal dx and dy (exact diagonal) by picking vertical", () => {
    const from = makeBox("a", 0, 0, 10, 10);
    const to = makeBox("b", 10, 10, 10, 10);
    const result = resolveAutoSides(from, to);
    // When dx === dy, Math.abs(dx) > Math.abs(dy) is false, so falls to vertical
    expect(result).toEqual({ fromSide: "bottom", toSide: "top" });
  });

  it("prefers bottom/top for hierarchical flow when boxes overlap horizontally", () => {
    const from = makeBox("a", 0, 16, 34, 5);
    const to = makeBox("b", 20, 24, 50, 5);
    const result = resolveAutoSides(from, to);
    expect(result).toEqual({ fromSide: "bottom", toSide: "top" });
  });

  it("keeps a pinned top entry while choosing a sensible auto exit", () => {
    const from = makeBox("a", 21, 9, 50, 5);
    const to = makeBox("b", 1, 17, 34, 5);
    const result = resolveAutoSides(from, to, undefined, "top");
    expect(result).toEqual({ fromSide: "left", toSide: "top" });
  });
});

describe("getAttachmentPoint", () => {
  const box = makeBox("a", 5, 3, 10, 5);

  it("computes top attachment (one cell above border)", () => {
    const pt = getAttachmentPoint(box, "top");
    expect(pt).toEqual({ col: 10, row: 2 }); // col 5 + floor(10/2) = 10, row 3-1 = 2
  });

  it("computes bottom attachment (one cell below border)", () => {
    const pt = getAttachmentPoint(box, "bottom");
    expect(pt).toEqual({ col: 10, row: 8 }); // row 3+5 = 8
  });

  it("computes left attachment (one cell left of border)", () => {
    const pt = getAttachmentPoint(box, "left");
    expect(pt).toEqual({ col: 4, row: 5 }); // col 5-1 = 4, row 3+floor(5/2) = 5
  });

  it("computes right attachment (one cell right of border)", () => {
    const pt = getAttachmentPoint(box, "right");
    expect(pt).toEqual({ col: 15, row: 5 }); // col 5+10 = 15
  });

  it("uses Math.floor for odd dimensions", () => {
    const oddBox = makeBox("a", 0, 0, 7, 9);
    const top = getAttachmentPoint(oddBox, "top");
    expect(top.col).toBe(3); // floor(7/2) = 3
    const left = getAttachmentPoint(oddBox, "left");
    expect(left.row).toBe(4); // floor(9/2) = 4
  });
});

describe("computeConnectorPath", () => {
  describe("straight routes (opposite directions, aligned)", () => {
    it("vertical straight: bottom to top, same column", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 5, row: 15 },
        "down",
        "up",
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
        "left",
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
        "up",
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      expect(path.points[1]).toEqual({ col: 5, row: 10 }); // midpoint row
      expect(path.points[2]).toEqual({ col: 15, row: 10 });
      expect(path.points[3]).toEqual({ col: 15, row: 15 });
    });

    it("horizontal Z: right to left, different rows", () => {
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 20, row: 15 },
        "right",
        "left",
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 5, row: 5 });
      expect(path.points[1]).toEqual({ col: 12, row: 5 }); // midpoint col
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
        "right",
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
        "down",
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
        "down",
      );
      expect(path.points).toHaveLength(4); // opposite route, Z-shape
    });

    it("up exit, perpendicular toDir, target below: 5-point snake", () => {
      // fromDir=up, toDir=right, from=(5,5), to=(15,15)
      // Naive L-corner at (5,15) is DOWN from (5,5) — not aligned with "up"
      const path = computeConnectorPath(
        { col: 5, row: 5 },
        { col: 15, row: 15 },
        "up",
        "right",
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
        "down",
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
        "left",
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
        "up",
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
      const fromRect: RoutingRect = { col: 0, row: 0, width: 20, height: 10 };
      const toRect: RoutingRect = { col: 30, row: 12, width: 15, height: 10 };
      const from = { col: 10, row: 10 }; // bottom attachment of source
      const to = { col: 29, row: 17 }; // left attachment of target
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect,
      );
      expect(path.points).toHaveLength(5);
    });

    it("places vertical segment between box edges (target to the right)", () => {
      // Source at col 0..20, target at col 30..45
      // Gap: 20..30, midCol should be 25
      const fromRect: RoutingRect = { col: 0, row: 0, width: 20, height: 10 };
      const toRect: RoutingRect = { col: 30, row: 12, width: 15, height: 10 };
      const from = { col: 10, row: 10 }; // bottom of source
      const to = { col: 29, row: 17 }; // left of target
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect,
      );
      // The vertical segment is at points[2] and points[3], both at midCol
      const midCol = path.points[2]?.col;
      expect(midCol).toBe(25); // floor((20 + 30) / 2)
      expect(path.points[3]?.col).toBe(midCol);
    });

    it("places horizontal segment between box edges (target below)", () => {
      // Source at row 0..10, target at row 20..30
      // Gap: 10..20, midRow should be 15
      const fromRect: RoutingRect = { col: 0, row: 0, width: 10, height: 10 };
      const toRect: RoutingRect = { col: 15, row: 20, width: 10, height: 10 };
      const from = { col: 10, row: 5 }; // right of source
      const to = { col: 20, row: 19 }; // top of target
      const path = computeConnectorPath(
        from,
        to,
        "right",
        "up",
        fromRect,
        toRect,
      );
      const midRow = path.points[2]?.row;
      expect(midRow).toBe(15); // floor((10 + 20) / 2)
      expect(path.points[3]?.row).toBe(midRow);
    });

    it("uses 2-cell clearance from attachment point for first turn", () => {
      const fromRect: RoutingRect = { col: 0, row: 0, width: 20, height: 10 };
      const toRect: RoutingRect = { col: 30, row: 12, width: 15, height: 10 };
      const from = { col: 10, row: 10 }; // bottom of source
      const to = { col: 29, row: 17 }; // left of target
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect,
      );
      // First turn should be 2 cells below attachment point
      expect(path.points[1]).toEqual({ col: 10, row: 12 });
    });

    it("falls back to attachment midpoint when boxes overlap horizontally", () => {
      // Source col 0..20, target col 10..25 — overlap!
      const fromRect: RoutingRect = { col: 0, row: 0, width: 20, height: 10 };
      const toRect: RoutingRect = { col: 10, row: 20, width: 15, height: 10 };
      const from = { col: 10, row: 10 };
      const to = { col: 9, row: 25 };
      const path = computeConnectorPath(
        from,
        to,
        "down",
        "left",
        fromRect,
        toRect,
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
        "right",
      );
      expect(path.points).toHaveLength(4);
      expect(path.points[0]).toEqual({ col: 10, row: 5 });
      // Should go right to max col + 2
      expect(path.points[1].col).toBe(12);
      expect(path.points[1].row).toBe(5);
      expect(path.points[2].col).toBe(12);
      expect(path.points[2].row).toBe(15);
      expect(path.points[3]).toEqual({ col: 10, row: 15 });
    });

    it("both exit left", () => {
      const path = computeConnectorPath(
        { col: 10, row: 5 },
        { col: 15, row: 15 },
        "left",
        "left",
      );
      expect(path.points).toHaveLength(4);
      // Should go left to min col - 2
      expect(path.points[1].col).toBe(8); // min(10,15) - 2
    });

    it("both exit down", () => {
      const path = computeConnectorPath(
        { col: 5, row: 10 },
        { col: 15, row: 10 },
        "down",
        "down",
      );
      expect(path.points).toHaveLength(4);
      // Should go down to max row + 2
      expect(path.points[1].row).toBe(12); // max(10,10) + 2
    });

    it("both exit up", () => {
      const path = computeConnectorPath(
        { col: 5, row: 10 },
        { col: 15, row: 8 },
        "up",
        "up",
      );
      expect(path.points).toHaveLength(4);
      // Should go up to min row - 2
      expect(path.points[1].row).toBe(6); // min(10,8) - 2
    });
  });
});

describe("resolveConnectorPath", () => {
  it("returns null when fromId object is missing", () => {
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "missing",
      toId: "b",
      position: { col: 0, row: 0 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const objects = [makeBox("b", 0, 10)];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("returns null when toId object is missing", () => {
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "a",
      toId: "missing",
      position: { col: 0, row: 0 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const objects = [makeBox("a", 0, 0)];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("returns null when referenced object is not rect-bounded (text)", () => {
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "a",
      toId: "t",
      position: { col: 0, row: 0 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const objects = [
      makeBox("a", 0, 0),
      {
        id: "t",
        type: "text" as const,
        content: "hello",
        position: { col: 0, row: 10 },
        zIndex: 1,
        layerId: "layer-1",
      },
    ];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("computes a path between two vertically stacked boxes", () => {
    const boxA = makeBox("a", 0, 0, 10, 5);
    const boxB = makeBox("b", 0, 10, 10, 5);
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "a",
      toId: "b",
      position: { col: 0, row: 0 },
      zIndex: 2,
      layerId: "layer-1",
    };
    const path = resolveConnectorPath(connector, [boxA, boxB, connector]);
    expect(path).not.toBeNull();
    // Auto-resolves to bottom → top
    expect(path?.points[0]).toEqual({ col: 5, row: 5 }); // bottom of A (col 0+floor(10/2)=5, row 0+5=5)
    expect(path?.points[path?.points.length - 1]).toEqual({ col: 5, row: 9 }); // top of B (col 0+5=5, row 10-1=9)
  });

  it("uses pinned sides from connector properties", () => {
    const boxA = makeBox("a", 0, 0, 10, 5);
    const boxB = makeBox("b", 20, 0, 10, 5);
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "a",
      toId: "b",
      fromSide: "right" as const,
      toSide: "left" as const,
      position: { col: 0, row: 0 },
      zIndex: 2,
      layerId: "layer-1",
    };
    const path = resolveConnectorPath(connector, [boxA, boxB, connector]);
    expect(path).not.toBeNull();
    expect(path?.points[0]).toEqual({ col: 10, row: 2 }); // right of A
    expect(path?.points[path?.points.length - 1]).toEqual({ col: 19, row: 2 }); // left of B
  });

  it("routes from bottom to top for upper-to-lower stage flows with horizontal overlap", () => {
    const upperStage = makeBox("a", 0, 16, 34, 5);
    const lowerStage = makeBox("b", 20, 24, 50, 5);
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "a",
      toId: "b",
      position: { col: 0, row: 0 },
      zIndex: 2,
      layerId: "layer-1",
    };
    const path = resolveConnectorPath(connector, [
      upperStage,
      lowerStage,
      connector,
    ]);
    expect(path).not.toBeNull();
    expect(path?.points[0]).toEqual({ col: 17, row: 21 });
    expect(path?.points[path.points.length - 1]).toEqual({ col: 45, row: 23 });
  });

  it("normalizes pinned perpendicular routes so they do not emit duplicate waypoints", () => {
    const inspiration = makeBox("inspiration", 21, 9, 50, 5);
    const discovery = makeBox("discovery", 1, 17, 34, 5);
    const intelligence = makeBox("intelligence", 57, 17, 34, 5);
    const connector = {
      id: "c1",
      type: "connector" as const,
      fromId: "inspiration",
      toId: "discovery",
      toSide: "top" as const,
      position: { col: 0, row: 0 },
      zIndex: 2,
      layerId: "layer-1",
    };

    const path = resolveConnectorPath(connector, [
      inspiration,
      discovery,
      intelligence,
      {
        id: "c2",
        type: "connector" as const,
        fromId: "inspiration",
        toId: "intelligence",
        toSide: "top" as const,
        position: { col: 0, row: 0 },
        zIndex: 3,
        layerId: "layer-1",
      },
      connector,
    ]);

    expect(path).not.toBeNull();
    expect(path?.points).toEqual([
      { col: 38, row: 14 },
      { col: 38, row: 15 },
      { col: 18, row: 15 },
      { col: 18, row: 16 },
    ]);
  });

  it("fans out sibling connectors from the same parent along a shared bottom edge", () => {
    const inspiration = makeBox("inspiration", 21, 9, 50, 5);
    const discovery = makeBox("discovery", 1, 17, 34, 5);
    const intelligence = makeBox("intelligence", 57, 17, 34, 5);
    const leftConnector = {
      id: "left",
      type: "connector" as const,
      fromId: "inspiration",
      toId: "discovery",
      toSide: "top" as const,
      position: { col: 0, row: 0 },
      zIndex: 1,
      layerId: "layer-1",
    };
    const rightConnector = {
      id: "right",
      type: "connector" as const,
      fromId: "inspiration",
      toId: "intelligence",
      toSide: "top" as const,
      position: { col: 0, row: 0 },
      zIndex: 2,
      layerId: "layer-1",
    };

    const leftPath = resolveConnectorPath(leftConnector, [
      inspiration,
      discovery,
      intelligence,
      leftConnector,
      rightConnector,
    ]);
    const rightPath = resolveConnectorPath(rightConnector, [
      inspiration,
      discovery,
      intelligence,
      leftConnector,
      rightConnector,
    ]);

    expect(leftPath?.points[0]).toEqual({ col: 38, row: 14 });
    expect(rightPath?.points[0]).toEqual({ col: 53, row: 14 });
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
      "right",
    );
  });
  it("left", () => {
    expect(getSegmentDirection({ col: 5, row: 0 }, { col: 0, row: 0 })).toBe(
      "left",
    );
  });
  it("down", () => {
    expect(getSegmentDirection({ col: 0, row: 0 }, { col: 0, row: 5 })).toBe(
      "down",
    );
  });
  it("up", () => {
    expect(getSegmentDirection({ col: 0, row: 5 }, { col: 0, row: 0 })).toBe(
      "up",
    );
  });
});
