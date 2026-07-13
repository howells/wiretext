import { describe, expect, it } from "vitest";

import { getResizeConstraint } from "./index";
import type { BoxObject, ComponentObject, ConnectorObject } from "./types";

describe("getResizeConstraint", () => {
  it("returns 'none' for a connector", () => {
    const connector: ConnectorObject = {
      fromId: "a",
      id: "c1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      toId: "b",
      type: "connector",
      zIndex: 0,
    };

    expect(getResizeConstraint(connector)).toBe("none");
  });

  it("returns 'both' for a box (non-component)", () => {
    const box: BoxObject = {
      borderStyle: "single",
      height: 5,
      id: "b1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "box",
      width: 10,
      zIndex: 0,
    };

    expect(getResizeConstraint(box)).toBe("both");
  });

  it("returns 'none' for an icon component", () => {
    const icon: ComponentObject = {
      borderStyle: "single",
      componentType: "icon",
      height: 1,
      id: "icon1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 1,
      zIndex: 0,
    };

    expect(getResizeConstraint(icon)).toBe("none");
  });

  it("returns 'horizontal' for a fixed-height component (button)", () => {
    const button: ComponentObject = {
      borderStyle: "single",
      componentType: "button",
      height: 3,
      id: "button1",
      label: "Submit",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 10,
      zIndex: 0,
    };

    expect(getResizeConstraint(button)).toBe("horizontal");
  });

  it("returns 'both' for a freeform component (card)", () => {
    const card: ComponentObject = {
      borderStyle: "single",
      componentType: "card",
      height: 8,
      id: "card1",
      layerId: "layer-1",
      position: { col: 0, row: 0 },
      type: "component",
      width: 20,
      zIndex: 0,
    };

    expect(getResizeConstraint(card)).toBe("both");
  });
});
