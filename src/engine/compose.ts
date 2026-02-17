import { charWidth, displayWidth, isWide, SHADOW } from "./char-width";
import { ARROW_CHARS, getBoxChars, LINE_CHARS } from "./characters";
import type {
  ArrowObject,
  BorderStyle,
  BoxObject,
  ComponentObject,
  ComponentType,
  GridSize,
  Layer,
  LineObject,
  TextObject,
  WireObject,
} from "./types";

const BORDERLESS_COMPONENTS: ReadonlySet<ComponentType> = new Set([
  "icon",
  "divider",
  "toggle",
  "breadcrumb",
  "list",
  "stepper",
  "rating",
  "skeleton",
]);

export function createGrid(size: GridSize): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < size.rows; r++) {
    grid.push(new Array(size.cols).fill(" "));
  }
  return grid;
}

function setChar(grid: string[][], col: number, row: number, char: string) {
  if (
    row >= 0 &&
    row < grid.length &&
    col >= 0 &&
    col < grid[0].length &&
    (char !== " " || grid[row][col] === " ")
  ) {
    const maxCol = grid[0].length;

    // If placing a wide char, its shadow must fit in the grid
    if (isWide(char) && col + 1 >= maxCol) {
      return;
    }

    // Clean up if overwriting a wide char (clear its shadow)
    if (isWide(grid[row][col]) && col + 1 < maxCol) {
      grid[row][col + 1] = " ";
    }

    // Clean up if overwriting a shadow (clear the wide char that owns it)
    if (grid[row][col] === SHADOW && col - 1 >= 0) {
      grid[row][col - 1] = " ";
    }

    grid[row][col] = char;

    // Place shadow for wide char
    if (isWide(char) && col + 1 < maxCol) {
      grid[row][col + 1] = SHADOW;
    }
  }
}

function forceSetChar(
  grid: string[][],
  col: number,
  row: number,
  char: string
) {
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    const maxCol = grid[0].length;

    // If placing a wide char, its shadow must fit in the grid
    if (isWide(char) && col + 1 >= maxCol) {
      return;
    }

    // Clean up if overwriting a wide char (clear its shadow)
    if (isWide(grid[row][col]) && col + 1 < maxCol) {
      grid[row][col + 1] = " ";
    }

    // Clean up if overwriting a shadow (clear the wide char that owns it)
    if (grid[row][col] === SHADOW && col - 1 >= 0) {
      grid[row][col - 1] = " ";
    }

    grid[row][col] = char;

    // Place shadow for wide char
    if (isWide(char) && col + 1 < maxCol) {
      grid[row][col + 1] = SHADOW;
    }
  }
}

function stampFill(
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number
) {
  for (let r = 1; r < height - 1; r++) {
    for (let c = 1; c < width - 1; c++) {
      forceSetChar(grid, col + c, row + r, " ");
    }
  }
}

function stampText(grid: string[][], col: number, row: number, text: string) {
  let offset = 0;
  for (const ch of text) {
    setChar(grid, col + offset, row, ch);
    offset += charWidth(ch);
  }
}

function stampBorder(
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number,
  borderStyle: BorderStyle
) {
  const chars = getBoxChars(borderStyle);

  // Corners
  setChar(grid, col, row, chars.topLeft);
  setChar(grid, col + width - 1, row, chars.topRight);
  setChar(grid, col, row + height - 1, chars.bottomLeft);
  setChar(grid, col + width - 1, row + height - 1, chars.bottomRight);

  // Top and bottom edges
  for (let c = 1; c < width - 1; c++) {
    setChar(grid, col + c, row, chars.horizontal);
    setChar(grid, col + c, row + height - 1, chars.horizontal);
  }

  // Left and right edges
  for (let r = 1; r < height - 1; r++) {
    setChar(grid, col, row + r, chars.vertical);
    setChar(grid, col + width - 1, row + r, chars.vertical);
  }
}

/** Truncate text to maxWidth display columns, adding … when it overflows. */
function truncate(text: string, maxWidth: number): string {
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
    if (width + cw + 1 > maxWidth) {
      break; // +1 for ellipsis
    }
    result += ch;
    width += cw;
  }
  return `${result}…`;
}

function stampCenteredLabel(
  grid: string[][],
  col: number,
  row: number,
  width: number,
  height: number,
  label: string
) {
  const labelRow = row + Math.floor(height / 2);
  const maxLabelLen = width - 4;
  const trimmed = truncate(label, maxLabelLen);
  const labelCol = col + Math.floor((width - displayWidth(trimmed)) / 2);
  stampText(grid, labelCol, labelRow, trimmed);
}

function stampBox(grid: string[][], obj: BoxObject) {
  const { col, row } = obj.position;

  if (obj.fill !== "transparent") {
    stampFill(grid, col, row, obj.width, obj.height);
  }

  stampBorder(grid, col, row, obj.width, obj.height, obj.borderStyle);

  if (obj.label) {
    stampCenteredLabel(grid, col, row, obj.width, obj.height, obj.label);
  }
}

function stampTextObj(grid: string[][], obj: TextObject) {
  const lines = obj.content.split("\n");
  for (let r = 0; r < lines.length; r++) {
    let offset = 0;
    for (const ch of lines[r]) {
      setChar(grid, obj.position.col + offset, obj.position.row + r, ch);
      offset += charWidth(ch);
    }
  }
}

function getDiagonalChar(dc: number, dr: number): string {
  // dc > 0 = moving right, dr > 0 = moving down
  if ((dc > 0 && dr > 0) || (dc < 0 && dr < 0)) {
    return LINE_CHARS.diagonalDown; // ╲
  }
  return LINE_CHARS.diagonalUp; // ╱
}

function getArrowHeadChar(dc: number, dr: number): string {
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
}

/** Walk from (c1,r1) to (c2,r2) using Bresenham-like stepping */
function walkLine(
  c1: number,
  r1: number,
  c2: number,
  r2: number
): { col: number; row: number }[] {
  const points: { col: number; row: number }[] = [];
  const dc = c2 - c1;
  const dr = r2 - r1;
  const steps = Math.max(Math.abs(dc), Math.abs(dr));
  if (steps === 0) {
    return [{ col: c1, row: r1 }];
  }
  for (let i = 0; i <= steps; i++) {
    const col = c1 + Math.round((dc * i) / steps);
    const row = r1 + Math.round((dr * i) / steps);
    points.push({ col, row });
  }
  return points;
}

function stampLine(grid: string[][], obj: LineObject) {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;

  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC; c <= maxC; c++) {
      setChar(grid, c, r1, LINE_CHARS.horizontal);
    }
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      setChar(grid, c1, r, LINE_CHARS.vertical);
    }
  } else {
    // Diagonal
    const dc = c2 - c1;
    const dr = r2 - r1;
    const ch = getDiagonalChar(dc, dr);
    for (const pt of walkLine(c1, r1, c2, r2)) {
      setChar(grid, pt.col, pt.row, ch);
    }
  }
}

/** Stamp arrow heads at the start/end of a line segment */
function stampArrowHeads(
  grid: string[][],
  c1: number,
  r1: number,
  c2: number,
  r2: number,
  showStart: boolean,
  showEnd: boolean
) {
  const dc = c2 - c1;
  const dr = r2 - r1;
  if (showEnd) {
    setChar(grid, c2, r2, getArrowHeadChar(dc, dr));
  }
  if (showStart) {
    setChar(grid, c1, r1, getArrowHeadChar(-dc, -dr));
  }
}

function stampArrow(grid: string[][], obj: ArrowObject) {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;
  const showStart = obj.startHead === true;
  const showEnd = obj.endHead !== false; // default true

  // Draw the line body (same as stampLine)
  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC; c <= maxC; c++) {
      setChar(grid, c, r1, LINE_CHARS.horizontal);
    }
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      setChar(grid, c1, r, LINE_CHARS.vertical);
    }
  } else {
    const dc = c2 - c1;
    const dr = r2 - r1;
    const ch = getDiagonalChar(dc, dr);
    for (const pt of walkLine(c1, r1, c2, r2)) {
      setChar(grid, pt.col, pt.row, ch);
    }
  }

  // Overlay heads
  stampArrowHeads(grid, c1, r1, c2, r2, showStart, showEnd);
}

function stampHLine(grid: string[][], col: number, row: number, width: number) {
  for (let c = 0; c < width; c++) {
    setChar(grid, col + c, row, "─");
  }
}

function stampComponentButton(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const label = obj.label ?? "Button";
  const icon = obj.icon;
  const iconRight = obj.iconPosition === "right";
  const mid = row + Math.floor(obj.height / 2);
  const innerW = obj.width - 4; // 2 border + 2 padding

  if (icon) {
    // Icon + label: icon takes charWidth + 1 space
    const iconW = charWidth(icon);
    const maxLabel = innerW - iconW - 1;
    const trimmed = truncate(label, maxLabel);
    if (iconRight) {
      const content = `${trimmed} ${icon}`;
      if (obj.align === "left") {
        stampText(grid, col + 2, mid, content);
      } else {
        const startCol =
          col + Math.floor((obj.width - displayWidth(content)) / 2);
        stampText(grid, startCol, mid, content);
      }
    } else {
      const content = `${icon} ${trimmed}`;
      if (obj.align === "left") {
        stampText(grid, col + 2, mid, content);
      } else {
        const startCol =
          col + Math.floor((obj.width - displayWidth(content)) / 2);
        stampText(grid, startCol, mid, content);
      }
    }
  } else {
    const trimmed = truncate(label, innerW);
    if (obj.align === "left") {
      stampText(grid, col + 2, mid, trimmed);
    } else {
      const startCol =
        col + Math.floor((obj.width - displayWidth(trimmed)) / 2);
      stampText(grid, startCol, mid, trimmed);
    }
  }
}

function stampComponentInput(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  let textCol = col + 2;
  if (obj.icon) {
    setChar(grid, textCol, mid, obj.icon);
    textCol += charWidth(obj.icon) + 1;
  }
  const maxLen = col + obj.width - 2 - textCol;
  stampText(grid, textCol, mid, truncate(obj.label ?? "Input", maxLen));
}

function stampComponentSelect(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  const maxLen = obj.width - 6;
  stampText(grid, col + 2, mid, truncate(obj.label ?? "Select", maxLen));
  setChar(grid, col + obj.width - 3, mid, "▾");
}

function stampComponentToggle(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number,
  indicator: string,
  defaultLabel: string
) {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, indicator);
  const maxLen = obj.width - 8;
  stampText(grid, col + 6, mid, truncate(obj.label ?? defaultLabel, maxLen));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sequential rendering logic reads best as a single function
function stampComponentTable(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  if (obj.height < 5) {
    return;
  }
  const cols = obj.columns ?? [];
  const numCols = cols.length;
  if (numCols === 0) {
    return;
  }
  const innerW = obj.width - 2;
  const colW = Math.floor(innerW / numCols);

  // Header separator line
  stampHLine(grid, col + 1, row + 2, innerW);

  // Column headers + vertical separators
  for (let i = 0; i < numCols; i++) {
    const headerCol = col + 1 + i * colW;
    const filterSpace = obj.filterable ? 3 : 0;
    stampText(
      grid,
      headerCol + 1,
      row + 1,
      truncate(cols[i], colW - 3 - filterSpace)
    );
    if (obj.filterable) {
      setChar(grid, headerCol + colW - 3, row + 1, "▾");
    }

    if (i > 0) {
      const sepCol = col + i * colW;
      for (let r = 1; r < obj.height - 1; r++) {
        setChar(grid, sepCol, row + r, "│");
      }
      setChar(grid, sepCol, row, "┬");
      setChar(grid, sepCol, row + 2, "┼");
      setChar(grid, sepCol, row + obj.height - 1, "┴");
    }
  }

  // Data rows
  const dataRows = obj.rows ?? [];
  const maxVisibleRows = obj.height - 4;
  const visibleCount = Math.min(dataRows.length, maxVisibleRows);
  for (let r = 0; r < visibleCount; r++) {
    const gridRow = row + 3 + r;
    const dataRow = dataRows[r];
    for (let c = 0; c < numCols; c++) {
      const cellValue = c < dataRow.length ? dataRow[c] : "";
      if (cellValue.length === 0) {
        continue;
      }
      const cellCol = col + 1 + c * colW;
      stampText(grid, cellCol + 1, gridRow, truncate(cellValue, colW - 3));
    }
  }
}

function stampComponentTitleBar(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number,
  title: string,
  showClose: boolean
) {
  if (obj.height < 5) {
    return;
  }
  const chars = getBoxChars(obj.borderStyle);
  stampHLine(grid, col + 1, row + 2, obj.width - 2);
  forceSetChar(grid, col, row + 2, chars.teeRight);
  forceSetChar(grid, col + obj.width - 1, row + 2, chars.teeLeft);
  if (showClose) {
    setChar(grid, col + obj.width - 3, row + 1, "×");
  }
  const maxLen = showClose ? obj.width - 6 : obj.width - 4;
  stampText(grid, col + 2, row + 1, truncate(title, maxLen));
}

function stampComponentBrowser(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  if (obj.height < 5) {
    return;
  }
  const chars = getBoxChars(obj.borderStyle);
  stampHLine(grid, col + 1, row + 2, obj.width - 2);
  forceSetChar(grid, col, row + 2, chars.teeRight);
  forceSetChar(grid, col + obj.width - 1, row + 2, chars.teeLeft);
  stampText(grid, col + 2, row + 1, "< > O");
  const url = obj.label ?? "https://";
  const barStart = col + 10;
  const barEnd = col + obj.width - 2;
  const barMaxLen = barEnd - barStart;
  if (barMaxLen > 0) {
    stampText(grid, barStart, row + 1, truncate(url, barMaxLen));
  }
}

function stampComponentNavbar(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, "=");
  const text = (obj.navItems ?? []).join("  ");
  const maxLen = obj.width - 7;
  stampText(grid, col + 5, mid, truncate(text, maxLen));
}

function stampComponentTabs(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  const text = (obj.tabs ?? []).join(" │ ");
  const maxLen = obj.width - 4;
  stampText(grid, col + 2, mid, truncate(text, maxLen));
}

function stampComponentProgress(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  const innerW = obj.width - 4;
  const pct = Math.max(0, Math.min(100, obj.progress ?? 40));
  const filled = Math.round(innerW * (pct / 100));
  let bar = "";
  for (let i = 0; i < innerW; i++) {
    bar += i < filled ? "▓" : "░";
  }
  stampText(grid, col + 2, mid, bar);
}

function stampComponentIcon(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const midCol = col + Math.floor(obj.width / 2);
  const midRow = row + Math.floor(obj.height / 2);
  setChar(grid, midCol, midRow, obj.icon ?? "*");
}

function stampComponentImage(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  // Fill interior with ░
  for (let r = 1; r < obj.height - 1; r++) {
    for (let c = 1; c < obj.width - 1; c++) {
      forceSetChar(grid, col + c, row + r, "░");
    }
  }
  // Centered label or icon — use forceSetChar so spaces overwrite ░
  const text = obj.label ?? obj.icon;
  if (text) {
    const maxLabelLen = obj.width - 4;
    const trimmed = truncate(text, maxLabelLen);
    const labelRow = row + Math.floor(obj.height / 2);
    const labelCol = col + Math.floor((obj.width - displayWidth(trimmed)) / 2);
    let offset = 0;
    for (const ch of trimmed) {
      forceSetChar(grid, labelCol + offset, labelRow, ch);
      offset += charWidth(ch);
    }
  }
}

function stampComponentDivider(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const label = obj.label;
  // Need at least 5 chars for "── L ─" pattern (2 dashes + space + 1 char + space)
  if (label && obj.width >= 5) {
    const maxLabelLen = obj.width - 4;
    const trimmed = truncate(label, maxLabelLen);
    const leftLen = 2;
    for (let c = 0; c < leftLen; c++) {
      setChar(grid, col + c, row, "─");
    }
    setChar(grid, col + leftLen, row, " ");
    stampText(grid, col + leftLen + 1, row, trimmed);
    const afterLabel = leftLen + 1 + displayWidth(trimmed);
    setChar(grid, col + afterLabel, row, " ");
    for (let c = afterLabel + 1; c < obj.width; c++) {
      setChar(grid, col + c, row, "─");
    }
  } else {
    for (let c = 0; c < obj.width; c++) {
      setChar(grid, col + c, row, "─");
    }
  }
}

function stampComponentToggleSwitch(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const on = obj.checked === true;
  const toggle = on ? "[●──]" : "[──●]";
  stampText(grid, col, row, toggle);
  if (obj.label) {
    const maxLen = obj.width - 6;
    stampText(grid, col + 6, row, truncate(obj.label, maxLen));
  }
}

function stampComponentAlert(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const icons: Record<string, string> = {
    info: "i",
    warning: "!",
    error: "x",
    success: "✓",
  };
  const icon = icons[obj.alertType ?? "info"] ?? "i";
  const label = obj.label ?? "Alert";
  const maxLen = obj.width - 3;
  // Title line at row+1 (inside border)
  stampText(grid, col + 2, row + 1, truncate(`${icon} ${label}`, maxLen));
}

function stampComponentBreadcrumb(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const items = obj.items ?? [];
  const sep = obj.separator ?? " > ";
  const text = items.join(sep);
  stampText(grid, col, row, truncate(text, obj.width));
}

function stampComponentAvatar(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const innerW = obj.width - 2;
  const midRow = row + Math.floor(obj.height / 2);

  // Icon mode: render a single character centered (e.g. smiley face)
  if (obj.icon) {
    const iconW = charWidth(obj.icon);
    const iconCol = col + 1 + Math.floor((innerW - iconW) / 2);
    setChar(grid, iconCol, midRow, obj.icon);
    return;
  }

  // Initials mode: space-separate characters (e.g. "DH" → "D H")
  const label = obj.label ?? "";
  if (label.length === 0) {
    const iconW = charWidth("⍥");
    const iconCol = col + 1 + Math.floor((innerW - iconW) / 2);
    setChar(grid, iconCol, midRow, "⍥");
    return;
  }
  const chars = label.slice(0, Math.ceil(innerW / 2));
  const spaced = chars.split("").join(" ");
  const display = truncate(spaced, innerW);
  const startCol = col + 1 + Math.floor((innerW - displayWidth(display)) / 2);
  stampText(grid, startCol, midRow, display);
}

function stampComponentList(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const items = obj.items ?? [];
  const style = obj.listStyle ?? "bullet";
  for (let i = 0; i < items.length && i < obj.height; i++) {
    let prefix: string;
    switch (style) {
      case "number":
        prefix = `${i + 1}. `;
        break;
      case "dash":
        prefix = "- ";
        break;
      default:
        prefix = "• ";
        break;
    }
    const line = `${prefix}${items[i]}`;
    stampText(grid, col, row + i, truncate(line, obj.width));
  }
}

function stampComponentStepper(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const items = obj.items ?? [];
  const active = obj.activeStep ?? 0;
  const numSeps = items.length - 1;

  // Calculate fixed width: dots + labels
  let fixedWidth = 0;
  for (const item of items) {
    fixedWidth += 1; // dot
    if (item) {
      fixedWidth += 1 + displayWidth(item); // space + label
    }
  }

  // Distribute remaining width evenly across separators (min 3: " ─ ")
  let sepWidth = 3;
  if (numSeps > 0) {
    sepWidth = Math.max(3, Math.floor((obj.width - fixedWidth) / numSeps));
  }
  const dashes = "─".repeat(sepWidth - 2);
  const sep = ` ${dashes} `;

  let text = "";
  for (let i = 0; i < items.length; i++) {
    const dot = i <= active ? "●" : "○";
    text += dot;
    if (items[i]) {
      text += ` ${items[i]}`;
    }
    if (i < items.length - 1) {
      text += sep;
    }
  }
  stampText(grid, col, row, truncate(text, obj.width));
}

function stampComponentRating(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const value = Math.max(0, obj.value ?? 0);
  const max = Math.max(1, obj.maxValue ?? 5);
  let text = "";
  for (let i = 0; i < max; i++) {
    text += i < value ? "●" : "○";
  }
  if (obj.label) {
    text += ` ${obj.label}`;
  }
  stampText(grid, col, row, truncate(text, obj.width));
}

function stampComponentSkeleton(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  for (let r = 0; r < obj.height; r++) {
    for (let c = 0; c < obj.width; c++) {
      setChar(grid, col + c, row + r, "░");
    }
  }
}

function stampComponentContent(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  switch (obj.componentType) {
    case "button":
      return stampComponentButton(grid, obj, col, row);
    case "input":
      return stampComponentInput(grid, obj, col, row);
    case "select":
      return stampComponentSelect(grid, obj, col, row);
    case "checkbox":
      return stampComponentToggle(
        grid,
        obj,
        col,
        row,
        obj.checked === true ? "[✓]" : "[ ]",
        "Checkbox"
      );
    case "radio":
      return stampComponentToggle(
        grid,
        obj,
        col,
        row,
        obj.checked === true ? "(●)" : "( )",
        "Radio"
      );
    case "table":
      return stampComponentTable(grid, obj, col, row);
    case "modal":
      return stampComponentTitleBar(
        grid,
        obj,
        col,
        row,
        obj.label ?? "Modal",
        true
      );
    case "browser":
      return stampComponentBrowser(grid, obj, col, row);
    case "card":
      return stampComponentTitleBar(
        grid,
        obj,
        col,
        row,
        obj.label ?? "Card",
        false
      );
    case "navbar":
      return stampComponentNavbar(grid, obj, col, row);
    case "tabs":
      return stampComponentTabs(grid, obj, col, row);
    case "progress":
      return stampComponentProgress(grid, obj, col, row);
    case "icon":
      return stampComponentIcon(grid, obj, col, row);
    case "image":
      return stampComponentImage(grid, obj, col, row);
    case "divider":
      return stampComponentDivider(grid, obj, col, row);
    case "toggle":
      return stampComponentToggleSwitch(grid, obj, col, row);
    case "alert":
      return stampComponentAlert(grid, obj, col, row);
    case "breadcrumb":
      return stampComponentBreadcrumb(grid, obj, col, row);
    case "avatar":
      return stampComponentAvatar(grid, obj, col, row);
    case "list":
      return stampComponentList(grid, obj, col, row);
    case "stepper":
      return stampComponentStepper(grid, obj, col, row);
    case "rating":
      return stampComponentRating(grid, obj, col, row);
    case "skeleton":
      return stampComponentSkeleton(grid, obj, col, row);
    default:
      break;
  }
}

function stampComponent(grid: string[][], obj: ComponentObject) {
  const { col, row } = obj.position;

  // Borderless components render without border or fill
  if (BORDERLESS_COMPONENTS.has(obj.componentType)) {
    stampComponentContent(grid, obj, col, row);
    return;
  }

  if (obj.fill !== "transparent") {
    stampFill(grid, col, row, obj.width, obj.height);
  }

  stampBorder(grid, col, row, obj.width, obj.height, obj.borderStyle);
  stampComponentContent(grid, obj, col, row);
}

/** Sort objects for rendering: layer order first, then zIndex within layer */
function sortForRendering(
  objects: WireObject[],
  layers: Layer[]
): WireObject[] {
  const layerOrder = new Map<string, number>();
  for (let i = 0; i < layers.length; i++) {
    layerOrder.set(layers[i].id, i);
  }

  // Filter out objects on hidden layers
  const hiddenLayerIds = new Set(
    layers.filter((l) => !l.visible).map((l) => l.id)
  );
  const visible = objects.filter((obj) => !hiddenLayerIds.has(obj.layerId));

  return [...visible].sort((a, b) => {
    const layerA = layerOrder.get(a.layerId) ?? 0;
    const layerB = layerOrder.get(b.layerId) ?? 0;
    if (layerA !== layerB) {
      return layerA - layerB;
    }
    return a.zIndex - b.zIndex;
  });
}

export function compose(
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string[][] {
  const grid = createGrid(gridSize);
  const sorted = layers
    ? sortForRendering(objects, layers)
    : [...objects].sort((a, b) => a.zIndex - b.zIndex);

  for (const obj of sorted) {
    switch (obj.type) {
      case "box":
        stampBox(grid, obj);
        break;
      case "text":
        stampTextObj(grid, obj);
        break;
      case "line":
        stampLine(grid, obj);
        break;
      case "arrow":
        stampArrow(grid, obj);
        break;
      case "component":
        stampComponent(grid, obj);
        break;
      default:
        break;
    }
  }

  return grid;
}

export function gridToString(grid: string[][]): string {
  return grid
    .map((row) => {
      // Trim trailing spaces and shadows
      let end = row.length - 1;
      while (end >= 0 && (row[end] === " " || row[end] === SHADOW)) {
        end--;
      }
      // Build string, skipping shadow cells
      let line = "";
      for (let c = 0; c <= end; c++) {
        if (row[c] !== SHADOW) {
          line += row[c];
        }
      }
      return line;
    })
    .join("\n");
}
