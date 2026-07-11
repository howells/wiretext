import { displayWidth } from "./char-width";
import type { ComponentType } from "./types";

/** Components that render their content directly with no surrounding border or fill, and so may be a single cell tall. */
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
  alert: { fallback: 5, padding: 6 },
  browser: { fallback: 12, padding: 12 },
  button: { fallback: 3, padding: 4 },
  card: { fallback: 5, padding: 4 },
  checkbox: { fallback: 3, padding: 8 },
  divider: { fallback: 1, padding: 5 },
  image: { fallback: 3, padding: 4 },
  input: { fallback: 3, padding: 4 },
  modal: { fallback: 5, padding: 4 },
  radio: { fallback: 3, padding: 8 },
  select: { fallback: 3, padding: 5 },
  toggle: { fallback: 5, padding: 6 },
};

const minWidthNavbar = (obj: MinWidthInput): number => {
  const content = (obj.navItems ?? []).join("  ");
  const w = displayWidth(content);
  return w > 0 ? w + 7 : 3;
};

const minWidthTabs = (obj: MinWidthInput): number => {
  const content = (obj.tabs ?? []).join(" │ ");
  const w = displayWidth(content);
  return w > 0 ? w + 4 : 3;
};

const minWidthTable = (obj: MinWidthInput): number => {
  let total = 0;
  for (const c of obj.columns ?? []) {
    total += displayWidth(c) + 2;
  }
  return total > 0 ? total + 2 : 3;
};

const minWidthBreadcrumb = (obj: MinWidthInput): number => {
  const content = (obj.items ?? []).join(obj.separator ?? " > ");
  const w = displayWidth(content);
  return w > 0 ? w : 1;
};

const minWidthList = (obj: MinWidthInput): number => {
  const prefixLen = obj.listStyle === "number" ? 3 : 2;
  let maxItem = 0;
  for (const item of obj.items ?? []) {
    maxItem = Math.max(maxItem, displayWidth(item));
  }
  return maxItem > 0 ? prefixLen + maxItem : 1;
};

const minWidthStepper = (obj: MinWidthInput): number => {
  const items = obj.items ?? [];
  let total = 0;
  for (const [i, item] of items.entries()) {
    total += 1 + (item ? 1 + displayWidth(item) : 0);
    if (i < items.length - 1) {
      total += 3;
    }
  }
  return total > 0 ? total : 1;
};

const minWidthRating = (obj: MinWidthInput): number => {
  const max = obj.maxValue ?? 5;
  const len = displayWidth(obj.label ?? "");
  return len > 0 ? max + 1 + len : max;
};

const ITEMS_MIN_WIDTH: Partial<
  Record<ComponentType, (obj: MinWidthInput) => number>
> = {
  breadcrumb: minWidthBreadcrumb,
  list: minWidthList,
  navbar: minWidthNavbar,
  rating: minWidthRating,
  stepper: minWidthStepper,
  table: minWidthTable,
  tabs: minWidthTabs,
};

/** Minimum width needed to display a component's content without clipping. */
export const getComponentMinWidth = (obj: MinWidthInput): number => {
  const itemsFn = ITEMS_MIN_WIDTH[obj.componentType];
  if (itemsFn) {
    return itemsFn(obj);
  }

  const pad = LABEL_PADDING[obj.componentType];
  if (pad) {
    const len = displayWidth(obj.label ?? "");
    const hasIcon = obj.icon !== undefined && obj.icon.length > 0;
    const extra = obj.componentType === "input" && hasIcon ? 2 : 0;
    return len > 0 ? len + pad.padding + extra : pad.fallback;
  }

  return BORDERLESS_COMPONENTS.has(obj.componentType) ? 1 : 3;
};

export { BORDERLESS_COMPONENTS };
