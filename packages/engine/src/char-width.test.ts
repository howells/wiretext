import { describe, expect, it } from "vitest";

import { charWidth, displayWidth, isWide, SHADOW } from "./char-width";

describe("SHADOW constant", () => {
  it("is the null character", () => {
    expect(SHADOW).toBe("\u0000");
  });
});

describe("charWidth", () => {
  it("returns 1 for ASCII characters", () => {
    expect(charWidth("A")).toBe(1);
    expect(charWidth("z")).toBe(1);
    expect(charWidth("0")).toBe(1);
    expect(charWidth(" ")).toBe(1);
    expect(charWidth("!")).toBe(1);
  });

  it("returns 1 for engine-internal box drawing chars", () => {
    const boxChars = ["┌", "┐", "└", "┘", "─", "│", "├", "┤"];
    for (const ch of boxChars) {
      expect(charWidth(ch)).toBe(1);
    }
  });

  it("returns 1 for engine-internal geometric shapes", () => {
    const shapes = ["●", "○", "▶", "▾", "▲", "▼", "◆", "◇", "□"];
    for (const ch of shapes) {
      expect(charWidth(ch)).toBe(1);
    }
  });

  it("returns 1 for engine-internal dingbats", () => {
    const dingbats = ["✓", "✕", "✎", "✦", "✉"];
    for (const ch of dingbats) {
      expect(charWidth(ch)).toBe(1);
    }
  });

  it("returns 1 for arrow chars", () => {
    const arrows = ["→", "←", "↑", "↓", "↗", "↘", "↙", "↖"];
    for (const ch of arrows) {
      expect(charWidth(ch)).toBe(1);
    }
  });

  it("returns 1 for block elements", () => {
    expect(charWidth("░")).toBe(1);
    expect(charWidth("▓")).toBe(1);
  });

  it("returns 1 for ellipsis", () => {
    expect(charWidth("…")).toBe(1);
  });

  it("returns 1 for replacement icon chars (⍥ and ♩)", () => {
    // User icon (replaces ☺)
    expect(charWidth("⍥")).toBe(1);
    // Music icon (replaces ♫)
    expect(charWidth("♩")).toBe(1);
  });

  it("returns 1 for Misc Symbols (not in ENGINE_SINGLE_WIDTH)", () => {
    // These are 1x because they fall through to the default return
    expect(charWidth("★")).toBe(1);
    expect(charWidth("♡")).toBe(1);
    expect(charWidth("☎")).toBe(1);
    expect(charWidth("⚑")).toBe(1);
    expect(charWidth("☁")).toBe(1);
    expect(charWidth("◉")).toBe(1);
  });

  it("returns 2 for CJK characters", () => {
    expect(charWidth("中")).toBe(2);
    expect(charWidth("日")).toBe(2);
    expect(charWidth("語")).toBe(2);
  });

  it("returns 2 for fullwidth forms", () => {
    // U+FF21 Fullwidth Latin Capital Letter A
    expect(charWidth("Ａ")).toBe(2);
  });

  it("returns 1 for empty string", () => {
    expect(charWidth("")).toBe(1);
  });
});

describe("displayWidth", () => {
  it("returns correct width for pure ASCII", () => {
    expect(displayWidth("hello")).toBe(5);
    expect(displayWidth("")).toBe(0);
    expect(displayWidth("abc")).toBe(3);
  });

  it("returns correct width for Misc Symbols (all 1x)", () => {
    expect(displayWidth("A⍥B")).toBe(3);
    expect(displayWidth("hi★")).toBe(3);
  });

  it("returns correct width for engine-internal chars", () => {
    expect(displayWidth("●○●")).toBe(3);
    expect(displayWidth("─────")).toBe(5);
    expect(displayWidth("[✓]")).toBe(3);
  });

  it("returns correct width for CJK text", () => {
    // 2 + 2
    expect(displayWidth("中文")).toBe(4);
    // 1 + 2 + 1
    expect(displayWidth("A中B")).toBe(4);
  });
});

describe("isWide", () => {
  it("returns true for genuinely wide chars (CJK, fullwidth)", () => {
    expect(isWide("中")).toBe(true);
    expect(isWide("Ａ")).toBe(true);
  });

  it("returns false for Misc Symbols", () => {
    expect(isWide("★")).toBe(false);
    expect(isWide("⍥")).toBe(false);
  });

  it("returns false for single-width chars", () => {
    expect(isWide("A")).toBe(false);
    expect(isWide("●")).toBe(false);
    expect(isWide("─")).toBe(false);
  });
});
