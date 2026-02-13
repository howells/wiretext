import type { ComponentType } from "./types";

export type ComponentCategory = "input" | "layout" | "display";

export interface ComponentDef {
  type: ComponentType;
  name: string;
  preview: string;
  category: ComponentCategory;
  defaultWidth: number;
  defaultHeight: number;
}

export const COMPONENT_DEFS: ComponentDef[] = [
  // Input
  {
    type: "button",
    name: "Button",
    preview: "[ OK ]",
    category: "input",
    defaultWidth: 12,
    defaultHeight: 3,
  },
  {
    type: "input",
    name: "Input",
    preview: "[____]",
    category: "input",
    defaultWidth: 20,
    defaultHeight: 3,
  },
  {
    type: "select",
    name: "Select",
    preview: "[▾  ]",
    category: "input",
    defaultWidth: 20,
    defaultHeight: 3,
  },
  {
    type: "checkbox",
    name: "Checkbox",
    preview: "[✓] ",
    category: "input",
    defaultWidth: 20,
    defaultHeight: 3,
  },
  {
    type: "radio",
    name: "Radio",
    preview: "(●) ",
    category: "input",
    defaultWidth: 20,
    defaultHeight: 3,
  },
  // Layout
  {
    type: "table",
    name: "Table",
    preview: "┌─┬─┐",
    category: "layout",
    defaultWidth: 24,
    defaultHeight: 8,
  },
  {
    type: "modal",
    name: "Modal",
    preview: "[×] ",
    category: "layout",
    defaultWidth: 30,
    defaultHeight: 15,
  },
  {
    type: "browser",
    name: "Browser",
    preview: "◄►⟳ ",
    category: "layout",
    defaultWidth: 40,
    defaultHeight: 20,
  },
  {
    type: "card",
    name: "Card",
    preview: "┌───┐",
    category: "layout",
    defaultWidth: 20,
    defaultHeight: 10,
  },
  // Display
  {
    type: "navbar",
    name: "Navbar",
    preview: "≡ ── ",
    category: "display",
    defaultWidth: 40,
    defaultHeight: 3,
  },
  {
    type: "tabs",
    name: "Tabs",
    preview: "┌┐┌┐ ",
    category: "display",
    defaultWidth: 30,
    defaultHeight: 3,
  },
  {
    type: "progress",
    name: "Progress",
    preview: "▓░░░ ",
    category: "display",
    defaultWidth: 20,
    defaultHeight: 3,
  },
];

export const COMPONENT_BY_TYPE: Record<ComponentType, ComponentDef> =
  Object.fromEntries(COMPONENT_DEFS.map((d) => [d.type, d])) as Record<
    ComponentType,
    ComponentDef
  >;

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  "input",
  "layout",
  "display",
];
