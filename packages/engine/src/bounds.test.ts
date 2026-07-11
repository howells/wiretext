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
  layerId: "layer-1",
  zIndex: 0,
};

describe("getObjectBounds", () => {
  describe("box", () => {
    it("should return position and dimensions directly", () => {
      const box: BoxObject = {
        ...BASE,
        borderStyle: "single",
        height: 4,
        position: { col: 3, row: 5 },
        type: "box",
        width: 10,
      };

      expect(getObjectBounds(box)).toEqual({
        col: 3,
        height: 4,
        row: 5,
        width: 10,
      });
    });

    it("should return zero-origin position when placed at origin", () => {
      const box: BoxObject = {
        ...BASE,
        borderStyle: "single",
        height: 8,
        position: { col: 0, row: 0 },
        type: "box",
        width: 20,
      };

      expect(getObjectBounds(box)).toEqual({
        col: 0,
        height: 8,
        row: 0,
        width: 20,
      });
    });
  });

  describe("component", () => {
    it("should return position and dimensions directly", () => {
      const component: ComponentObject = {
        ...BASE,
        borderStyle: "single",
        componentType: "button",
        height: 3,
        position: { col: 2, row: 7 },
        type: "component",
        width: 12,
      };

      expect(getObjectBounds(component)).toEqual({
        col: 2,
        height: 3,
        row: 7,
        width: 12,
      });
    });

    it("should work for any component type", () => {
      const component: ComponentObject = {
        ...BASE,
        borderStyle: "double",
        componentType: "modal",
        height: 15,
        position: { col: 10, row: 2 },
        type: "component",
        width: 30,
      };

      expect(getObjectBounds(component)).toEqual({
        col: 10,
        height: 15,
        row: 2,
        width: 30,
      });
    });
  });

  describe("text", () => {
    it("should use content length as width and 1 as height for a single line", () => {
      const text: TextObject = {
        ...BASE,
        content: "Hello World",
        position: { col: 4, row: 2 },
        type: "text",
      };

      expect(getObjectBounds(text)).toEqual({
        col: 4,
        height: 1,
        row: 2,
        width: 11,
      });
    });

    it("should use the longest line as width and line count as height for multiline content", () => {
      const text: TextObject = {
        ...BASE,
        content: "short\na much longer line\nmed line",
        position: { col: 1, row: 1 },
        type: "text",
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
        content: "",
        position: { col: 0, row: 0 },
        type: "text",
      };

      const result = getObjectBounds(text);
      expect(result.width).toBeGreaterThanOrEqual(1);
      expect(result.height).toBeGreaterThanOrEqual(1);
    });

    it("should handle content with equal-length lines by returning that length as width", () => {
      const text: TextObject = {
        ...BASE,
        content: "abc\ndef\nghi",
        position: { col: 5, row: 3 },
        type: "text",
      };

      expect(getObjectBounds(text)).toEqual({
        col: 5,
        height: 3,
        row: 3,
        width: 3,
      });
    });
  });

  describe("line", () => {
    it("should span from start to end for a horizontal line moving right", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 8, row: 5 },
        position: { col: 2, row: 5 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 2,
        height: 1,
        row: 5,
        width: 7,
      });
    });

    it("should span from start to end for a horizontal line moving left", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 2, row: 5 },
        position: { col: 8, row: 5 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 2,
        height: 1,
        row: 5,
        width: 7,
      });
    });

    it("should span from start to end for a vertical line moving down", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 3, row: 6 },
        position: { col: 3, row: 1 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 3,
        height: 6,
        row: 1,
        width: 1,
      });
    });

    it("should span from start to end for a vertical line moving up", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 3, row: 1 },
        position: { col: 3, row: 6 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 3,
        height: 6,
        row: 1,
        width: 1,
      });
    });

    it("should span the full area for a diagonal line", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 5, row: 7 },
        position: { col: 1, row: 2 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 1,
        height: 6,
        row: 2,
        width: 5,
      });
    });

    it("should handle a diagonal line going up-left (reversed direction)", () => {
      const line: LineObject = {
        ...BASE,
        endPosition: { col: 1, row: 2 },
        position: { col: 5, row: 7 },
        type: "line",
      };

      expect(getObjectBounds(line)).toEqual({
        col: 1,
        height: 6,
        row: 2,
        width: 5,
      });
    });
  });

  describe("arrow", () => {
    it("should use endPosition to determine bounds, same as line", () => {
      const arrow: ArrowObject = {
        ...BASE,
        endHead: true,
        endPosition: { col: 4, row: 0 },
        position: { col: 0, row: 0 },
        type: "arrow",
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 0,
        height: 1,
        row: 0,
        width: 5,
      });
    });

    it("should handle arrow pointing up (position below endPosition)", () => {
      const arrow: ArrowObject = {
        ...BASE,
        endHead: true,
        endPosition: { col: 3, row: 3 },
        position: { col: 3, row: 8 },
        type: "arrow",
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 3,
        height: 6,
        row: 3,
        width: 1,
      });
    });

    it("should handle arrow with both heads and reversed direction", () => {
      const arrow: ArrowObject = {
        ...BASE,
        endHead: true,
        endPosition: { col: 2, row: 5 },
        position: { col: 10, row: 5 },
        startHead: true,
        type: "arrow",
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 2,
        height: 1,
        row: 5,
        width: 9,
      });
    });

    it("should span the full area for a diagonal arrow", () => {
      const arrow: ArrowObject = {
        ...BASE,
        endHead: true,
        endPosition: { col: 9, row: 9 },
        position: { col: 4, row: 4 },
        type: "arrow",
      };

      expect(getObjectBounds(arrow)).toEqual({
        col: 4,
        height: 6,
        row: 4,
        width: 6,
      });
    });
  });
});
