import { describe, expect, it } from "vitest";

import { must } from "./test-utils";
import { validateContentWidth } from "./validate";

describe("validateContentWidth", () => {
  describe("box", () => {
    it("should return error when explicit width < label minimum", () => {
      const errors = validateContentWidth({
        label: "Hello",
        type: "box",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      const error = must(errors[0]);
      expect(error.path).toEqual(["width"]);
      expect(error.message).toContain("box width 5");
      expect(error.message).toContain("minimum: 9");
    });

    it("should return no error when explicit width = label minimum", () => {
      // "Hello".length + 4
      const errors = validateContentWidth({
        label: "Hello",
        type: "box",
        width: 9,
      });
      expect(errors).toEqual([]);
    });

    it("should return no error when width is omitted (even with long label)", () => {
      const errors = validateContentWidth({
        label: "A very long label that would exceed defaults",
        type: "box",
      });
      expect(errors).toEqual([]);
    });

    it("should return no error when box has no label", () => {
      const errors = validateContentWidth({
        type: "box",
        width: 3,
      });
      expect(errors).toEqual([]);
    });

    it("should use widest line for multiline label minimum width", () => {
      // "AB\nCDEF" → widest line is "CDEF" (4 chars) → minWidth = 4 + 4 = 8
      const errors = validateContentWidth({
        label: "AB\nCDEF",
        type: "box",
        width: 7,
      });
      expect(errors).toHaveLength(1);
      expect(must(errors[0]).message).toContain("minimum: 8");
    });

    it("should pass when multiline label widest line fits", () => {
      const errors = validateContentWidth({
        label: "AB\nCDEF",
        type: "box",
        width: 8,
      });
      expect(errors).toEqual([]);
    });

    it("should use short line width when all lines are short", () => {
      // "A\nB" → widest = 1 → minWidth = 5
      const errors = validateContentWidth({
        label: "A\nB",
        type: "box",
        width: 5,
      });
      expect(errors).toEqual([]);
    });
  });

  describe("component (label-based)", () => {
    it("should return error when button width < content minimum", () => {
      const errors = validateContentWidth({
        componentType: "button",
        label: "Submit Payment",
        type: "component",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      const error = must(errors[0]);
      expect(error.path).toEqual(["width"]);
      expect(error.message).toContain("button width 5");
      expect(error.message).toContain("Submit Payment");
    });

    it("should return no error when button width fits label", () => {
      const errors = validateContentWidth({
        componentType: "button",
        label: "OK",
        type: "component",
        width: 12,
      });
      expect(errors).toEqual([]);
    });

    it("should return no error when component width is omitted", () => {
      const errors = validateContentWidth({
        componentType: "button",
        label: "Submit Payment",
        type: "component",
      });
      expect(errors).toEqual([]);
    });

    it("should return error for input with icon when width too small", () => {
      const errors = validateContentWidth({
        componentType: "input",
        icon: "Q",
        label: "Search",
        type: "component",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(must(errors[0]).message).toContain("input width 5");
    });
  });

  describe("component (items-based)", () => {
    it("should return error when navbar width < content minimum", () => {
      const errors = validateContentWidth({
        componentType: "navbar",
        navItems: ["Home", "About", "Contact"],
        type: "component",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(must(errors[0]).message).toContain("navbar width 5");
    });

    it("should return error when tabs width < content minimum", () => {
      const errors = validateContentWidth({
        componentType: "tabs",
        tabs: ["Tab 1", "Tab 2", "Tab 3"],
        type: "component",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(must(errors[0]).message).toContain("tabs width 5");
    });

    it("should return error when table width < content minimum", () => {
      const errors = validateContentWidth({
        columns: ["Name", "Email", "Role"],
        componentType: "table",
        type: "component",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(must(errors[0]).message).toContain("table width 5");
    });
  });

  describe("text, line, arrow", () => {
    it("should always return no errors for text", () => {
      const errors = validateContentWidth({
        content: "Hello world",
        type: "text",
      });
      expect(errors).toEqual([]);
    });

    it("should always return no errors for line", () => {
      const errors = validateContentWidth({
        endPosition: { col: 10, row: 10 },
        type: "line",
      });
      expect(errors).toEqual([]);
    });

    it("should always return no errors for arrow", () => {
      const errors = validateContentWidth({
        endPosition: { col: 10, row: 10 },
        type: "arrow",
      });
      expect(errors).toEqual([]);
    });
  });

  describe("error messages", () => {
    it("should include width, minimum, and context in box error", () => {
      const errors = validateContentWidth({
        label: "Settings",
        type: "box",
        width: 5,
      });
      expect(must(errors[0]).message).toBe(
        "box width 5 is too small for label 'Settings' (minimum: 12)"
      );
    });

    it("should include component type and label in component error", () => {
      const errors = validateContentWidth({
        componentType: "button",
        label: "Submit",
        type: "component",
        width: 5,
      });
      const error = must(errors[0]);
      expect(error.message).toContain("button width 5");
      expect(error.message).toContain("label 'Submit'");
    });

    it("should use component content description when no label", () => {
      const errors = validateContentWidth({
        componentType: "navbar",
        navItems: ["Home", "About"],
        type: "component",
        width: 5,
      });
      expect(must(errors[0]).message).toContain("navbar content");
    });
  });
});
