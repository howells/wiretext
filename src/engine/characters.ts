import type { BorderStyle } from "./types";

export interface BoxChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  teeRight: string;
  teeLeft: string;
}

const SINGLE_BOX: BoxChars = {
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  horizontal: "─",
  vertical: "│",
  teeRight: "├",
  teeLeft: "┤",
};

const DOUBLE_BOX: BoxChars = {
  topLeft: "╔",
  topRight: "╗",
  bottomLeft: "╚",
  bottomRight: "╝",
  horizontal: "═",
  vertical: "║",
  teeRight: "╠",
  teeLeft: "╣",
};

const ROUNDED_BOX: BoxChars = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  teeRight: "├",
  teeLeft: "┤",
};

const HEAVY_BOX: BoxChars = {
  topLeft: "┏",
  topRight: "┓",
  bottomLeft: "┗",
  bottomRight: "┛",
  horizontal: "━",
  vertical: "┃",
  teeRight: "┣",
  teeLeft: "┫",
};

export const BOX_CHARS: Record<BorderStyle, BoxChars> = {
  single: SINGLE_BOX,
  double: DOUBLE_BOX,
  rounded: ROUNDED_BOX,
  heavy: HEAVY_BOX,
};

export const LINE_CHARS = {
  horizontal: "─",
  vertical: "│",
  diagonalDown: "╲",
  diagonalUp: "╱",
} as const;

export const ARROW_CHARS = {
  right: "→",
  left: "←",
  up: "↑",
  down: "↓",
  upRight: "↗",
  downRight: "↘",
  downLeft: "↙",
  upLeft: "↖",
} as const;

export function getBoxChars(style: BorderStyle): BoxChars {
  return BOX_CHARS[style];
}
