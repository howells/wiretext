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
  id: z
    .string()
    .optional()
    .describe("Unique object ID. Auto-generated if omitted."),
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
};

export const boxSchema = z.object({
  ...baseFields,
  type: z.literal("box"),
  width: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Width in cells including borders (default: 10). Interior = width - 2."
    ),
  height: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Height in cells including borders (default: 5). Interior = height - 2."
    ),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema.describe(
    "'solid' clears interior before drawing children (use for containers). 'transparent' preserves background."
  ),
  label: z
    .string()
    .optional()
    .describe(
      "Centered label. Max length: width - 4 characters. For symmetric padding, width and label length must share parity (both even or both odd). Use \\n for multiline centered text."
    ),
});

export const textSchema = z.object({
  ...baseFields,
  type: z.literal("text"),
  content: z
    .string()
    .describe(
      "Text content. Each character = 1 cell wide. Newlines create additional rows. IMPORTANT: ensure text length fits within any parent container (container.width - 4 from the container's left edge)."
    ),
});

export const lineSchema = z.object({
  ...baseFields,
  type: z.literal("line"),
  endPosition: gridPointSchema.describe(
    "End point. Supports horizontal, vertical, and diagonal lines."
  ),
});

export const arrowSchema = z.object({
  ...baseFields,
  type: z.literal("arrow"),
  endPosition: gridPointSchema.describe(
    "End point. Arrow head drawn at this end by default."
  ),
  startHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at start point (default: false)"),
  endHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at end point (default: true)"),
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
  type: z.literal("component"),
  componentType: componentTypeSchema.describe(
    "UI component type. Each has a min size — see layout guide."
  ),
  width: z
    .number()
    .int()
    .min(3)
    .optional()
    .describe(
      "Width including borders. Minimum varies by component: button=label+4, input=label+6, checkbox/radio=label+8, table=24, card/modal=10, browser=20, tabs=20, progress=8, icon=3, navbar=20."
    ),
  height: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Height including borders. Bordered components need height>=3. Borderless components (divider, toggle, breadcrumb, stepper, rating, skeleton) can be height=1. Card/modal need height>=6. Browser/table need height>=5."
    ),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema,
  label: z
    .string()
    .optional()
    .describe(
      "Component label text. For button: centered (or left with align). For input/select: left-aligned. For card/modal: title bar. For browser: URL bar. For divider: centered in line. For toggle/rating: suffix text. For avatar: first 1-2 chars used as initials."
    ),
  icon: z
    .string()
    .optional()
    .describe(
      "Single character icon (for icon component, input prefix, button icon, or image placeholder). Use Unicode symbols like ← → ✓ ✕ ⌕ ✉ ★ ♡ ● ▶ etc."
    ),
  align: z
    .enum(["center", "left"])
    .optional()
    .describe("Label alignment for button. Default: center."),
  iconPosition: z
    .enum(["left", "right"])
    .optional()
    .describe(
      "Icon placement for button: left or right of label. Default: left."
    ),
  checked: z
    .boolean()
    .optional()
    .describe(
      "For checkbox ([✓]/[ ]), radio ((●)/( )), and toggle ([●──]/[──●]). Default: true."
    ),
  progress: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Progress percentage 0-100. Bar renders inside the border."),
  filterable: z
    .boolean()
    .optional()
    .describe(
      "Show filter dropdown arrows (▾) in table column headers. Default: false."
    ),
  columns: z
    .array(z.string())
    .optional()
    .describe(
      "Table column headers. Table width should be >= (sum of header lengths + separators). Each column gets width/numColumns cells."
    ),
  rows: z
    .array(z.array(z.string()))
    .optional()
    .describe(
      "Table data rows. Each row is an array of cell strings matching the columns order. Rows render below the header separator. Excess rows beyond available height are clipped."
    ),
  tabs: z
    .array(z.string())
    .optional()
    .describe(
      "Tab labels (rendered at vertical center with │ separators). WARNING: do not place objects at the same row as the tab labels."
    ),
  navItems: z
    .array(z.string())
    .optional()
    .describe("Navbar items (rendered at vertical center with 2-space gaps)."),
  alertType: alertTypeSchema
    .optional()
    .describe(
      "Alert variant: info (i), warning (!), error (x), success (✓). Controls icon prefix in title bar. Default: info."
    ),
  items: z
    .array(z.string())
    .optional()
    .describe(
      "Items array for breadcrumb (joined by separator), list (one per row with prefix), and stepper (step labels)."
    ),
  separator: z
    .string()
    .optional()
    .describe(
      'Breadcrumb separator string (default: " > "). Example: " / " or " → ".'
    ),
  listStyle: listStyleSchema
    .optional()
    .describe(
      "List item prefix style: bullet (• ), number (1. ), dash (- ). Default: bullet."
    ),
  activeStep: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      "0-based index of the current step in stepper. Steps up to this index show ● (filled), rest show ○ (empty). Default: 0."
    ),
  value: z
    .number()
    .min(0)
    .optional()
    .describe(
      "Current value for rating component (number of filled ● dots). Default: 0."
    ),
  maxValue: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Maximum value for rating component (total number of stars). Default: 5."
    ),
  body: z
    .string()
    .optional()
    .describe(
      "Body text for card/modal, rendered left-aligned below the title separator starting at row+4. Use \\n for multiple lines. Lines exceeding available height are clipped."
    ),
});

export const connectorSideSchema = z.enum(["top", "bottom", "left", "right"]);

export const connectorSchema = z.object({
  ...baseFields,
  type: z.literal("connector"),
  fromId: z
    .string()
    .describe(
      "ID of the source object (box or component) this connector starts from."
    ),
  toId: z
    .string()
    .describe(
      "ID of the target object (box or component) this connector ends at."
    ),
  fromSide: connectorSideSchema
    .optional()
    .describe(
      "Which side of the source object to attach to. Auto-detected based on relative positions if omitted."
    ),
  toSide: connectorSideSchema
    .optional()
    .describe(
      "Which side of the target object to attach to. Auto-detected based on relative positions if omitted."
    ),
  startHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at start point (default: false)"),
  endHead: z
    .boolean()
    .optional()
    .describe("Show arrow head at end point (default: true)"),
  label: z
    .string()
    .optional()
    .describe("Label displayed along the connector path."),
});

export const wireObjectSchema = z.discriminatedUnion("type", [
  boxSchema,
  textSchema,
  lineSchema,
  arrowSchema,
  componentSchema,
  connectorSchema,
]);

export const validatedObjectsSchema = z
  .array(wireObjectSchema)
  .superRefine((arr, ctx) => {
    for (let i = 0; i < arr.length; i++) {
      for (const err of validateContentWidth(arr[i])) {
        ctx.addIssue({
          code: "custom",
          path: [i, ...err.path],
          message: err.message,
        });
      }
    }
  });
