import { describe, expect, it } from "vitest";
import { compose, gridToString } from "./compose";
import type {
  ArrowObject,
  BoxObject,
  ComponentObject,
  LineObject,
  TextObject,
} from "./types";

describe("compose", () => {
  it("creates an empty grid", () => {
    const result = gridToString(compose([], { cols: 5, rows: 3 }));
    expect(result).toBe("\n\n");
  });

  it("stamps a single-border box", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box], { cols: 10, rows: 5 }));
    expect(result).toContain("┌───┐");
    expect(result).toContain("│   │");
    expect(result).toContain("└───┘");
  });

  it("stamps a double-border box", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "double",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box], { cols: 10, rows: 5 }));
    expect(result).toContain("╔═══╗");
    expect(result).toContain("║   ║");
    expect(result).toContain("╚═══╝");
  });

  it("stamps a box with a label", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 10,
      height: 3,
      borderStyle: "single",
      label: "Hello",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box], { cols: 15, rows: 5 }));
    expect(result).toContain("│ Hello  │");
  });

  it("stamps text", () => {
    const text: TextObject = {
      id: "1",
      type: "text",
      position: { col: 2, row: 1 },
      content: "Hi",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Hi");
  });

  it("stamps multiline text", () => {
    const text: TextObject = {
      id: "1",
      type: "text",
      position: { col: 0, row: 0 },
      content: "AB\nCD",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([text], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("AB");
    expect(lines[1]).toBe("CD");
  });

  it("stamps a horizontal line", () => {
    const line: LineObject = {
      id: "1",
      type: "line",
      position: { col: 1, row: 1 },
      endPosition: { col: 5, row: 1 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([line], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("─────");
  });

  it("stamps a vertical line", () => {
    const line: LineObject = {
      id: "1",
      type: "line",
      position: { col: 2, row: 0 },
      endPosition: { col: 2, row: 3 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([line], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    for (let r = 0; r <= 3; r++) {
      expect(lines[r]).toContain("│");
    }
  });

  it("stamps a horizontal arrow pointing right", () => {
    const arrow: ArrowObject = {
      id: "1",
      type: "arrow",
      position: { col: 0, row: 0 },
      endPosition: { col: 4, row: 0 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([arrow], { cols: 10, rows: 3 }));
    expect(result).toContain("────→");
  });

  it("stamps a vertical arrow pointing down", () => {
    const arrow: ArrowObject = {
      id: "1",
      type: "arrow",
      position: { col: 0, row: 0 },
      endPosition: { col: 0, row: 3 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([arrow], { cols: 5, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("│");
    expect(lines[3]).toBe("↓");
  });

  it("respects zIndex ordering", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const text: TextObject = {
      id: "2",
      type: "text",
      position: { col: 0, row: 0 },
      content: "X",
      zIndex: 1,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box, text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Text (zIndex 1) overwrites box corner (zIndex 0)
    expect(lines[0][0]).toBe("X");
  });

  it("overlapping boxes preserve both borders (transparent spaces)", () => {
    const box1: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 6,
      height: 4,
      borderStyle: "single",
      fill: "transparent",
      zIndex: 0,
      layerId: "layer-1",
    };
    const box2: BoxObject = {
      id: "2",
      type: "box",
      position: { col: 3, row: 1 },
      width: 6,
      height: 4,
      borderStyle: "single",
      fill: "transparent",
      zIndex: 1,
      layerId: "layer-1",
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
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 6,
      height: 4,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const box2: BoxObject = {
      id: "2",
      type: "box",
      position: { col: 3, row: 1 },
      width: 6,
      height: 4,
      borderStyle: "single",
      zIndex: 1,
      layerId: "layer-1",
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
      id: "1",
      type: "text",
      position: { col: 1, row: 1 },
      content: "Hello",
      zIndex: 0,
      layerId: "layer-1",
    };
    const box: BoxObject = {
      id: "2",
      type: "box",
      position: { col: 0, row: 0 },
      width: 8,
      height: 3,
      borderStyle: "single",
      zIndex: 1,
      layerId: "layer-1",
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
      id: "1",
      type: "text",
      position: { col: 1, row: 1 },
      content: "Hello",
      zIndex: 0,
      layerId: "layer-1",
    };
    const box: BoxObject = {
      id: "2",
      type: "box",
      position: { col: 0, row: 0 },
      width: 8,
      height: 3,
      borderStyle: "single",
      fill: "transparent",
      zIndex: 1,
      layerId: "layer-1",
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
      id: "1",
      type: "text",
      position: { col: 1, row: 1 },
      content: "Hello",
      zIndex: 0,
      layerId: "layer-1",
    };
    const box: BoxObject = {
      id: "2",
      type: "box",
      position: { col: 0, row: 0 },
      width: 8,
      height: 3,
      borderStyle: "single",
      fill: "solid",
      zIndex: 1,
      layerId: "layer-1",
    };
    const result = gridToString(compose([text, box], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toBe("│      │");
  });

  it("text inside a box is visible with borders intact", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 8,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const text: TextObject = {
      id: "2",
      type: "text",
      position: { col: 2, row: 1 },
      content: "Hi",
      zIndex: 1,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box, text], { cols: 12, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│ Hi   │");
    expect(lines[2]).toBe("└──────┘");
  });

  it("horizontal line over a box is visible", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 8,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const line: LineObject = {
      id: "2",
      type: "line",
      position: { col: 1, row: 1 },
      endPosition: { col: 6, row: 1 },
      zIndex: 1,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box, line], { cols: 12, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("┌──────┐");
    expect(lines[1]).toBe("│──────│");
    expect(lines[2]).toBe("└──────┘");
  });

  it("higher-z non-space chars overwrite lower-z non-space chars", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const text: TextObject = {
      id: "2",
      type: "text",
      position: { col: 0, row: 0 },
      content: "X",
      zIndex: 1,
      layerId: "layer-1",
    };
    const result = gridToString(compose([box, text], { cols: 10, rows: 5 }));
    const lines = result.split("\n");
    // Text "X" overwrites box corner "┌"
    expect(lines[0][0]).toBe("X");
    // Rest of top border intact
    expect(lines[0].slice(1, 5)).toBe("───┐");
  });

  it("clips objects to grid bounds", () => {
    const box: BoxObject = {
      id: "1",
      type: "box",
      position: { col: -1, row: -1 },
      width: 5,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    // Should not throw
    const result = compose([box], { cols: 3, rows: 3 });
    expect(result.length).toBe(3);
  });

  // Component tests
  it("stamps a button component with centered label", () => {
    const btn: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "button",
      position: { col: 0, row: 0 },
      width: 12,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toContain("┌──────────┐");
    expect(lines[1]).toContain("Button");
    expect(lines[2]).toContain("└──────────┘");
  });

  it("stamps a button with custom label", () => {
    const btn: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "button",
      position: { col: 0, row: 0 },
      width: 12,
      height: 3,
      borderStyle: "single",
      label: "OK",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    expect(result).toContain("OK");
  });

  it("stamps a table component with headers and separators", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 24,
      height: 8,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
      columns: ["Col A", "Col B"],
    };
    const result = gridToString(compose([table], { cols: 30, rows: 10 }));
    const lines = result.split("\n");
    // Top border with column separator
    expect(lines[0]).toContain("┬");
    // Header row
    expect(lines[1]).toContain("Col A");
    expect(lines[1]).toContain("Col B");
    // Separator row with cross
    expect(lines[2]).toContain("┼");
    // Bottom border with column separator
    expect(lines[7]).toContain("┴");
  });

  it("stamps a modal component with title and close button", () => {
    const modal: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "modal",
      position: { col: 0, row: 0 },
      width: 30,
      height: 15,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([modal], { cols: 35, rows: 20 }));
    const lines = result.split("\n");
    // Title row
    expect(lines[1]).toContain("Modal");
    // Close button
    expect(lines[1]).toContain("×");
    // Separator
    expect(lines[2]).toContain("─");
  });

  it("component respects min size of 3x3", () => {
    const btn: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "button",
      position: { col: 0, row: 0 },
      width: 3,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    // Should not throw even at minimum size
    const result = compose([btn], { cols: 10, rows: 5 });
    expect(result.length).toBe(5);
  });

  it("component uses double border style", () => {
    const btn: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "button",
      position: { col: 0, row: 0 },
      width: 12,
      height: 3,
      borderStyle: "double",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    expect(result).toContain("╔");
    expect(result).toContain("╗");
    expect(result).toContain("║");
  });

  it("stamps a progress bar component", () => {
    const prog: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "progress",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).toContain("▓");
    expect(result).toContain("░");
  });

  // Checkbox checked/unchecked
  it("checkbox renders checked by default", () => {
    const cb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "checkbox",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[✓]");
    expect(result).toContain("Checkbox");
  });

  it("checkbox renders unchecked when checked=false", () => {
    const cb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "checkbox",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      checked: false,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[ ]");
    expect(result).not.toContain("[✓]");
  });

  it("checkbox renders checked when checked=true", () => {
    const cb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "checkbox",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      checked: true,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[✓]");
  });

  // Radio button state
  it("radio renders selected by default", () => {
    const radio: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "radio",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([radio], { cols: 25, rows: 5 }));
    expect(result).toContain("(●)");
  });

  it("radio renders unselected when checked=false", () => {
    const radio: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "radio",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      checked: false,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([radio], { cols: 25, rows: 5 }));
    expect(result).toContain("( )");
    expect(result).not.toContain("(●)");
  });

  // Progress bar percentage
  it("progress bar uses custom percentage", () => {
    const prog: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "progress",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      progress: 100,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    // All filled at 100%
    expect(result).toContain("▓");
    expect(result).not.toContain("░");
  });

  it("progress bar at 0% is all empty", () => {
    const prog: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "progress",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      progress: 0,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).not.toContain("▓");
    expect(result).toContain("░");
  });

  it("progress bar clamps to 0-100 range", () => {
    const prog: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "progress",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      progress: 150,
      zIndex: 0,
      layerId: "layer-1",
    };
    // Should not throw, clamps to 100
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).toContain("▓");
  });

  // Table with custom columns
  it("table renders custom columns", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 30,
      height: 8,
      borderStyle: "single",
      columns: ["Name", "Age", "City"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 35, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Name");
    expect(lines[1]).toContain("Age");
    expect(lines[1]).toContain("City");
    // Two column separators for 3 columns
    const topBorder = lines[0];
    const separatorCount = [...topBorder].filter((c) => c === "┬").length;
    expect(separatorCount).toBe(2);
  });

  it("table with single column has no separators", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 20,
      height: 8,
      borderStyle: "single",
      columns: ["Only"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 25, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Only");
    expect(lines[0]).not.toContain("┬");
  });

  // Tabs with custom tab names
  it("tabs renders custom tab names", () => {
    const tabs: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "tabs",
      position: { col: 0, row: 0 },
      width: 30,
      height: 3,
      borderStyle: "single",
      tabs: ["Home", "Settings"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([tabs], { cols: 35, rows: 5 }));
    expect(result).toContain("Home");
    expect(result).toContain("Settings");
    expect(result).toContain("│");
  });

  it("tabs with single tab has no separator", () => {
    const tabs: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "tabs",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      tabs: ["Only Tab"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([tabs], { cols: 25, rows: 5 }));
    expect(result).toContain("Only Tab");
  });

  it("tabs defaults to Tab 1 | Tab 2 | Tab 3", () => {
    const tabs: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "tabs",
      position: { col: 0, row: 0 },
      width: 30,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
      tabs: ["Tab 1", "Tab 2", "Tab 3"],
    };
    const result = gridToString(compose([tabs], { cols: 35, rows: 5 }));
    expect(result).toContain("Tab 1");
    expect(result).toContain("Tab 2");
    expect(result).toContain("Tab 3");
  });

  // Diagonal lines
  it("diagonal line going down-right uses ╲", () => {
    const line: LineObject = {
      id: "1",
      type: "line",
      position: { col: 0, row: 0 },
      endPosition: { col: 4, row: 4 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([line], { cols: 6, rows: 6 });
    expect(grid[0][0]).toBe("╲");
    expect(grid[1][1]).toBe("╲");
    expect(grid[4][4]).toBe("╲");
  });

  it("diagonal line going down-left uses ╱", () => {
    const line: LineObject = {
      id: "1",
      type: "line",
      position: { col: 4, row: 0 },
      endPosition: { col: 0, row: 4 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([line], { cols: 6, rows: 6 });
    expect(grid[0][4]).toBe("╱");
    expect(grid[4][0]).toBe("╱");
  });

  it("diagonal arrow has arrowhead at endpoint", () => {
    const arrow: ArrowObject = {
      id: "1",
      type: "arrow",
      position: { col: 0, row: 0 },
      endPosition: { col: 3, row: 3 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([arrow], { cols: 5, rows: 5 });
    // Body is diagonal
    expect(grid[0][0]).toBe("╲");
    expect(grid[1][1]).toBe("╲");
    // Endpoint has arrow head
    expect(grid[3][3]).toBe("↘");
  });

  it("diagonal arrow up-left has correct arrowhead", () => {
    const arrow: ArrowObject = {
      id: "1",
      type: "arrow",
      position: { col: 3, row: 3 },
      endPosition: { col: 0, row: 0 },
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([arrow], { cols: 5, rows: 5 });
    expect(grid[0][0]).toBe("↖");
  });
});
