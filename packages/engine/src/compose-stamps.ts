import { charWidth, displayWidth, isWide, SHADOW } from "./char-width";
import { ARROW_CHARS, getBoxChars, LINE_CHARS } from "./characters";
import type {
  ArrowObject,
  BorderStyle,
  BoxObject,
  LineObject,
  TextObject,
} from "./types";

/**
 * Clear the remnants of whatever occupied a cell before overwriting it:
 * a wide char leaves a shadow to its right, a shadow belongs to the wide
 * char on its left.
 */
const clearOverwrittenCell = (gridRow: string[], col: number): void => {
  const cell = gridRow[col] ?? " ";
  if (isWide(cell) && col + 1 < gridRow.length) {
    gridRow[col + 1] = " ";
  }
  if (cell === SHADOW && col - 1 >= 0) {
    gridRow[col - 1] = " ";
  }
};

/**
 * Write a character into the grid, handling wide-character shadow cells.
 * When `force` is false, spaces never overwrite existing content — this is
 * the difference between the public {@link setChar} and {@link forceSetChar}.
 */
const writeChar = (
  grid: string[][],
  col: number,
  row: number,
  char: string,
  force: boolean
): void => {
  const gridRow = grid[row];
  if (!gridRow || col < 0 || col >= gridRow.length) {
    return;
  }
  const cell = gridRow[col] ?? " ";
  if (!force && char === " " && cell !== " ") {
    return;
  }

  // If placing a wide char, its shadow must fit in the grid
  const wide = isWide(char);
  if (wide && col + 1 >= gridRow.length) {
    return;
  }

  clearOverwrittenCell(gridRow, col);
  gridRow[col] = char;

  // Place shadow for wide char
  if (wide) {
    gridRow[col + 1] = SHADOW;
  }
};

/** Write a character, but never let a space overwrite existing content. */
export const setChar = (
  grid: string[][],
  col: number,
  row: number,
  char: string
): void => {
  writeChar(grid, col, row, char, false);
};

/** Write a character unconditionally, letting spaces clear existing content. */
export const forceSetChar = (
  grid: string[][],
  col: number,
  row: number,
  char: string
): void => {
  writeChar(grid, col, row, char, true);
};

export const stampFill = (
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number
): void => {
  for (let r = 1; r < height - 1; r += 1) {
    for (let c = 1; c < width - 1; c += 1) {
      forceSetChar(grid, col + c, row + r, " ");
    }
  }
};

export const stampText = (
  grid: string[][],
  col: number,
  row: number,
  text: string
): void => {
  let offset = 0;
  for (const ch of text) {
    setChar(grid, col + offset, row, ch);
    offset += charWidth(ch);
  }
};

export const forceStampText = (
  grid: string[][],
  col: number,
  row: number,
  text: string
): void => {
  let offset = 0;
  for (const ch of text) {
    forceSetChar(grid, col + offset, row, ch);
    offset += charWidth(ch);
  }
};

export const stampBorder = (
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number,
  borderStyle: BorderStyle
): void => {
  const chars = getBoxChars(borderStyle);

  // Corners
  setChar(grid, col, row, chars.topLeft);
  setChar(grid, col + width - 1, row, chars.topRight);
  setChar(grid, col, row + height - 1, chars.bottomLeft);
  setChar(grid, col + width - 1, row + height - 1, chars.bottomRight);

  // Top and bottom edges
  for (let c = 1; c < width - 1; c += 1) {
    setChar(grid, col + c, row, chars.horizontal);
    setChar(grid, col + c, row + height - 1, chars.horizontal);
  }

  // Left and right edges
  for (let r = 1; r < height - 1; r += 1) {
    setChar(grid, col, row + r, chars.vertical);
    setChar(grid, col + width - 1, row + r, chars.vertical);
  }
};

/** Truncate text to maxWidth display columns, adding … when it overflows. */
export const truncate = (text: string, maxWidth: number): string => {
  if (maxWidth <= 0) {
    return "";
  }
  if (displayWidth(text) <= maxWidth) {
    return text;
  }
  if (maxWidth === 1) {
    return "…";
  }
  let result = "";
  let width = 0;
  for (const ch of text) {
    const cw = charWidth(ch);
    // Reserve one column for the ellipsis
    if (width + cw + 1 > maxWidth) {
      break;
    }
    result += ch;
    width += cw;
  }
  return `${result}…`;
};

const stampCenteredLabel = (
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number,
  label: string
): void => {
  const maxLabelLen = width - 4;
  const lines = label.split("\n");

  if (lines.length === 1) {
    // Single-line: preserve exact original centering row
    const labelRow = row + Math.floor(height / 2);
    const trimmed = truncate(label, maxLabelLen);
    const labelCol = col + Math.floor((width - displayWidth(trimmed)) / 2);
    stampText(grid, labelCol, labelRow, trimmed);
    return;
  }

  // Multiline: vertically center the block of lines within the interior
  const interiorHeight = height - 2;
  const visibleLines = lines.slice(0, interiorHeight);
  const startRow =
    row + 1 + Math.floor((interiorHeight - visibleLines.length) / 2);

  for (const [i, line] of visibleLines.entries()) {
    const trimmed = truncate(line, maxLabelLen);
    const labelCol = col + Math.floor((width - displayWidth(trimmed)) / 2);
    stampText(grid, labelCol, startRow + i, trimmed);
  }
};

export const stampBox = (grid: string[][], obj: BoxObject): void => {
  const { col, row } = obj.position;

  if (obj.fill !== "transparent") {
    stampFill(grid, col, row, obj.width, obj.height);
  }

  stampBorder(grid, col, row, obj.width, obj.height, obj.borderStyle);

  if (obj.label !== undefined && obj.label.length > 0) {
    stampCenteredLabel(grid, col, row, obj.width, obj.height, obj.label);
  }
};

export const stampTextObj = (grid: string[][], obj: TextObject): void => {
  const lines = obj.content.split("\n");
  for (const [r, line] of lines.entries()) {
    let offset = 0;
    for (const ch of line) {
      setChar(grid, obj.position.col + offset, obj.position.row + r, ch);
      offset += charWidth(ch);
    }
  }
};

const getDiagonalChar = (dc: number, dr: number): string => {
  // dc > 0 = moving right, dr > 0 = moving down
  if ((dc > 0 && dr > 0) || (dc < 0 && dr < 0)) {
    return LINE_CHARS.diagonalDown;
  }
  return LINE_CHARS.diagonalUp;
};

const getArrowHeadChar = (dc: number, dr: number): string => {
  if (dr === 0) {
    return dc > 0 ? ARROW_CHARS.right : ARROW_CHARS.left;
  }
  if (dc === 0) {
    return dr > 0 ? ARROW_CHARS.down : ARROW_CHARS.up;
  }
  if (dc > 0 && dr < 0) {
    return ARROW_CHARS.upRight;
  }
  if (dc > 0 && dr > 0) {
    return ARROW_CHARS.downRight;
  }
  if (dc < 0 && dr > 0) {
    return ARROW_CHARS.downLeft;
  }
  return ARROW_CHARS.upLeft;
};

/** Walk from (c1,r1) to (c2,r2) using Bresenham-like stepping */
const walkLine = (
  c1: number,
  r1: number,
  c2: number,
  r2: number
): { col: number; row: number }[] => {
  const points: { col: number; row: number }[] = [];
  const dc = c2 - c1;
  const dr = r2 - r1;
  const steps = Math.max(Math.abs(dc), Math.abs(dr));
  if (steps === 0) {
    return [{ col: c1, row: r1 }];
  }
  for (let i = 0; i <= steps; i += 1) {
    const col = c1 + Math.round((dc * i) / steps);
    const row = r1 + Math.round((dr * i) / steps);
    points.push({ col, row });
  }
  return points;
};

/** Draw a straight horizontal, vertical, or diagonal line segment. */
const drawSegment = (
  grid: string[][],
  c1: number,
  r1: number,
  c2: number,
  r2: number
): void => {
  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC; c <= maxC; c += 1) {
      setChar(grid, c, r1, LINE_CHARS.horizontal);
    }
    return;
  }
  if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r += 1) {
      setChar(grid, c1, r, LINE_CHARS.vertical);
    }
    return;
  }
  const ch = getDiagonalChar(c2 - c1, r2 - r1);
  for (const pt of walkLine(c1, r1, c2, r2)) {
    setChar(grid, pt.col, pt.row, ch);
  }
};

export const stampLine = (grid: string[][], obj: LineObject): void => {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;
  drawSegment(grid, c1, r1, c2, r2);
};

/** Stamp arrow heads at the start/end of a line segment */
const stampArrowHeads = (
  grid: string[][],
  c1: number,
  r1: number,
  c2: number,
  r2: number,
  showStart: boolean,
  showEnd: boolean
): void => {
  const dc = c2 - c1;
  const dr = r2 - r1;
  if (showEnd) {
    setChar(grid, c2, r2, getArrowHeadChar(dc, dr));
  }
  if (showStart) {
    setChar(grid, c1, r1, getArrowHeadChar(-dc, -dr));
  }
};

export const stampArrow = (grid: string[][], obj: ArrowObject): void => {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;
  const showStart = obj.startHead === true;
  // endHead defaults to true when unset
  const showEnd = obj.endHead !== false;

  drawSegment(grid, c1, r1, c2, r2);
  stampArrowHeads(grid, c1, r1, c2, r2, showStart, showEnd);
};

export const stampHLine = (
  grid: string[][],
  col: number,
  row: number,
  width: number
): void => {
  for (let c = 0; c < width; c += 1) {
    setChar(grid, col + c, row, "─");
  }
};
