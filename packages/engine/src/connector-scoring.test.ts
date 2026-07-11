import { describe, expect, it } from "vitest";

import { resolveAutoSides, resolveConnectorPath } from "./connector-scoring";
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

describe("resolveConnectorPath", () => {
  it("returns null when fromId object is missing", () => {
    const connector = {
      fromId: "missing",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "b",
      type: "connector" as const,
      zIndex: 0,
    };
    const objects = [makeBox("b", 0, 10)];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("returns null when toId object is missing", () => {
    const connector = {
      fromId: "a",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "missing",
      type: "connector" as const,
      zIndex: 0,
    };
    const objects = [makeBox("a", 0, 0)];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("returns null when referenced object is not rect-bounded (text)", () => {
    const connector = {
      fromId: "a",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "t",
      type: "connector" as const,
      zIndex: 0,
    };
    const objects = [
      makeBox("a", 0, 0),
      {
        content: "hello",
        id: "t",
        layerId: "layer-1",
        position: { col: 0, row: 10 },
        type: "text" as const,
        zIndex: 1,
      },
    ];
    expect(resolveConnectorPath(connector, objects)).toBeNull();
  });

  it("computes a path between two vertically stacked boxes", () => {
    const boxA = makeBox("a", 0, 0, 10, 5);
    const boxB = makeBox("b", 0, 10, 10, 5);
    const connector = {
      fromId: "a",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "b",
      type: "connector" as const,
      zIndex: 2,
    };
    const path = resolveConnectorPath(connector, [boxA, boxB, connector]);
    expect(path).not.toBeNull();
    // Auto-resolves to bottom → top
    // bottom of A (col 0+floor(10/2)=5, row 0+5=5)
    expect(path?.points[0]).toEqual({ col: 5, row: 5 });
    // top of B (col 0+5=5, row 10-1=9)
    expect(path?.points[path?.points.length - 1]).toEqual({ col: 5, row: 9 });
  });

  it("uses pinned sides from connector properties", () => {
    const boxA = makeBox("a", 0, 0, 10, 5);
    const boxB = makeBox("b", 20, 0, 10, 5);
    const connector = {
      fromId: "a",
      fromSide: "right" as const,
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "b",
      toSide: "left" as const,
      type: "connector" as const,
      zIndex: 2,
    };
    const path = resolveConnectorPath(connector, [boxA, boxB, connector]);
    expect(path).not.toBeNull();
    // right of A
    expect(path?.points[0]).toEqual({ col: 10, row: 2 });
    // left of B
    expect(path?.points[path?.points.length - 1]).toEqual({ col: 19, row: 2 });
  });

  it("routes from bottom to top for upper-to-lower stage flows with horizontal overlap", () => {
    const upperStage = makeBox("a", 0, 16, 34, 5);
    const lowerStage = makeBox("b", 20, 24, 50, 5);
    const connector = {
      fromId: "a",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "b",
      type: "connector" as const,
      zIndex: 2,
    };
    const path = resolveConnectorPath(connector, [
      upperStage,
      lowerStage,
      connector,
    ]);
    expect(path).not.toBeNull();
    expect(path?.points[0]).toEqual({ col: 17, row: 21 });
    expect(path?.points.at(-1)).toEqual({ col: 45, row: 23 });
  });

  it("normalizes pinned perpendicular routes so they do not emit duplicate waypoints", () => {
    const inspiration = makeBox("inspiration", 21, 9, 50, 5);
    const discovery = makeBox("discovery", 1, 17, 34, 5);
    const intelligence = makeBox("intelligence", 57, 17, 34, 5);
    const connector = {
      fromId: "inspiration",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "discovery",
      toSide: "top" as const,
      type: "connector" as const,
      zIndex: 2,
    };

    const path = resolveConnectorPath(connector, [
      inspiration,
      discovery,
      intelligence,
      {
        fromId: "inspiration",
        id: "c2",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        toId: "intelligence",
        toSide: "top" as const,
        type: "connector" as const,
        zIndex: 3,
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
      fromId: "inspiration",
      id: "left",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "discovery",
      toSide: "top" as const,
      type: "connector" as const,
      zIndex: 1,
    };
    const rightConnector = {
      fromId: "inspiration",
      id: "right",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "intelligence",
      toSide: "top" as const,
      type: "connector" as const,
      zIndex: 2,
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
