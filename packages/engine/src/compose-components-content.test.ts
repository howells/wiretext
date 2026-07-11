import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type { ComponentObject } from "./types";

describe("compose", () => {
  // input
  it("input renders default label and border", () => {
    const input: ComponentObject = {
      borderStyle: "single",
      componentType: "input",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    expect(result).toContain("┌");
    expect(result).toContain("Input");
  });

  it("input renders custom label at col+2 on the middle row", () => {
    const input: ComponentObject = {
      borderStyle: "single",
      componentType: "input",
      height: 3,
      id: "1",
      label: "Email",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    // Middle row (row index 1) should contain the label starting at col 2
    expect(lines[1]).toContain("Email");
    expect(must(lines[1]).indexOf("Email")).toBe(2);
  });

  it("input with icon shifts label to col+4", () => {
    const input: ComponentObject = {
      borderStyle: "single",
      componentType: "input",
      height: 3,
      icon: "@",
      id: "1",
      label: "Search",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([input], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    // Icon at col+2, label starts at col+4
    expect(lines[1]).toContain("Search");
    expect(must(lines[1]).indexOf("Search")).toBe(4);
  });

  // select
  it("select renders default label and dropdown arrow", () => {
    const select: ComponentObject = {
      borderStyle: "single",
      componentType: "select",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([select], { cols: 25, rows: 5 }));
    expect(result).toContain("Select");
    expect(result).toContain("▾");
  });

  it("select renders custom label with dropdown arrow at col+width-3", () => {
    const select: ComponentObject = {
      borderStyle: "single",
      componentType: "select",
      height: 3,
      id: "1",
      label: "Country",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([select], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Country");
    // Arrow is at col+width-3 = 0+20-3 = 17
    expect(must(lines[1])[17]).toBe("▾");
  });

  // navbar
  it("navbar renders hamburger icon and default empty nav items", () => {
    const navbar: ComponentObject = {
      borderStyle: "single",
      componentType: "navbar",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([navbar], { cols: 35, rows: 5 }));
    expect(result).toContain("=");
  });

  it("navbar renders nav items joined by double spaces", () => {
    const navbar: ComponentObject = {
      borderStyle: "single",
      componentType: "navbar",
      height: 3,
      id: "1",
      layerId: "layer-1",
      navItems: ["Home", "About", "Contact"],
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([navbar], { cols: 35, rows: 5 }));
    expect(result).toContain("Home  About  Contact");
  });

  it("navbar with no navItems renders only the hamburger icon", () => {
    const navbar: ComponentObject = {
      borderStyle: "single",
      componentType: "navbar",
      height: 3,
      id: "1",
      layerId: "layer-1",
      navItems: [],
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([navbar], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("=");
    // No item text after the hamburger — between col+3 and right border there are only spaces
    // lines[1] = "│ =               │", right border is the last char
    const innerContent = must(lines[1]).slice(3, -1);
    expect(innerContent.trim()).toBe("");
  });

  // browser
  it("browser renders navigation controls and separator", () => {
    const browser: ComponentObject = {
      borderStyle: "single",
      componentType: "browser",
      height: 6,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([browser], { cols: 35, rows: 10 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("< > O");
    // Separator at row+2
    expect(lines[2]).toContain("─");
  });

  it("browser renders custom URL label in the toolbar row", () => {
    const browser: ComponentObject = {
      borderStyle: "single",
      componentType: "browser",
      height: 6,
      id: "1",
      label: "https://example.com",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const grid = compose([browser], { cols: 35, rows: 10 });
    // URL label is stamped at col+10 = 10
    expect(must(grid[1])[10]).toBe("h");
    expect(must(grid[1])[11]).toBe("t");
    expect(must(grid[1])[12]).toBe("t");
  });

  it("browser skips rendering content when height < 5", () => {
    const browser: ComponentObject = {
      borderStyle: "single",
      componentType: "browser",
      height: 4,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([browser], { cols: 25, rows: 8 }));
    // Border is still drawn but no nav controls
    expect(result).not.toContain("<");
  });

  // card
  it("card renders default title and separator", () => {
    const card: ComponentObject = {
      borderStyle: "single",
      componentType: "card",
      height: 8,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([card], { cols: 25, rows: 12 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("Card");
    // Padding row at lines[2], separator at lines[3]
    expect(lines[3]).toContain("─");
  });

  it("card renders custom label and has no close button", () => {
    const card: ComponentObject = {
      borderStyle: "single",
      componentType: "card",
      height: 8,
      id: "1",
      label: "User Profile",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([card], { cols: 25, rows: 12 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("User Profile");
    expect(result).not.toContain("×");
  });

  // ─── Card/modal body text ──────────────────────────────────────────
  describe("card body text", () => {
    it("renders body text left-aligned below separator at row+4", () => {
      const card: ComponentObject = {
        body: "Body text",
        borderStyle: "single",
        componentType: "card",
        height: 8,
        id: "1",
        label: "Title",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      // Title at row 1, separator at row 3, body starts at row 4
      expect(lines[1]).toContain("Title");
      expect(lines[4]).toContain("Body text");
      // Body is left-aligned at col+2
      expect(must(lines[4]).indexOf("Body text")).toBe(2);
    });

    it("renders multiline body text", () => {
      const card: ComponentObject = {
        body: "First\nSecond\nThird",
        borderStyle: "single",
        componentType: "card",
        height: 10,
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 25, rows: 14 }));
      const lines = result.split("\n");
      expect(lines[4]).toContain("First");
      expect(lines[5]).toContain("Second");
      expect(lines[6]).toContain("Third");
    });

    it("clips body lines that exceed available height", () => {
      const card: ComponentObject = {
        body: "Line1\nLine2\nLine3\nLine4",
        borderStyle: "single",
        componentType: "card",
        height: 7,
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 25, rows: 10 }));
      // height=7: body rows = row+4 to row+5 (endRow = 0+7-2=5), so 2 rows
      expect(result).toContain("Line1");
      expect(result).toContain("Line2");
      expect(result).not.toContain("Line3");
    });

    it("does not render body when height < 6", () => {
      const card: ComponentObject = {
        body: "Should not appear",
        borderStyle: "single",
        componentType: "card",
        height: 5,
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 25, rows: 8 }));
      expect(result).not.toContain("Should not appear");
    });

    it("does not render body when body is undefined", () => {
      const card: ComponentObject = {
        borderStyle: "single",
        componentType: "card",
        height: 8,
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      // Row 4 should be interior spaces only
      expect(must(lines[4]).trim()).toBe("│                  │");
    });

    it("modal also renders body text", () => {
      const modal: ComponentObject = {
        body: "Are you sure?",
        borderStyle: "single",
        componentType: "modal",
        height: 8,
        id: "1",
        label: "Confirm",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 20,
        zIndex: 0,
      };
      const result = gridToString(compose([modal], { cols: 25, rows: 12 }));
      const lines = result.split("\n");
      expect(lines[1]).toContain("Confirm");
      expect(lines[1]).toContain("×");
      expect(lines[4]).toContain("Are you sure?");
    });

    it("truncates long body lines with ellipsis", () => {
      const card: ComponentObject = {
        body: "This is a very long body line that overflows",
        borderStyle: "single",
        componentType: "card",
        height: 8,
        id: "1",
        layerId: "layer-1",
        position: { col: 0, row: 0 },
        type: "component",
        width: 12,
        zIndex: 0,
      };
      const result = gridToString(compose([card], { cols: 16, rows: 12 }));
      const lines = result.split("\n");
      expect(lines[4]).toContain("…");
    });
  });
});
