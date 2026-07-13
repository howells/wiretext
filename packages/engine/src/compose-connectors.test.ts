import { describe, expect, it } from "vitest";

import { compose, getConnectorMidpoint, gridToString } from "./compose";
import { must } from "./test-utils";
import type { BoxObject, ConnectorObject, GridPoint } from "./types";

const makeConnector = (
  overrides: Partial<ConnectorObject> = {}
): ConnectorObject => ({
  fromId: "a",
  id: "c1",
  layerId: "layer-1",
  position: { col: 0, row: 0 },
  toId: "b",
  type: "connector",
  zIndex: 2,
  ...overrides,
});

describe("compose", () => {
  // ─── Connectors ──────────────────────────────────────────────────────
  describe("connectors", () => {
    const boxA: BoxObject = {
      borderStyle: "single",
      height: 5,
      id: "a",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 10,
      zIndex: 0,
    };

    const boxB: BoxObject = {
      borderStyle: "single",
      height: 5,
      id: "b",
      layerId: "layer-1",
      position: { col: 0, row: 10 },
      type: "box",
      width: 10,
      zIndex: 1,
    };

    it("renders a straight vertical connector between vertically stacked boxes", () => {
      const connector = makeConnector();
      const result = gridToString(
        compose([boxA, boxB, connector], { cols: 20, rows: 20 })
      );
      // Connector should be vertical between row 5 (bottom of A) and row 9 (top of B)
      expect(result).toContain("│");
    });

    it("renders a vertical connector with arrow head at the end", () => {
      const connector = makeConnector({ endHead: true });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Arrow head should be at the last point (row 9, col 5 = midpoint of boxes)
      expect(must(grid[9])[5]).toBe("↓");
    });

    it("renders arrow heads at both ends when startHead is true", () => {
      const connector = makeConnector({ endHead: true, startHead: true });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Start head points away from box A, end head towards box B
      expect(must(grid[5])[5]).toBe("↑");
      expect(must(grid[9])[5]).toBe("↓");
    });

    it("renders no arrow heads when both are false", () => {
      const connector = makeConnector({ endHead: false, startHead: false });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // All intermediate cells should be │, not arrow chars
      for (let r = 5; r <= 9; r += 1) {
        expect(must(grid[r])[5]).toBe("│");
      }
    });

    it("renders an L-shaped connector between offset boxes", () => {
      const rightBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "b",
        layerId: "layer-1",
        position: { col: 20, row: 10 },
        type: "box",
        width: 10,
        zIndex: 1,
      };
      const connector = makeConnector();
      const result = gridToString(
        compose([boxA, rightBox, connector], { cols: 40, rows: 20 })
      );
      // Should contain both horizontal and vertical segments
      expect(result).toContain("─");
      expect(result).toContain("│");
    });

    it("renders corner characters at path bends", () => {
      const rightBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "b",
        layerId: "layer-1",
        position: { col: 20, row: 10 },
        type: "box",
        width: 10,
        zIndex: 1,
      };
      const connector = makeConnector();
      const grid = compose([boxA, rightBox, connector], { cols: 40, rows: 20 });
      // The path goes bottom of A → down → right → top of B
      // This should produce at least one corner character
      const cornerChars = ["┌", "┐", "└", "┘"];
      const result = gridToString(grid);
      const hasCorner = cornerChars.some((c) => result.includes(c));
      expect(hasCorner).toBe(true);
    });

    it("skips rendering when fromId object is missing", () => {
      const connector = makeConnector({ fromId: "missing" });
      // Should not throw
      const grid = compose([boxB, connector], { cols: 20, rows: 20 });
      expect(grid).toBeDefined();
    });

    it("skips rendering when toId object is missing", () => {
      const connector = makeConnector({ toId: "missing" });
      const grid = compose([boxA, connector], { cols: 20, rows: 20 });
      expect(grid).toBeDefined();
    });

    it("renders horizontal connector between side-by-side boxes", () => {
      const leftBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "a",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const rightBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "b",
        layerId: "layer-1",
        position: { col: 20, row: 0 },
        type: "box",
        width: 10,
        zIndex: 1,
      };
      const connector = makeConnector();
      const grid = compose([leftBox, rightBox, connector], {
        cols: 40,
        rows: 10,
      });
      // Connector exits right side of leftBox (col 10) → enters left of rightBox (col 19)
      // Middle row is row 2 (floor(5/2))
      // Check that the horizontal line exists
      expect(must(grid[2])[10]).toBe("─");
      expect(must(grid[2])[15]).toBe("─");
    });

    it("renders label on a vertical connector centered at the midpoint", () => {
      const connector = makeConnector({ label: "API" });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Vertical connector goes from row 5 to row 9 at col 5
      // Midpoint is row 7, label centered on col 5 (width 3 → starts at col 4)
      expect(must(grid[7])[4]).toBe("A");
      expect(must(grid[7])[5]).toBe("P");
      expect(must(grid[7])[6]).toBe("I");
    });

    it("renders label on a horizontal connector one row above the line", () => {
      const leftBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "a",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const rightBox: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "b",
        layerId: "layer-1",
        position: { col: 20, row: 0 },
        type: "box",
        width: 10,
        zIndex: 1,
      };
      const connector = makeConnector({ label: "data" });
      const grid = compose([leftBox, rightBox, connector], {
        cols: 40,
        rows: 10,
      });
      // Horizontal connector at row 2, label should be one row above at row 1
      const row1 = must(grid[1]).join("");
      expect(row1).toContain("data");
      // The connector line at row 2 should remain intact
      expect(must(grid[2])[15]).toBe("─");
    });

    it("truncates long connector labels", () => {
      const connector = makeConnector({
        label: "This is a very long label that exceeds twenty",
      });
      const grid = compose([boxA, boxB, connector], { cols: 40, rows: 20 });
      const result = gridToString(grid);
      expect(result).toContain("…");
      // Should not contain the full original text
      expect(result).not.toContain("twenty");
    });

    it("does not render label when label is undefined", () => {
      const connector = makeConnector();
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Midpoint row 7 should only have the vertical line char at col 5
      for (let c = 0; c < 20; c += 1) {
        expect(must(grid[7])[c]).toBe(c === 5 ? "│" : " ");
      }
    });

    it("does not render label when label is empty string", () => {
      const connector = makeConnector({ label: "" });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Should behave the same as no label
      for (let c = 0; c < 20; c += 1) {
        expect(must(grid[7])[c]).toBe(c === 5 ? "│" : " ");
      }
    });
  });
});

describe("getConnectorMidpoint", () => {
  it("returns the midpoint of a single horizontal segment", () => {
    const points: GridPoint[] = [
      { col: 0, row: 5 },
      { col: 10, row: 5 },
    ];
    // totalLength = 10, halfLen = 5; midpoint is 5 cols in from (0, 5)
    expect(getConnectorMidpoint(points)).toEqual({
      col: 5,
      isHorizontal: true,
      row: 5,
    });
  });

  it("returns the midpoint of a single vertical segment", () => {
    const points: GridPoint[] = [
      { col: 3, row: 0 },
      { col: 3, row: 8 },
    ];
    // totalLength = 8, halfLen = 4; midpoint is 4 rows down from (3, 0)
    expect(getConnectorMidpoint(points)).toEqual({
      col: 3,
      isHorizontal: false,
      row: 4,
    });
  });

  it("finds the midpoint on the correct segment of a multi-segment L-shaped path", () => {
    const points: GridPoint[] = [
      { col: 0, row: 0 },
      { col: 0, row: 5 },
      { col: 8, row: 5 },
    ];
    // Segment 1 (vertical): length 5. Segment 2 (horizontal): length 8.
    // totalLength = 13, halfLen = 6.5.
    // 6.5 falls within segment 2: remaining = 6.5 - 5 = 1.5, Math.round(1.5) = 2.
    // Midpoint lands on the horizontal segment at (0 + 2, 5).
    expect(getConnectorMidpoint(points)).toEqual({
      col: 2,
      isHorizontal: true,
      row: 5,
    });
  });

  it("returns the fallback origin for an empty path", () => {
    expect(getConnectorMidpoint([])).toEqual({
      col: 0,
      isHorizontal: true,
      row: 0,
    });
  });
});
