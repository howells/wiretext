import { validateContentWidth } from "@wiretext/engine";
import { z } from "zod";

export const gridPointSchema = z.object({
  col: z.number().int().min(0).describe("Column position (0-based, integer)"),
  row: z.number().int().min(0).describe("Row position (0-based, integer)"),
});

export const borderStyleSchema = z
  .enum(["single", "double", "rounded", "heavy"])
  .optional();

export const fillStyleSchema = z.enum(["solid", "transparent"]).optional();

export const layerSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique layer ID. Objects reference this via their layerId field."
    ),
  name: z
    .string()
    .describe(
      "Human-readable name for this layer (e.g., 'UI Elements', 'Annotations', 'Flow Arrows')."
    ),
});

const baseFields = {
  annotation: z
    .string()
    .optional()
    .describe(
      "Design note or annotation attached to this object. Visible as a tooltip in the editor."
    ),
  groupId: z
    .string()
    .optional()
    .describe(
      "Group ID for logically related objects. Objects sharing a groupId move and select together."
    ),
  id: z
    .string()
    .optional()
    .describe("Unique object ID. Auto-generated if omitted."),
  layerId: z
    .string()
    .optional()
    .describe(
      "ID of the layer this object belongs to. Must match a layer ID from the layers array. Defaults to the first layer."
    ),
  name: z
    .string()
    .optional()
    .describe(
      "Human-readable name for this object (e.g., 'Header Nav', 'Submit Button'). Shown in the editor's object list."
    ),
  position: gridPointSchema
    .optional()
    .describe("Top-left corner in grid coordinates (default: 0,0)"),
  zIndex: z
    .number()
    .int()
    .optional()
    .describe(
      "Render order — higher values draw on top. Use low values for containers, high for content."
    ),
};

export const boxSchema = z.object({
  ...baseFields,
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema.describe(
    "'solid' clears interior before drawing children (use for containers). 'transparent' preserves background."
  ),
  height: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Height in cells including borders (default: 5). Interior = height - 2."
    ),
  label: z
    .string()
    .optional()
    .describe(
      "Centered label. Max length: width - 4 characters. For symmetric padding, width and label length must share parity (both even or both odd). Use \\n for multiline centered text."
    ),
  type: z.literal("box"),
  width: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Width in cells including borders (default: 10). Interior = width - 2."
    ),
});

export const textSchema = z.object({
  ...baseFields,
  content: z
    .string()
    .describe(
      "Text content. Each character = 1 cell wide. Newlines create additional rows. IMPORTANT: ensure text length fits within any parent container (container.width - 4 from the container's left edge)."
    ),
  type: z.literal("text"),
});

export const lineSchema = z.object({
  ...baseFields,
  endPosition: gridPointSchema.describe(
    "End point. Supports horizontal, vertical, and diagonal lines."
  ),
  type: z.literal("line"),
});

export const arrowSchema = z.object({
  ...baseFields,
  endHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at end point (default: true)"),
  endPosition: gridPointSchema.describe(
    "End point. Arrow head drawn at this end by default."
  ),
  startHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at start point (default: false)"),
  type: z.literal("arrow"),
});

export const componentTypeSchema = z.enum([
  "button",
  "input",
  "select",
  "checkbox",
  "radio",
  "table",
  "modal",
  "browser",
  "card",
  "navbar",
  "tabs",
  "progress",
  "icon",
  "image",
  "divider",
  "toggle",
  "alert",
  "breadcrumb",
  "avatar",
  "list",
  "stepper",
  "rating",
  "skeleton",
]);

export const alertTypeSchema = z.enum(["info", "warning", "error", "success"]);
export const listStyleSchema = z.enum(["bullet", "number", "dash"]);

export const componentSchema = z.object({
  ...baseFields,
  activeStep: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      "0-based index of the current step in stepper. Steps up to this index show ● (filled), rest show ○ (empty). Default: 0."
    ),
  alertType: alertTypeSchema
    .optional()
    .describe(
      "Alert variant: info (i), warning (!), error (x), success (✓). Controls icon prefix in title bar. Default: info."
    ),
  align: z
    .enum(["center", "left"])
    .optional()
    .describe("Label alignment for button. Default: center."),
  body: z
    .string()
    .optional()
    .describe(
      "Body text for card/modal, rendered left-aligned below the title separator starting at row+4. Use \\n for multiple lines. Lines exceeding available height are clipped."
    ),
  borderStyle: borderStyleSchema,
  checked: z
    .boolean()
    .optional()
    .describe(
      "For checkbox ([✓]/[ ]), radio ((●)/( )), and toggle ([●──]/[──●]). Default: true."
    ),
  columns: z
    .array(z.string())
    .optional()
    .describe(
      "Table column headers. Table width should be >= (sum of header lengths + separators). Each column gets width/numColumns cells."
    ),
  componentType: componentTypeSchema.describe(
    "UI component type. Each has a min size — see layout guide."
  ),
  fill: fillStyleSchema,
  filterable: z
    .boolean()
    .optional()
    .describe(
      "Show filter dropdown arrows (▾) in table column headers. Default: false."
    ),
  height: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Height including borders. Bordered components need height>=3. Borderless components (divider, toggle, breadcrumb, stepper, rating, skeleton) can be height=1. Card/modal need height>=6. Browser/table need height>=5."
    ),
  icon: z
    .string()
    .optional()
    .describe(
      "Single character icon (for icon component, input prefix, button icon, or image placeholder). Use Unicode symbols like ← → ✓ ✕ ⌕ ✉ ★ ♡ ● ▶ etc."
    ),
  iconPosition: z
    .enum(["left", "right"])
    .optional()
    .describe(
      "Icon placement for button: left or right of label. Default: left."
    ),
  items: z
    .array(z.string())
    .optional()
    .describe(
      "Items array for breadcrumb (joined by separator), list (one per row with prefix), and stepper (step labels)."
    ),
  label: z
    .string()
    .optional()
    .describe(
      "Component label text. For button: centered (or left with align). For input/select: left-aligned. For card/modal: title bar. For browser: URL bar. For divider: centered in line. For toggle/rating: suffix text. For avatar: first 1-2 chars used as initials."
    ),
  listStyle: listStyleSchema
    .optional()
    .describe(
      "List item prefix style: bullet (• ), number (1. ), dash (- ). Default: bullet."
    ),
  maxValue: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Maximum value for rating component (total number of stars). Default: 5."
    ),
  navItems: z
    .array(z.string())
    .optional()
    .describe("Navbar items (rendered at vertical center with 2-space gaps)."),
  progress: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Progress percentage 0-100. Bar renders inside the border."),
  rows: z
    .array(z.array(z.string()))
    .optional()
    .describe(
      "Table data rows. Each row is an array of cell strings matching the columns order. Rows render below the header separator. Excess rows beyond available height are clipped."
    ),
  separator: z
    .string()
    .optional()
    .describe(
      'Breadcrumb separator string (default: " > "). Example: " / " or " → ".'
    ),
  tabs: z
    .array(z.string())
    .optional()
    .describe(
      "Tab labels (rendered at vertical center with │ separators). WARNING: do not place objects at the same row as the tab labels."
    ),
  type: z.literal("component"),
  value: z
    .number()
    .min(0)
    .optional()
    .describe(
      "Current value for rating component (number of filled ● dots). Default: 0."
    ),
  width: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Width including borders. Minimum varies by component: button=label+4, input=label+6, checkbox/radio=label+8, table=24, card/modal=10, browser=20, tabs=20, progress=8, icon=3, navbar=20."
    ),
});

export const connectorSideSchema = z.enum(["top", "bottom", "left", "right"]);

export const connectorSchema = z.object({
  ...baseFields,
  endHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at end point (default: true)"),
  fromId: z
    .string()
    .describe(
      "ID of the source object (box or component) this connector starts from."
    ),
  fromSide: connectorSideSchema
    .optional()
    .describe(
      "Which side of the source object to attach to. Auto-detected based on relative positions if omitted."
    ),
  label: z
    .string()
    .optional()
    .describe("Label displayed along the connector path."),
  startHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at start point (default: false)"),
  toId: z
    .string()
    .describe(
      "ID of the target object (box or component) this connector ends at."
    ),
  toSide: connectorSideSchema
    .optional()
    .describe(
      "Which side of the target object to attach to. Auto-detected based on relative positions if omitted."
    ),
  type: z.literal("connector"),
});

/** Any single wire object, discriminated on `type`. Accepts the minimal input form — most fields are optional and filled by the engine's defaults. */
export const wireObjectSchema = z.discriminatedUnion("type", [
  boxSchema,
  textSchema,
  lineSchema,
  arrowSchema,
  componentSchema,
  connectorSchema,
]);

/**
 * An object array plus a cross-field check that each explicit `width` can fit
 * its content (label/columns/items), surfaced as a Zod issue on `[index, "width"]`.
 *
 * The width check runs against the shared engine rule ({@link validateContentWidth}),
 * so schema validation and render-time sizing stay in agreement.
 */
export const validatedObjectsSchema = z
  .array(wireObjectSchema)
  .superRefine((arr, ctx) => {
    for (let i = 0; i < arr.length; i += 1) {
      const item = arr[i];
      if (!item) {
        continue;
      }
      for (const err of validateContentWidth(item)) {
        ctx.addIssue({
          code: "custom",
          message: err.message,
          path: [i, ...err.path],
        });
      }
    }
  });
