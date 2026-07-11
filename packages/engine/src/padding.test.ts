import { describe, expect, it } from "vitest";

import { getContentBounds } from "./bounds";
import { addPadding, prepareForExport, shiftObjects } from "./padding";
import { must, mustBeArrow, mustBeBox, mustBeLine } from "./test-utils";
import type { WireObject } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBox = (
  col: number,
  row: number,
  width = 10,
  height = 5
): WireObject => ({
  borderStyle: "single",
  height,
  id: `box-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "box",
  width,
  zIndex: 0,
});

const makeText = (col: number, row: number, content = "hello"): WireObject => ({
  content,
  id: `text-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "text",
  zIndex: 0,
});

const makeArrow = (
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): WireObject => ({
  endPosition: { col: endCol, row: endRow },
  id: `arrow-${startCol}-${startRow}`,
  layerId: "layer-1",
  position: { col: startCol, row: startRow },
  type: "arrow",
  zIndex: 0,
});

const makeLine = (
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): WireObject => ({
  endPosition: { col: endCol, row: endRow },
  id: `line-${startCol}-${startRow}`,
  layerId: "layer-1",
  position: { col: startCol, row: startRow },
  type: "line",
  zIndex: 0,
});

// ---------------------------------------------------------------------------
// getContentBounds
// ---------------------------------------------------------------------------

describe("getContentBounds", () => {
  it("returns null for empty array", () => {
    expect(getContentBounds([])).toBeNull();
  });

  it("returns bounds for a single box", () => {
    const bounds = getContentBounds([makeBox(5, 3, 10, 5)]);
    expect(bounds).toEqual({ maxCol: 15, maxRow: 8, minCol: 5, minRow: 3 });
  });

  it("returns bounds for a single text object", () => {
    const bounds = getContentBounds([makeText(2, 4, "hi")]);
    expect(bounds).toEqual({ maxCol: 4, maxRow: 5, minCol: 2, minRow: 4 });
  });

  it("returns bounds for an arrow", () => {
    const bounds = getContentBounds([makeArrow(10, 5, 20, 15)]);
    expect(bounds).toEqual({
      maxCol: 21,
      maxRow: 16,
      minCol: 10,
      minRow: 5,
    });
  });

  it("returns bounds for a reversed arrow (endPosition < position)", () => {
    const bounds = getContentBounds([makeArrow(20, 15, 10, 5)]);
    expect(bounds).toEqual({
      maxCol: 21,
      maxRow: 16,
      minCol: 10,
      minRow: 5,
    });
  });

  it("computes envelope across multiple objects", () => {
    const bounds = getContentBounds([
      makeBox(0, 0, 10, 5),
      makeBox(50, 20, 10, 5),
    ]);
    expect(bounds).toEqual({
      maxCol: 60,
      maxRow: 25,
      minCol: 0,
      minRow: 0,
    });
  });

  it("handles objects at the origin", () => {
    const bounds = getContentBounds([makeBox(0, 0, 5, 3)]);
    expect(bounds).toEqual({ maxCol: 5, maxRow: 3, minCol: 0, minRow: 0 });
  });

  it("handles multiline text", () => {
    const bounds = getContentBounds([makeText(3, 2, "hello\nworld!")]);
    expect(bounds).toEqual({ maxCol: 9, maxRow: 4, minCol: 3, minRow: 2 });
  });
});

// ---------------------------------------------------------------------------
// shiftObjects
// ---------------------------------------------------------------------------

describe("shiftObjects", () => {
  it("shifts box positions", () => {
    const shifted = shiftObjects([makeBox(5, 3)], 2, 4);
    expect(must(shifted[0]).position).toEqual({ col: 7, row: 7 });
  });

  it("shifts text positions", () => {
    const shifted = shiftObjects([makeText(0, 0)], 1, 1);
    expect(must(shifted[0]).position).toEqual({ col: 1, row: 1 });
  });

  it("shifts arrow position and endPosition", () => {
    const shifted = shiftObjects([makeArrow(5, 3, 15, 10)], 3, 2);
    expect(must(shifted[0]).position).toEqual({ col: 8, row: 5 });
    expect(mustBeArrow(shifted[0]).endPosition).toEqual({
      col: 18,
      row: 12,
    });
  });

  it("shifts line position and endPosition", () => {
    const shifted = shiftObjects([makeLine(0, 0, 10, 5)], 5, 5);
    expect(must(shifted[0]).position).toEqual({ col: 5, row: 5 });
    expect(mustBeLine(shifted[0]).endPosition).toEqual({
      col: 15,
      row: 10,
    });
  });

  it("returns shallow copies when delta is zero", () => {
    const original = [makeBox(5, 3)];
    const shifted = shiftObjects(original, 0, 0);
    expect(shifted[0]).not.toBe(original[0]);
    expect(must(shifted[0]).position).toEqual(must(original[0]).position);
  });

  it("supports negative deltas", () => {
    const shifted = shiftObjects([makeBox(10, 10)], -5, -3);
    expect(must(shifted[0]).position).toEqual({ col: 5, row: 7 });
  });

  it("does not mutate original objects", () => {
    const original = makeBox(5, 3);
    const copy = { ...original, position: { ...original.position } };
    shiftObjects([original], 10, 10);
    expect(original).toEqual(copy);
  });

  it("preserves all non-position properties", () => {
    const obj = makeBox(5, 3, 20, 10);
    const shifted = shiftObjects([obj], 1, 1);
    const shiftedBox = mustBeBox(shifted[0]);
    expect(shiftedBox.id).toBe(obj.id);
    expect(shiftedBox.type).toBe("box");
    expect(shiftedBox.zIndex).toBe(obj.zIndex);
    expect(shiftedBox.layerId).toBe(obj.layerId);
    expect(shiftedBox.width).toBe(20);
    expect(shiftedBox.height).toBe(10);
  });

  it("handles mixed object types", () => {
    const shifted = shiftObjects(
      [makeBox(0, 0), makeText(5, 5), makeArrow(10, 10, 20, 20)],
      3,
      2
    );
    expect(must(shifted[0]).position).toEqual({ col: 3, row: 2 });
    expect(must(shifted[1]).position).toEqual({ col: 8, row: 7 });
    expect(must(shifted[2]).position).toEqual({ col: 13, row: 12 });
    expect(mustBeArrow(shifted[2]).endPosition).toEqual({
      col: 23,
      row: 22,
    });
  });
});

// ---------------------------------------------------------------------------
// addPadding
// ---------------------------------------------------------------------------

describe("addPadding", () => {
  it("returns empty array for empty input", () => {
    expect(addPadding([])).toEqual([]);
  });

  it("shifts objects at (0,0) to (1,1) with default padding", () => {
    const result = addPadding([makeBox(0, 0)]);
    expect(must(result[0]).position).toEqual({ col: 1, row: 1 });
  });

  it("does not shift objects already at padding boundary", () => {
    const original = makeBox(1, 1);
    const result = addPadding([original], 1);
    expect(must(result[0]).position).toEqual({ col: 1, row: 1 });
  });

  it("does not shift objects already beyond padding", () => {
    const result = addPadding([makeBox(5, 5)], 1);
    expect(must(result[0]).position).toEqual({ col: 5, row: 5 });
  });

  it("only shifts the axis that needs it", () => {
    const result = addPadding([makeBox(0, 5)], 1);
    expect(must(result[0]).position).toEqual({ col: 1, row: 5 });
  });

  it("respects custom padding value", () => {
    const result = addPadding([makeBox(0, 0)], 3);
    expect(must(result[0]).position).toEqual({ col: 3, row: 3 });
  });

  it("shifts all objects by the same delta", () => {
    const result = addPadding([makeBox(0, 0), makeBox(10, 10)], 1);
    expect(must(result[0]).position).toEqual({ col: 1, row: 1 });
    expect(must(result[1]).position).toEqual({ col: 11, row: 11 });
  });

  it("shifts based on the closest-to-origin object", () => {
    const result = addPadding([makeBox(5, 0), makeBox(0, 5)], 1);
    // minCol=0 needs +1, minRow=0 needs +1
    expect(must(result[0]).position).toEqual({ col: 6, row: 1 });
    expect(must(result[1]).position).toEqual({ col: 1, row: 6 });
  });

  it("shifts arrows including endPosition", () => {
    const result = addPadding([makeArrow(0, 0, 10, 5)], 1);
    expect(must(result[0]).position).toEqual({ col: 1, row: 1 });
    expect(mustBeArrow(result[0]).endPosition).toEqual({
      col: 11,
      row: 6,
    });
  });

  it("does not mutate original objects", () => {
    const obj = makeBox(0, 0);
    const copy = { ...obj, position: { ...obj.position } };
    addPadding([obj]);
    expect(obj).toEqual(copy);
  });

  it("handles padding of 0", () => {
    const result = addPadding([makeBox(0, 0)], 0);
    expect(must(result[0]).position).toEqual({ col: 0, row: 0 });
  });
});

// ---------------------------------------------------------------------------
// prepareForExport
// ---------------------------------------------------------------------------

describe("prepareForExport", () => {
  it("returns empty result for empty objects", () => {
    const result = prepareForExport([]);
    expect(result.objects).toEqual([]);
    expect(result.gridSize).toEqual({ cols: 1, rows: 1 });
  });

  it("shifts a single box to start at padding offset", () => {
    const result = prepareForExport([makeBox(50, 30, 10, 5)], 1);
    expect(must(result.objects[0]).position).toEqual({ col: 1, row: 1 });
    expect(result.gridSize).toEqual({ cols: 12, rows: 7 });
  });

  it("produces tight grid for objects at origin", () => {
    const result = prepareForExport([makeBox(0, 0, 10, 5)], 1);
    expect(must(result.objects[0]).position).toEqual({ col: 1, row: 1 });
    expect(result.gridSize).toEqual({ cols: 12, rows: 7 });
  });

  it("handles multiple objects with spread-out positions", () => {
    const result = prepareForExport(
      [makeBox(10, 10, 10, 5), makeBox(30, 20, 10, 5)],
      1
    );
    // Content: col 10-40, row 10-25 → size 30x15
    // With padding 1 on each side: 32x17
    expect(result.gridSize).toEqual({ cols: 32, rows: 17 });
    // First box shifted: 10-10+1 = 1
    expect(must(result.objects[0]).position).toEqual({ col: 1, row: 1 });
    // Second box shifted: 30-10+1 = 21
    expect(must(result.objects[1]).position).toEqual({ col: 21, row: 11 });
  });

  it("handles arrows correctly", () => {
    const result = prepareForExport([makeArrow(5, 3, 15, 10)], 1);
    expect(must(result.objects[0]).position).toEqual({ col: 1, row: 1 });
    const arrow = mustBeArrow(result.objects[0]);
    expect(arrow.endPosition).toEqual({ col: 11, row: 8 });
  });

  it("respects custom padding", () => {
    const result = prepareForExport([makeBox(0, 0, 10, 5)], 2);
    expect(must(result.objects[0]).position).toEqual({ col: 2, row: 2 });
    expect(result.gridSize).toEqual({ cols: 14, rows: 9 });
  });

  it("does not mutate original objects", () => {
    const obj = makeBox(50, 30);
    const originalPos = { ...obj.position };
    prepareForExport([obj]);
    expect(obj.position).toEqual(originalPos);
  });

  it("handles objects with mixed types", () => {
    const result = prepareForExport(
      [makeBox(0, 0, 10, 5), makeText(12, 6, "note"), makeArrow(0, 8, 20, 8)],
      1
    );
    // minCol=0, minRow=0, maxCol=21 (arrow endCol+1), maxRow=9 (arrow endRow+1)
    // Content: 21 x 9
    // Grid: 21+2 x 9+2 = 23 x 11
    expect(result.gridSize).toEqual({ cols: 23, rows: 11 });
    expect(result.objects).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// getContentBounds + addPadding integration
// ---------------------------------------------------------------------------

describe("padding integration", () => {
  it("after addPadding, content bounds start at >= padding", () => {
    const padded = addPadding([makeBox(0, 0, 10, 5), makeText(0, 5, "hi")], 1);
    const bounds = getContentBounds(padded);
    expect(bounds).not.toBeNull();
    expect(bounds?.minCol).toBeGreaterThanOrEqual(1);
    expect(bounds?.minRow).toBeGreaterThanOrEqual(1);
  });

  it("preserves relative positions between objects", () => {
    const original = [makeBox(0, 0), makeBox(10, 10)];
    const padded = addPadding(original, 1);
    const dx =
      must(padded[1]).position.col -
      must(padded[0]).position.col -
      (must(original[1]).position.col - must(original[0]).position.col);
    const dy =
      must(padded[1]).position.row -
      must(padded[0]).position.row -
      (must(original[1]).position.row - must(original[0]).position.row);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });
});
