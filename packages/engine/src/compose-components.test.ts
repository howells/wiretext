import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type { ComponentObject } from "./types";

/** Count occurrences of a character, iterating by code point. */
const countChar = (text: string, char: string): number => {
  let count = 0;
  for (const ch of text) {
    if (ch === char) {
      count += 1;
    }
  }
  return count;
};

describe("compose", () => {
  // Component tests
  it("stamps a button component with centered label", () => {
    const btn: ComponentObject = {
      borderStyle: "single",
      componentType: "button",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 12,
      zIndex: 0,
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toContain("┌──────────┐");
    expect(lines[1]).toContain("Button");
    expect(lines[2]).toContain("└──────────┘");
  });

  it("stamps a button with custom label", () => {
    const btn: ComponentObject = {
      borderStyle: "single",
      componentType: "button",
      height: 3,
      id: "1",
      label: "OK",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 12,
      zIndex: 0,
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    expect(result).toContain("OK");
  });

  it("stamps a table component with headers and separators", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Col A", "Col B"],
      componentType: "table",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 24,
      zIndex: 0,
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
      borderStyle: "single",
      componentType: "modal",
      height: 15,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
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
      borderStyle: "single",
      componentType: "button",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 3,
      zIndex: 0,
    };
    // Should not throw even at minimum size
    const result = compose([btn], { cols: 10, rows: 5 });
    expect(result.length).toBe(5);
  });

  it("component uses double border style", () => {
    const btn: ComponentObject = {
      borderStyle: "double",
      componentType: "button",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 12,
      zIndex: 0,
    };
    const result = gridToString(compose([btn], { cols: 20, rows: 5 }));
    expect(result).toContain("╔");
    expect(result).toContain("╗");
    expect(result).toContain("║");
  });

  it("stamps a progress bar component", () => {
    const prog: ComponentObject = {
      borderStyle: "single",
      componentType: "progress",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).toContain("▓");
    expect(result).toContain("░");
  });

  // Checkbox checked/unchecked
  it("checkbox renders unchecked by default (checked=undefined)", () => {
    const cb: ComponentObject = {
      borderStyle: "single",
      componentType: "checkbox",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[ ]");
    expect(result).toContain("Checkbox");
  });

  it("checkbox renders unchecked when checked=false", () => {
    const cb: ComponentObject = {
      borderStyle: "single",
      checked: false,
      componentType: "checkbox",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[ ]");
    expect(result).not.toContain("[✓]");
  });

  it("checkbox renders checked when checked=true", () => {
    const cb: ComponentObject = {
      borderStyle: "single",
      checked: true,
      componentType: "checkbox",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([cb], { cols: 25, rows: 5 }));
    expect(result).toContain("[✓]");
  });

  // Radio button state
  it("radio renders unselected by default (checked=undefined)", () => {
    const radio: ComponentObject = {
      borderStyle: "single",
      componentType: "radio",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([radio], { cols: 25, rows: 5 }));
    expect(result).toContain("( )");
  });

  it("radio renders unselected when checked=false", () => {
    const radio: ComponentObject = {
      borderStyle: "single",
      checked: false,
      componentType: "radio",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([radio], { cols: 25, rows: 5 }));
    expect(result).toContain("( )");
    expect(result).not.toContain("(●)");
  });

  // Progress bar percentage
  it("progress bar uses custom percentage", () => {
    const prog: ComponentObject = {
      borderStyle: "single",
      componentType: "progress",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      progress: 100,
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    // All filled at 100%
    expect(result).toContain("▓");
    expect(result).not.toContain("░");
  });

  it("progress bar at 0% is all empty", () => {
    const prog: ComponentObject = {
      borderStyle: "single",
      componentType: "progress",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      progress: 0,
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).not.toContain("▓");
    expect(result).toContain("░");
  });

  it("progress bar clamps to 0-100 range", () => {
    const prog: ComponentObject = {
      borderStyle: "single",
      componentType: "progress",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      progress: 150,
      type: "component",
      width: 20,
      zIndex: 0,
    };
    // Should not throw, clamps to 100
    const result = gridToString(compose([prog], { cols: 25, rows: 5 }));
    expect(result).toContain("▓");
  });

  // Table with custom columns
  it("table renders custom columns", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Name", "Age", "City"],
      componentType: "table",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 35, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Name");
    expect(lines[1]).toContain("Age");
    expect(lines[1]).toContain("City");
    // Two column separators for 3 columns
    const topBorder = lines[0] ?? "";
    const separatorCount = countChar(topBorder, "┬");
    expect(separatorCount).toBe(2);
  });

  it("table with single column has no separators", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Only"],
      componentType: "table",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 25, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Only");
    expect(lines[0]).not.toContain("┬");
  });

  it("table renders filter buttons when filterable=true", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Name", "Age"],
      componentType: "table",
      filterable: true,
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 24,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 30, rows: 10 }));
    const lines = result.split("\n");
    // Each column header should have a v filter button
    const headerRow = lines[1] ?? "";
    // v should appear with a space before and after
    expect(headerRow).toContain("Name");
    // Count filter arrows — one per column
    const vCount = countChar(headerRow, "▾");
    expect(vCount).toBe(2);
  });

  it("table does not render filter buttons when filterable is not set", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Name", "Age"],
      componentType: "table",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 24,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 30, rows: 10 }));
    const lines = result.split("\n");
    const headerRow = lines[1] ?? "";
    expect(headerRow).not.toContain("▾");
  });

  // Table data rows
  it("table renders data rows below header", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Name", "Age", "City"],
      componentType: "table",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      rows: [
        ["Alice", "30", "NYC"],
        ["Bob", "25", "LA"],
      ],
      type: "component",
      width: 30,
      zIndex: 0,
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
      borderStyle: "single",
      columns: ["Name"],
      componentType: "table",
      height: 6,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      rows: [["Alice"], ["Bob"], ["Carol"], ["Dave"]],
      type: "component",
      width: 20,
      zIndex: 0,
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
      borderStyle: "single",
      columns: ["Name", "Info"],
      componentType: "table",
      height: 7,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      rows: [["VeryLongNameHere", "OK"]],
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 25, rows: 9 }));
    // colW = 18/2 = 9, maxCellLen = 9-3 = 6 → "Very…" (truncated)
    expect(result).toContain("…");
    expect(result).toContain("OK");
  });

  it("table renders with no rows when rows is empty", () => {
    const table: ComponentObject = {
      borderStyle: "single",
      columns: ["Name"],
      componentType: "table",
      height: 7,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      rows: [],
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([table], { cols: 25, rows: 9 }));
    expect(result).toContain("Name");
    // Data area should be empty
    const lines = result.split("\n");
    expect(must(lines[3]).trim()).toBe("│                  │");
  });

  // Tabs with custom tab names
  it("tabs renders custom tab names", () => {
    const tabs: ComponentObject = {
      borderStyle: "single",
      componentType: "tabs",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      tabs: ["Home", "Settings"],
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([tabs], { cols: 35, rows: 5 }));
    expect(result).toContain("Home");
    expect(result).toContain("Settings");
    expect(result).toContain("│");
  });

  it("tabs with single tab has no separator", () => {
    const tabs: ComponentObject = {
      borderStyle: "single",
      componentType: "tabs",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      tabs: ["Only Tab"],
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([tabs], { cols: 25, rows: 5 }));
    expect(result).toContain("Only Tab");
  });

  it("tabs defaults to Tab 1 | Tab 2 | Tab 3", () => {
    const tabs: ComponentObject = {
      borderStyle: "single",
      componentType: "tabs",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      tabs: ["Tab 1", "Tab 2", "Tab 3"],
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([tabs], { cols: 35, rows: 5 }));
    expect(result).toContain("Tab 1");
    expect(result).toContain("Tab 2");
    expect(result).toContain("Tab 3");
  });
});
