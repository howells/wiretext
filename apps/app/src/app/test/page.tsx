"use client";

import type { ComponentObject, WireObject } from "@wiretext/engine";
import {
  compose,
  gridToString,
  ICON_CATEGORIES,
  WIRE_ICONS,
} from "@wiretext/engine";

const LAYER_ID = "test-layer";

const comp = (
  id: string,
  componentType: ComponentObject["componentType"],
  col: number,
  row: number,
  width: number,
  height: number,
  overrides: Partial<ComponentObject> = {}
): ComponentObject => ({
  borderStyle: "single",
  componentType,
  height,
  id,
  layerId: LAYER_ID,
  position: { col, row },
  type: "component",
  width,
  zIndex: 0,
  ...overrides,
});

interface Showcase {
  add: (
    componentType: ComponentObject["componentType"],
    col: number,
    row: number,
    width: number,
    height: number,
    overrides?: Partial<ComponentObject>
  ) => void;
  label: (text: string, col: number, row: number) => void;
  nextId: () => string;
  objects: WireObject[];
}

const createShowcase = (): Showcase => {
  const objects: WireObject[] = [];
  let counter = 1;
  const nextId = () => {
    counter += 1;
    return String(counter);
  };
  const add = (
    componentType: ComponentObject["componentType"],
    col: number,
    row: number,
    width: number,
    height: number,
    overrides: Partial<ComponentObject> = {}
  ) => {
    objects.push(
      comp(nextId(), componentType, col, row, width, height, overrides)
    );
  };
  const label = (text: string, col: number, row: number) => {
    objects.push({
      content: text,
      id: nextId(),
      layerId: LAYER_ID,
      position: { col, row },
      type: "text",
      zIndex: 0,
    });
  };
  return { add, label, nextId, objects };
};

const addFormControls = (showcase: Showcase): void => {
  const { add, label } = showcase;

  // ── BUTTON ────────────────────────────────────────────────
  let r = 0;
  label("BUTTON", 0, r);
  // custom label
  add("button", 0, r + 1, 14, 3, { label: "Click Me" });
  // default label
  add("button", 16, r + 1, 12, 3);
  // double border
  add("button", 30, r + 1, 14, 3, { borderStyle: "double", label: "Double" });
  // truncated
  add("button", 46, r + 1, 8, 3, { label: "Very Long Label" });
  // alignment & icon variations
  add("button", 0, r + 5, 18, 3, { align: "left", label: "Left Align" });
  add("button", 20, r + 5, 18, 3, {
    icon: "→",
    iconPosition: "right",
    label: "Submit",
  });
  add("button", 40, r + 5, 18, 3, { icon: "⌕", label: "Search" });
  add("button", 60, r + 5, 18, 3, {
    align: "left",
    icon: "✕",
    label: "Delete",
  });
  add("button", 80, r + 5, 18, 3, {
    align: "left",
    icon: "✓",
    iconPosition: "right",
    label: "Save",
  });

  // ── INPUT ─────────────────────────────────────────────────
  r = 9;
  label("INPUT", 0, r);
  // custom label
  add("input", 0, r + 1, 20, 3, { label: "Email address" });
  // default label
  add("input", 22, r + 1, 14, 3);
  // with icon
  add("input", 38, r + 1, 18, 3, { icon: "@", label: "Search" });
  // icon + truncated
  add("input", 58, r + 1, 12, 3, { icon: "Q", label: "Long placeholder text" });

  // ── SELECT ────────────────────────────────────────────────
  r = 14;
  label("SELECT", 0, r);
  // custom label
  add("select", 0, r + 1, 18, 3, { label: "Choose option" });
  // default label
  add("select", 20, r + 1, 14, 3);
  // truncated
  add("select", 36, r + 1, 10, 3, { label: "Very long select label" });

  // ── CHECKBOX ──────────────────────────────────────────────
  r = 19;
  label("CHECKBOX", 0, r);
  // unchecked (default)
  add("checkbox", 0, r + 1, 22, 3, { label: "Accept terms" });
  // checked
  add("checkbox", 24, r + 1, 22, 3, { checked: true, label: "I agree" });
  // explicit unchecked
  add("checkbox", 48, r + 1, 22, 3, { checked: false, label: "Declined" });
  // truncated
  add("checkbox", 72, r + 1, 14, 3, {
    checked: true,
    label: "Very long checkbox label",
  });

  // ── RADIO ─────────────────────────────────────────────────
  r = 24;
  label("RADIO", 0, r);
  // unselected (default)
  add("radio", 0, r + 1, 20, 3, { label: "Option A" });
  // selected
  add("radio", 22, r + 1, 20, 3, { checked: true, label: "Option B" });
  // explicit unselected
  add("radio", 44, r + 1, 20, 3, { checked: false, label: "Option C" });
  // truncated
  add("radio", 66, r + 1, 14, 3, {
    checked: true,
    label: "Longer radio option",
  });
};

const addContainers = (showcase: Showcase): void => {
  const { add, label } = showcase;

  // ── CARD ──────────────────────────────────────────────────
  let r = 29;
  label("CARD", 0, r);
  // custom label
  add("card", 0, r + 1, 22, 8, { label: "User Profile" });
  // default label
  add("card", 24, r + 1, 16, 7);
  // rounded
  add("card", 42, r + 1, 22, 8, { borderStyle: "rounded", label: "My Card" });
  // truncated
  add("card", 66, r + 1, 12, 6, { label: "Very Long Card Title" });

  // ── MODAL ─────────────────────────────────────────────────
  r = 39;
  label("MODAL", 0, r);
  // custom label + close btn
  add("modal", 0, r + 1, 24, 8, { label: "Confirm Delete" });
  // default label
  add("modal", 26, r + 1, 18, 7);
  // truncated
  add("modal", 46, r + 1, 14, 6, { label: "Very Long Modal Title" });

  // ── BROWSER ───────────────────────────────────────────────
  r = 49;
  label("BROWSER", 0, r);
  // custom URL
  add("browser", 0, r + 1, 36, 8, {
    label: "https://example.com/very/long/path",
  });
  // default URL
  add("browser", 38, r + 1, 28, 7);
  // height < 5 (no controls)
  add("browser", 68, r + 1, 20, 4);

  // ── TABLE ─────────────────────────────────────────────────
  r = 59;
  label("TABLE", 0, r);
  // 3 columns
  add("table", 0, r + 1, 30, 7, { columns: ["Name", "Email", "Role"] });
  // single column (no separators)
  add("table", 32, r + 1, 20, 6, { columns: ["Only"] });
  // filterable
  add("table", 54, r + 1, 30, 7, {
    columns: ["Name", "Status"],
    filterable: true,
  });
  // truncated headers
  add("table", 86, r + 1, 18, 6, {
    columns: ["Very Long Column Name", "Short"],
  });
};

const addNavAndProgress = (showcase: Showcase): void => {
  const { add, label } = showcase;

  // ── NAVBAR ────────────────────────────────────────────────
  let r = 68;
  label("NAVBAR", 0, r);
  // full
  add("navbar", 0, r + 1, 40, 3, {
    navItems: ["Home", "About", "Services", "Contact"],
  });
  // truncated
  add("navbar", 42, r + 1, 20, 3, {
    navItems: ["Home", "About", "Services", "Contact"],
  });
  // empty (hamburger only)
  add("navbar", 64, r + 1, 16, 3, { navItems: [] });
  // default (no navItems)
  add("navbar", 82, r + 1, 12, 3);

  // ── TABS ──────────────────────────────────────────────────
  r = 73;
  label("TABS", 0, r);
  // full
  add("tabs", 0, r + 1, 28, 3, { tabs: ["Overview", "Settings", "Advanced"] });
  // truncated
  add("tabs", 30, r + 1, 16, 3, { tabs: ["Overview", "Settings", "Advanced"] });
  // single tab
  add("tabs", 48, r + 1, 14, 3, { tabs: ["Only Tab"] });

  // ── PROGRESS ──────────────────────────────────────────────
  r = 78;
  label("PROGRESS", 0, r);
  // partial
  add("progress", 0, r + 1, 24, 3, { progress: 65 });
  // 0%
  add("progress", 26, r + 1, 20, 3, { progress: 0 });
  // 100%
  add("progress", 48, r + 1, 20, 3, { progress: 100 });
  // default (~40%)
  add("progress", 70, r + 1, 12, 3);
};

const addIconGallery = (showcase: Showcase): number => {
  const { add, label } = showcase;

  // ── ICONS (all available) ───────────────────────────────────
  let r = 83;
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
  return r;
};

const addMediaAndFeedback = (showcase: Showcase, start: number): number => {
  const { add, label } = showcase;
  let r = start;

  // ── AVATAR ────────────────────────────────────────────────
  r += 1;
  label("AVATAR", 0, r);
  // spaced initials
  add("avatar", 0, r + 1, 5, 3, { label: "DH" });
  // spaced initials
  add("avatar", 7, r + 1, 5, 3, { label: "AB" });
  // icon mode (smiley)
  add("avatar", 14, r + 1, 5, 3, { icon: ":" });
  // empty label (⍥)
  add("avatar", 21, r + 1, 5, 3, { label: "" });
  // clipped long label
  add("avatar", 28, r + 1, 5, 3, { label: "ABCDEF" });

  // ── IMAGE ─────────────────────────────────────────────────
  r += 5;
  label("IMAGE", 0, r);
  // with label
  add("image", 0, r + 1, 20, 7, { label: "Hero Banner" });
  // with icon
  add("image", 22, r + 1, 14, 5, { icon: "#" });
  // no label/icon (just fill)
  add("image", 38, r + 1, 12, 5);
  // truncated label
  add("image", 52, r + 1, 12, 5, { label: "A very long image alt text" });

  // ── TOGGLE ────────────────────────────────────────────────
  r += 9;
  label("TOGGLE", 0, r);
  // off (default)
  add("toggle", 0, r + 1, 20, 1, { label: "Dark mode" });
  // on
  add("toggle", 0, r + 2, 20, 1, { checked: true, label: "Notifications" });
  // explicit off
  add("toggle", 0, r + 3, 20, 1, { checked: false, label: "Sound" });
  // no label
  add("toggle", 0, r + 4, 8, 1);
  // truncated
  add("toggle", 0, r + 5, 12, 1, {
    checked: true,
    label: "Enable all notifications",
  });

  // ── ALERT ─────────────────────────────────────────────────
  r += 7;
  label("ALERT", 0, r);
  // info (default label)
  add("alert", 0, r + 1, 24, 5, { alertType: "info" });
  // warning
  add("alert", 26, r + 1, 24, 5, {
    alertType: "warning",
    label: "Check input",
  });
  // error
  add("alert", 52, r + 1, 24, 5, { alertType: "error", label: "Failed" });
  // success
  add("alert", 78, r + 1, 24, 5, {
    alertType: "success",
    label: "Changes saved",
  });
  // truncated
  add("alert", 0, r + 7, 16, 5, {
    alertType: "error",
    label: "Something went terribly wrong",
  });

  return r;
};

const addDividersAndLists = (showcase: Showcase, start: number): number => {
  const { add, label } = showcase;
  let r = start;

  // ── DIVIDER ───────────────────────────────────────────────
  r += 13;
  label("DIVIDER", 0, r);
  // with label
  add("divider", 0, r + 1, 30, 1, { label: "Section Header" });
  // plain (no label)
  add("divider", 0, r + 3, 20, 1);
  // truncated label
  add("divider", 0, r + 5, 14, 1, { label: "Very Long Section Header" });
  // narrow (< 5, fallback)
  add("divider", 0, r + 7, 4, 1, { label: "OR" });

  // ── BREADCRUMB ────────────────────────────────────────────
  label("BREADCRUMB", 34, r);
  // default sep
  add("breadcrumb", 34, r + 1, 30, 1, {
    items: ["Home", "Products", "Electronics"],
  });
  // custom sep
  add("breadcrumb", 34, r + 3, 30, 1, {
    items: ["A", "B", "C"],
    separator: " / ",
  });
  // truncated
  add("breadcrumb", 34, r + 5, 14, 1, {
    items: ["Home", "Products", "Electronics", "Phones"],
  });

  // ── LIST ──────────────────────────────────────────────────
  r += 10;
  label("LIST", 0, r);
  // bullet (default)
  add("list", 0, r + 1, 20, 4, {
    items: ["First item", "Second item", "Third item", "Fourth item"],
  });
  // numbered
  add("list", 22, r + 1, 20, 3, {
    items: ["First", "Second", "Third"],
    listStyle: "number",
  });
  // dash
  add("list", 44, r + 1, 20, 2, {
    items: ["Item A", "Item B"],
    listStyle: "dash",
  });
  // truncated
  add("list", 66, r + 1, 10, 3, {
    items: ["A really long list item", "Short", "Medium length"],
  });

  return r;
};

const addIndicators = (showcase: Showcase, start: number): number => {
  const { add, label } = showcase;
  let r = start;

  // ── STEPPER ───────────────────────────────────────────────
  r += 6;
  label("STEPPER", 0, r);
  // first active
  add("stepper", 0, r + 1, 40, 1, {
    activeStep: 0,
    items: ["Start", "Middle", "End"],
  });
  // middle active
  add("stepper", 0, r + 3, 40, 1, {
    activeStep: 1,
    items: ["Start", "Middle", "End"],
  });
  // all active
  add("stepper", 0, r + 5, 40, 1, {
    activeStep: 2,
    items: ["Start", "Middle", "End"],
  });
  // truncated
  add("stepper", 42, r + 1, 14, 1, {
    activeStep: 0,
    items: ["Start", "Middle", "End"],
  });

  // ── RATING ────────────────────────────────────────────────
  r += 7;
  label("RATING", 0, r);
  // partial + label
  add("rating", 0, r + 1, 14, 1, { label: "Good", maxValue: 5, value: 3 });
  // 0 stars
  add("rating", 0, r + 3, 10, 1, { maxValue: 5, value: 0 });
  // full stars
  add("rating", 0, r + 5, 10, 1, { maxValue: 5, value: 5 });
  // with label
  add("rating", 12, r + 3, 10, 1, { label: "4/5", maxValue: 5, value: 4 });
  // truncated
  add("rating", 12, r + 5, 8, 1, {
    label: "Very long rating label",
    maxValue: 5,
    value: 4,
  });

  // ── SKELETON ──────────────────────────────────────────────
  r += 7;
  label("SKELETON", 0, r);
  // single row
  add("skeleton", 0, r + 1, 20, 1);
  // multi-row
  add("skeleton", 22, r + 1, 14, 3);

  return r;
};

const addBoxPrimitives = (showcase: Showcase, start: number): number => {
  const { label, nextId, objects } = showcase;
  let r = start;

  // ── BOX PRIMITIVES ────────────────────────────────────────
  r += 5;
  label("BOX", 0, r);
  objects.push(
    {
      borderStyle: "single",
      height: 5,
      id: nextId(),
      label: "Single",
      layerId: LAYER_ID,
      position: { col: 0, row: r + 1 },
      type: "box",
      width: 14,
      zIndex: 0,
    },
    {
      borderStyle: "double",
      height: 5,
      id: nextId(),
      label: "Double",
      layerId: LAYER_ID,
      position: { col: 16, row: r + 1 },
      type: "box",
      width: 14,
      zIndex: 0,
    },
    {
      borderStyle: "rounded",
      height: 5,
      id: nextId(),
      label: "Rounded",
      layerId: LAYER_ID,
      position: { col: 32, row: r + 1 },
      type: "box",
      width: 14,
      zIndex: 0,
    },
    {
      borderStyle: "heavy",
      height: 5,
      id: nextId(),
      label: "Heavy",
      layerId: LAYER_ID,
      position: { col: 48, row: r + 1 },
      type: "box",
      width: 14,
      zIndex: 0,
    },
    {
      borderStyle: "single",
      fill: "transparent",
      height: 5,
      id: nextId(),
      label: "Transparent",
      layerId: LAYER_ID,
      position: { col: 64, row: r + 1 },
      type: "box",
      width: 14,
      zIndex: 0,
    },
    {
      borderStyle: "single",
      height: 4,
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 80, row: r + 1 },
      type: "box",
      width: 10,
      zIndex: 0,
    },
    {
      borderStyle: "single",
      height: 4,
      id: nextId(),
      label: "Overflowing Label Text",
      layerId: LAYER_ID,
      position: { col: 92, row: r + 1 },
      type: "box",
      width: 10,
      zIndex: 0,
    }
  );

  return r;
};

const addLinesAndArrows = (showcase: Showcase, start: number): number => {
  const { label, nextId, objects } = showcase;
  let r = start;

  // ── LINES & ARROWS ────────────────────────────────────────
  r += 8;
  label("LINE & ARROW", 0, r);
  objects.push(
    // Horizontal line
    {
      endPosition: { col: 20, row: r + 1 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 0, row: r + 1 },
      type: "line",
      zIndex: 0,
    },
    // Vertical line
    {
      endPosition: { col: 24, row: r + 5 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 24, row: r + 1 },
      type: "line",
      zIndex: 0,
    },
    // Diagonal line (down-right)
    {
      endPosition: { col: 33, row: r + 5 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 28, row: r + 1 },
      type: "line",
      zIndex: 0,
    },
    // Diagonal line (down-left)
    {
      endPosition: { col: 35, row: r + 5 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 40, row: r + 1 },
      type: "line",
      zIndex: 0,
    },
    // Horizontal arrow (right)
    {
      endPosition: { col: 60, row: r + 1 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 44, row: r + 1 },
      type: "arrow",
      zIndex: 0,
    },
    // Vertical arrow (down)
    {
      endPosition: { col: 64, row: r + 5 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 64, row: r + 1 },
      type: "arrow",
      zIndex: 0,
    },
    // Diagonal arrow (down-right)
    {
      endPosition: { col: 76, row: r + 5 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 68, row: r + 1 },
      type: "arrow",
      zIndex: 0,
    },
    // Double-headed arrow
    {
      endPosition: { col: 96, row: r + 1 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 80, row: r + 1 },
      startHead: true,
      type: "arrow",
      zIndex: 0,
    },
    // Arrow with no end head
    {
      endHead: false,
      endPosition: { col: 96, row: r + 3 },
      id: nextId(),
      layerId: LAYER_ID,
      position: { col: 80, row: r + 3 },
      type: "arrow",
      zIndex: 0,
    }
  );

  return r;
};

const buildShowcase = (): { objects: WireObject[]; rows: number } => {
  const showcase = createShowcase();
  addFormControls(showcase);
  addContainers(showcase);
  addNavAndProgress(showcase);
  let r = addIconGallery(showcase);
  r = addMediaAndFeedback(showcase, r);
  r = addDividersAndLists(showcase, r);
  r = addIndicators(showcase, r);
  r = addBoxPrimitives(showcase, r);
  r = addLinesAndArrows(showcase, r);
  return { objects: showcase.objects, rows: r + 8 };
};

export default function TestPage() {
  const { objects, rows } = buildShowcase();
  const grid = compose(objects, { cols: 110, rows });
  const text = gridToString(grid);

  return (
    <div
      style={{
        background: "var(--color-bg)",
        fontFamily: "var(--font-mono), monospace",
        height: "100vh",
        overflow: "auto",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          color: "var(--color-text)",
          fontFamily: "system-ui, sans-serif",
          fontSize: "1.2rem",
          marginBottom: "0.5rem",
        }}
      >
        Wiretext Component Showcase
      </h1>
      <p
        style={{
          color: "var(--color-text-dim)",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.85rem",
          marginBottom: "1.5rem",
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
          overflow: "auto",
          whiteSpace: "pre",
        }}
      >
        {text}
      </pre>
    </div>
  );
}
