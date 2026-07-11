import { charWidth, displayWidth } from "./char-width";
import { getBoxChars } from "./characters";
import {
  forceSetChar,
  forceStampText,
  setChar,
  stampBorder,
  stampFill,
  stampHLine,
  stampText,
  truncate,
} from "./compose-stamps";
import { BORDERLESS_COMPONENTS } from "./min-width";
import type { ComponentObject, ComponentType } from "./types";

/** Signature shared by every component content stamper. */
type ComponentStamper = (
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
) => void;

const hasText = (value: string | undefined): value is string =>
  value !== undefined && value.length > 0;

const stampComponentButton: ComponentStamper = (grid, obj, col, row) => {
  const label = obj.label ?? "Button";
  const { icon } = obj;
  const mid = row + Math.floor(obj.height / 2);
  // Inner width: 2 border + 2 padding
  const innerW = obj.width - 4;

  let content: string;
  if (hasText(icon)) {
    // Icon + label: icon takes charWidth + 1 space
    const iconW = charWidth(icon);
    const trimmed = truncate(label, innerW - iconW - 1);
    content =
      obj.iconPosition === "right"
        ? `${trimmed} ${icon}`
        : `${icon} ${trimmed}`;
  } else {
    content = truncate(label, innerW);
  }

  if (obj.align === "left") {
    stampText(grid, col + 2, mid, content);
  } else {
    const startCol = col + Math.floor((obj.width - displayWidth(content)) / 2);
    stampText(grid, startCol, mid, content);
  }
};

const stampComponentInput: ComponentStamper = (grid, obj, col, row) => {
  const mid = row + Math.floor(obj.height / 2);
  let textCol = col + 2;
  if (hasText(obj.icon)) {
    setChar(grid, textCol, mid, obj.icon);
    textCol += charWidth(obj.icon) + 1;
  }
  const maxLen = col + obj.width - 2 - textCol;
  stampText(grid, textCol, mid, truncate(obj.label ?? "Input", maxLen));
};

const stampComponentSelect: ComponentStamper = (grid, obj, col, row) => {
  const mid = row + Math.floor(obj.height / 2);
  const maxLen = obj.width - 6;
  stampText(grid, col + 2, mid, truncate(obj.label ?? "Select", maxLen));
  setChar(grid, col + obj.width - 3, mid, "▾");
};

const stampComponentToggleRow = (
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number,
  indicator: string,
  defaultLabel: string
): void => {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col, mid, indicator);
  const labelCol = col + displayWidth(indicator) + 1;
  const maxLen = obj.width - displayWidth(indicator) - 1;
  stampText(grid, labelCol, mid, truncate(obj.label ?? defaultLabel, maxLen));
};

const stampComponentCheckbox: ComponentStamper = (grid, obj, col, row) => {
  const indicator = obj.checked === true ? "[✓]" : "[ ]";
  stampComponentToggleRow(grid, obj, col, row, indicator, "Checkbox");
};

const stampComponentRadio: ComponentStamper = (grid, obj, col, row) => {
  const indicator = obj.checked === true ? "(●)" : "( )";
  stampComponentToggleRow(grid, obj, col, row, indicator, "Radio");
};

const stampTableHeaders = (
  grid: string[][],
  cols: string[],
  col: number,
  row: number,
  colW: number,
  height: number,
  filterable: boolean
): void => {
  for (const [i, colName] of cols.entries()) {
    const headerCol = col + 1 + i * colW;
    const filterSpace = filterable ? 3 : 0;
    stampText(
      grid,
      headerCol + 1,
      row + 1,
      truncate(colName, colW - 3 - filterSpace)
    );
    if (filterable) {
      setChar(grid, headerCol + colW - 3, row + 1, "▾");
    }

    if (i > 0) {
      const sepCol = col + i * colW;
      for (let r = 1; r < height - 1; r += 1) {
        setChar(grid, sepCol, row + r, "│");
      }
      setChar(grid, sepCol, row, "┬");
      setChar(grid, sepCol, row + 2, "┼");
      setChar(grid, sepCol, row + height - 1, "┴");
    }
  }
};

const stampTableDataRows = (
  grid: string[][],
  dataRows: string[][],
  col: number,
  row: number,
  numCols: number,
  colW: number,
  maxVisibleRows: number
): void => {
  const visibleCount = Math.min(dataRows.length, maxVisibleRows);
  for (let r = 0; r < visibleCount; r += 1) {
    const gridRow = row + 3 + r;
    const dataRow = dataRows[r];
    if (!dataRow) {
      continue;
    }
    for (let c = 0; c < numCols; c += 1) {
      const cellValue = dataRow[c] ?? "";
      if (cellValue.length === 0) {
        continue;
      }
      const cellCol = col + 1 + c * colW;
      stampText(grid, cellCol + 1, gridRow, truncate(cellValue, colW - 3));
    }
  }
};

const stampComponentTable: ComponentStamper = (grid, obj, col, row) => {
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

  stampHLine(grid, col + 1, row + 2, innerW);
  stampTableHeaders(
    grid,
    cols,
    col,
    row,
    colW,
    obj.height,
    obj.filterable === true
  );

  const dataRows = obj.rows ?? [];
  stampTableDataRows(grid, dataRows, col, row, numCols, colW, obj.height - 4);
};

const stampComponentTitleBar = (
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number,
  title: string,
  showClose: boolean
): void => {
  if (obj.height < 6) {
    return;
  }
  const chars = getBoxChars(obj.borderStyle);
  // Title at row+1, padding row at row+2, separator at row+3
  stampHLine(grid, col + 1, row + 3, obj.width - 2);
  forceSetChar(grid, col, row + 3, chars.teeRight);
  forceSetChar(grid, col + obj.width - 1, row + 3, chars.teeLeft);
  if (showClose) {
    setChar(grid, col + obj.width - 3, row + 1, "×");
  }
  const maxLen = showClose ? obj.width - 6 : obj.width - 4;
  stampText(grid, col + 2, row + 1, truncate(title, maxLen));
};

const stampCardBody = (
  grid: string[][],
  obj: ComponentObject,
  col: number,
  row: number
): void => {
  if (obj.height < 6 || !hasText(obj.body)) {
    return;
  }
  const lines = obj.body.split("\n");
  const maxLen = obj.width - 4;
  const startRow = row + 4;
  const endRow = row + obj.height - 2;

  for (const [i, line] of lines.entries()) {
    const r = startRow + i;
    if (r > endRow) {
      break;
    }
    const trimmed = truncate(line, maxLen);
    stampText(grid, col + 2, r, trimmed);
  }
};

const stampComponentModal: ComponentStamper = (grid, obj, col, row) => {
  stampComponentTitleBar(grid, obj, col, row, obj.label ?? "Modal", true);
  stampCardBody(grid, obj, col, row);
};

const stampComponentCard: ComponentStamper = (grid, obj, col, row) => {
  stampComponentTitleBar(grid, obj, col, row, obj.label ?? "Card", false);
  stampCardBody(grid, obj, col, row);
};

const stampComponentBrowser: ComponentStamper = (grid, obj, col, row) => {
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
};

const stampComponentNavbar: ComponentStamper = (grid, obj, col, row) => {
  const mid = row + Math.floor(obj.height / 2);
  stampText(grid, col + 2, mid, "=");
  const text = (obj.navItems ?? []).join("  ");
  const maxLen = obj.width - 7;
  stampText(grid, col + 5, mid, truncate(text, maxLen));
};

const stampComponentTabs: ComponentStamper = (grid, obj, col, row) => {
  const mid = row + Math.floor(obj.height / 2);
  const text = (obj.tabs ?? []).join(" │ ");
  const maxLen = obj.width - 4;
  stampText(grid, col + 2, mid, truncate(text, maxLen));
};

const stampComponentProgress: ComponentStamper = (grid, obj, col, row) => {
  const mid = row + Math.floor(obj.height / 2);
  const innerW = obj.width - 4;
  const pct = Math.max(0, Math.min(100, obj.progress ?? 40));
  const filled = Math.round(innerW * (pct / 100));
  let bar = "";
  for (let i = 0; i < innerW; i += 1) {
    bar += i < filled ? "▓" : "░";
  }
  stampText(grid, col + 2, mid, bar);
};

const stampComponentIcon: ComponentStamper = (grid, obj, col, row) => {
  const midCol = col + Math.floor(obj.width / 2);
  const midRow = row + Math.floor(obj.height / 2);
  setChar(grid, midCol, midRow, obj.icon ?? "*");
};

const stampComponentImage: ComponentStamper = (grid, obj, col, row) => {
  // Fill interior with ░
  for (let r = 1; r < obj.height - 1; r += 1) {
    for (let c = 1; c < obj.width - 1; c += 1) {
      forceSetChar(grid, col + c, row + r, "░");
    }
  }
  // Centered label or icon — force-stamped so spaces overwrite ░
  const text = obj.label ?? obj.icon;
  if (hasText(text)) {
    const maxLabelLen = obj.width - 4;
    const trimmed = truncate(text, maxLabelLen);
    const labelRow = row + Math.floor(obj.height / 2);
    const labelCol = col + Math.floor((obj.width - displayWidth(trimmed)) / 2);
    forceStampText(grid, labelCol, labelRow, trimmed);
  }
};

const stampComponentDivider: ComponentStamper = (grid, obj, col, row) => {
  const { label } = obj;
  // Need at least 5 chars for "── L ─" pattern (2 dashes + space + 1 char + space)
  if (hasText(label) && obj.width >= 5) {
    const maxLabelLen = obj.width - 4;
    const trimmed = truncate(label, maxLabelLen);
    const leftLen = 2;
    for (let c = 0; c < leftLen; c += 1) {
      setChar(grid, col + c, row, "─");
    }
    setChar(grid, col + leftLen, row, " ");
    stampText(grid, col + leftLen + 1, row, trimmed);
    const afterLabel = leftLen + 1 + displayWidth(trimmed);
    setChar(grid, col + afterLabel, row, " ");
    for (let c = afterLabel + 1; c < obj.width; c += 1) {
      setChar(grid, col + c, row, "─");
    }
  } else {
    for (let c = 0; c < obj.width; c += 1) {
      setChar(grid, col + c, row, "─");
    }
  }
};

const stampComponentToggleSwitch: ComponentStamper = (grid, obj, col, row) => {
  const on = obj.checked === true;
  const toggle = on ? "[●──]" : "[──●]";
  stampText(grid, col, row, toggle);
  const toggleLabel = obj.label ?? "Toggle";
  const maxLen = obj.width - 6;
  stampText(grid, col + 6, row, truncate(toggleLabel, maxLen));
};

const ALERT_ICONS: Record<string, string> = {
  error: "x",
  info: "i",
  success: "✓",
  warning: "!",
};

const stampComponentAlert: ComponentStamper = (grid, obj, col, row) => {
  const icon = ALERT_ICONS[obj.alertType ?? "info"] ?? "i";
  const label = obj.label ?? "Alert";
  const maxLen = obj.width - 3;
  // Title line at row+1 (inside border)
  stampText(grid, col + 2, row + 1, truncate(`${icon} ${label}`, maxLen));
};

const stampComponentBreadcrumb: ComponentStamper = (grid, obj, col, row) => {
  const items = obj.items ?? [];
  const sep = obj.separator ?? " > ";
  const text = items.join(sep);
  stampText(grid, col, row, truncate(text, obj.width));
};

const stampComponentAvatar: ComponentStamper = (grid, obj, col, row) => {
  const innerW = obj.width - 2;
  const midRow = row + Math.floor(obj.height / 2);

  // Icon mode: render a single character centered (e.g. smiley face)
  if (hasText(obj.icon)) {
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
  // Iterate by code point so surrogate pairs stay intact
  const parts: string[] = [];
  for (const ch of chars) {
    parts.push(ch);
  }
  const spaced = parts.join(" ");
  const display = truncate(spaced, innerW);
  const startCol = col + 1 + Math.floor((innerW - displayWidth(display)) / 2);
  stampText(grid, startCol, midRow, display);
};

const listPrefix = (
  style: ComponentObject["listStyle"],
  index: number
): string => {
  switch (style) {
    case "number": {
      return `${index + 1}. `;
    }
    case "dash": {
      return "- ";
    }
    case "bullet":
    case undefined: {
      return "• ";
    }
    default: {
      return style satisfies never;
    }
  }
};

const stampComponentList: ComponentStamper = (grid, obj, col, row) => {
  const items = obj.items ?? [];
  for (let i = 0; i < items.length && i < obj.height; i += 1) {
    const line = `${listPrefix(obj.listStyle, i)}${items[i]}`;
    stampText(grid, col, row + i, truncate(line, obj.width));
  }
};

const stampComponentStepper: ComponentStamper = (grid, obj, col, row) => {
  const items = obj.items ?? [];
  const active = obj.activeStep ?? 0;
  const numSeps = items.length - 1;

  // Calculate fixed width: dots + labels
  let fixedWidth = 0;
  for (const item of items) {
    // Each step is a dot, plus a space + label when the label is non-empty
    fixedWidth += 1;
    if (item) {
      fixedWidth += 1 + displayWidth(item);
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
  for (const [i, item] of items.entries()) {
    const dot = i <= active ? "●" : "○";
    text += dot;
    if (item.length > 0) {
      text += ` ${item}`;
    }
    if (i < items.length - 1) {
      text += sep;
    }
  }
  stampText(grid, col, row, truncate(text, obj.width));
};

const stampComponentRating: ComponentStamper = (grid, obj, col, row) => {
  const value = Math.max(0, obj.value ?? 0);
  const max = Math.max(1, obj.maxValue ?? 5);
  let text = "";
  for (let i = 0; i < max; i += 1) {
    text += i < value ? "●" : "○";
  }
  if (hasText(obj.label)) {
    text += ` ${obj.label}`;
  }
  stampText(grid, col, row, truncate(text, obj.width));
};

const stampComponentSkeleton: ComponentStamper = (grid, obj, col, row) => {
  for (let r = 0; r < obj.height; r += 1) {
    for (let c = 0; c < obj.width; c += 1) {
      setChar(grid, col + c, row + r, "░");
    }
  }
};

/** Dispatch table from component type to its content stamper. */
const COMPONENT_STAMPERS: Record<ComponentType, ComponentStamper> = {
  alert: stampComponentAlert,
  avatar: stampComponentAvatar,
  breadcrumb: stampComponentBreadcrumb,
  browser: stampComponentBrowser,
  button: stampComponentButton,
  card: stampComponentCard,
  checkbox: stampComponentCheckbox,
  divider: stampComponentDivider,
  icon: stampComponentIcon,
  image: stampComponentImage,
  input: stampComponentInput,
  list: stampComponentList,
  modal: stampComponentModal,
  navbar: stampComponentNavbar,
  progress: stampComponentProgress,
  radio: stampComponentRadio,
  rating: stampComponentRating,
  select: stampComponentSelect,
  skeleton: stampComponentSkeleton,
  stepper: stampComponentStepper,
  table: stampComponentTable,
  tabs: stampComponentTabs,
  toggle: stampComponentToggleSwitch,
};

export const stampComponent = (
  grid: string[][],
  obj: ComponentObject
): void => {
  const { col, row } = obj.position;
  const stampContent = COMPONENT_STAMPERS[obj.componentType];

  // Borderless components render without border or fill
  if (BORDERLESS_COMPONENTS.has(obj.componentType)) {
    stampContent(grid, obj, col, row);
    return;
  }

  if (obj.fill !== "transparent") {
    stampFill(grid, col, row, obj.width, obj.height);
  }

  stampBorder(grid, col, row, obj.width, obj.height, obj.borderStyle);
  stampContent(grid, obj, col, row);
};
