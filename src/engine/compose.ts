import { ARROW_CHARS, getBoxChars, LINE_CHARS } from "./characters";
import type {
  ArrowObject,
  BorderStyle,
  BoxObject,
  ComponentObject,
  GridSize,
  LineObject,
  TextObject,
  WireObject,
} from "./types";

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
    grid[row][col] = char;
  }
}

function forceSetChar(
  grid: string[][],
  col: number,
  row: number,
  char: string
) {
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    grid[row][col] = char;
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
  for (let i = 0; i < text.length; i++) {
    setChar(grid, col + i, row, text[i]);
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
  const trimmed =
    label.length > maxLabelLen ? `${label.slice(0, maxLabelLen - 1)}…` : label;
  const labelCol = col + Math.floor((width - trimmed.length) / 2);
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
    for (let c = 0; c < lines[r].length; c++) {
      setChar(grid, obj.position.col + c, obj.position.row + r, lines[r][c]);
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

function stampArrow(grid: string[][], obj: ArrowObject) {
  const { col: c1, row: r1 } = obj.position;
  const { col: c2, row: r2 } = obj.endPosition;

  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC; c <= maxC; c++) {
      setChar(grid, c, r1, LINE_CHARS.horizontal);
    }
    setChar(grid, c2, r2, c2 > c1 ? ARROW_CHARS.right : ARROW_CHARS.left);
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      setChar(grid, c1, r, LINE_CHARS.vertical);
    }
    setChar(grid, c2, r2, r2 > r1 ? ARROW_CHARS.down : ARROW_CHARS.up);
  } else {
    // Diagonal
    const dc = c2 - c1;
    const dr = r2 - r1;
    const ch = getDiagonalChar(dc, dr);
    for (const pt of walkLine(c1, r1, c2, r2)) {
      setChar(grid, pt.col, pt.row, ch);
    }
    setChar(grid, c2, r2, getArrowHeadChar(dc, dr));
  }
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
  stampCenteredLabel(
    grid,
    col,
    row,
    obj.width,
    obj.height,
    obj.label ?? "Button"
  );
}

function stampComponentInput(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  stampText(
    grid,
    col + 2,
    row + Math.floor(obj.height / 2),
    obj.label ?? "Input"
  );
}

function stampComponentSelect(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, obj.label ?? "Select");
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
  stampText(grid, col + 6, mid, obj.label ?? defaultLabel);
}

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
  const innerW = obj.width - 2;
  const colW = Math.floor(innerW / cols.length);

  stampHLine(grid, col + 1, row + 2, innerW);

  for (let i = 0; i < cols.length; i++) {
    const headerCol = col + 1 + i * colW;
    stampText(grid, headerCol + 1, row + 1, cols[i].slice(0, colW - 2));

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
  stampText(grid, col + 2, row + 1, title);
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
  stampText(grid, col + 2, row + 1, "◄ ► ⟳");
  const url = obj.label ?? "https://";
  const barStart = col + 10;
  const barEnd = col + obj.width - 2;
  if (barEnd > barStart) {
    stampText(grid, barStart, row + 1, url.slice(0, barEnd - barStart));
  }
}

function stampComponentNavbar(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, "≡");
  stampText(grid, col + 5, mid, (obj.navItems ?? []).join("  "));
}

function stampComponentTabs(
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, (obj.tabs ?? []).join(" │ "));
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
        obj.checked !== false ? "[✓]" : "[ ]",
        "Checkbox"
      );
    case "radio":
      return stampComponentToggle(
        grid,
        obj,
        col,
        row,
        obj.checked !== false ? "(●)" : "( )",
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
    default:
      break;
  }
}

function stampComponent(grid: string[][], obj: ComponentObject) {
  const { col, row } = obj.position;

  if (obj.fill !== "transparent") {
    stampFill(grid, col, row, obj.width, obj.height);
  }

  stampBorder(grid, col, row, obj.width, obj.height, obj.borderStyle);
  stampComponentContent(grid, obj, col, row);
}

export function compose(objects: WireObject[], gridSize: GridSize): string[][] {
  const grid = createGrid(gridSize);
  const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);

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
      // Trim trailing spaces
      let end = row.length - 1;
      while (end >= 0 && row[end] === " ") {
        end--;
      }
      return row.slice(0, end + 1).join("");
    })
    .join("\n");
}
