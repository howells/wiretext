import { describe, expect, it } from "vitest";
import { compose, gridToString } from "./compose";
import type {
  ArrowObject,
  BoxObject,
  ComponentObject,
  ConnectorObject,
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
    // Padding row between title and separator
    expect(lines[2]).not.toContain("─");
    // Separator at row+3
    expect(lines[3]).toContain("─");
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
  it("checkbox renders unchecked by default (checked=undefined)", () => {
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
    expect(result).toContain("[ ]");
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
  it("radio renders unselected by default (checked=undefined)", () => {
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
    expect(result).toContain("( )");
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

  it("table renders filter buttons when filterable=true", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 24,
      height: 8,
      borderStyle: "single",
      columns: ["Name", "Age"],
      filterable: true,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 30, rows: 10 }));
    const lines = result.split("\n");
    // Each column header should have a v filter button
    const headerRow = lines[1];
    // v should appear with a space before and after
    expect(headerRow).toContain("Name");
    // Count filter arrows — one per column
    const vCount = [...headerRow].filter((c) => c === "▾").length;
    expect(vCount).toBe(2);
  });

  it("table does not render filter buttons when filterable is not set", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 24,
      height: 8,
      borderStyle: "single",
      columns: ["Name", "Age"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 30, rows: 10 }));
    const lines = result.split("\n");
    const headerRow = lines[1];
    expect(headerRow).not.toContain("▾");
  });

  // Table data rows
  it("table renders data rows below header", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 30,
      height: 8,
      borderStyle: "single",
      columns: ["Name", "Age", "City"],
      rows: [
        ["Alice", "30", "NYC"],
        ["Bob", "25", "LA"],
      ],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 35, rows: 10 }));
    const lines = result.split("\n");
    // Row 0: top border, Row 1: headers, Row 2: separator, Row 3+: data
    expect(lines[3]).toContain("Alice");
    expect(lines[3]).toContain("30");
    expect(lines[3]).toContain("NYC");
    expect(lines[4]).toContain("Bob");
    expect(lines[4]).toContain("25");
    expect(lines[4]).toContain("LA");
  });

  it("table clips rows that exceed available height", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 20,
      height: 6,
      borderStyle: "single",
      columns: ["Name"],
      rows: [["Alice"], ["Bob"], ["Carol"], ["Dave"]],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 25, rows: 8 }));
    // height=6 → maxVisibleRows = 6-4 = 2, so only Alice and Bob visible
    expect(result).toContain("Alice");
    expect(result).toContain("Bob");
    expect(result).not.toContain("Carol");
    expect(result).not.toContain("Dave");
  });

  it("table truncates long cell values to fit column width", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 20,
      height: 7,
      borderStyle: "single",
      columns: ["Name", "Info"],
      rows: [["VeryLongNameHere", "OK"]],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 25, rows: 9 }));
    // colW = 18/2 = 9, maxCellLen = 9-3 = 6 → "Very…" (truncated)
    expect(result).toContain("…");
    expect(result).toContain("OK");
  });

  it("table renders with no rows when rows is empty", () => {
    const table: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "table",
      position: { col: 0, row: 0 },
      width: 20,
      height: 7,
      borderStyle: "single",
      columns: ["Name"],
      rows: [],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([table], { cols: 25, rows: 9 }));
    expect(result).toContain("Name");
    // Data area should be empty
    const lines = result.split("\n");
    expect(lines[3].trim()).toBe("│                  │");
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

  // input
  it("input renders default label and border", () => {
    const input: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "input",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    expect(result).toContain("┌");
    expect(result).toContain("Input");
  });

  it("input renders custom label at col+2 on the middle row", () => {
    const input: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "input",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      label: "Email",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    // Middle row (row index 1) should contain the label starting at col 2
    expect(lines[1]).toContain("Email");
    expect(lines[1].indexOf("Email")).toBe(2);
  });

  it("input with icon shifts label to col+4", () => {
    const input: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "input",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      icon: "@",
      label: "Search",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    // Icon at col+2, label starts at col+4
    expect(lines[1]).toContain("Search");
    expect(lines[1].indexOf("Search")).toBe(4);
  });

  // select
  it("select renders default label and dropdown arrow", () => {
    const select: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "select",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([select], { cols: 25, rows: 5 }));
    expect(result).toContain("Select");
    expect(result).toContain("▾");
  });

  it("select renders custom label with dropdown arrow at col+width-3", () => {
    const select: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "select",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      label: "Country",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([select], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Country");
    // Arrow is at col+width-3 = 0+20-3 = 17
    expect(lines[1][17]).toBe("▾");
  });

  // navbar
  it("navbar renders hamburger icon and default empty nav items", () => {
    const navbar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "navbar",
      position: { col: 0, row: 0 },
      width: 30,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([navbar], { cols: 35, rows: 5 }));
    expect(result).toContain("=");
  });

  it("navbar renders nav items joined by double spaces", () => {
    const navbar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "navbar",
      position: { col: 0, row: 0 },
      width: 30,
      height: 3,
      borderStyle: "single",
      navItems: ["Home", "About", "Contact"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([navbar], { cols: 35, rows: 5 }));
    expect(result).toContain("Home  About  Contact");
  });

  it("navbar with no navItems renders only the hamburger icon", () => {
    const navbar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "navbar",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      navItems: [],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([navbar], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("=");
    // No item text after the hamburger — between col+3 and right border there are only spaces
    // lines[1] = "│ =               │", right border is the last char
    const innerContent = lines[1].slice(3, -1);
    expect(innerContent.trim()).toBe("");
  });

  // browser
  it("browser renders navigation controls and separator", () => {
    const browser: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 30,
      height: 6,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([browser], { cols: 35, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("< > O");
    // Separator at row+2
    expect(lines[2]).toContain("─");
  });

  it("browser renders custom URL label in the toolbar row", () => {
    const browser: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 30,
      height: 6,
      borderStyle: "single",
      label: "https://example.com",
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([browser], { cols: 35, rows: 10 });
    // URL label is stamped at col+10 = 10
    expect(grid[1][10]).toBe("h");
    expect(grid[1][11]).toBe("t");
    expect(grid[1][12]).toBe("t");
  });

  it("browser skips rendering content when height < 5", () => {
    const browser: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 20,
      height: 4,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([browser], { cols: 25, rows: 8 }));
    // Border is still drawn but no nav controls
    expect(result).not.toContain("<");
  });

  // card
  it("card renders default title and separator", () => {
    const card: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "card",
      position: { col: 0, row: 0 },
      width: 20,
      height: 8,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([card], { cols: 25, rows: 12 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Card");
    // Padding row at lines[2], separator at lines[3]
    expect(lines[3]).toContain("─");
  });

  it("card renders custom label and has no close button", () => {
    const card: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "card",
      position: { col: 0, row: 0 },
      width: 20,
      height: 8,
      borderStyle: "single",
      label: "User Profile",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([card], { cols: 25, rows: 12 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("User Profile");
    expect(result).not.toContain("×");
  });

  // icon (borderless)
  it("icon renders default star centered without border", () => {
    const icon: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "icon",
      position: { col: 0, row: 0 },
      width: 3,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([icon], { cols: 8, rows: 5 }));
    // Borderless — no box corners
    expect(result).not.toContain("┌");
    expect(result).toContain("*");
  });

  it("icon renders custom icon character at center position", () => {
    const icon: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "icon",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      icon: "♥",
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([icon], { cols: 8, rows: 5 });
    // midCol = Math.floor(5/2) = 2, midRow = Math.floor(3/2) = 1
    expect(grid[1][2]).toBe("♥");
  });

  // image (bordered)
  it("image renders interior filled with ░ and border", () => {
    const image: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "image",
      position: { col: 0, row: 0 },
      width: 10,
      height: 5,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([image], { cols: 15, rows: 8 }));
    expect(result).toContain("┌");
    expect(result).toContain("░");
  });

  it("image renders label centered over ░ fill", () => {
    const image: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "image",
      position: { col: 0, row: 0 },
      width: 20,
      height: 6,
      borderStyle: "single",
      label: "Photo",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([image], { cols: 25, rows: 10 }));
    // Label overwrites ░ in the middle row
    expect(result).toContain("Photo");
    expect(result).toContain("░");
  });

  // divider (borderless)
  it("divider renders a full horizontal line without border", () => {
    const divider: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 0 },
      width: 10,
      height: 1,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([divider], { cols: 15, rows: 3 }));
    expect(result).not.toContain("┌");
    const lines = result.split("\n");
    expect(lines[0]).toBe("──────────");
  });

  it("divider with label renders labeled separator", () => {
    const divider: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 0 },
      width: 16,
      height: 1,
      borderStyle: "single",
      label: "OR",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([divider], { cols: 20, rows: 3 }));
    const lines = result.split("\n");
    // "── OR ──────────" pattern
    expect(lines[0]).toContain("── OR");
    expect(lines[0]).toContain("─");
  });

  it("divider with label that exactly fits renders label", () => {
    const divider: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 0 },
      width: 6,
      height: 1,
      borderStyle: "single",
      label: "OR",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([divider], { cols: 10, rows: 3 }));
    const lines = result.split("\n");
    // width=6, label="OR" (2 chars), maxLabelLen=2 — label fits exactly
    expect(lines[0]).toBe("── OR");
  });

  it("divider with width too small for label renders plain line", () => {
    const divider: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 0 },
      width: 4,
      height: 1,
      borderStyle: "single",
      label: "OR",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([divider], { cols: 10, rows: 3 }));
    const lines = result.split("\n");
    // width=4, too small for "── X ─" pattern — falls back to plain line
    expect(lines[0]).toBe("────");
  });

  // toggle (borderless)
  it("toggle renders off state by default", () => {
    const toggle: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "toggle",
      position: { col: 0, row: 0 },
      width: 20,
      height: 1,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("[──●]");
  });

  it("toggle renders on state when checked=true", () => {
    const toggle: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "toggle",
      position: { col: 0, row: 0 },
      width: 20,
      height: 1,
      borderStyle: "single",
      checked: true,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    expect(result).toContain("[●──]");
  });

  it("toggle renders label after the switch indicator", () => {
    const toggle: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "toggle",
      position: { col: 0, row: 0 },
      width: 20,
      height: 1,
      borderStyle: "single",
      label: "Dark mode",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toContain("Dark mode");
    // Label starts at col+6
    expect(lines[0].indexOf("Dark mode")).toBe(6);
  });

  // alert (bordered)
  it("alert renders default info icon and label", () => {
    const alert: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "alert",
      position: { col: 0, row: 0 },
      width: 30,
      height: 5,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([alert], { cols: 35, rows: 8 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("i");
    expect(lines[1]).toContain("Alert");
  });

  it("alert renders warning icon for alertType=warning", () => {
    const alert: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "alert",
      position: { col: 0, row: 0 },
      width: 30,
      height: 5,
      borderStyle: "single",
      alertType: "warning",
      label: "Check input",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([alert], { cols: 35, rows: 8 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("!");
    expect(lines[1]).toContain("Check input");
  });

  it("alert renders correct icons for error and success types", () => {
    const makeAlert = (alertType: "error" | "success"): ComponentObject => ({
      id: "1",
      type: "component",
      componentType: "alert",
      position: { col: 0, row: 0 },
      width: 30,
      height: 5,
      borderStyle: "single",
      alertType,
      zIndex: 0,
      layerId: "layer-1",
    });

    const errorResult = gridToString(
      compose([makeAlert("error")], { cols: 35, rows: 8 })
    );
    expect(errorResult.split("\n")[1]).toContain("x");

    const successResult = gridToString(
      compose([makeAlert("success")], { cols: 35, rows: 8 })
    );
    expect(successResult.split("\n")[1]).toContain("✓");
  });

  // breadcrumb (borderless)
  it("breadcrumb renders items joined by default separator", () => {
    const breadcrumb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "breadcrumb",
      position: { col: 0, row: 0 },
      width: 30,
      height: 1,
      borderStyle: "single",
      items: ["Home", "Products", "Details"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("Home > Products > Details");
  });

  it("breadcrumb renders items with custom separator", () => {
    const breadcrumb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "breadcrumb",
      position: { col: 0, row: 0 },
      width: 30,
      height: 1,
      borderStyle: "single",
      items: ["A", "B", "C"],
      separator: " / ",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    expect(result).toContain("A / B / C");
  });

  it("breadcrumb truncates to obj.width", () => {
    const breadcrumb: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "breadcrumb",
      position: { col: 0, row: 0 },
      width: 10,
      height: 1,
      borderStyle: "single",
      items: ["Home", "Very Long Section Name"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0].length).toBeLessThanOrEqual(10);
  });

  // avatar (bordered)
  it("avatar renders spaced initials from label centered inside border", () => {
    const avatar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "avatar",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      label: "JD",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    expect(result).toContain("┌");
    expect(result).toContain("J D");
  });

  it("avatar with empty label renders border with empty interior", () => {
    const avatar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "avatar",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      label: "",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    expect(result).toContain("┌───┐");
    const lines = result.split("\n");
    // ⍥ is 1 display column, centered in innerW=3: pad=floor((3-1)/2)=1
    expect(lines[1]).toBe("│ ⍥ │");
  });

  it("avatar clips spaced initials to innerWidth (width-2)", () => {
    const avatar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "avatar",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      label: "ABCDEF",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    // innerW = 3, ceil(3/2) = 2 chars → "A B" (spaced)
    expect(result).toContain("A B");
    expect(result).not.toContain("ABCDEF");
  });

  it("avatar renders icon centered when icon prop is set", () => {
    const avatar: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "avatar",
      position: { col: 0, row: 0 },
      width: 5,
      height: 3,
      borderStyle: "single",
      icon: ":",
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([avatar], { cols: 10, rows: 5 });
    // midCol = 0 + 1 + floor((3-1)/2) = 2, midRow = floor(3/2) = 1
    expect(grid[1][2]).toBe(":");
  });

  // list (borderless)
  it("list renders items with bullet prefix by default", () => {
    const list: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "list",
      position: { col: 0, row: 0 },
      width: 20,
      height: 4,
      borderStyle: "single",
      items: ["Apple", "Banana", "Cherry"],
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([list], { cols: 25, rows: 6 }));
    expect(result).not.toContain("┌");
    const lines = result.split("\n");
    expect(lines[0]).toBe("• Apple");
    expect(lines[1]).toBe("• Banana");
    expect(lines[2]).toBe("• Cherry");
  });

  it("list renders items with number prefix when listStyle=number", () => {
    const list: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "list",
      position: { col: 0, row: 0 },
      width: 20,
      height: 3,
      borderStyle: "single",
      items: ["First", "Second", "Third"],
      listStyle: "number",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([list], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("1. First");
    expect(lines[1]).toBe("2. Second");
    expect(lines[2]).toBe("3. Third");
  });

  it("list renders items with dash prefix when listStyle=dash", () => {
    const list: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "list",
      position: { col: 0, row: 0 },
      width: 20,
      height: 2,
      borderStyle: "single",
      items: ["Item A", "Item B"],
      listStyle: "dash",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([list], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("- Item A");
    expect(lines[1]).toBe("- Item B");
  });

  // stepper (borderless)
  it("stepper renders active step with filled dot and inactive with empty dot", () => {
    const stepper: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "stepper",
      position: { col: 0, row: 0 },
      width: 40,
      height: 1,
      borderStyle: "single",
      items: ["Step 1", "Step 2", "Step 3"],
      activeStep: 0,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([stepper], { cols: 50, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("●");
    expect(result).toContain("○");
  });

  it("stepper with activeStep=2 marks all three steps active", () => {
    const stepper: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "stepper",
      position: { col: 0, row: 0 },
      width: 40,
      height: 1,
      borderStyle: "single",
      items: ["A", "B", "C"],
      activeStep: 2,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([stepper], { cols: 50, rows: 3 }));
    // All steps <= activeStep(2) are filled
    expect(result).not.toContain("o");
  });

  it("stepper renders step connector dashes between steps", () => {
    const stepper: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "stepper",
      position: { col: 0, row: 0 },
      width: 30,
      height: 1,
      borderStyle: "single",
      items: ["Go", "Stop"],
      activeStep: 0,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([stepper], { cols: 35, rows: 3 }));
    expect(result).toContain("─");
  });

  // rating (borderless)
  it("rating renders all empty stars when value=0", () => {
    const rating: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "rating",
      position: { col: 0, row: 0 },
      width: 10,
      height: 1,
      borderStyle: "single",
      value: 0,
      maxValue: 5,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([rating], { cols: 15, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).not.toContain("●");
    const lines = result.split("\n");
    expect(lines[0]).toBe("○○○○○");
  });

  it("rating renders filled and empty stars based on value", () => {
    const rating: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "rating",
      position: { col: 0, row: 0 },
      width: 10,
      height: 1,
      borderStyle: "single",
      value: 3,
      maxValue: 5,
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([rating], { cols: 15, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("●●●○○");
  });

  it("rating renders optional label after stars", () => {
    const rating: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "rating",
      position: { col: 0, row: 0 },
      width: 20,
      height: 1,
      borderStyle: "single",
      value: 4,
      maxValue: 5,
      label: "4/5",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([rating], { cols: 25, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("●●●●○ 4/5");
  });

  // skeleton (borderless)
  it("skeleton fills entire area with ░ without border", () => {
    const skeleton: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "skeleton",
      position: { col: 0, row: 0 },
      width: 5,
      height: 2,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const result = gridToString(compose([skeleton], { cols: 10, rows: 4 }));
    expect(result).not.toContain("┌");
    const lines = result.split("\n");
    expect(lines[0]).toBe("░░░░░");
    expect(lines[1]).toBe("░░░░░");
  });

  it("skeleton fills a multi-row area entirely", () => {
    const skeleton: ComponentObject = {
      id: "1",
      type: "component",
      componentType: "skeleton",
      position: { col: 2, row: 1 },
      width: 4,
      height: 3,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };
    const grid = compose([skeleton], { cols: 10, rows: 6 });
    // All cells in the skeleton region should be ░
    for (let r = 1; r <= 3; r++) {
      for (let c = 2; c <= 5; c++) {
        expect(grid[r][c]).toBe("░");
      }
    }
  });

  // ─── Overflow truncation with ellipsis ──────────────────────────────
  describe("text overflow truncation", () => {
    const makeComponent = (
      componentType: ComponentObject["componentType"],
      width: number,
      height: number,
      overrides: Partial<ComponentObject> = {}
    ): ComponentObject => ({
      id: "1",
      type: "component",
      componentType,
      position: { col: 0, row: 0 },
      width,
      height,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
      ...overrides,
    });

    it("input truncates long label with ellipsis", () => {
      const input = makeComponent("input", 10, 3, {
        label: "Very Long Placeholder",
      });
      const result = gridToString(compose([input], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      // Inner row should contain … and NOT overflow past border
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("│");
    });

    it("select truncates long label with ellipsis", () => {
      const select = makeComponent("select", 10, 3, {
        label: "Very Long Option",
      });
      const result = gridToString(compose([select], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("▾");
    });

    it("checkbox truncates long label with ellipsis", () => {
      const checkbox = makeComponent("checkbox", 12, 3, {
        label: "Accept all terms and conditions",
      });
      const result = gridToString(compose([checkbox], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("[ ]");
    });

    it("radio truncates long label with ellipsis", () => {
      const radio = makeComponent("radio", 12, 3, {
        label: "First option in a very long list",
      });
      const result = gridToString(compose([radio], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("( )");
    });

    it("card truncates long title with ellipsis", () => {
      const card = makeComponent("card", 10, 6, {
        label: "Very Long Card Title",
      });
      const result = gridToString(compose([card], { cols: 15, rows: 8 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
    });

    it("modal truncates long title with ellipsis", () => {
      const modal = makeComponent("modal", 10, 6, {
        label: "Very Long Modal Title",
      });
      const result = gridToString(compose([modal], { cols: 15, rows: 8 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("×");
    });

    it("alert truncates long label with ellipsis", () => {
      const alert = makeComponent("alert", 10, 5, {
        label: "Something went terribly wrong here",
      });
      const result = gridToString(compose([alert], { cols: 15, rows: 8 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
    });

    it("navbar truncates long nav items with ellipsis", () => {
      const navbar = makeComponent("navbar", 15, 3, {
        navItems: ["Home", "About", "Contact", "Services"],
      });
      const result = gridToString(compose([navbar], { cols: 20, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
      expect(lines[1]).toContain("=");
    });

    it("tabs truncates long tab list with ellipsis", () => {
      const tabs = makeComponent("tabs", 12, 3, {
        tabs: ["Overview", "Settings", "Advanced"],
      });
      const result = gridToString(compose([tabs], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("…");
    });

    it("toggle truncates long label with ellipsis", () => {
      const toggle = makeComponent("toggle", 12, 1, {
        label: "Enable all notifications for this account",
      });
      const result = gridToString(compose([toggle], { cols: 15, rows: 3 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
      expect(lines[0]).toContain("[");
    });

    it("breadcrumb truncates long path with ellipsis", () => {
      const breadcrumb = makeComponent("breadcrumb", 15, 1, {
        items: ["Home", "Category", "Subcategory", "Item"],
      });
      const result = gridToString(compose([breadcrumb], { cols: 20, rows: 3 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
    });

    it("list truncates long items with ellipsis", () => {
      const list = makeComponent("list", 10, 3, {
        items: ["A very long list item that overflows"],
      });
      const result = gridToString(compose([list], { cols: 15, rows: 5 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
    });

    it("stepper truncates when steps overflow width", () => {
      const stepper = makeComponent("stepper", 10, 1, {
        items: ["First Step", "Second Step", "Third Step"],
      });
      const result = gridToString(compose([stepper], { cols: 15, rows: 3 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
    });

    it("rating truncates long label with ellipsis", () => {
      const rating = makeComponent("rating", 8, 1, {
        label: "Rating label that is way too long",
        maxValue: 5,
      });
      const result = gridToString(compose([rating], { cols: 12, rows: 3 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
    });

    it("divider truncates long label with ellipsis", () => {
      const divider = makeComponent("divider", 10, 1, {
        label: "Section Header That Is Way Too Long",
      });
      const result = gridToString(compose([divider], { cols: 15, rows: 3 }));
      const lines = result.split("\n");
      expect(lines[0]).toContain("…");
      expect(lines[0]).toContain("──");
    });

    it("text within border does not overwrite border chars", () => {
      // Verify that truncated text stays inside the border
      const input = makeComponent("input", 8, 3, {
        label: "Overflowing text",
      });
      const grid = compose([input], { cols: 12, rows: 5 });
      // Right border should still be │
      expect(grid[1][7]).toBe("│");
    });
  });

  // ─── Double-width Unicode character support ──────────────────────────
  // Only CJK / fullwidth / emoji chars are genuinely 2x wide.
  // All icon chars (⍥ ★ ◉ etc.) are 1x in Geist Mono.
  describe("wide character support", () => {
    it("CJK char gets shadow cell after it", () => {
      const text: TextObject = {
        id: "1",
        type: "text",
        position: { col: 0, row: 0 },
        content: "中B",
        zIndex: 0,
        layerId: "layer-1",
      };
      const grid = compose([text], { cols: 10, rows: 1 });
      expect(grid[0][0]).toBe("中");
      expect(grid[0][1]).toBe("\x00"); // shadow
      expect(grid[0][2]).toBe("B");
    });

    it("gridToString skips shadow cells from CJK chars", () => {
      const text: TextObject = {
        id: "1",
        type: "text",
        position: { col: 0, row: 0 },
        content: "A中B",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([text], { cols: 10, rows: 1 }));
      expect(result).toBe("A中B");
      expect(result).not.toContain("\x00");
    });

    it("CJK char at grid edge is skipped (no half-char)", () => {
      const text: TextObject = {
        id: "1",
        type: "text",
        position: { col: 2, row: 0 },
        content: "中",
        zIndex: 0,
        layerId: "layer-1",
      };
      // Grid is 3 cols wide, placing at col 2 means shadow at col 3 = out of bounds
      const grid = compose([text], { cols: 3, rows: 1 });
      expect(grid[0][2]).toBe(" "); // wide char should not be placed
    });

    it("overwriting a CJK char cleans up its shadow", () => {
      const text1: TextObject = {
        id: "1",
        type: "text",
        position: { col: 0, row: 0 },
        content: "中",
        zIndex: 0,
        layerId: "layer-1",
      };
      const text2: TextObject = {
        id: "2",
        type: "text",
        position: { col: 0, row: 0 },
        content: "AB",
        zIndex: 1,
        layerId: "layer-1",
      };
      const grid = compose([text1, text2], { cols: 10, rows: 1 });
      expect(grid[0][0]).toBe("A");
      expect(grid[0][1]).toBe("B");
      // No orphaned shadow
      expect(grid[0][2]).toBe(" ");
    });

    it("⍥ ★ ◉ are all single-width (no shadow cells)", () => {
      const text: TextObject = {
        id: "1",
        type: "text",
        position: { col: 0, row: 0 },
        content: "⍥★◉",
        zIndex: 0,
        layerId: "layer-1",
      };
      const grid = compose([text], { cols: 10, rows: 1 });
      // Each char occupies exactly 1 cell, no shadows
      expect(grid[0][0]).toBe("⍥");
      expect(grid[0][1]).toBe("★");
      expect(grid[0][2]).toBe("◉");
      expect(grid[0][3]).toBe(" ");
    });

    it("icon component with ⍥ renders without breaking borders", () => {
      const makeComponent = (
        componentType: ComponentObject["componentType"],
        width: number,
        height: number,
        overrides: Partial<ComponentObject> = {}
      ): ComponentObject => ({
        id: "1",
        type: "component",
        componentType,
        position: { col: 0, row: 0 },
        width,
        height,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
        ...overrides,
      });

      const icon = makeComponent("icon", 5, 3, { icon: "⍥" });
      const grid = compose([icon], { cols: 10, rows: 5 });
      const result = gridToString(grid);
      expect(result).toContain("⍥");
      expect(result).not.toContain("\x00");
    });

    it("multiline text with icon chars aligns correctly", () => {
      const text: TextObject = {
        id: "1",
        type: "text",
        position: { col: 0, row: 0 },
        content: "⍥A\nB★",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([text], { cols: 10, rows: 2 }));
      const lines = result.split("\n");
      expect(lines[0]).toBe("⍥A");
      expect(lines[1]).toBe("B★");
    });

    it("box with CJK label centers correctly with shadow", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 3,
        borderStyle: "single",
        label: "中",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([box], { cols: 15, rows: 5 }));
      expect(result).toContain("中");
      expect(result).not.toContain("\x00");
      expect(result).toContain("┌────────┐");
      expect(result).toContain("└────────┘");
    });

    it("divider with ★ label renders correctly", () => {
      const makeComponent = (
        componentType: ComponentObject["componentType"],
        width: number,
        height: number,
        overrides: Partial<ComponentObject> = {}
      ): ComponentObject => ({
        id: "1",
        type: "component",
        componentType,
        position: { col: 0, row: 0 },
        width,
        height,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
        ...overrides,
      });

      const divider = makeComponent("divider", 12, 1, { label: "★" });
      const result = gridToString(compose([divider], { cols: 15, rows: 1 }));
      // ★ is 1 display col: "──── ★ ─────"
      expect(result).toContain("★");
      expect(result).not.toContain("\x00");
      expect(result.startsWith("──")).toBe(true);
    });

    it("avatar default ⍥ renders within borders", () => {
      const makeComponent = (
        componentType: ComponentObject["componentType"],
        width: number,
        height: number,
        overrides: Partial<ComponentObject> = {}
      ): ComponentObject => ({
        id: "1",
        type: "component",
        componentType,
        position: { col: 0, row: 0 },
        width,
        height,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
        ...overrides,
      });

      const avatar = makeComponent("avatar", 5, 3);
      const grid = compose([avatar], { cols: 10, rows: 5 });
      const result = gridToString(grid);
      expect(result).toContain("⍥");
      expect(result).not.toContain("\x00");
      expect(result).toContain("┐");
      expect(result).toContain("┘");
    });
  });

  // ─── Multiline box labels ──────────────────────────────────────────
  describe("multiline box labels", () => {
    it("single-line label renders at same row as before (regression)", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 12,
        height: 5,
        borderStyle: "single",
        label: "Hello",
        zIndex: 0,
        layerId: "layer-1",
      };
      const grid = compose([box], { cols: 15, rows: 7 });
      // row + Math.floor(height / 2) = 0 + Math.floor(5/2) = 2
      const labelRow = grid[2];
      expect(labelRow.join("")).toContain("Hello");
    });

    it("renders two-line label centered vertically and horizontally", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 14,
        height: 6,
        borderStyle: "single",
        label: "Line 1\nLine 2",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([box], { cols: 18, rows: 8 }));
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
    });

    it("clips excess lines that do not fit in interior height", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 12,
        height: 4,
        borderStyle: "single",
        label: "A\nB\nC\nD\nE",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([box], { cols: 15, rows: 6 }));
      // Interior height = 4 - 2 = 2, so only first 2 lines visible
      expect(result).toContain("A");
      expect(result).toContain("B");
      expect(result).not.toContain("C");
    });

    it("vertically centers odd line count in even interior", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 12,
        height: 6,
        borderStyle: "single",
        label: "X",
        zIndex: 0,
        layerId: "layer-1",
      };
      // height 6 → interior 4, single-line label at Math.floor(6/2)=3
      const grid = compose([box], { cols: 15, rows: 8 });
      expect(grid[3].join("")).toContain("X");
    });

    it("vertically centers two lines in height=6 box", () => {
      const box: BoxObject = {
        id: "1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 12,
        height: 6,
        borderStyle: "single",
        label: "AA\nBB",
        zIndex: 0,
        layerId: "layer-1",
      };
      // Interior height = 4, 2 lines → startRow = 0 + 1 + floor((4-2)/2) = 2
      const grid = compose([box], { cols: 15, rows: 8 });
      expect(grid[2].join("")).toContain("AA");
      expect(grid[3].join("")).toContain("BB");
    });
  });

  // ─── Card/modal body text ──────────────────────────────────────────
  describe("card body text", () => {
    it("renders body text left-aligned below separator at row+4", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 20,
        height: 8,
        borderStyle: "single",
        label: "Title",
        body: "Body text",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      // Title at row 1, separator at row 3, body starts at row 4
      expect(lines[1]).toContain("Title");
      expect(lines[4]).toContain("Body text");
      // Body is left-aligned at col+2
      expect(lines[4].indexOf("Body text")).toBe(2);
    });

    it("renders multiline body text", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 20,
        height: 10,
        borderStyle: "single",
        body: "First\nSecond\nThird",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 25, rows: 14 }));
      const lines = result.split("\n");
      expect(lines[4]).toContain("First");
      expect(lines[5]).toContain("Second");
      expect(lines[6]).toContain("Third");
    });

    it("clips body lines that exceed available height", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 20,
        height: 7,
        borderStyle: "single",
        body: "Line1\nLine2\nLine3\nLine4",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 25, rows: 10 }));
      // height=7: body rows = row+4 to row+5 (endRow = 0+7-2=5), so 2 rows
      expect(result).toContain("Line1");
      expect(result).toContain("Line2");
      expect(result).not.toContain("Line3");
    });

    it("does not render body when height < 6", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 20,
        height: 5,
        borderStyle: "single",
        body: "Should not appear",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 25, rows: 8 }));
      expect(result).not.toContain("Should not appear");
    });

    it("does not render body when body is undefined", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 20,
        height: 8,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      // Row 4 should be interior spaces only
      expect(lines[4].trim()).toBe("│                  │");
    });

    it("modal also renders body text", () => {
      const modal: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "modal",
        position: { col: 0, row: 0 },
        width: 20,
        height: 8,
        borderStyle: "single",
        label: "Confirm",
        body: "Are you sure?",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([modal], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("Confirm");
      expect(lines[1]).toContain("×");
      expect(lines[4]).toContain("Are you sure?");
    });

    it("truncates long body lines with ellipsis", () => {
      const card: ComponentObject = {
        id: "1",
        type: "component",
        componentType: "card",
        position: { col: 0, row: 0 },
        width: 12,
        height: 8,
        borderStyle: "single",
        body: "This is a very long body line that overflows",
        zIndex: 0,
        layerId: "layer-1",
      };
      const result = gridToString(compose([card], { cols: 16, rows: 12 }));
      const lines = result.split("\n");
      expect(lines[4]).toContain("…");
    });
  });

  // ─── Connectors ──────────────────────────────────────────────────────
  describe("connectors", () => {
    const boxA: BoxObject = {
      id: "a",
      type: "box",
      position: { col: 0, row: 0 },
      width: 10,
      height: 5,
      borderStyle: "single",
      zIndex: 0,
      layerId: "layer-1",
    };

    const boxB: BoxObject = {
      id: "b",
      type: "box",
      position: { col: 0, row: 10 },
      width: 10,
      height: 5,
      borderStyle: "single",
      zIndex: 1,
      layerId: "layer-1",
    };

    function makeConnector(
      overrides: Partial<ConnectorObject> = {}
    ): ConnectorObject {
      return {
        id: "c1",
        type: "connector",
        fromId: "a",
        toId: "b",
        position: { col: 0, row: 0 },
        zIndex: 2,
        layerId: "layer-1",
        ...overrides,
      };
    }

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
      expect(grid[9][5]).toBe("↓");
    });

    it("renders arrow heads at both ends when startHead is true", () => {
      const connector = makeConnector({ startHead: true, endHead: true });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      expect(grid[5][5]).toBe("↑"); // start head (pointing away from box A)
      expect(grid[9][5]).toBe("↓"); // end head (pointing towards box B)
    });

    it("renders no arrow heads when both are false", () => {
      const connector = makeConnector({ startHead: false, endHead: false });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // All intermediate cells should be │, not arrow chars
      for (let r = 5; r <= 9; r++) {
        expect(grid[r][5]).toBe("│");
      }
    });

    it("renders an L-shaped connector between offset boxes", () => {
      const rightBox: BoxObject = {
        id: "b",
        type: "box",
        position: { col: 20, row: 10 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 1,
        layerId: "layer-1",
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
        id: "b",
        type: "box",
        position: { col: 20, row: 10 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 1,
        layerId: "layer-1",
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
        id: "a",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
      };
      const rightBox: BoxObject = {
        id: "b",
        type: "box",
        position: { col: 20, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 1,
        layerId: "layer-1",
      };
      const connector = makeConnector();
      const grid = compose([leftBox, rightBox, connector], {
        cols: 40,
        rows: 10,
      });
      // Connector exits right side of leftBox (col 10) → enters left of rightBox (col 19)
      // Middle row is row 2 (floor(5/2))
      // Check that the horizontal line exists
      expect(grid[2][10]).toBe("─");
      expect(grid[2][15]).toBe("─");
    });

    it("renders label on a vertical connector centered at the midpoint", () => {
      const connector = makeConnector({ label: "API" });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Vertical connector goes from row 5 to row 9 at col 5
      // Midpoint is row 7, label centered on col 5 (width 3 → starts at col 4)
      expect(grid[7][4]).toBe("A");
      expect(grid[7][5]).toBe("P");
      expect(grid[7][6]).toBe("I");
    });

    it("renders label on a horizontal connector one row above the line", () => {
      const leftBox: BoxObject = {
        id: "a",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "layer-1",
      };
      const rightBox: BoxObject = {
        id: "b",
        type: "box",
        position: { col: 20, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 1,
        layerId: "layer-1",
      };
      const connector = makeConnector({ label: "data" });
      const grid = compose([leftBox, rightBox, connector], {
        cols: 40,
        rows: 10,
      });
      // Horizontal connector at row 2, label should be one row above at row 1
      const row1 = grid[1].join("");
      expect(row1).toContain("data");
      // The connector line at row 2 should remain intact
      expect(grid[2][15]).toBe("─");
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
      for (let c = 0; c < 20; c++) {
        if (c === 5) {
          expect(grid[7][c]).toBe("│");
        } else {
          expect(grid[7][c]).toBe(" ");
        }
      }
    });

    it("does not render label when label is empty string", () => {
      const connector = makeConnector({ label: "" });
      const grid = compose([boxA, boxB, connector], { cols: 20, rows: 20 });
      // Should behave the same as no label
      for (let c = 0; c < 20; c++) {
        if (c === 5) {
          expect(grid[7][c]).toBe("│");
        } else {
          expect(grid[7][c]).toBe(" ");
        }
      }
    });
  });
});
