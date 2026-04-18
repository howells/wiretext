import { displayWidth } from "./char-width";
import type { ComponentType } from "./types";

const BORDERLESS_COMPONENTS: ReadonlySet<ComponentType> = new Set([
  "icon",
  "divider",
  "toggle",
  "checkbox",
  "radio",
  "breadcrumb",
  "list",
  "stepper",
  "rating",
  "skeleton",
]);

/** Fields needed to compute min width. Satisfied by both ComponentObject and MinimalComponent. */
interface MinWidthInput {
  columns?: string[];
  componentType: ComponentType;
  icon?: string;
  items?: string[];
  label?: string;
  listStyle?: string;
  maxValue?: number;
  navItems?: string[];
  separator?: string;
  tabs?: string[];
}

/**
 * Label padding per component type: how many extra chars the component adds
 * around the label text. { padding, fallback } where fallback is the min
 * width when the label is empty.
 */
const LABEL_PADDING: Partial<
  Record<ComponentType, { padding: number; fallback: number }>
> = {
  button: { padding: 4, fallback: 3 },
  input: { padding: 4, fallback: 3 },
  select: { padding: 5, fallback: 3 },
  checkbox: { padding: 8, fallback: 3 },
  radio: { padding: 8, fallback: 3 },
  card: { padding: 4, fallback: 5 },
  modal: { padding: 4, fallback: 5 },
  browser: { padding: 12, fallback: 12 },
  alert: { padding: 6, fallback: 5 },
  image: { padding: 4, fallback: 3 },
  toggle: { padding: 6, fallback: 5 },
  divider: { padding: 5, fallback: 1 },
};

function minWidthNavbar(obj: MinWidthInput): number {
  const content = (obj.navItems ?? []).join("  ");
  const w = displayWidth(content);
  return w > 0 ? w + 7 : 3;
}

function minWidthTabs(obj: MinWidthInput): number {
  const content = (obj.tabs ?? []).join(" │ ");
  const w = displayWidth(content);
  return w > 0 ? w + 4 : 3;
}

function minWidthTable(obj: MinWidthInput): number {
  const total = (obj.columns ?? []).reduce(
    (sum, c) => sum + displayWidth(c) + 2,
    0,
  );
  return total > 0 ? total + 2 : 3;
}

function minWidthBreadcrumb(obj: MinWidthInput): number {
  const content = (obj.items ?? []).join(obj.separator ?? " > ");
  const w = displayWidth(content);
  return w > 0 ? w : 1;
}

function minWidthList(obj: MinWidthInput): number {
  const prefixLen = obj.listStyle === "number" ? 3 : 2;
  const maxItem = (obj.items ?? []).reduce(
    (max, item) => Math.max(max, displayWidth(item)),
    0,
  );
  return maxItem > 0 ? prefixLen + maxItem : 1;
}

function minWidthStepper(obj: MinWidthInput): number {
  const items = obj.items ?? [];
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += 1 + (items[i] ? 1 + displayWidth(items[i]) : 0);
    if (i < items.length - 1) {
      total += 3;
    }
  }
  return total > 0 ? total : 1;
}

function minWidthRating(obj: MinWidthInput): number {
  const max = obj.maxValue ?? 5;
  const len = displayWidth(obj.label ?? "");
  return len > 0 ? max + 1 + len : max;
}

const ITEMS_MIN_WIDTH: Partial<
  Record<ComponentType, (obj: MinWidthInput) => number>
> = {
  navbar: minWidthNavbar,
  tabs: minWidthTabs,
  table: minWidthTable,
  breadcrumb: minWidthBreadcrumb,
  list: minWidthList,
  stepper: minWidthStepper,
  rating: minWidthRating,
};

/** Minimum width needed to display a component's content without clipping. */
export function getComponentMinWidth(obj: MinWidthInput): number {
  const itemsFn = ITEMS_MIN_WIDTH[obj.componentType];
  if (itemsFn) {
    return itemsFn(obj);
  }

  const pad = LABEL_PADDING[obj.componentType];
  if (pad) {
    const len = displayWidth(obj.label ?? "");
    const extra = obj.componentType === "input" && obj.icon ? 2 : 0;
    return len > 0 ? len + pad.padding + extra : pad.fallback;
  }

  return BORDERLESS_COMPONENTS.has(obj.componentType) ? 1 : 3;
}

export { BORDERLESS_COMPONENTS };
