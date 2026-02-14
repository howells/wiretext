import { describe, expect, it } from "vitest";
import { getEffectiveGridSize } from "./grid-size";
import type {
  ArrowObject,
  BoxObject,
  GridSize,
  LineObject,
  TextObject,
} from "./types";

const DEFAULT_MIN: GridSize = { cols: 120, rows: 60 };

describe("getEffectiveGridSize", () => {
  it("returns minSize for empty objects array", () => {
    expect(getEffectiveGridSize([], DEFAULT_MIN)).toEqual(DEFAULT_MIN);
  });

  it("returns minSize when objects fit within it", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 5, row: 5 },
      width: 10,
      height: 5,
      borderStyle: "single",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([box], DEFAULT_MIN);
    // box ends at col 15, row 10 — well within 120×60
    expect(result).toEqual(DEFAULT_MIN);
  });

  it("expands beyond minSize when objects exceed it", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 110, row: 50 },
      width: 20,
      height: 15,
      borderStyle: "single",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([box], DEFAULT_MIN);
    // box ends at col 130, row 65 → + 20 padding = 150, 85
    expect(result.cols).toBe(150);
    expect(result.rows).toBe(85);
  });

  it("handles text objects", () => {
    const text: TextObject = {
      id: "1",
      type: "text",
      position: { col: 115, row: 55 },
      content: "Hello\nWorld!",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([text], DEFAULT_MIN);
    // text: width = max(5, 6) = 6, height = 2
    // ends at col 121, row 57 → + 20 padding = 141, 77
    expect(result.cols).toBe(141);
    expect(result.rows).toBe(77);
  });

  it("handles line/arrow objects", () => {
    const arrow: ArrowObject = {
      id: "1",
      type: "arrow",
      position: { col: 100, row: 50 },
      endPosition: { col: 130, row: 70 },
      zIndex: 0,
    };
    const result = getEffectiveGridSize([arrow], DEFAULT_MIN);
    // bounds: col=100, row=50, width=31, height=21
    // ends at col 131, row 71 → + 20 = 151, 91
    expect(result.cols).toBe(151);
    expect(result.rows).toBe(91);
  });

  it("considers multiple objects and takes the max extent", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 10,
      height: 5,
      borderStyle: "single",
      zIndex: 0,
    };
    const line: LineObject = {
      id: "2",
      type: "line",
      position: { col: 0, row: 0 },
      endPosition: { col: 200, row: 100 },
      zIndex: 1,
    };
    const result = getEffectiveGridSize([box, line], DEFAULT_MIN);
    // line ends at col 201, row 101 → + 20 = 221, 121
    expect(result.cols).toBe(221);
    expect(result.rows).toBe(121);
  });

  it("caps at 2000×2000", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 1990, row: 1990 },
      width: 100,
      height: 100,
      borderStyle: "single",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([box], DEFAULT_MIN);
    expect(result.cols).toBe(2000);
    expect(result.rows).toBe(2000);
  });

  it("respects custom padding", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 110, row: 50 },
      width: 20,
      height: 15,
      borderStyle: "single",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([box], DEFAULT_MIN, 5);
    // box ends at col 130, row 65 → + 5 padding = 135, 70
    expect(result.cols).toBe(135);
    expect(result.rows).toBe(70);
  });

  it("uses minSize when padding alone would shrink below it", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
    };
    const result = getEffectiveGridSize([box], DEFAULT_MIN, 0);
    // box ends at col 5, row 3 — much smaller than minSize
    expect(result).toEqual(DEFAULT_MIN);
  });
});
