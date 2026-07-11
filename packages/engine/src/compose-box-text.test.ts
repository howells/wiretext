import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type {
  ArrowObject,
  BoxObject,
  ComponentObject,
  LineObject,
  TextObject,
} from "./types";

const makeComponent = (
  componentType: ComponentObject["componentType"],
  width: number,
  height: number,
  overrides: Partial<ComponentObject> = {}
): ComponentObject => ({
  borderStyle: "single",
  componentType,
  height,
  id: "1",
  layerId: "layer-1",
  position: { col: 0, row: 0 },
  type: "component",
  width,
  zIndex: 0,
  ...overrides,
});

describe("compose", () => {
  it("creates an empty grid", () => {
    const result = gridToString(compose([], { cols: 5, rows: 3 }));
    expect(result).toBe("\n\n");
  });

  it("stamps a single-border box", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([box], { cols: 10, rows: 5 }));
    expect(result).toContain("┌───┐");
    expect(result).toContain("│   │");
    expect(result).toContain("└───┘");
  });

  it("stamps a double-border box", () => {
    const box: BoxObject = {
      borderStyle: "double",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([box], { cols: 10, rows: 5 }));
    expect(result).toContain("╔═══╗");
    expect(result).toContain("║   ║");
    expect(result).toContain("╚═══╝");
  });

  it("stamps a box with a label", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "1",
      label: "Hello",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([box], { cols: 15, rows: 5 }));
    expect(result).toContain("│ Hello  │");
  });

  it("stamps text", () => {
    const text: TextObject = {
      content: "Hi",
      id: "1",
      layerId: "layer-1",
      position: { col: 2, row: 1 },
      type: "text",
      zIndex: 0,
    };
    const result = gridToString(compose([text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Hi");
  });

  it("stamps multiline text", () => {
    const text: TextObject = {
      content: "AB\nCD",
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "text",
      zIndex: 0,
    };
    const result = gridToString(compose([text], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("AB");
    expect(lines[1]).toBe("CD");
  });

  it("stamps a horizontal line", () => {
    const line: LineObject = {
      endPosition: { col: 5, row: 1 },
      id: "1",
      layerId: "layer-1",
      position: { col: 1, row: 1 },
      type: "line",
      zIndex: 0,
    };
    const result = gridToString(compose([line], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("─────");
  });

  it("stamps a vertical line", () => {
    const line: LineObject = {
      endPosition: { col: 2, row: 3 },
      id: "1",
      layerId: "layer-1",
      position: { col: 2, row: 0 },
      type: "line",
      zIndex: 0,
    };
    const result = gridToString(compose([line], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    for (let r = 0; r <= 3; r += 1) {
      expect(lines[r]).toContain("│");
    }
  });

  it("stamps a horizontal arrow pointing right", () => {
    const arrow: ArrowObject = {
      endPosition: { col: 4, row: 0 },
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "arrow",
      zIndex: 0,
    };
    const result = gridToString(compose([arrow], { cols: 10, rows: 3 }));
    expect(result).toContain("────→");
  });

  it("stamps a vertical arrow pointing down", () => {
    const arrow: ArrowObject = {
      endPosition: { col: 0, row: 3 },
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "arrow",
      zIndex: 0,
    };
    const result = gridToString(compose([arrow], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("│");
    expect(lines[3]).toBe("↓");
  });

  // Diagonal lines
  it("diagonal line going down-right uses ╲", () => {
    const line: LineObject = {
      endPosition: { col: 4, row: 4 },
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "line",
      zIndex: 0,
    };
    const grid = compose([line], { cols: 6, rows: 6 });
    expect(must(grid[0])[0]).toBe("╲");
    expect(must(grid[1])[1]).toBe("╲");
    expect(must(grid[4])[4]).toBe("╲");
  });

  it("diagonal line going down-left uses ╱", () => {
    const line: LineObject = {
      endPosition: { col: 0, row: 4 },
      id: "1",
      layerId: "layer-1",
      position: { col: 4, row: 0 },
      type: "line",
      zIndex: 0,
    };
    const grid = compose([line], { cols: 6, rows: 6 });
    expect(must(grid[0])[4]).toBe("╱");
    expect(must(grid[4])[0]).toBe("╱");
  });

  it("diagonal arrow has arrowhead at endpoint", () => {
    const arrow: ArrowObject = {
      endPosition: { col: 3, row: 3 },
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "arrow",
      zIndex: 0,
    };
    const grid = compose([arrow], { cols: 5, rows: 5 });
    // Body is diagonal
    expect(must(grid[0])[0]).toBe("╲");
    expect(must(grid[1])[1]).toBe("╲");
    // Endpoint has arrow head
    expect(must(grid[3])[3]).toBe("↘");
  });

  it("diagonal arrow up-left has correct arrowhead", () => {
    const arrow: ArrowObject = {
      endPosition: { col: 0, row: 0 },
      id: "1",
      layerId: "layer-1",
      position: { col: 3, row: 3 },
      type: "arrow",
      zIndex: 0,
    };
    const grid = compose([arrow], { cols: 5, rows: 5 });
    expect(must(grid[0])[0]).toBe("↖");
  });

  // ─── Double-width Unicode character support ──────────────────────────
  // Only CJK / fullwidth / emoji chars are genuinely 2x wide.
  // All icon chars (⍥ ★ ◉ etc.) are 1x in Geist Mono.
  describe("wide character support", () => {
    it("CJK char gets shadow cell after it", () => {
      const text: TextObject = {
        content: "中B",
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 0,
      };
      const grid = compose([text], { cols: 10, rows: 1 });
      expect(must(grid[0])[0]).toBe("中");
      // shadow
      expect(must(grid[0])[1]).toBe("\u0000");
      expect(must(grid[0])[2]).toBe("B");
    });

    it("gridToString skips shadow cells from CJK chars", () => {
      const text: TextObject = {
        content: "A中B",
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 0,
      };
      const result = gridToString(compose([text], { cols: 10, rows: 1 }));
      expect(result).toBe("A中B");
      expect(result).not.toContain("\u0000");
    });

    it("CJK char at grid edge is skipped (no half-char)", () => {
      const text: TextObject = {
        content: "中",
        id: "1",
        layerId: "layer-1",
        position: { col: 2, row: 0 },
        type: "text",
        zIndex: 0,
      };
      // Grid is 3 cols wide, placing at col 2 means shadow at col 3 = out of bounds
      const grid = compose([text], { cols: 3, rows: 1 });
      // wide char should not be placed
      expect(must(grid[0])[2]).toBe(" ");
    });

    it("overwriting a CJK char cleans up its shadow", () => {
      const text1: TextObject = {
        content: "中",
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 0,
      };
      const text2: TextObject = {
        content: "AB",
        id: "2",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 1,
      };
      const grid = compose([text1, text2], { cols: 10, rows: 1 });
      expect(must(grid[0])[0]).toBe("A");
      expect(must(grid[0])[1]).toBe("B");
      // No orphaned shadow
      expect(must(grid[0])[2]).toBe(" ");
    });

    it("⍥ ★ ◉ are all single-width (no shadow cells)", () => {
      const text: TextObject = {
        content: "⍥★◉",
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 0,
      };
      const grid = compose([text], { cols: 10, rows: 1 });
      // Each char occupies exactly 1 cell, no shadows
      expect(must(grid[0])[0]).toBe("⍥");
      expect(must(grid[0])[1]).toBe("★");
      expect(must(grid[0])[2]).toBe("◉");
      expect(must(grid[0])[3]).toBe(" ");
    });

    it("icon component with ⍥ renders without breaking borders", () => {
      const icon = makeComponent("icon", 5, 3, { icon: "⍥" });
      const grid = compose([icon], { cols: 10, rows: 5 });
      const result = gridToString(grid);
      expect(result).toContain("⍥");
      expect(result).not.toContain("\u0000");
    });

    it("multiline text with icon chars aligns correctly", () => {
      const text: TextObject = {
        content: "⍥A\nB★",
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "text",
        zIndex: 0,
      };
      const result = gridToString(compose([text], { cols: 10, rows: 2 }));
      const lines = result.split("\n");
      expect(lines[0]).toBe("⍥A");
      expect(lines[1]).toBe("B★");
    });

    it("box with CJK label centers correctly with shadow", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 3,
        id: "1",
        label: "中",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const result = gridToString(compose([box], { cols: 15, rows: 5 }));
      expect(result).toContain("中");
      expect(result).not.toContain("\u0000");
      expect(result).toContain("┌────────┐");
      expect(result).toContain("└────────┘");
    });

    it("divider with ★ label renders correctly", () => {
      const divider = makeComponent("divider", 12, 1, { label: "★" });
      const result = gridToString(compose([divider], { cols: 15, rows: 1 }));
      // ★ is 1 display col: "──── ★ ─────"
      expect(result).toContain("★");
      expect(result).not.toContain("\u0000");
      expect(result.startsWith("──")).toBe(true);
    });

    it("avatar default ⍥ renders within borders", () => {
      const avatar = makeComponent("avatar", 5, 3);
      const grid = compose([avatar], { cols: 10, rows: 5 });
      const result = gridToString(grid);
      expect(result).toContain("⍥");
      expect(result).not.toContain("\u0000");
      expect(result).toContain("┐");
      expect(result).toContain("┘");
    });
  });

  // ─── Multiline box labels ──────────────────────────────────────────
  describe("multiline box labels", () => {
    it("single-line label renders at same row as before (regression)", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 5,
        id: "1",
        label: "Hello",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 12,
        zIndex: 0,
      };
      const grid = compose([box], { cols: 15, rows: 7 });
      // row + Math.floor(height / 2) = 0 + Math.floor(5/2) = 2
      const labelRow = must(grid[2]);
      expect(labelRow.join("")).toContain("Hello");
    });

    it("renders two-line label centered vertically and horizontally", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 6,
        id: "1",
        label: "Line 1\nLine 2",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 14,
        zIndex: 0,
      };
      const result = gridToString(compose([box], { cols: 18, rows: 8 }));
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
    });

    it("clips excess lines that do not fit in interior height", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 4,
        id: "1",
        label: "A\nB\nC\nD\nE",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 12,
        zIndex: 0,
      };
      const result = gridToString(compose([box], { cols: 15, rows: 6 }));
      // Interior height = 4 - 2 = 2, so only first 2 lines visible
      expect(result).toContain("A");
      expect(result).toContain("B");
      expect(result).not.toContain("C");
    });

    it("vertically centers odd line count in even interior", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 6,
        id: "1",
        label: "X",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 12,
        zIndex: 0,
      };
      // height 6 → interior 4, single-line label at Math.floor(6/2)=3
      const grid = compose([box], { cols: 15, rows: 8 });
      expect(must(grid[3]).join("")).toContain("X");
    });

    it("vertically centers two lines in height=6 box", () => {
      const box: BoxObject = {
        borderStyle: "single",
        height: 6,
        id: "1",
        label: "AA\nBB",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 12,
        zIndex: 0,
      };
      // Interior height = 4, 2 lines → startRow = 0 + 1 + floor((4-2)/2) = 2
      const grid = compose([box], { cols: 15, rows: 8 });
      expect(must(grid[2]).join("")).toContain("AA");
      expect(must(grid[3]).join("")).toContain("BB");
    });
  });
});
