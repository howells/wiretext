"use client";

import type { ComponentObject, WireObject } from "@wiretext/engine";
import {
  compose,
  gridToString,
  ICON_CATEGORIES,
  WIRE_ICONS,
} from "@wiretext/engine";

const LAYER_ID = "test-layer";

function comp(
  id: string,
  componentType: ComponentObject["componentType"],
  col: number,
  row: number,
  width: number,
  height: number,
  overrides: Partial<ComponentObject> = {},
): ComponentObject {
  return {
    id,
    type: "component",
    componentType,
    position: { col, row },
    width,
    height,
    borderStyle: "single",
    zIndex: 0,
    layerId: LAYER_ID,
    ...overrides,
  };
}

function buildShowcase(): { objects: WireObject[]; rows: number } {
  const objects: WireObject[] = [];
  let nextId = 1;
  const id = () => String(nextId++);
  const add = (
    componentType: ComponentObject["componentType"],
    col: number,
    row: number,
    width: number,
    height: number,
    overrides: Partial<ComponentObject> = {},
  ) => {
    objects.push(comp(id(), componentType, col, row, width, height, overrides));
  };
  const label = (text: string, col: number, row: number) => {
    objects.push({
      id: id(),
      type: "text",
      content: text,
      position: { col, row },
      zIndex: 0,
      layerId: LAYER_ID,
    });
  };

  // ── BUTTON ────────────────────────────────────────────────
  let r = 0;
  label("BUTTON", 0, r);
  add("button", 0, r + 1, 14, 3, { label: "Click Me" }); // custom label
  add("button", 16, r + 1, 12, 3); // default label
  add("button", 30, r + 1, 14, 3, { borderStyle: "double", label: "Double" }); // double border
  add("button", 46, r + 1, 8, 3, { label: "Very Long Label" }); // truncated
  // alignment & icon variations
  add("button", 0, r + 5, 18, 3, { label: "Left Align", align: "left" });
  add("button", 20, r + 5, 18, 3, {
    label: "Submit",
    icon: "→",
    iconPosition: "right",
  });
  add("button", 40, r + 5, 18, 3, { label: "Search", icon: "⌕" });
  add("button", 60, r + 5, 18, 3, {
    label: "Delete",
    icon: "✕",
    align: "left",
  });
  add("button", 80, r + 5, 18, 3, {
    label: "Save",
    icon: "✓",
    align: "left",
    iconPosition: "right",
  });

  // ── INPUT ─────────────────────────────────────────────────
  r = 9;
  label("INPUT", 0, r);
  add("input", 0, r + 1, 20, 3, { label: "Email address" }); // custom label
  add("input", 22, r + 1, 14, 3); // default label
  add("input", 38, r + 1, 18, 3, { label: "Search", icon: "@" }); // with icon
  add("input", 58, r + 1, 12, 3, { label: "Long placeholder text", icon: "Q" }); // icon + truncated

  // ── SELECT ────────────────────────────────────────────────
  r = 14;
  label("SELECT", 0, r);
  add("select", 0, r + 1, 18, 3, { label: "Choose option" }); // custom label
  add("select", 20, r + 1, 14, 3); // default label
  add("select", 36, r + 1, 10, 3, { label: "Very long select label" }); // truncated

  // ── CHECKBOX ──────────────────────────────────────────────
  r = 19;
  label("CHECKBOX", 0, r);
  add("checkbox", 0, r + 1, 22, 3, { label: "Accept terms" }); // unchecked (default)
  add("checkbox", 24, r + 1, 22, 3, { label: "I agree", checked: true }); // checked
  add("checkbox", 48, r + 1, 22, 3, { label: "Declined", checked: false }); // explicit unchecked
  add("checkbox", 72, r + 1, 14, 3, {
    label: "Very long checkbox label",
    checked: true,
  }); // truncated

  // ── RADIO ─────────────────────────────────────────────────
  r = 24;
  label("RADIO", 0, r);
  add("radio", 0, r + 1, 20, 3, { label: "Option A" }); // unselected (default)
  add("radio", 22, r + 1, 20, 3, { label: "Option B", checked: true }); // selected
  add("radio", 44, r + 1, 20, 3, { label: "Option C", checked: false }); // explicit unselected
  add("radio", 66, r + 1, 14, 3, {
    label: "Longer radio option",
    checked: true,
  }); // truncated

  // ── CARD ──────────────────────────────────────────────────
  r = 29;
  label("CARD", 0, r);
  add("card", 0, r + 1, 22, 8, { label: "User Profile" }); // custom label
  add("card", 24, r + 1, 16, 7); // default label
  add("card", 42, r + 1, 22, 8, { label: "My Card", borderStyle: "rounded" }); // rounded
  add("card", 66, r + 1, 12, 6, { label: "Very Long Card Title" }); // truncated

  // ── MODAL ─────────────────────────────────────────────────
  r = 39;
  label("MODAL", 0, r);
  add("modal", 0, r + 1, 24, 8, { label: "Confirm Delete" }); // custom label + close btn
  add("modal", 26, r + 1, 18, 7); // default label
  add("modal", 46, r + 1, 14, 6, { label: "Very Long Modal Title" }); // truncated

  // ── BROWSER ───────────────────────────────────────────────
  r = 49;
  label("BROWSER", 0, r);
  add("browser", 0, r + 1, 36, 8, {
    label: "https://example.com/very/long/path",
  }); // custom URL
  add("browser", 38, r + 1, 28, 7); // default URL
  add("browser", 68, r + 1, 20, 4); // height < 5 (no controls)

  // ── TABLE ─────────────────────────────────────────────────
  r = 59;
  label("TABLE", 0, r);
  add("table", 0, r + 1, 30, 7, { columns: ["Name", "Email", "Role"] }); // 3 columns
  add("table", 32, r + 1, 20, 6, { columns: ["Only"] }); // single column (no separators)
  add("table", 54, r + 1, 30, 7, {
    columns: ["Name", "Status"],
    filterable: true,
  }); // filterable
  add("table", 86, r + 1, 18, 6, {
    columns: ["Very Long Column Name", "Short"],
  }); // truncated headers

  // ── NAVBAR ────────────────────────────────────────────────
  r = 68;
  label("NAVBAR", 0, r);
  add("navbar", 0, r + 1, 40, 3, {
    navItems: ["Home", "About", "Services", "Contact"],
  }); // full
  add("navbar", 42, r + 1, 20, 3, {
    navItems: ["Home", "About", "Services", "Contact"],
  }); // truncated
  add("navbar", 64, r + 1, 16, 3, { navItems: [] }); // empty (hamburger only)
  add("navbar", 82, r + 1, 12, 3); // default (no navItems)

  // ── TABS ──────────────────────────────────────────────────
  r = 73;
  label("TABS", 0, r);
  add("tabs", 0, r + 1, 28, 3, { tabs: ["Overview", "Settings", "Advanced"] }); // full
  add("tabs", 30, r + 1, 16, 3, { tabs: ["Overview", "Settings", "Advanced"] }); // truncated
  add("tabs", 48, r + 1, 14, 3, { tabs: ["Only Tab"] }); // single tab

  // ── PROGRESS ──────────────────────────────────────────────
  r = 78;
  label("PROGRESS", 0, r);
  add("progress", 0, r + 1, 24, 3, { progress: 65 }); // partial
  add("progress", 26, r + 1, 20, 3, { progress: 0 }); // 0%
  add("progress", 48, r + 1, 20, 3, { progress: 100 }); // 100%
  add("progress", 70, r + 1, 12, 3); // default (~40%)

  // ── ICONS (all available) ───────────────────────────────────
  r = 83;
  label("ICONS", 0, r);
  r += 1;
  for (const category of ICON_CATEGORIES) {
    const icons = WIRE_ICONS.filter((i) => i.category === category);
    label(category.toUpperCase(), 0, r);
    let c = 0;
    for (const icon of icons) {
      add("icon", c, r + 1, 3, 3, { icon: icon.char });
      c += 5;
    }
    r += 5;
  }

  // ── AVATAR ────────────────────────────────────────────────
  r += 1;
  label("AVATAR", 0, r);
  add("avatar", 0, r + 1, 5, 3, { label: "DH" }); // spaced initials
  add("avatar", 7, r + 1, 5, 3, { label: "AB" }); // spaced initials
  add("avatar", 14, r + 1, 5, 3, { icon: ":" }); // icon mode (smiley)
  add("avatar", 21, r + 1, 5, 3, { label: "" }); // empty label (⍥)
  add("avatar", 28, r + 1, 5, 3, { label: "ABCDEF" }); // clipped long label

  // ── IMAGE ─────────────────────────────────────────────────
  r += 5;
  label("IMAGE", 0, r);
  add("image", 0, r + 1, 20, 7, { label: "Hero Banner" }); // with label
  add("image", 22, r + 1, 14, 5, { icon: "#" }); // with icon
  add("image", 38, r + 1, 12, 5); // no label/icon (just fill)
  add("image", 52, r + 1, 12, 5, { label: "A very long image alt text" }); // truncated label

  // ── TOGGLE ────────────────────────────────────────────────
  r += 9;
  label("TOGGLE", 0, r);
  add("toggle", 0, r + 1, 20, 1, { label: "Dark mode" }); // off (default)
  add("toggle", 0, r + 2, 20, 1, { label: "Notifications", checked: true }); // on
  add("toggle", 0, r + 3, 20, 1, { label: "Sound", checked: false }); // explicit off
  add("toggle", 0, r + 4, 8, 1); // no label
  add("toggle", 0, r + 5, 12, 1, {
    label: "Enable all notifications",
    checked: true,
  }); // truncated

  // ── ALERT ─────────────────────────────────────────────────
  r += 7;
  label("ALERT", 0, r);
  add("alert", 0, r + 1, 24, 5, { alertType: "info" }); // info (default label)
  add("alert", 26, r + 1, 24, 5, {
    label: "Check input",
    alertType: "warning",
  }); // warning
  add("alert", 52, r + 1, 24, 5, { label: "Failed", alertType: "error" }); // error
  add("alert", 78, r + 1, 24, 5, {
    label: "Changes saved",
    alertType: "success",
  }); // success
  add("alert", 0, r + 7, 16, 5, {
    label: "Something went terribly wrong",
    alertType: "error",
  }); // truncated

  // ── DIVIDER ───────────────────────────────────────────────
  r += 13;
  label("DIVIDER", 0, r);
  add("divider", 0, r + 1, 30, 1, { label: "Section Header" }); // with label
  add("divider", 0, r + 3, 20, 1); // plain (no label)
  add("divider", 0, r + 5, 14, 1, { label: "Very Long Section Header" }); // truncated label
  add("divider", 0, r + 7, 4, 1, { label: "OR" }); // narrow (< 5, fallback)

  // ── BREADCRUMB ────────────────────────────────────────────
  label("BREADCRUMB", 34, r);
  add("breadcrumb", 34, r + 1, 30, 1, {
    items: ["Home", "Products", "Electronics"],
  }); // default sep
  add("breadcrumb", 34, r + 3, 30, 1, {
    items: ["A", "B", "C"],
    separator: " / ",
  }); // custom sep
  add("breadcrumb", 34, r + 5, 14, 1, {
    items: ["Home", "Products", "Electronics", "Phones"],
  }); // truncated

  // ── LIST ──────────────────────────────────────────────────
  r += 10;
  label("LIST", 0, r);
  add("list", 0, r + 1, 20, 4, {
    items: ["First item", "Second item", "Third item", "Fourth item"],
  }); // bullet (default)
  add("list", 22, r + 1, 20, 3, {
    items: ["First", "Second", "Third"],
    listStyle: "number",
  }); // numbered
  add("list", 44, r + 1, 20, 2, {
    items: ["Item A", "Item B"],
    listStyle: "dash",
  }); // dash
  add("list", 66, r + 1, 10, 3, {
    items: ["A really long list item", "Short", "Medium length"],
  }); // truncated

  // ── STEPPER ───────────────────────────────────────────────
  r += 6;
  label("STEPPER", 0, r);
  add("stepper", 0, r + 1, 40, 1, {
    items: ["Start", "Middle", "End"],
    activeStep: 0,
  }); // first active
  add("stepper", 0, r + 3, 40, 1, {
    items: ["Start", "Middle", "End"],
    activeStep: 1,
  }); // middle active
  add("stepper", 0, r + 5, 40, 1, {
    items: ["Start", "Middle", "End"],
    activeStep: 2,
  }); // all active
  add("stepper", 42, r + 1, 14, 1, {
    items: ["Start", "Middle", "End"],
    activeStep: 0,
  }); // truncated

  // ── RATING ────────────────────────────────────────────────
  r += 7;
  label("RATING", 0, r);
  add("rating", 0, r + 1, 14, 1, { value: 3, maxValue: 5, label: "Good" }); // partial + label
  add("rating", 0, r + 3, 10, 1, { value: 0, maxValue: 5 }); // 0 stars
  add("rating", 0, r + 5, 10, 1, { value: 5, maxValue: 5 }); // full stars
  add("rating", 12, r + 3, 10, 1, { value: 4, maxValue: 5, label: "4/5" }); // with label
  add("rating", 12, r + 5, 8, 1, {
    value: 4,
    maxValue: 5,
    label: "Very long rating label",
  }); // truncated

  // ── SKELETON ──────────────────────────────────────────────
  r += 7;
  label("SKELETON", 0, r);
  add("skeleton", 0, r + 1, 20, 1); // single row
  add("skeleton", 22, r + 1, 14, 3); // multi-row

  // ── BOX PRIMITIVES ────────────────────────────────────────
  r += 5;
  label("BOX", 0, r);
  objects.push({
    id: id(),
    type: "box",
    position: { col: 0, row: r + 1 },
    width: 14,
    height: 5,
    borderStyle: "single",
    label: "Single",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 16, row: r + 1 },
    width: 14,
    height: 5,
    borderStyle: "double",
    label: "Double",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 32, row: r + 1 },
    width: 14,
    height: 5,
    borderStyle: "rounded",
    label: "Rounded",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 48, row: r + 1 },
    width: 14,
    height: 5,
    borderStyle: "heavy",
    label: "Heavy",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 64, row: r + 1 },
    width: 14,
    height: 5,
    borderStyle: "single",
    fill: "transparent",
    label: "Transparent",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 80, row: r + 1 },
    width: 10,
    height: 4,
    borderStyle: "single",
    zIndex: 0,
    layerId: LAYER_ID,
  });
  objects.push({
    id: id(),
    type: "box",
    position: { col: 92, row: r + 1 },
    width: 10,
    height: 4,
    borderStyle: "single",
    label: "Overflowing Label Text",
    zIndex: 0,
    layerId: LAYER_ID,
  });

  // ── LINES & ARROWS ────────────────────────────────────────
  r += 8;
  label("LINE & ARROW", 0, r);
  // Horizontal line
  objects.push({
    id: id(),
    type: "line",
    position: { col: 0, row: r + 1 },
    endPosition: { col: 20, row: r + 1 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Vertical line
  objects.push({
    id: id(),
    type: "line",
    position: { col: 24, row: r + 1 },
    endPosition: { col: 24, row: r + 5 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Diagonal line (down-right)
  objects.push({
    id: id(),
    type: "line",
    position: { col: 28, row: r + 1 },
    endPosition: { col: 33, row: r + 5 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Diagonal line (down-left)
  objects.push({
    id: id(),
    type: "line",
    position: { col: 40, row: r + 1 },
    endPosition: { col: 35, row: r + 5 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Horizontal arrow (right)
  objects.push({
    id: id(),
    type: "arrow",
    position: { col: 44, row: r + 1 },
    endPosition: { col: 60, row: r + 1 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Vertical arrow (down)
  objects.push({
    id: id(),
    type: "arrow",
    position: { col: 64, row: r + 1 },
    endPosition: { col: 64, row: r + 5 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Diagonal arrow (down-right)
  objects.push({
    id: id(),
    type: "arrow",
    position: { col: 68, row: r + 1 },
    endPosition: { col: 76, row: r + 5 },
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Double-headed arrow
  objects.push({
    id: id(),
    type: "arrow",
    position: { col: 80, row: r + 1 },
    endPosition: { col: 96, row: r + 1 },
    startHead: true,
    zIndex: 0,
    layerId: LAYER_ID,
  });
  // Arrow with no end head
  objects.push({
    id: id(),
    type: "arrow",
    position: { col: 80, row: r + 3 },
    endPosition: { col: 96, row: r + 3 },
    endHead: false,
    zIndex: 0,
    layerId: LAYER_ID,
  });

  return { objects, rows: r + 8 };
}

export default function TestPage() {
  const { objects, rows } = buildShowcase();
  const grid = compose(objects, { cols: 110, rows });
  const text = gridToString(grid);

  return (
    <div
      style={{
        background: "var(--color-bg)",
        height: "100vh",
        padding: "2rem",
        fontFamily: "var(--font-mono), monospace",
        overflow: "auto",
      }}
    >
      <h1
        style={{
          color: "var(--color-text)",
          fontSize: "1.2rem",
          marginBottom: "0.5rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Wiretext Component Showcase
      </h1>
      <p
        style={{
          color: "var(--color-text-dim)",
          fontSize: "0.85rem",
          marginBottom: "1.5rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Every component type with all variations. Overflow text should show
        ellipsis (...).
      </p>
      <pre
        style={{
          color: "var(--color-text)",
          fontSize: "14px",
          lineHeight: "1.35",
          whiteSpace: "pre",
          overflow: "auto",
        }}
      >
        {text}
      </pre>
    </div>
  );
}
