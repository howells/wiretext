import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type { BoxObject, LineObject, TextObject } from "./types";

describe("compose", () => {
  it("respects zIndex ordering", () => {
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
    const text: TextObject = {
      content: "X",
      id: "2",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "text",
      zIndex: 1,
    };
    const result = gridToString(compose([box, text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Text (zIndex 1) overwrites box corner (zIndex 0)
    expect(must(lines[0])[0]).toBe("X");
  });

  it("overlapping boxes preserve both borders (transparent spaces)", () => {
    const box1: BoxObject = {
      borderStyle: "single",
      fill: "transparent",
      height: 4,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 6,
      zIndex: 0,
    };
    const box2: BoxObject = {
      borderStyle: "single",
      fill: "transparent",
      height: 4,
      id: "2",
      layerId: "layer-1",
      position: { col: 3, row: 1 },
      type: "box",
      width: 6,
      zIndex: 1,
    };
    const result = gridToString(compose([box1, box2], { cols: 12, rows: 8 }));
    const lines = result.split("\n");
    // box1 top row intact
    expect(lines[0]).toBe("┌────┐");
    // box1 left side + box2 top-left corner overlapping box1 interior
    expect(lines[1]).toBe("│  ┌────┐");
    // box1 left + box2 left + box1 right + box2 right all visible
    expect(lines[2]).toBe("│  │ │  │");
    // box1 bottom + box2 left edge overwrites box1 bottom ─
    expect(lines[3]).toBe("└──│─┘  │");
    // box2 bottom row
    expect(lines[4]).toBe("   └────┘");
  });

  it("opaque box (default) covers content underneath", () => {
    const box1: BoxObject = {
      borderStyle: "single",
      height: 4,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 6,
      zIndex: 0,
    };
    const box2: BoxObject = {
      borderStyle: "single",
      height: 4,
      id: "2",
      layerId: "layer-1",
      position: { col: 3, row: 1 },
      type: "box",
      width: 6,
      zIndex: 1,
    };
    const result = gridToString(compose([box1, box2], { cols: 12, rows: 8 }));
    const lines = result.split("\n");
    // box1 top row intact
    expect(lines[0]).toBe("┌────┐");
    // box2 top overlaps box1 interior
    expect(lines[1]).toBe("│  ┌────┐");
    // box2 interior (opaque) covers box1's right border
    expect(lines[2]).toBe("│  │    │");
    // box2 interior covers box1 bottom
    expect(lines[3]).toBe("└──│    │");
    // box2 bottom row
    expect(lines[4]).toBe("   └────┘");
  });

  it("opaque box covers text underneath", () => {
    const text: TextObject = {
      content: "Hello",
      id: "1",
      layerId: "layer-1",
      position: { col: 1, row: 1 },
      type: "text",
      zIndex: 0,
    };
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "2",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 8,
      zIndex: 1,
    };
    const result = gridToString(compose([text, box], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Box covers the text — interior should be empty spaces
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│      │");
    expect(lines[2]).toBe("└──────┘");
  });

  it("transparent box does not cover text underneath", () => {
    const text: TextObject = {
      content: "Hello",
      id: "1",
      layerId: "layer-1",
      position: { col: 1, row: 1 },
      type: "text",
      zIndex: 0,
    };
    const box: BoxObject = {
      borderStyle: "single",
      fill: "transparent",
      height: 3,
      id: "2",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 8,
      zIndex: 1,
    };
    const result = gridToString(compose([text, box], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Text shows through transparent box
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│Hello │");
    expect(lines[2]).toBe("└──────┘");
  });

  it("explicit fill solid behaves same as default", () => {
    const text: TextObject = {
      content: "Hello",
      id: "1",
      layerId: "layer-1",
      position: { col: 1, row: 1 },
      type: "text",
      zIndex: 0,
    };
    const box: BoxObject = {
      borderStyle: "single",
      fill: "solid",
      height: 3,
      id: "2",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 8,
      zIndex: 1,
    };
    const result = gridToString(compose([text, box], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toBe("│      │");
  });

  it("text inside a box is visible with borders intact", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 8,
      zIndex: 0,
    };
    const text: TextObject = {
      content: "Hi",
      id: "2",
      layerId: "layer-1",
      position: { col: 2, row: 1 },
      type: "text",
      zIndex: 1,
    };
    const result = gridToString(compose([box, text], { cols: 12, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│ Hi   │");
    expect(lines[2]).toBe("└──────┘");
  });

  it("horizontal line over a box is visible", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 8,
      zIndex: 0,
    };
    const line: LineObject = {
      endPosition: { col: 6, row: 1 },
      id: "2",
      layerId: "layer-1",
      position: { col: 1, row: 1 },
      type: "line",
      zIndex: 1,
    };
    const result = gridToString(compose([box, line], { cols: 12, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│──────│");
    expect(lines[2]).toBe("└──────┘");
  });

  it("higher-z non-space chars overwrite lower-z non-space chars", () => {
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
    const text: TextObject = {
      content: "X",
      id: "2",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "text",
      zIndex: 1,
    };
    const result = gridToString(compose([box, text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Text "X" overwrites box corner "┌"
    expect(must(lines[0])[0]).toBe("X");
    // Rest of top border intact
    expect(must(lines[0]).slice(1, 5)).toBe("───┐");
  });

  it("clips objects to grid bounds", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: -1, row: -1 },
      type: "box",
      width: 5,
      zIndex: 0,
    };
    // Should not throw
    const result = compose([box], { cols: 3, rows: 3 });
    expect(result.length).toBe(3);
  });
});
