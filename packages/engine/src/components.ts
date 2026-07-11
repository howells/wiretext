import type { ComponentType } from "./types";

export type ComponentCategory = "input" | "layout" | "display";

/**
 * Palette metadata for one component type.
 *
 * `defaultWidth`/`defaultHeight` seed {@link fillDefaults} when the caller
 * omits a size; `preview` is the short glyph string shown in the picker.
 */
export interface ComponentDef {
  category: ComponentCategory;
  defaultHeight: number;
  defaultWidth: number;
  name: string;
  preview: string;
  type: ComponentType;
}

export const COMPONENT_DEFS: ComponentDef[] = [
  // Input
  {
    category: "input",
    defaultHeight: 3,
    defaultWidth: 12,
    name: "Button",
    preview: "[ OK ]",
    type: "button",
  },
  {
    category: "input",
    defaultHeight: 3,
    defaultWidth: 20,
    name: "Input",
    preview: "[____]",
    type: "input",
  },
  {
    category: "input",
    defaultHeight: 3,
    defaultWidth: 20,
    name: "Select",
    preview: "[▾  ]",
    type: "select",
  },
  {
    category: "input",
    defaultHeight: 1,
    defaultWidth: 14,
    name: "Checkbox",
    preview: "[✓] ",
    type: "checkbox",
  },
  {
    category: "input",
    defaultHeight: 1,
    defaultWidth: 14,
    name: "Radio",
    preview: "(●) ",
    type: "radio",
  },
  // Layout
  {
    category: "layout",
    defaultHeight: 8,
    defaultWidth: 24,
    name: "Table",
    preview: "┌─┬─┐",
    type: "table",
  },
  {
    category: "layout",
    defaultHeight: 15,
    defaultWidth: 30,
    name: "Modal",
    preview: "[×] ",
    type: "modal",
  },
  {
    category: "layout",
    defaultHeight: 20,
    defaultWidth: 40,
    name: "Browser",
    preview: "◄►⟳ ",
    type: "browser",
  },
  {
    category: "layout",
    defaultHeight: 10,
    defaultWidth: 20,
    name: "Card",
    preview: "┌───┐",
    type: "card",
  },
  // Display
  {
    category: "display",
    defaultHeight: 3,
    defaultWidth: 40,
    name: "Navbar",
    preview: "≡ ── ",
    type: "navbar",
  },
  {
    category: "display",
    defaultHeight: 3,
    defaultWidth: 30,
    name: "Tabs",
    preview: "┌┐┌┐ ",
    type: "tabs",
  },
  {
    category: "display",
    defaultHeight: 3,
    defaultWidth: 20,
    name: "Progress",
    preview: "▓░░░ ",
    type: "progress",
  },
  {
    category: "display",
    defaultHeight: 3,
    defaultWidth: 3,
    name: "Icon",
    preview: "★    ",
    type: "icon",
  },
  {
    category: "display",
    defaultHeight: 10,
    defaultWidth: 20,
    name: "Image",
    preview: "░░░░ ",
    type: "image",
  },
  {
    category: "display",
    defaultHeight: 1,
    defaultWidth: 20,
    name: "Divider",
    preview: "──── ",
    type: "divider",
  },
  {
    category: "input",
    defaultHeight: 1,
    defaultWidth: 14,
    name: "Toggle",
    preview: "[●━━]",
    type: "toggle",
  },
  {
    category: "display",
    defaultHeight: 5,
    defaultWidth: 40,
    name: "Alert",
    preview: "⚠ ── ",
    type: "alert",
  },
  {
    category: "display",
    defaultHeight: 1,
    defaultWidth: 30,
    name: "Breadcrumb",
    preview: "a > b",
    type: "breadcrumb",
  },
  {
    category: "display",
    defaultHeight: 3,
    defaultWidth: 5,
    name: "Avatar",
    preview: "┌DH┐ ",
    type: "avatar",
  },
  {
    category: "display",
    defaultHeight: 5,
    defaultWidth: 20,
    name: "List",
    preview: "• ── ",
    type: "list",
  },
  {
    category: "display",
    defaultHeight: 1,
    defaultWidth: 30,
    name: "Stepper",
    preview: "●─○─○",
    type: "stepper",
  },
  {
    category: "display",
    defaultHeight: 1,
    defaultWidth: 5,
    name: "Rating",
    preview: "★★★☆☆",
    type: "rating",
  },
  {
    category: "display",
    defaultHeight: 1,
    defaultWidth: 20,
    name: "Skeleton",
    preview: "░░░░░",
    type: "skeleton",
  },
];

const DEF_BY_TYPE = new Map<ComponentType, ComponentDef>(
  COMPONENT_DEFS.map((d) => [d.type, d])
);

const pickDef = (type: ComponentType): ComponentDef => {
  const def = DEF_BY_TYPE.get(type);
  if (!def) {
    throw new Error(`Missing component definition for "${type}"`);
  }
  return def;
};

/**
 * Lookup table from component type to its definition. The explicit literal
 * makes exhaustiveness a compile-time guarantee: adding a ComponentType
 * without a definition here fails typechecking.
 */
export const COMPONENT_BY_TYPE: Record<ComponentType, ComponentDef> = {
  alert: pickDef("alert"),
  avatar: pickDef("avatar"),
  breadcrumb: pickDef("breadcrumb"),
  browser: pickDef("browser"),
  button: pickDef("button"),
  card: pickDef("card"),
  checkbox: pickDef("checkbox"),
  divider: pickDef("divider"),
  icon: pickDef("icon"),
  image: pickDef("image"),
  input: pickDef("input"),
  list: pickDef("list"),
  modal: pickDef("modal"),
  navbar: pickDef("navbar"),
  progress: pickDef("progress"),
  radio: pickDef("radio"),
  rating: pickDef("rating"),
  select: pickDef("select"),
  skeleton: pickDef("skeleton"),
  stepper: pickDef("stepper"),
  table: pickDef("table"),
  tabs: pickDef("tabs"),
  toggle: pickDef("toggle"),
};

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  "input",
  "layout",
  "display",
];
