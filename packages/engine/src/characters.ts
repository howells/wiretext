import type { BorderStyle } from "./types";

export interface BoxChars {
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  teeLeft: string;
  teeRight: string;
  topLeft: string;
  topRight: string;
  vertical: string;
}

const SINGLE_BOX: BoxChars = {
  bottomLeft: "└",
  bottomRight: "┘",
  horizontal: "─",
  teeLeft: "┤",
  teeRight: "├",
  topLeft: "┌",
  topRight: "┐",
  vertical: "│",
};

const DOUBLE_BOX: BoxChars = {
  bottomLeft: "╚",
  bottomRight: "╝",
  horizontal: "═",
  teeLeft: "╣",
  teeRight: "╠",
  topLeft: "╔",
  topRight: "╗",
  vertical: "║",
};

const ROUNDED_BOX: BoxChars = {
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  teeLeft: "┤",
  teeRight: "├",
  topLeft: "╭",
  topRight: "╮",
  vertical: "│",
};

const HEAVY_BOX: BoxChars = {
  bottomLeft: "┗",
  bottomRight: "┛",
  horizontal: "━",
  teeLeft: "┫",
  teeRight: "┣",
  topLeft: "┏",
  topRight: "┓",
  vertical: "┃",
};

export const BOX_CHARS: Record<BorderStyle, BoxChars> = {
  double: DOUBLE_BOX,
  heavy: HEAVY_BOX,
  rounded: ROUNDED_BOX,
  single: SINGLE_BOX,
};

export const LINE_CHARS = {
  diagonalDown: "╲",
  diagonalUp: "╱",
  horizontal: "─",
  vertical: "│",
} as const;

export const ARROW_CHARS = {
  down: "↓",
  downLeft: "↙",
  downRight: "↘",
  left: "←",
  right: "→",
  up: "↑",
  upLeft: "↖",
  upRight: "↗",
} as const;

export const getBoxChars = (style: BorderStyle): BoxChars => BOX_CHARS[style];
