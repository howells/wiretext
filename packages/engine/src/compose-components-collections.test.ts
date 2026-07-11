import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type { ComponentObject } from "./types";

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
  // avatar (bordered)
  it("avatar renders spaced initials from label centered inside border", () => {
    const avatar: ComponentObject = {
      borderStyle: "single",
      componentType: "avatar",
      height: 3,
      id: "1",
      label: "JD",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    expect(result).toContain("┌");
    expect(result).toContain("J D");
  });

  it("avatar with empty label renders border with empty interior", () => {
    const avatar: ComponentObject = {
      borderStyle: "single",
      componentType: "avatar",
      height: 3,
      id: "1",
      label: "",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    expect(result).toContain("┌───┐");
    const lines = result.split("\n");
    // ⍥ is 1 display column, centered in innerW=3: pad=floor((3-1)/2)=1
    expect(lines[1]).toBe("│ ⍥ │");
  });

  it("avatar clips spaced initials to innerWidth (width-2)", () => {
    const avatar: ComponentObject = {
      borderStyle: "single",
      componentType: "avatar",
      height: 3,
      id: "1",
      label: "ABCDEF",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([avatar], { cols: 10, rows: 5 }));
    // innerW = 3, ceil(3/2) = 2 chars → "A B" (spaced)
    expect(result).toContain("A B");
    expect(result).not.toContain("ABCDEF");
  });

  it("avatar renders icon centered when icon prop is set", () => {
    const avatar: ComponentObject = {
      borderStyle: "single",
      componentType: "avatar",
      height: 3,
      icon: ":",
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const grid = compose([avatar], { cols: 10, rows: 5 });
    // midCol = 0 + 1 + floor((3-1)/2) = 2, midRow = floor(3/2) = 1
    expect(must(grid[1])[2]).toBe(":");
  });

  // list (borderless)
  it("list renders items with bullet prefix by default", () => {
    const list: ComponentObject = {
      borderStyle: "single",
      componentType: "list",
      height: 4,
      id: "1",
      items: ["Apple", "Banana", "Cherry"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
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
      borderStyle: "single",
      componentType: "list",
      height: 3,
      id: "1",
      items: ["First", "Second", "Third"],
      layerId: "layer-1",
      listStyle: "number",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([list], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("1. First");
    expect(lines[1]).toBe("2. Second");
    expect(lines[2]).toBe("3. Third");
  });

  it("list renders items with dash prefix when listStyle=dash", () => {
    const list: ComponentObject = {
      borderStyle: "single",
      componentType: "list",
      height: 2,
      id: "1",
      items: ["Item A", "Item B"],
      layerId: "layer-1",
      listStyle: "dash",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([list], { cols: 25, rows: 5 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("- Item A");
    expect(lines[1]).toBe("- Item B");
  });

  // stepper (borderless)
  it("stepper renders active step with filled dot and inactive with empty dot", () => {
    const stepper: ComponentObject = {
      activeStep: 0,
      borderStyle: "single",
      componentType: "stepper",
      height: 1,
      id: "1",
      items: ["Step 1", "Step 2", "Step 3"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 40,
      zIndex: 0,
    };
    const result = gridToString(compose([stepper], { cols: 50, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("●");
    expect(result).toContain("○");
  });

  it("stepper with activeStep=2 marks all three steps active", () => {
    const stepper: ComponentObject = {
      activeStep: 2,
      borderStyle: "single",
      componentType: "stepper",
      height: 1,
      id: "1",
      items: ["A", "B", "C"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 40,
      zIndex: 0,
    };
    const result = gridToString(compose([stepper], { cols: 50, rows: 3 }));
    // All steps <= activeStep(2) are filled
    expect(result).not.toContain("o");
  });

  it("stepper renders step connector dashes between steps", () => {
    const stepper: ComponentObject = {
      activeStep: 0,
      borderStyle: "single",
      componentType: "stepper",
      height: 1,
      id: "1",
      items: ["Go", "Stop"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([stepper], { cols: 35, rows: 3 }));
    expect(result).toContain("─");
  });

  // rating (borderless)
  it("rating renders all empty stars when value=0", () => {
    const rating: ComponentObject = {
      borderStyle: "single",
      componentType: "rating",
      height: 1,
      id: "1",
      layerId: "layer-1",
      maxValue: 5,
      position: { col: 0, row: 0 },
      type: "component",
      value: 0,
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([rating], { cols: 15, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).not.toContain("●");
    const lines = result.split("\n");
    expect(lines[0]).toBe("○○○○○");
  });

  it("rating renders filled and empty stars based on value", () => {
    const rating: ComponentObject = {
      borderStyle: "single",
      componentType: "rating",
      height: 1,
      id: "1",
      layerId: "layer-1",
      maxValue: 5,
      position: { col: 0, row: 0 },
      type: "component",
      value: 3,
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([rating], { cols: 15, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("●●●○○");
  });

  it("rating renders optional label after stars", () => {
    const rating: ComponentObject = {
      borderStyle: "single",
      componentType: "rating",
      height: 1,
      id: "1",
      label: "4/5",
      layerId: "layer-1",
      maxValue: 5,
      position: { col: 0, row: 0 },
      type: "component",
      value: 4,
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([rating], { cols: 25, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toBe("●●●●○ 4/5");
  });

  // skeleton (borderless)
  it("skeleton fills entire area with ░ without border", () => {
    const skeleton: ComponentObject = {
      borderStyle: "single",
      componentType: "skeleton",
      height: 2,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const result = gridToString(compose([skeleton], { cols: 10, rows: 4 }));
    expect(result).not.toContain("┌");
    const lines = result.split("\n");
    expect(lines[0]).toBe("░░░░░");
    expect(lines[1]).toBe("░░░░░");
  });

  it("skeleton fills a multi-row area entirely", () => {
    const skeleton: ComponentObject = {
      borderStyle: "single",
      componentType: "skeleton",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 2, row: 1 },
      type: "component",
      width: 4,
      zIndex: 0,
    };
    const grid = compose([skeleton], { cols: 10, rows: 6 });
    // All cells in the skeleton region should be ░
    for (let r = 1; r <= 3; r += 1) {
      for (let c = 2; c <= 5; c += 1) {
        expect(must(grid[r])[c]).toBe("░");
      }
    }
  });

  // ─── Overflow truncation with ellipsis ──────────────────────────────
  describe("text overflow truncation", () => {
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
      expect(must(grid[1])[7]).toBe("│");
    });
  });
});
