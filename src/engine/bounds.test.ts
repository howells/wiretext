import { describe, expect, it } from "vitest";
import { getObjectBounds } from "./bounds";
import type {
  ArrowObject,
  BoxObject,
  ComponentObject,
  LineObject,
  TextObject,
} from "./types";

const BASE = {
  id: "obj-1",
  zIndex: 0,
  layerId: "layer-1",
};

describe("getObjectBounds", () => {
  describe("box", () => {
    it("should return position and dimensions directly", () => {
      const box: BoxObject = {
        ...BASE,
        type: "box",
        position: { col: 3, row: 5 },
        width: 10,
        height: 4,
        borderStyle: "single",
      };

      expect(getObjectBounds(box)).toEqual({
        col: 3,
        row: 5,
        width: 10,
        height: 4,
      });
    });

    it("should return zero-origin position when placed at origin", () => {
      const box: BoxObject = {
        ...BASE,
        type: "box",
        position: { col: 0, row: 0 },
        width: 20,
        height: 8,
        borderStyle: "single",
      };

      expect(getObjectBounds(box)).toEqual({
        col: 0,
        row: 0,
        width: 20,
        height: 8,
      });
    });
  });

  describe("component", () => {
    it("should return position and dimensions directly", () => {
      const component: ComponentObject = {
        ...BASE,
        type: "component",
        componentType: "button",
        position: { col: 2, row: 7 },
        width: 12,
        height: 3,
        borderStyle: "single",
      };

      expect(getObjectBounds(component)).toEqual({
        col: 2,
        row: 7,
        width: 12,
        height: 3,
      });
    });

    it("should work for any component type", () => {
      const component: ComponentObject = {
        ...BASE,
        type: "component",
        componentType: "modal",
        position: { col: 10, row: 2 },
        width: 30,
        height: 15,
        borderStyle: "double",
      };

      expect(getObjectBounds(component)).toEqual({
        col: 10,
        row: 2,
        width: 30,
        height: 15,
      });
    });
  });

  describe("text", () => {
    it("should use content length as width and 1 as height for a single line", () => {
      const text: TextObject = {
        ...BASE,
        type: "text",
        position: { col: 4, row: 2 },
        content: "Hello World",
      };

      expect(getObjectBounds(text)).toEqual({
        col: 4,
        row: 2,
        width: 11,
        height: 1,
      });
    });

    it("should use the longest line as width and line count as height for multiline content", () => {
      const text: TextObject = {
        ...BASE,
        type: "text",
        position: { col: 1, row: 1 },
        content: "short\na much longer line\nmed line",
      };

      const result = getObjectBounds(text);
      expect(result.col).toBe(1);
      expect(result.row).toBe(1);
      expect(result.width).toBe("a much longer line".length);
      expect(result.height).toBe(3);
    });

    it("should return width >= 1 and height >= 1 for empty content", () => {
      const text: TextObject = {
        ...BASE,
        type: "text",
        position: { col: 0, row: 0 },
        content: "",
      };

      const result = getObjectBounds(text);
      expect(result.width).toBeGreaterThanOrEqual(1);
      expect(result.height).toBeGreaterThanOrEqual(1);
    });

    it("should handle content with equal-length lines by returning that length as width", () => {
      const text: TextObject = {
        ...BASE,
        type: "text",
        position: { col: 5, row: 3 },
        content: "abc\ndef\nghi",
      };

      expect(getObjectBounds(text)).toEqual({
        col: 5,
        row: 3,
        width: 3,
        height: 3,
      });
    });
  });

  describe("line", () => {
    it("should span from start to end for a horizontal line moving right", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 2, row: 5 },
        endPosition: { col: 8, row: 5 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 2,
        row: 5,
        width: 7,
        height: 1,
      });
    });

    it("should span from start to end for a horizontal line moving left", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 8, row: 5 },
        endPosition: { col: 2, row: 5 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 2,
        row: 5,
        width: 7,
        height: 1,
      });
    });

    it("should span from start to end for a vertical line moving down", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 3, row: 1 },
        endPosition: { col: 3, row: 6 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 3,
        row: 1,
        width: 1,
        height: 6,
      });
    });

    it("should span from start to end for a vertical line moving up", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 3, row: 6 },
        endPosition: { col: 3, row: 1 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 3,
        row: 1,
        width: 1,
        height: 6,
      });
    });

    it("should span the full area for a diagonal line", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 1, row: 2 },
        endPosition: { col: 5, row: 7 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 1,
        row: 2,
        width: 5,
        height: 6,
      });
    });

    it("should handle a diagonal line going up-left (reversed direction)", () => {
      const line: LineObject = {
        ...BASE,
        type: "line",
        position: { col: 5, row: 7 },
        endPosition: { col: 1, row: 2 },
      };

      expect(getObjectBounds(line)).toEqual({
        col: 1,
        row: 2,
        width: 5,
        height: 6,
      });
    });
  });

  describe("arrow", () => {
    it("should use endPosition to determine bounds, same as line", () => {
      const arrow: ArrowObject = {
        ...BASE,
        type: "arrow",
        position: { col: 0, row: 0 },
        endPosition: { col: 4, row: 0 },
        endHead: true,
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 0,
        row: 0,
        width: 5,
        height: 1,
      });
    });

    it("should handle arrow pointing up (position below endPosition)", () => {
      const arrow: ArrowObject = {
        ...BASE,
        type: "arrow",
        position: { col: 3, row: 8 },
        endPosition: { col: 3, row: 3 },
        endHead: true,
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 3,
        row: 3,
        width: 1,
        height: 6,
      });
    });

    it("should handle arrow with both heads and reversed direction", () => {
      const arrow: ArrowObject = {
        ...BASE,
        type: "arrow",
        position: { col: 10, row: 5 },
        endPosition: { col: 2, row: 5 },
        startHead: true,
        endHead: true,
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 2,
        row: 5,
        width: 9,
        height: 1,
      });
    });

    it("should span the full area for a diagonal arrow", () => {
      const arrow: ArrowObject = {
        ...BASE,
        type: "arrow",
        position: { col: 4, row: 4 },
        endPosition: { col: 9, row: 9 },
        endHead: true,
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 4,
        row: 4,
        width: 6,
        height: 6,
      });
    });
  });
});
