import { describe, expect, it } from "vitest";

import { ARROW_CHARS, BOX_CHARS, getBoxChars, LINE_CHARS } from "./characters";
import type { BorderStyle } from "./types";

const BORDER_STYLES: BorderStyle[] = ["single", "double", "rounded", "heavy"];
const BOX_CHAR_KEYS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
  "horizontal",
  "vertical",
  "teeRight",
  "teeLeft",
] as const;

describe("BOX_CHARS", () => {
  it("should have entries for all 4 border styles", () => {
    for (const style of BORDER_STYLES) {
      expect(BOX_CHARS).toHaveProperty(style);
    }
  });

  it("should have all 8 required properties for each style", () => {
    for (const style of BORDER_STYLES) {
      for (const key of BOX_CHAR_KEYS) {
        expect(BOX_CHARS[style]).toHaveProperty(key);
        expect(typeof BOX_CHARS[style][key]).toBe("string");
      }
    }
  });

  it("should have correct chars for the single border style", () => {
    expect(BOX_CHARS.single).toEqual({
      bottomLeft: "└",
      bottomRight: "┘",
      horizontal: "─",
      teeLeft: "┤",
      teeRight: "├",
      topLeft: "┌",
      topRight: "┐",
      vertical: "│",
    });
  });

  it("should have correct chars for the double border style", () => {
    expect(BOX_CHARS.double).toEqual({
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      teeLeft: "╣",
      teeRight: "╠",
      topLeft: "╔",
      topRight: "╗",
      vertical: "║",
    });
  });

  it("should have correct chars for the rounded border style", () => {
    expect(BOX_CHARS.rounded).toEqual({
      bottomLeft: "╰",
      bottomRight: "╯",
      horizontal: "─",
      teeLeft: "┤",
      teeRight: "├",
      topLeft: "╭",
      topRight: "╮",
      vertical: "│",
    });
  });

  it("should have correct chars for the heavy border style", () => {
    expect(BOX_CHARS.heavy).toEqual({
      bottomLeft: "┗",
      bottomRight: "┛",
      horizontal: "━",
      teeLeft: "┫",
      teeRight: "┣",
      topLeft: "┏",
      topRight: "┓",
      vertical: "┃",
    });
  });

  it("should have unique corner chars that differ between styles", () => {
    const topLeftChars = BORDER_STYLES.map((s) => BOX_CHARS[s].topLeft);
    const uniqueTopLeft = new Set(topLeftChars);
    expect(uniqueTopLeft.size).toBe(BORDER_STYLES.length);
  });
});

describe("getBoxChars", () => {
  it("should return the correct chars for single style", () => {
    expect(getBoxChars("single")).toEqual(BOX_CHARS.single);
  });

  it("should return the correct chars for double style", () => {
    expect(getBoxChars("double")).toEqual(BOX_CHARS.double);
  });

  it("should return the correct chars for rounded style", () => {
    expect(getBoxChars("rounded")).toEqual(BOX_CHARS.rounded);
  });

  it("should return the correct chars for heavy style", () => {
    expect(getBoxChars("heavy")).toEqual(BOX_CHARS.heavy);
  });

  it("should return a reference equal to the corresponding BOX_CHARS entry", () => {
    for (const style of BORDER_STYLES) {
      expect(getBoxChars(style)).toBe(BOX_CHARS[style]);
    }
  });
});

describe("LINE_CHARS", () => {
  it("should have all 4 direction chars", () => {
    expect(LINE_CHARS).toHaveProperty("horizontal");
    expect(LINE_CHARS).toHaveProperty("vertical");
    expect(LINE_CHARS).toHaveProperty("diagonalDown");
    expect(LINE_CHARS).toHaveProperty("diagonalUp");
  });

  it("should have correct horizontal char", () => {
    expect(LINE_CHARS.horizontal).toBe("─");
  });

  it("should have correct vertical char", () => {
    expect(LINE_CHARS.vertical).toBe("│");
  });

  it("should have correct diagonal down char", () => {
    expect(LINE_CHARS.diagonalDown).toBe("╲");
  });

  it("should have correct diagonal up char", () => {
    expect(LINE_CHARS.diagonalUp).toBe("╱");
  });
});

describe("ARROW_CHARS", () => {
  it("should have all 8 direction chars", () => {
    const expectedKeys = [
      "right",
      "left",
      "up",
      "down",
      "upRight",
      "downRight",
      "downLeft",
      "upLeft",
    ] as const;

    for (const key of expectedKeys) {
      expect(ARROW_CHARS).toHaveProperty(key);
      expect(typeof ARROW_CHARS[key]).toBe("string");
    }
  });

  it("should have correct cardinal direction chars", () => {
    expect(ARROW_CHARS.right).toBe("→");
    expect(ARROW_CHARS.left).toBe("←");
    expect(ARROW_CHARS.up).toBe("↑");
    expect(ARROW_CHARS.down).toBe("↓");
  });

  it("should have correct diagonal direction chars", () => {
    expect(ARROW_CHARS.upRight).toBe("↗");
    expect(ARROW_CHARS.downRight).toBe("↘");
    expect(ARROW_CHARS.downLeft).toBe("↙");
    expect(ARROW_CHARS.upLeft).toBe("↖");
  });

  it("should have unique chars for each direction", () => {
    const chars = Object.values(ARROW_CHARS);
    const unique = new Set(chars);
    expect(unique.size).toBe(chars.length);
  });
});
