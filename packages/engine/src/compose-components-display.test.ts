import { describe, expect, it } from "vitest";

import { compose, gridToString } from "./compose";
import { must } from "./test-utils";
import type { ComponentObject } from "./types";

const makeAlert = (alertType: "error" | "success"): ComponentObject => ({
  alertType,
  borderStyle: "single",
  componentType: "alert",
  height: 5,
  id: "1",
  layerId: "layer-1",
  position: { col: 0, row: 0 },
  type: "component",
  width: 30,
  zIndex: 0,
});

describe("compose", () => {
  // icon (borderless)
  it("icon renders default star centered without border", () => {
    const icon: ComponentObject = {
      borderStyle: "single",
      componentType: "icon",
      height: 3,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 3,
      zIndex: 0,
    };
    const result = gridToString(compose([icon], { cols: 8, rows: 5 }));
    // Borderless — no box corners
    expect(result).not.toContain("┌");
    expect(result).toContain("*");
  });

  it("icon renders custom icon character at center position", () => {
    const icon: ComponentObject = {
      borderStyle: "single",
      componentType: "icon",
      height: 3,
      icon: "♥",
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 5,
      zIndex: 0,
    };
    const grid = compose([icon], { cols: 8, rows: 5 });
    // midCol = Math.floor(5/2) = 2, midRow = Math.floor(3/2) = 1
    expect(must(grid[1])[2]).toBe("♥");
  });

  // image (bordered)
  it("image renders interior filled with ░ and border", () => {
    const image: ComponentObject = {
      borderStyle: "single",
      componentType: "image",
      height: 5,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([image], { cols: 15, rows: 8 }));
    expect(result).toContain("┌");
    expect(result).toContain("░");
  });

  it("image renders label centered over ░ fill", () => {
    const image: ComponentObject = {
      borderStyle: "single",
      componentType: "image",
      height: 6,
      id: "1",
      label: "Photo",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([image], { cols: 25, rows: 10 }));
    // Label overwrites ░ in the middle row
    expect(result).toContain("Photo");
    expect(result).toContain("░");
  });

  // divider (borderless)
  it("divider renders a full horizontal line without border", () => {
    const divider: ComponentObject = {
      borderStyle: "single",
      componentType: "divider",
      height: 1,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([divider], { cols: 15, rows: 3 }));
    expect(result).not.toContain("┌");
    const lines = result.split("\n");
    expect(lines[0]).toBe("──────────");
  });

  it("divider with label renders labeled separator", () => {
    const divider: ComponentObject = {
      borderStyle: "single",
      componentType: "divider",
      height: 1,
      id: "1",
      label: "OR",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 16,
      zIndex: 0,
    };
    const result = gridToString(compose([divider], { cols: 20, rows: 3 }));
    const lines = result.split("\n");
    // "── OR ──────────" pattern
    expect(lines[0]).toContain("── OR");
    expect(lines[0]).toContain("─");
  });

  it("divider with label that exactly fits renders label", () => {
    const divider: ComponentObject = {
      borderStyle: "single",
      componentType: "divider",
      height: 1,
      id: "1",
      label: "OR",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 6,
      zIndex: 0,
    };
    const result = gridToString(compose([divider], { cols: 10, rows: 3 }));
    const lines = result.split("\n");
    // width=6, label="OR" (2 chars), maxLabelLen=2 — label fits exactly
    expect(lines[0]).toBe("── OR");
  });

  it("divider with width too small for label renders plain line", () => {
    const divider: ComponentObject = {
      borderStyle: "single",
      componentType: "divider",
      height: 1,
      id: "1",
      label: "OR",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 4,
      zIndex: 0,
    };
    const result = gridToString(compose([divider], { cols: 10, rows: 3 }));
    const lines = result.split("\n");
    // width=4, too small for "── X ─" pattern — falls back to plain line
    expect(lines[0]).toBe("────");
  });

  // toggle (borderless)
  it("toggle renders off state by default", () => {
    const toggle: ComponentObject = {
      borderStyle: "single",
      componentType: "toggle",
      height: 1,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("[──●]");
  });

  it("toggle renders on state when checked=true", () => {
    const toggle: ComponentObject = {
      borderStyle: "single",
      checked: true,
      componentType: "toggle",
      height: 1,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    expect(result).toContain("[●──]");
  });

  it("toggle renders label after the switch indicator", () => {
    const toggle: ComponentObject = {
      borderStyle: "single",
      componentType: "toggle",
      height: 1,
      id: "1",
      label: "Dark mode",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };
    const result = gridToString(compose([toggle], { cols: 25, rows: 3 }));
    const lines = result.split("\n");
    expect(lines[0]).toContain("Dark mode");
    // Label starts at col+6
    expect(must(lines[0]).indexOf("Dark mode")).toBe(6);
  });

  // alert (bordered)
  it("alert renders default info icon and label", () => {
    const alert: ComponentObject = {
      borderStyle: "single",
      componentType: "alert",
      height: 5,
      id: "1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([alert], { cols: 35, rows: 8 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("i");
    expect(lines[1]).toContain("Alert");
  });

  it("alert renders warning icon for alertType=warning", () => {
    const alert: ComponentObject = {
      alertType: "warning",
      borderStyle: "single",
      componentType: "alert",
      height: 5,
      id: "1",
      label: "Check input",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([alert], { cols: 35, rows: 8 }));
    const lines = result.split("\n");
    expect(lines[1]).toContain("!");
    expect(lines[1]).toContain("Check input");
  });

  it("alert renders correct icons for error and success types", () => {
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
      borderStyle: "single",
      componentType: "breadcrumb",
      height: 1,
      id: "1",
      items: ["Home", "Products", "Details"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    expect(result).not.toContain("┌");
    expect(result).toContain("Home > Products > Details");
  });

  it("breadcrumb renders items with custom separator", () => {
    const breadcrumb: ComponentObject = {
      borderStyle: "single",
      componentType: "breadcrumb",
      height: 1,
      id: "1",
      items: ["A", "B", "C"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      separator: " / ",
      type: "component",
      width: 30,
      zIndex: 0,
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    expect(result).toContain("A / B / C");
  });

  it("breadcrumb truncates to obj.width", () => {
    const breadcrumb: ComponentObject = {
      borderStyle: "single",
      componentType: "breadcrumb",
      height: 1,
      id: "1",
      items: ["Home", "Very Long Section Name"],
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 10,
      zIndex: 0,
    };
    const result = gridToString(compose([breadcrumb], { cols: 35, rows: 3 }));
    const lines = result.split("\n");
    expect(must(lines[0]).length).toBeLessThanOrEqual(10);
  });
});
