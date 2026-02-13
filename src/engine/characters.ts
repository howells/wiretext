import type { BorderStyle } from "./types";

export interface BoxChars {
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
	horizontal: string;
	vertical: string;
}

const SINGLE_BOX: BoxChars = {
	topLeft: "┌",
	topRight: "┐",
	bottomLeft: "└",
	bottomRight: "┘",
	horizontal: "─",
	vertical: "│",
};

const DOUBLE_BOX: BoxChars = {
	topLeft: "╔",
	topRight: "╗",
	bottomLeft: "╚",
	bottomRight: "╝",
	horizontal: "═",
	vertical: "║",
};

const ROUNDED_BOX: BoxChars = {
	topLeft: "╭",
	topRight: "╮",
	bottomLeft: "╰",
	bottomRight: "╯",
	horizontal: "─",
	vertical: "│",
};

const HEAVY_BOX: BoxChars = {
	topLeft: "┏",
	topRight: "┓",
	bottomLeft: "┗",
	bottomRight: "┛",
	horizontal: "━",
	vertical: "┃",
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
} as const;

export const ARROW_CHARS = {
	right: "→",
	left: "←",
	up: "↑",
	down: "↓",
} as const;

export function getBoxChars(style: BorderStyle): BoxChars {
	return BOX_CHARS[style];
}
