import { describe, expect, it } from "vitest";
import { validateContentWidth } from "./validate";

describe("validateContentWidth", () => {
  describe("box", () => {
    it("should return error when explicit width < label minimum", () => {
      const errors = validateContentWidth({
        type: "box",
        label: "Hello",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["width"]);
      expect(errors[0].message).toContain("box width 5");
      expect(errors[0].message).toContain("minimum: 9");
    });

    it("should return no error when explicit width = label minimum", () => {
      const errors = validateContentWidth({
        type: "box",
        label: "Hello",
        width: 9, // "Hello".length + 4
      });
      expect(errors).toEqual([]);
    });

    it("should return no error when width is omitted (even with long label)", () => {
      const errors = validateContentWidth({
        type: "box",
        label: "A very long label that would exceed defaults",
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
        type: "box",
        label: "AB\nCDEF",
        width: 7,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("minimum: 8");
    });

    it("should pass when multiline label widest line fits", () => {
      const errors = validateContentWidth({
        type: "box",
        label: "AB\nCDEF",
        width: 8,
      });
      expect(errors).toEqual([]);
    });

    it("should use short line width when all lines are short", () => {
      // "A\nB" → widest = 1 → minWidth = 5
      const errors = validateContentWidth({
        type: "box",
        label: "A\nB",
        width: 5,
      });
      expect(errors).toEqual([]);
    });
  });

  describe("component (label-based)", () => {
    it("should return error when button width < content minimum", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "button",
        label: "Submit Payment",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["width"]);
      expect(errors[0].message).toContain("button width 5");
      expect(errors[0].message).toContain("Submit Payment");
    });

    it("should return no error when button width fits label", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "button",
        label: "OK",
        width: 12,
      });
      expect(errors).toEqual([]);
    });

    it("should return no error when component width is omitted", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "button",
        label: "Submit Payment",
      });
      expect(errors).toEqual([]);
    });

    it("should return error for input with icon when width too small", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "input",
        label: "Search",
        icon: "Q",
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("input width 5");
    });
  });

  describe("component (items-based)", () => {
    it("should return error when navbar width < content minimum", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "navbar",
        navItems: ["Home", "About", "Contact"],
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("navbar width 5");
    });

    it("should return error when tabs width < content minimum", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "tabs",
        tabs: ["Tab 1", "Tab 2", "Tab 3"],
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("tabs width 5");
    });

    it("should return error when table width < content minimum", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "table",
        columns: ["Name", "Email", "Role"],
        width: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("table width 5");
    });
  });

  describe("text, line, arrow", () => {
    it("should always return no errors for text", () => {
      const errors = validateContentWidth({
        type: "text",
        content: "Hello world",
      });
      expect(errors).toEqual([]);
    });

    it("should always return no errors for line", () => {
      const errors = validateContentWidth({
        type: "line",
        endPosition: { col: 10, row: 10 },
      });
      expect(errors).toEqual([]);
    });

    it("should always return no errors for arrow", () => {
      const errors = validateContentWidth({
        type: "arrow",
        endPosition: { col: 10, row: 10 },
      });
      expect(errors).toEqual([]);
    });
  });

  describe("error messages", () => {
    it("should include width, minimum, and context in box error", () => {
      const errors = validateContentWidth({
        type: "box",
        label: "Settings",
        width: 5,
      });
      expect(errors[0].message).toBe(
        "box width 5 is too small for label 'Settings' (minimum: 12)",
      );
    });

    it("should include component type and label in component error", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "button",
        label: "Submit",
        width: 5,
      });
      expect(errors[0].message).toContain("button width 5");
      expect(errors[0].message).toContain("label 'Submit'");
    });

    it("should use component content description when no label", () => {
      const errors = validateContentWidth({
        type: "component",
        componentType: "navbar",
        navItems: ["Home", "About"],
        width: 5,
      });
      expect(errors[0].message).toContain("navbar content");
    });
  });
});
