/**
 * Double-width Unicode character support.
 *
 * In monospace fonts, most characters occupy 1 column, but certain Unicode
 * characters (CJK, some symbols, emoji) occupy 2. This module provides
 * width classification and a shadow-cell sentinel for the rendering grid.
 */

/** Sentinel placed in the cell after a wide character. */
export const SHADOW = "\x00";

/**
 * Characters that are ALWAYS single-width in this engine.
 * Includes every char used by the box-drawing/line/arrow renderers,
 * block elements, geometric shapes used internally, and all icons
 * from icons.ts that are confirmed single-width in JetBrains Mono.
 */
const ENGINE_SINGLE_WIDTH: ReadonlySet<string> = new Set([
  // Box drawing (single, double, rounded, heavy)
  "┌",
  "┐",
  "└",
  "┘",
  "─",
  "│",
  "├",
  "┤",
  "╔",
  "╗",
  "╚",
  "╝",
  "═",
  "║",
  "╠",
  "╣",
  "╭",
  "╮",
  "╰",
  "╯",
  "┏",
  "┓",
  "┗",
  "┛",
  "━",
  "┃",
  "┣",
  "┫",
  "┬",
  "┼",
  "┴",

  // Line chars
  "╲",
  "╱",

  // Arrow chars
  "→",
  "←",
  "↑",
  "↓",
  "↗",
  "↘",
  "↙",
  "↖",

  // Block elements (used in progress, skeleton, image fill)
  "░",
  "▓",
  "■",

  // Geometric shapes used internally
  "●",
  "○",
  "▶",
  "◀",
  "▾",
  "▴",
  "◁",
  "▷",
  "▲",
  "▼",
  "◆",
  "◇",
  "□",
  "△",

  // Dingbats / actions used in renderers
  "✓",
  "✕",
  "✎",
  "✦",
  "✉",
  "×",

  // Math / misc operators used as icons
  "⊕",
  "⊖",
  "⊗",
  "⊘",
  "⊞",
  "≡",
  "⇅",
  "⌕",
  "⟳",
  "⏎",
  "⌫",
  "⏏",
  "÷",
  "±",
  "≠",
  "≤",
  "≥",
  "∞",
  "∑",
  "√",
  "π",

  // Misc punctuation / icons (single-width in Geist Mono)
  "⌂",
  "⌘",
  "◷",
  "ℹ",
  "©",
  "®",
  "°",
  "†",
  "‡",
  "…",
  "•",
  "※",
  "♯",
  "¶",
  "§",
  "$",
  "€",
  "£",
  "¥",
  "¢",
  "%",

  // Replacement icon chars (Geist-Mono-safe alternatives for ☺ and ♫)
  "⍥",
  "♩",

  // Toggle switch chars
  "[",
  "]",
]);

/**
 * Characters confirmed double-width in monospace fonts.
 *
 * Note: ☺ U+263A and ♫ U+266B are NOT in Geist Mono — the browser falls
 * back to a proportional font, rendering them at unpredictable widths
 * (2.24x and 1.64x respectively). These chars have been replaced in the
 * icon set with Geist-Mono-safe alternatives (⍥ and ♩). Shadow cells
 * can't fix font-fallback width issues, so KNOWN_WIDE is only for chars
 * that are genuinely 2x in monospace fonts. CJK/Fullwidth/Emoji are
 * caught by the range fallback in charWidth().
 */
const KNOWN_WIDE: ReadonlySet<string> = new Set([
  // Currently empty — CJK/Fullwidth/Emoji handled by range fallback.
]);

/** Return the display width (1 or 2) of a single character. */
export function charWidth(ch: string): 1 | 2 {
  if (ch.length === 0) {
    return 1;
  }

  // Fast path: ASCII
  // biome-ignore lint/style/noNonNullAssertion: ch is guaranteed non-empty by checks above
  const cp = ch.codePointAt(0)!;
  if (cp < 0x1_00) {
    return 1;
  }

  // Engine chars are always single-width
  if (ENGINE_SINGLE_WIDTH.has(ch)) {
    return 1;
  }

  // Known wide chars
  if (KNOWN_WIDE.has(ch)) {
    return 2;
  }

  // Range-based fallback
  if (
    // CJK Radicals Supplement through CJK Unified Ideographs
    (cp >= 0x2e_80 && cp <= 0x9f_ff) ||
    // CJK Compatibility Ideographs
    (cp >= 0xf9_00 && cp <= 0xfa_ff) ||
    // Hangul Syllables
    (cp >= 0xac_00 && cp <= 0xd7_af) ||
    // Fullwidth Forms
    (cp >= 0xff_01 && cp <= 0xff_60) ||
    // CJK Unified Ideographs Extension B+
    (cp >= 0x2_00_00 && cp <= 0x3_ff_ff) ||
    // Emoji block (Misc Symbols and Pictographs through Symbols Extended-A)
    (cp >= 0x1_f3_00 && cp <= 0x1_fa_ff)
  ) {
    return 2;
  }

  return 1;
}

/** Sum of display widths for all characters in a string. */
export function displayWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    width += charWidth(ch);
  }
  return width;
}

/** Convenience check: is this character double-width? */
export function isWide(ch: string): boolean {
  return charWidth(ch) === 2;
}
