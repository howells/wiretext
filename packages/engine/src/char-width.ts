/**
 * Double-width Unicode character support.
 *
 * In monospace fonts, most characters occupy 1 column, but certain Unicode
 * characters (CJK, some symbols, emoji) occupy 2. This module provides
 * width classification and a shadow-cell sentinel for the rendering grid.
 */

/** Sentinel placed in the cell after a wide character. */
export const SHADOW = "\u0000";

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
 * Code-point ranges that render double-width in monospace fonts.
 * CJK, Hangul, Fullwidth forms, and emoji are the practical cases.
 *
 * Chars outside these ranges that lack a genuine monospace glyph (☺ U+263A,
 * ♫ U+266B) are deliberately excluded: the browser falls back to a
 * proportional font at unpredictable widths, which shadow cells can't fix.
 * Those have been swapped in the icon set for Geist-Mono-safe alternatives.
 */
const WIDE_RANGES: readonly (readonly [number, number])[] = [
  [0x2e_80, 0x9f_ff],
  [0xf9_00, 0xfa_ff],
  [0xac_00, 0xd7_af],
  [0xff_01, 0xff_60],
  [0x2_00_00, 0x3_ff_ff],
  [0x1_f3_00, 0x1_fa_ff],
];

const isWideCodePoint = (cp: number): boolean =>
  WIDE_RANGES.some(([start, end]) => cp >= start && cp <= end);

/** Return the display width (1 or 2) of a single character. */
export const charWidth = (ch: string): 1 | 2 => {
  if (ch.length === 0) {
    return 1;
  }
  const cp = ch.codePointAt(0) ?? 0;
  if (cp < 0x1_00) {
    return 1;
  }
  if (ENGINE_SINGLE_WIDTH.has(ch)) {
    return 1;
  }
  return isWideCodePoint(cp) ? 2 : 1;
};

/** Sum of display widths for all characters in a string. */
export const displayWidth = (text: string): number => {
  let width = 0;
  for (const ch of text) {
    width += charWidth(ch);
  }
  return width;
};

/** Convenience check: is this character double-width? */
export const isWide = (ch: string): boolean => charWidth(ch) === 2;
