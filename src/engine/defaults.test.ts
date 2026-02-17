import { describe, expect, it } from "vitest";
import { COMPONENT_BY_TYPE } from "./components";
import { computeRenderGridSize, fillDefaults } from "./defaults";
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
      expect(objects[0].type).toBe("box");
      if (objects[0].type === "box") {
        expect(objects[0].width).toBe(10);
      }
    });

    it("should apply default height of 5", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      if (objects[0].type === "box") {
        expect(objects[0].height).toBe(5);
      }
    });

    it("should apply default borderStyle of single", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      if (objects[0].type === "box") {
        expect(objects[0].borderStyle).toBe("single");
      }
    });

    it("should preserve explicit width when larger than minimum", () => {
      const { objects } = fillDefaults([{ type: "box", width: 20 }]);
      if (objects[0].type === "box") {
        expect(objects[0].width).toBe(20);
      }
    });

    it("should preserve explicit height", () => {
      const { objects } = fillDefaults([{ type: "box", height: 8 }]);
      if (objects[0].type === "box") {
        expect(objects[0].height).toBe(8);
      }
    });

    it("should preserve explicit borderStyle", () => {
      const { objects } = fillDefaults([
        { type: "box", borderStyle: "double" },
      ]);
      if (objects[0].type === "box") {
        expect(objects[0].borderStyle).toBe("double");
      }
    });
  });

  describe("when a box has a label", () => {
    it("should apply default width regardless of label", () => {
      const { objects } = fillDefaults([{ type: "box", label: "Hello" }]);
      if (objects[0].type === "box") {
        expect(objects[0].width).toBe(10);
      }
    });

    it("should preserve explicit width even when smaller than label", () => {
      const { objects } = fillDefaults([
        { type: "box", label: "Long Label Text", width: 5 },
      ]);
      if (objects[0].type === "box") {
        expect(objects[0].width).toBe(5);
      }
    });

    it("should keep a larger explicit width even with a label", () => {
      const label = "Hi";
      const { objects } = fillDefaults([{ type: "box", label, width: 30 }]);
      if (objects[0].type === "box") {
        expect(objects[0].width).toBe(30);
      }
    });
  });

  describe("when given a text object", () => {
    it("should preserve the content field", () => {
      const { objects } = fillDefaults([
        { type: "text", content: "Hello\nWorld" },
      ]);
      expect(objects[0].type).toBe("text");
      if (objects[0].type === "text") {
        expect(objects[0].content).toBe("Hello\nWorld");
      }
    });
  });

  describe("when given a line object", () => {
    it("should preserve the endPosition", () => {
      const endPosition = { col: 5, row: 10 };
      const { objects } = fillDefaults([{ type: "line", endPosition }]);
      expect(objects[0].type).toBe("line");
      if (objects[0].type === "line") {
        expect(objects[0].endPosition).toEqual(endPosition);
      }
    });
  });

  describe("when given an arrow object", () => {
    it("should preserve the endPosition", () => {
      const endPosition = { col: 8, row: 3 };
      const { objects } = fillDefaults([{ type: "arrow", endPosition }]);
      expect(objects[0].type).toBe("arrow");
      if (objects[0].type === "arrow") {
        expect(objects[0].endPosition).toEqual(endPosition);
      }
    });

    it("should preserve startHead when provided", () => {
      const { objects } = fillDefaults([
        { type: "arrow", endPosition: { col: 5, row: 5 }, startHead: true },
      ]);
      if (objects[0].type === "arrow") {
        expect(objects[0].startHead).toBe(true);
      }
    });

    it("should preserve endHead when provided", () => {
      const { objects } = fillDefaults([
        { type: "arrow", endPosition: { col: 5, row: 5 }, endHead: false },
      ]);
      if (objects[0].type === "arrow") {
        expect(objects[0].endHead).toBe(false);
      }
    });
  });

  describe("when given a component object", () => {
    it("should apply default width from COMPONENT_BY_TYPE", () => {
      const { objects } = fillDefaults([
        { type: "component", componentType: "button" },
      ]);
      expect(objects[0].type).toBe("component");
      if (objects[0].type === "component") {
        expect(objects[0].width).toBe(COMPONENT_BY_TYPE.button.defaultWidth);
      }
    });

    it("should apply default height from COMPONENT_BY_TYPE", () => {
      const { objects } = fillDefaults([
        { type: "component", componentType: "card" },
      ]);
      if (objects[0].type === "component") {
        expect(objects[0].height).toBe(COMPONENT_BY_TYPE.card.defaultHeight);
      }
    });

    it("should apply default width regardless of label length", () => {
      const { objects } = fillDefaults([
        {
          type: "component",
          componentType: "button",
          label: "Download Everything",
        },
      ]);
      if (objects[0].type === "component") {
        expect(objects[0].width).toBe(COMPONENT_BY_TYPE.button.defaultWidth);
      }
    });

    it("should preserve explicit width when larger than component minimum", () => {
      const { objects } = fillDefaults([
        { type: "component", componentType: "input", width: 40 },
      ]);
      if (objects[0].type === "component") {
        expect(objects[0].width).toBe(40);
      }
    });

    it("should preserve explicit height", () => {
      const { objects } = fillDefaults([
        { type: "component", componentType: "card", height: 20 },
      ]);
      if (objects[0].type === "component") {
        expect(objects[0].height).toBe(20);
      }
    });

    it("should preserve optional component fields", () => {
      const { objects } = fillDefaults([
        {
          type: "component",
          componentType: "checkbox",
          label: "Accept terms",
          checked: true,
          icon: "check",
        },
      ]);
      if (objects[0].type === "component") {
        expect(objects[0].label).toBe("Accept terms");
        expect(objects[0].checked).toBe(true);
        expect(objects[0].icon).toBe("check");
      }
    });
  });

  describe("ID assignment", () => {
    it("should assign a nanoid when object has no id", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      expect(typeof objects[0].id).toBe("string");
      expect(objects[0].id.length).toBeGreaterThan(0);
    });

    it("should preserve an explicitly provided id", () => {
      const { objects } = fillDefaults([{ type: "box", id: "custom-id-123" }]);
      expect(objects[0].id).toBe("custom-id-123");
    });

    it("should generate unique ids for multiple objects", () => {
      const { objects } = fillDefaults([
        { type: "box" },
        { type: "text", content: "hello" },
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
      expect(objects[0].layerId).toBe(layer.id);
    });

    it("should preserve an explicitly provided layerId", () => {
      const { objects } = fillDefaults([
        { type: "box", layerId: "existing-layer" },
      ]);
      expect(objects[0].layerId).toBe("existing-layer");
    });
  });

  describe("position and zIndex defaults", () => {
    it("should default position to col 0 row 0", () => {
      const { objects } = fillDefaults([{ type: "box" }]);
      expect(objects[0].position).toEqual({ col: 0, row: 0 });
    });

    it("should preserve an explicit position", () => {
      const { objects } = fillDefaults([
        { type: "box", position: { col: 3, row: 7 } },
      ]);
      expect(objects[0].position).toEqual({ col: 3, row: 7 });
    });

    it("should use array index as default zIndex", () => {
      const { objects } = fillDefaults([
        { type: "box" },
        { type: "text", content: "hi" },
        { type: "box" },
      ]);
      expect(objects[0].zIndex).toBe(0);
      expect(objects[1].zIndex).toBe(1);
      expect(objects[2].zIndex).toBe(2);
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
        id: "b1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "l1",
      };
      const size = computeRenderGridSize([box]);
      // bounds: col=0, row=0, width=10, height=5 → maxCol=10, maxRow=5
      // + padding 2 → cols=12, rows=7
      expect(size.cols).toBe(12);
      expect(size.rows).toBe(7);
    });

    it("should account for object position in bounds", () => {
      const box: WireObject = {
        id: "b1",
        type: "box",
        position: { col: 5, row: 3 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "l1",
      };
      const size = computeRenderGridSize([box]);
      // maxCol = 5 + 10 = 15, maxRow = 3 + 5 = 8
      // + padding 2 → cols=17, rows=10
      expect(size.cols).toBe(17);
      expect(size.rows).toBe(10);
    });

    it("should use the furthest-reaching object when multiple objects exist", () => {
      const box1: WireObject = {
        id: "b1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "l1",
      };
      const box2: WireObject = {
        id: "b2",
        type: "box",
        position: { col: 20, row: 10 },
        width: 8,
        height: 4,
        borderStyle: "single",
        zIndex: 1,
        layerId: "l1",
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
        id: "b1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "l1",
      };
      const size = computeRenderGridSize([box], 5);
      // maxCol=10, maxRow=5, padding=5 → cols=15, rows=10
      expect(size.cols).toBe(15);
      expect(size.rows).toBe(10);
    });

    it("should apply zero padding when explicitly set to 0", () => {
      const box: WireObject = {
        id: "b1",
        type: "box",
        position: { col: 0, row: 0 },
        width: 10,
        height: 5,
        borderStyle: "single",
        zIndex: 0,
        layerId: "l1",
      };
      const size = computeRenderGridSize([box], 0);
      expect(size.cols).toBe(10);
      expect(size.rows).toBe(5);
    });
  });
});
