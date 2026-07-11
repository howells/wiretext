import { describe, expect, it } from "vitest";

import { COMPONENT_BY_TYPE } from "./components";
import { computeRenderGridSize, fillDefaults } from "./defaults";
import {
  must,
  mustBeArrow,
  mustBeBox,
  mustBeComponent,
  mustBeLine,
  mustBeText,
} from "./test-utils";
import type { WireObject } from "./types";

describe("fillDefaults", () => {
  describe("when given an empty array", () => {
    it("should return an empty objects array", () => {
      const { objects } = fillDefaults([]);
      expect(objects).toEqual([]);
    });

    it("should return a valid layer", () => {
      const { layer } = fillDefaults([]);
      expect(typeof layer.id).toBe("string");
      expect(layer.id.length).toBeGreaterThan(0);
      expect(layer.name).toBe("Layer 1");
      expect(layer.visible).toBe(true);
      expect(layer.locked).toBe(false);
    });
  });

  describe("when given a box object", () => {
    it("should apply default width of 10", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      const box = mustBeBox(objects[0]);
      expect(box.type).toBe("box");
      expect(box.width).toBe(10);
    });

    it("should apply default height of 5", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      const box = mustBeBox(objects[0]);
      expect(box.height).toBe(5);
    });

    it("should apply default borderStyle of single", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      const box = mustBeBox(objects[0]);
      expect(box.borderStyle).toBe("single");
    });

    it("should preserve explicit width when larger than minimum", () => {
      const { objects } = fillDefaults([{ type: "box", width: 20 }]);
      const box = mustBeBox(objects[0]);
      expect(box.width).toBe(20);
    });

    it("should preserve explicit height", () => {
      const { objects } = fillDefaults([{ height: 8, type: "box" }]);
      const box = mustBeBox(objects[0]);
      expect(box.height).toBe(8);
    });

    it("should preserve explicit borderStyle", () => {
      const { objects } = fillDefaults([
        { borderStyle: "double", type: "box" },
      ]);
      const box = mustBeBox(objects[0]);
      expect(box.borderStyle).toBe("double");
    });
  });

  describe("when a box has a label", () => {
    it("should apply default width regardless of label", () => {
      const { objects } = fillDefaults([{ label: "Hello", type: "box" }]);
      const box = mustBeBox(objects[0]);
      expect(box.width).toBe(10);
    });

    it("should preserve explicit width even when smaller than label", () => {
      const { objects } = fillDefaults([
        { label: "Long Label Text", type: "box", width: 5 },
      ]);
      const box = mustBeBox(objects[0]);
      expect(box.width).toBe(5);
    });

    it("should keep a larger explicit width even with a label", () => {
      const label = "Hi";
      const { objects } = fillDefaults([{ label, type: "box", width: 30 }]);
      const box = mustBeBox(objects[0]);
      expect(box.width).toBe(30);
    });
  });

  describe("when given a text object", () => {
    it("should preserve the content field", () => {
      const { objects } = fillDefaults([
        { content: "Hello\nWorld", type: "text" },
      ]);
      const text = mustBeText(objects[0]);
      expect(text.type).toBe("text");
      expect(text.content).toBe("Hello\nWorld");
    });
  });

  describe("when given a line object", () => {
    it("should preserve the endPosition", () => {
      const endPosition = { col: 5, row: 10 };
      const { objects } = fillDefaults([{ endPosition, type: "line" }]);
      const line = mustBeLine(objects[0]);
      expect(line.type).toBe("line");
      expect(line.endPosition).toEqual(endPosition);
    });
  });

  describe("when given an arrow object", () => {
    it("should preserve the endPosition", () => {
      const endPosition = { col: 8, row: 3 };
      const { objects } = fillDefaults([{ endPosition, type: "arrow" }]);
      const arrow = mustBeArrow(objects[0]);
      expect(arrow.type).toBe("arrow");
      expect(arrow.endPosition).toEqual(endPosition);
    });

    it("should preserve startHead when provided", () => {
      const { objects } = fillDefaults([
        { endPosition: { col: 5, row: 5 }, startHead: true, type: "arrow" },
      ]);
      const arrow = mustBeArrow(objects[0]);
      expect(arrow.startHead).toBe(true);
    });

    it("should preserve endHead when provided", () => {
      const { objects } = fillDefaults([
        { endHead: false, endPosition: { col: 5, row: 5 }, type: "arrow" },
      ]);
      const arrow = mustBeArrow(objects[0]);
      expect(arrow.endHead).toBe(false);
    });
  });

  describe("when given a component object", () => {
    it("should apply default width from COMPONENT_BY_TYPE", () => {
      const { objects } = fillDefaults([
        { componentType: "button", type: "component" },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.type).toBe("component");
      expect(component.width).toBe(COMPONENT_BY_TYPE.button.defaultWidth);
    });

    it("should apply default height from COMPONENT_BY_TYPE", () => {
      const { objects } = fillDefaults([
        { componentType: "card", type: "component" },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.height).toBe(COMPONENT_BY_TYPE.card.defaultHeight);
    });

    it("should auto-size width to fit label when wider than default", () => {
      const { objects } = fillDefaults([
        {
          componentType: "button",
          label: "Download Everything",
          type: "component",
        },
      ]);
      const component = mustBeComponent(objects[0]);
      // "Download Everything" = 19 chars + 4 padding = 23
      expect(component.width).toBe(23);
    });

    it("should use default width when label fits within it", () => {
      const { objects } = fillDefaults([
        {
          componentType: "button",
          label: "OK",
          type: "component",
        },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.width).toBe(COMPONENT_BY_TYPE.button.defaultWidth);
    });

    it("should auto-size toggle width to fit label", () => {
      const { objects } = fillDefaults([
        {
          componentType: "toggle",
          label: "Push notifications",
          type: "component",
        },
      ]);
      const component = mustBeComponent(objects[0]);
      // "Push notifications" = 18 chars + 6 padding = 24
      expect(component.width).toBe(24);
    });

    it("should auto-size navbar width to fit nav items", () => {
      const { objects } = fillDefaults([
        {
          componentType: "navbar",
          navItems: ["Home", "About", "Contact Us", "Blog"],
          type: "component",
        },
      ]);
      const component = mustBeComponent(objects[0]);
      // "Home  About  Contact Us  Blog" = 30 chars + 7 padding = 37
      expect(component.width).toBe(
        Math.max(COMPONENT_BY_TYPE.navbar.defaultWidth, 37)
      );
    });

    it("should preserve explicit width when larger than component minimum", () => {
      const { objects } = fillDefaults([
        { componentType: "input", type: "component", width: 40 },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.width).toBe(40);
    });

    it("should preserve explicit height", () => {
      const { objects } = fillDefaults([
        { componentType: "card", height: 20, type: "component" },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.height).toBe(20);
    });

    it("should preserve optional component fields", () => {
      const { objects } = fillDefaults([
        {
          checked: true,
          componentType: "checkbox",
          icon: "check",
          label: "Accept terms",
          type: "component",
        },
      ]);
      const component = mustBeComponent(objects[0]);
      expect(component.label).toBe("Accept terms");
      expect(component.checked).toBe(true);
      expect(component.icon).toBe("check");
    });
  });

  describe("ID assignment", () => {
    it("should assign a nanoid when object has no id", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      const object = must(objects[0]);
      expect(typeof object.id).toBe("string");
      expect(object.id.length).toBeGreaterThan(0);
    });

    it("should preserve an explicitly provided id", () => {
      const { objects } = fillDefaults([{ id: "custom-id-123", type: "box" }]);
      expect(must(objects[0]).id).toBe("custom-id-123");
    });

    it("should generate unique ids for multiple objects", () => {
      const { objects } = fillDefaults([
        { type: "box" },
        { content: "hello", type: "text" },
        { type: "box" },
      ]);
      const ids = objects.map((o) => o.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("layer assignment", () => {
    it("should assign objects to the returned layer by default", () => {
      const { objects, layer } = fillDefaults([{ type: "box" }]);
      expect(must(objects[0]).layerId).toBe(layer.id);
    });

    it("should preserve an explicitly provided layerId", () => {
      const { objects } = fillDefaults([
        { layerId: "existing-layer", type: "box" },
      ]);
      expect(must(objects[0]).layerId).toBe("existing-layer");
    });
  });

  describe("position and zIndex defaults", () => {
    it("should default position to col 0 row 0", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      expect(must(objects[0]).position).toEqual({ col: 0, row: 0 });
    });

    it("should preserve an explicit position", () => {
      const { objects } = fillDefaults([
        { position: { col: 3, row: 7 }, type: "box" },
      ]);
      expect(must(objects[0]).position).toEqual({ col: 3, row: 7 });
    });

    it("should use array index as default zIndex", () => {
      const { objects } = fillDefaults([
        { type: "box" },
        { content: "hi", type: "text" },
        { type: "box" },
      ]);
      expect(must(objects[0]).zIndex).toBe(0);
      expect(must(objects[1]).zIndex).toBe(1);
      expect(must(objects[2]).zIndex).toBe(2);
    });
  });
});

describe("computeRenderGridSize", () => {
  describe("when given an empty array", () => {
    it("should return a minimal grid of at least 1x1", () => {
      const size = computeRenderGridSize([]);
      expect(size.cols).toBeGreaterThanOrEqual(1);
      expect(size.rows).toBeGreaterThanOrEqual(1);
    });
  });

  describe("when given objects with known bounds", () => {
    it("should return tight bounds plus default padding of 2", () => {
      const box: WireObject = {
        borderStyle: "single",
        height: 5,
        id: "b1",
        layerId: "l1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const size = computeRenderGridSize([box]);
      // bounds: col=0, row=0, width=10, height=5 → maxCol=10, maxRow=5
      // + padding 2 → cols=12, rows=7
      expect(size.cols).toBe(12);
      expect(size.rows).toBe(7);
    });

    it("should account for object position in bounds", () => {
      const box: WireObject = {
        borderStyle: "single",
        height: 5,
        id: "b1",
        layerId: "l1",
        position: { col: 5, row: 3 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const size = computeRenderGridSize([box]);
      // maxCol = 5 + 10 = 15, maxRow = 3 + 5 = 8
      // + padding 2 → cols=17, rows=10
      expect(size.cols).toBe(17);
      expect(size.rows).toBe(10);
    });

    it("should use the furthest-reaching object when multiple objects exist", () => {
      const box1: WireObject = {
        borderStyle: "single",
        height: 5,
        id: "b1",
        layerId: "l1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const box2: WireObject = {
        borderStyle: "single",
        height: 4,
        id: "b2",
        layerId: "l1",
        position: { col: 20, row: 10 },
        type: "box",
        width: 8,
        zIndex: 1,
      };
      const size = computeRenderGridSize([box1, box2]);
      // box2 extends furthest: maxCol=28, maxRow=14
      // + padding 2 → cols=30, rows=16
      expect(size.cols).toBe(30);
      expect(size.rows).toBe(16);
    });
  });

  describe("when custom padding is specified", () => {
    it("should apply the provided padding value", () => {
      const box: WireObject = {
        borderStyle: "single",
        height: 5,
        id: "b1",
        layerId: "l1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const size = computeRenderGridSize([box], 5);
      // maxCol=10, maxRow=5, padding=5 → cols=15, rows=10
      expect(size.cols).toBe(15);
      expect(size.rows).toBe(10);
    });

    it("should apply zero padding when explicitly set to 0", () => {
      const box: WireObject = {
        borderStyle: "single",
        height: 5,
        id: "b1",
        layerId: "l1",
        position: { col: 0, row: 0 },
        type: "box",
        width: 10,
        zIndex: 0,
      };
      const size = computeRenderGridSize([box], 0);
      expect(size.cols).toBe(10);
      expect(size.rows).toBe(5);
    });
  });
});
