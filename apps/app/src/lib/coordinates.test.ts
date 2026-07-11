import type {
  ArrowObject,
  BoxObject,
  CharMetrics,
  LineObject,
  TextObject,
  Viewport,
  WireObject,
} from "@wiretext/engine";
import { describe, expect, it } from "vitest";

import {
  fitViewport,
  gridToScreen,
  screenToGrid,
  shiftObjectsForRender,
} from "./coordinates";

const METRICS: CharMetrics = { charWidth: 8.4, lineHeight: 21 };

const DEFAULT_VIEWPORT: Viewport = { panX: 0, panY: 0, zoom: 1 };

const makeBox = (
  col: number,
  row: number,
  width: number,
  height: number
): BoxObject => ({
  borderStyle: "single",
  height,
  id: `box-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "box",
  width,
  zIndex: 0,
});

const makeLine = (
  col: number,
  row: number,
  endCol: number,
  endRow: number
): LineObject => ({
  endPosition: { col: endCol, row: endRow },
  id: `line-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "line",
  zIndex: 0,
});

const makeArrow = (
  col: number,
  row: number,
  endCol: number,
  endRow: number
): ArrowObject => ({
  endPosition: { col: endCol, row: endRow },
  id: `arrow-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "arrow",
  zIndex: 0,
});

const makeText = (col: number, row: number, content: string): TextObject => ({
  content,
  id: `text-${col}-${row}`,
  layerId: "layer-1",
  position: { col, row },
  type: "text",
  zIndex: 0,
});

// ─── screenToGrid ──────────────────────────────────────

describe("screenToGrid", () => {
  it("converts origin screen position to grid (0,0)", () => {
    const pt = screenToGrid(0, 0, DEFAULT_VIEWPORT, METRICS);
    expect(pt).toEqual({ col: 0, row: 0 });
  });

  it("maps screen pixel to correct grid cell", () => {
    // At x=42 (5 * 8.4), y=63 (3 * 21) → col=5, row=3
    const pt = screenToGrid(42, 63, DEFAULT_VIEWPORT, METRICS);
    expect(pt).toEqual({ col: 5, row: 3 });
  });

  it("floors partial cells", () => {
    // x=10 is within the first cell (8.4px wide), so col=1
    const pt = screenToGrid(10, 25, DEFAULT_VIEWPORT, METRICS);
    expect(pt).toEqual({ col: 1, row: 1 });
  });

  it("accounts for pan offset", () => {
    const viewport: Viewport = { panX: 84, panY: 42, zoom: 1 };
    // Screen (84, 42) → world (0, 0) → grid (0, 0)
    const pt = screenToGrid(84, 42, viewport, METRICS);
    expect(pt).toEqual({ col: 0, row: 0 });
  });

  it("accounts for zoom", () => {
    const viewport: Viewport = { panX: 0, panY: 0, zoom: 2 };
    // Screen (16.8, 42) → world (8.4, 21) → grid (1, 1)
    const pt = screenToGrid(16.8, 42, viewport, METRICS);
    expect(pt).toEqual({ col: 1, row: 1 });
  });

  it("returns negative grid coords for screen positions above/left of origin", () => {
    const viewport: Viewport = { panX: 100, panY: 100, zoom: 1 };
    // Screen (0, 0) → world (-100, -100) → grid (-12, -5)
    const pt = screenToGrid(0, 0, viewport, METRICS);
    expect(pt.col).toBeLessThan(0);
    expect(pt.row).toBeLessThan(0);
  });
});

// ─── gridToScreen ──────────────────────────────────────

describe("gridToScreen", () => {
  it("converts grid origin to screen (panX, panY)", () => {
    const viewport: Viewport = { panX: 50, panY: 30, zoom: 1 };
    const pos = gridToScreen(0, 0, viewport, METRICS);
    expect(pos).toEqual({ x: 50, y: 30 });
  });

  it("maps grid cell to correct screen pixel", () => {
    const pos = gridToScreen(5, 3, DEFAULT_VIEWPORT, METRICS);
    expect(pos.x).toBeCloseTo(5 * 8.4);
    expect(pos.y).toBeCloseTo(3 * 21);
  });

  it("accounts for zoom", () => {
    const viewport: Viewport = { panX: 0, panY: 0, zoom: 2 };
    const pos = gridToScreen(1, 1, viewport, METRICS);
    expect(pos.x).toBeCloseTo(8.4 * 2);
    expect(pos.y).toBeCloseTo(21 * 2);
  });

  it("is the inverse of screenToGrid (cell center)", () => {
    // gridToScreen returns the top-left corner of a cell. Due to Math.floor in
    // screenToGrid, exact boundary pixels can round down from floating-point
    // drift. Adding half a cell offset places us safely inside the cell.
    const viewport: Viewport = { panX: 120, panY: 80, zoom: 1.5 };
    const col = 7;
    const row = 4;
    const screen = gridToScreen(col, row, viewport, METRICS);
    const halfCellX = (METRICS.charWidth * viewport.zoom) / 2;
    const halfCellY = (METRICS.lineHeight * viewport.zoom) / 2;
    const grid = screenToGrid(
      screen.x + halfCellX,
      screen.y + halfCellY,
      viewport,
      METRICS
    );
    expect(grid).toEqual({ col, row });
  });
});

// ─── shiftObjectsForRender ─────────────────────────────

describe("shiftObjectsForRender", () => {
  it("returns objects unmodified when all positions are non-negative", () => {
    const objects: WireObject[] = [makeBox(5, 3, 10, 5)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(0);
    expect(result.originRow).toBe(0);
    // Same reference — no copy is made when nothing shifts
    expect(result.renderObjects).toBe(objects);
  });

  it("shifts a box with negative row to row 0", () => {
    const objects: WireObject[] = [makeBox(5, -10, 10, 5)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(0);
    expect(result.originRow).toBe(-10);
    expect(result.renderObjects[0]?.position).toEqual({ col: 5, row: 0 });
  });

  it("shifts a box with negative col to col 0", () => {
    const objects: WireObject[] = [makeBox(-8, 3, 10, 5)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-8);
    expect(result.originRow).toBe(0);
    expect(result.renderObjects[0]?.position).toEqual({ col: 0, row: 3 });
  });

  it("shifts both col and row when both are negative", () => {
    const objects: WireObject[] = [makeBox(-5, -3, 10, 5)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-5);
    expect(result.originRow).toBe(-3);
    expect(result.renderObjects[0]?.position).toEqual({ col: 0, row: 0 });
  });

  it("uses the most-negative position as the origin", () => {
    const objects: WireObject[] = [
      makeBox(-2, 5, 10, 5),
      makeBox(3, -7, 10, 5),
    ];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-2);
    expect(result.originRow).toBe(-7);
    expect(result.renderObjects[0]?.position).toEqual({ col: 0, row: 12 });
    expect(result.renderObjects[1]?.position).toEqual({ col: 5, row: 0 });
  });

  it("shifts line endPosition along with position", () => {
    const objects: WireObject[] = [makeLine(-5, -3, 10, 8)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-5);
    expect(result.originRow).toBe(-3);
    const [shifted] = result.renderObjects;
    if (shifted?.type !== "line") {
      throw new Error("expected a line object");
    }
    expect(shifted.position).toEqual({ col: 0, row: 0 });
    expect(shifted.endPosition).toEqual({ col: 15, row: 11 });
  });

  it("shifts arrow endPosition along with position", () => {
    const objects: WireObject[] = [makeArrow(2, -4, -3, 6)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-3);
    expect(result.originRow).toBe(-4);
    const [shifted] = result.renderObjects;
    if (shifted?.type !== "arrow") {
      throw new Error("expected an arrow object");
    }
    expect(shifted.position).toEqual({ col: 5, row: 0 });
    expect(shifted.endPosition).toEqual({ col: 0, row: 10 });
  });

  it("considers line endPosition when computing origin", () => {
    // Position is positive, but endPosition is negative
    const objects: WireObject[] = [makeLine(5, 5, -3, -2)];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-3);
    expect(result.originRow).toBe(-2);
    const [shifted] = result.renderObjects;
    if (shifted?.type !== "line") {
      throw new Error("expected a line object");
    }
    expect(shifted.position).toEqual({ col: 8, row: 7 });
    expect(shifted.endPosition).toEqual({ col: 0, row: 0 });
  });

  it("does not mutate original objects", () => {
    const box = makeBox(-5, -3, 10, 5);
    const objects: WireObject[] = [box];
    shiftObjectsForRender(objects);
    expect(box.position).toEqual({ col: -5, row: -3 });
  });

  it("preserves non-position properties", () => {
    const box = makeBox(-2, -1, 15, 8);
    const objects: WireObject[] = [box];
    const result = shiftObjectsForRender(objects);
    const [shifted] = result.renderObjects;
    if (shifted?.type !== "box") {
      throw new Error("expected a box object");
    }
    expect(shifted.id).toBe(box.id);
    expect(shifted.type).toBe("box");
    expect(shifted.width).toBe(15);
    expect(shifted.height).toBe(8);
    expect(shifted.borderStyle).toBe("single");
  });

  it("handles text objects at negative positions", () => {
    const objects: WireObject[] = [makeText(-3, -2, "hello")];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-3);
    expect(result.originRow).toBe(-2);
    expect(result.renderObjects[0]?.position).toEqual({ col: 0, row: 0 });
  });

  it("handles mixed positive and negative objects", () => {
    const objects: WireObject[] = [
      makeBox(0, 0, 10, 5),
      makeBox(-5, -3, 8, 4),
      makeText(20, 10, "hi"),
    ];
    const result = shiftObjectsForRender(objects);
    expect(result.originCol).toBe(-5);
    expect(result.originRow).toBe(-3);
    // Original (0,0) box shifts to (5,3)
    expect(result.renderObjects[0]?.position).toEqual({ col: 5, row: 3 });
    // Negative box shifts to (0,0)
    expect(result.renderObjects[1]?.position).toEqual({ col: 0, row: 0 });
    // Positive text shifts by the same offset
    expect(result.renderObjects[2]?.position).toEqual({ col: 25, row: 13 });
  });

  it("returns empty array for empty input", () => {
    const result = shiftObjectsForRender([]);
    expect(result.renderObjects).toEqual([]);
    expect(result.originCol).toBe(0);
    expect(result.originRow).toBe(0);
  });
});

// ─── fitViewport ───────────────────────────────────────

describe("fitViewport", () => {
  const CANVAS_W = 1000;
  const CANVAS_H = 800;

  it("returns default viewport for empty objects", () => {
    const vp = fitViewport([], CANVAS_W, CANVAS_H, METRICS);
    expect(vp).toEqual({ panX: 0, panY: 0, zoom: 1 });
  });

  it("keeps zoom at 1 when content fits in canvas", () => {
    // Small box: 10 cols * 8.4 = 84px wide, 5 rows * 21 = 105px tall
    const objects: WireObject[] = [makeBox(0, 0, 10, 5)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBe(1);
  });

  it("centers content horizontally and vertically", () => {
    // Box at (0,0) with width=10, height=5
    // Content: 84px wide, 105px tall
    // Canvas: 1000x800
    // Expected: centered with padding
    const objects: WireObject[] = [makeBox(0, 0, 10, 5)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);

    // The center of content should map to the center of canvas
    // Center col = (0 + 10) / 2, center row = (0 + 5) / 2
    const contentCenterCol = 5;
    const contentCenterRow = 2.5;
    const screenCenter = gridToScreen(
      contentCenterCol,
      contentCenterRow,
      vp,
      METRICS
    );

    expect(screenCenter.x).toBeCloseTo(CANVAS_W / 2, 0);
    expect(screenCenter.y).toBeCloseTo(CANVAS_H / 2, 0);
  });

  it("zooms out when content is too wide", () => {
    // 200 cols * 8.4 = 1680px — wider than 1000px canvas
    const objects: WireObject[] = [makeBox(0, 0, 200, 5)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBeLessThan(1);
  });

  it("zooms out when content is too tall", () => {
    // 50 rows * 21 = 1050px — taller than 800px canvas
    const objects: WireObject[] = [makeBox(0, 0, 10, 50)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBeLessThan(1);
  });

  it("does not zoom in past 1", () => {
    // Tiny content: 2 cols, 2 rows
    const objects: WireObject[] = [makeBox(0, 0, 2, 2)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBe(1);
  });

  it("clamps zoom to minimum 0.25", () => {
    // Enormous content that would need very small zoom
    const objects: WireObject[] = [makeBox(0, 0, 2000, 2000)];
    const vp = fitViewport(objects, 200, 200, METRICS);
    expect(vp.zoom).toBe(0.25);
  });

  it("handles objects not at the origin", () => {
    // Box starts at (50, 30), not (0,0)
    const objects: WireObject[] = [makeBox(50, 30, 10, 5)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBe(1);

    // Top-left of box should be visible (positive screen coords)
    const topLeft = gridToScreen(50, 30, vp, METRICS);
    expect(topLeft.x).toBeGreaterThan(0);
    expect(topLeft.y).toBeGreaterThan(0);

    // Bottom-right should also be visible (within canvas)
    const bottomRight = gridToScreen(60, 35, vp, METRICS);
    expect(bottomRight.x).toBeLessThan(CANVAS_W);
    expect(bottomRight.y).toBeLessThan(CANVAS_H);
  });

  it("handles multiple objects spanning a large area", () => {
    const objects: WireObject[] = [
      makeBox(0, 0, 10, 5),
      makeBox(100, 40, 10, 5),
    ];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);

    // Both objects should be visible
    const tl1 = gridToScreen(0, 0, vp, METRICS);
    const br2 = gridToScreen(110, 45, vp, METRICS);
    expect(tl1.x).toBeGreaterThanOrEqual(0);
    expect(tl1.y).toBeGreaterThanOrEqual(0);
    expect(br2.x).toBeLessThanOrEqual(CANVAS_W);
    expect(br2.y).toBeLessThanOrEqual(CANVAS_H);
  });

  it("handles objects at negative positions", () => {
    const objects: WireObject[] = [makeBox(-10, -5, 20, 10)];
    const vp = fitViewport(objects, CANVAS_W, CANVAS_H, METRICS);
    expect(vp.zoom).toBe(1);

    // Content center should be near canvas center
    const center = gridToScreen(0, 0, vp, METRICS);
    expect(center.x).toBeGreaterThan(0);
    expect(center.y).toBeGreaterThan(0);
  });
});

// ─── Pre position consistency with gridToScreen ────────

describe("pre position consistency", () => {
  it("shifted pre position matches gridToScreen for objects at origin", () => {
    const objects: WireObject[] = [makeBox(5, 3, 10, 5)];
    const { originCol, originRow } = shiftObjectsForRender(objects);
    const viewport: Viewport = { panX: 100, panY: 80, zoom: 1 };

    // Pre is positioned at:
    const preLeft =
      viewport.panX + originCol * METRICS.charWidth * viewport.zoom;
    const preTop =
      viewport.panY + originRow * METRICS.lineHeight * viewport.zoom;

    // gridToScreen for (5, 3) — where the box is in original coords:
    const screen = gridToScreen(5, 3, viewport, METRICS);

    // The box renders at shifted position (5, 3) in the pre (since origin is 0,0)
    // Its pixel offset from pre top-left: 5 * charWidth * zoom, 3 * lineHeight * zoom
    const textPixelX = preLeft + 5 * METRICS.charWidth * viewport.zoom;
    const textPixelY = preTop + 3 * METRICS.lineHeight * viewport.zoom;

    expect(textPixelX).toBeCloseTo(screen.x);
    expect(textPixelY).toBeCloseTo(screen.y);
  });

  it("shifted pre position matches gridToScreen for negative positions", () => {
    const objects: WireObject[] = [makeBox(-5, -3, 10, 5)];
    const { renderObjects, originCol, originRow } =
      shiftObjectsForRender(objects);
    const viewport: Viewport = { panX: 200, panY: 150, zoom: 0.8 };

    // Pre position with origin shift
    const preLeft =
      viewport.panX + originCol * METRICS.charWidth * viewport.zoom;
    const preTop =
      viewport.panY + originRow * METRICS.lineHeight * viewport.zoom;

    // The box's shifted position in the grid (both shift to 0)
    const shiftedCol = renderObjects[0]?.position.col ?? Number.NaN;
    const shiftedRow = renderObjects[0]?.position.row ?? Number.NaN;

    // Pixel position of the box text in the pre
    const textPixelX = preLeft + shiftedCol * METRICS.charWidth * viewport.zoom;
    const textPixelY = preTop + shiftedRow * METRICS.lineHeight * viewport.zoom;

    // gridToScreen for the ORIGINAL position (-5, -3)
    const screen = gridToScreen(-5, -3, viewport, METRICS);

    expect(textPixelX).toBeCloseTo(screen.x);
    expect(textPixelY).toBeCloseTo(screen.y);
  });

  it("alignment holds at various zoom levels", () => {
    const objects: WireObject[] = [
      makeBox(-10, -5, 20, 10),
      makeBox(5, 3, 8, 4),
    ];
    const { renderObjects, originCol, originRow } =
      shiftObjectsForRender(objects);

    for (const zoom of [0.25, 0.5, 1, 2, 4]) {
      const viewport: Viewport = { panX: 300, panY: 200, zoom };
      const preLeft =
        viewport.panX + originCol * METRICS.charWidth * viewport.zoom;
      const preTop =
        viewport.panY + originRow * METRICS.lineHeight * viewport.zoom;

      // Check both objects
      for (const [i, obj] of objects.entries()) {
        const rendered = renderObjects[i];
        if (!rendered) {
          throw new Error(`missing render object at index ${i}`);
        }
        const origPos = obj.position;
        const shiftedPos = rendered.position;

        const textX =
          preLeft + shiftedPos.col * METRICS.charWidth * viewport.zoom;
        const textY =
          preTop + shiftedPos.row * METRICS.lineHeight * viewport.zoom;
        const screen = gridToScreen(
          origPos.col,
          origPos.row,
          viewport,
          METRICS
        );

        expect(textX).toBeCloseTo(screen.x, 5);
        expect(textY).toBeCloseTo(screen.y, 5);
      }
    }
  });
});
