import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { compose, gridToString } from "../src/engine/compose";
import { computeRenderGridSize, fillDefaults } from "../src/engine/defaults";
import { validateContentWidth } from "../src/engine/validate";
import { encodeDocument } from "../src/lib/sharing";

const BASE_URL = "https://wiretext.app";

// --- Layout Guide (embedded in tool descriptions) ---
const LAYOUT_GUIDE = `
CRITICAL LAYOUT RULES — read carefully to avoid rendering bugs:

COORDINATE SYSTEM:
- Grid is character-based: 1 cell = 1 character wide, 1 character tall
- position {col, row} is the top-left corner of the object (0-based)
- An object at col=5, width=20 occupies cols 5 through 24 (inclusive)

BORDER SIZING:
- Boxes and components have a 1-cell border on all sides
- Interior usable space = width - 2 (cols) × height - 2 (rows)
- A box of width=20 has 18 usable interior columns

NESTING CHILDREN INSIDE CONTAINERS:
- To place an object inside a container, offset position by at least +2 col, +2 row from the container's position
- Child must end at least 2 cols/rows before container's far edge
- Formula: child.col >= parent.col + 2, child.col + child.width <= parent.col + parent.width - 2
- Same rule applies vertically

TEXT SIZING:
- Each character in text content = 1 cell wide
- Text at col=10 with 15 characters occupies cols 10-24
- To fit text inside a container: text.length <= container.width - 4 (2 for borders + 2 for padding)
- Use shorter text or wider containers to avoid overflow

VERTICAL STACKING (inputs, checkboxes, etc.):
- Most input components are height=3 (top border + content + bottom border)
- To stack vertically WITHOUT overlapping: next.row = previous.row + previous.height
- Example: input at row=10 (height 3) → next input at row=13, NOT row=12
- Overlapping components corrupt each other's borders

COMPONENT SIZES:
- button: min width = label.length + 4, height 3
- input/select: min width = label.length + 6, height 3
- checkbox/radio: min width = label.length + 8, height 3 (includes [✓] or (●) prefix)
- table: min height 5, width should fit all column headers
- card/modal/browser: min height 5 (needs room for title bar separator)
- tabs: height should be tall enough for content below the tab labels (labels render at vertical center)
- progress: min width = 8, height 3 (bar renders inside borders)
- icon: width 3, height 3 (renders single char at center)
- navbar: height 3
- image: default 20×10, bordered with ░ fill and centered label/icon
- divider: height 1, borderless ─── line (optional centered label)
- toggle: height 1, borderless [●━━] or [━━●] + label, uses checked field
- alert: default 40×5, bordered with icon prefix (ℹ⚠✖✓) per alertType
- breadcrumb: height 1, borderless items joined by separator
- avatar: default 5×3, bordered with 1-2 char initials from label
- list: height = items.length, borderless rows with bullet/number/dash prefix
- stepper: height 1, borderless ● Step ─ ○ Step chain, uses activeStep
- rating: height 1, borderless ★★★☆☆ stars based on value/maxValue
- skeleton: height 1, borderless ░ fill block

TABS COMPONENT WARNING:
- Tab labels render at the vertical center of the tabs component
- Do NOT place other objects at that row — they will collide
- Place content objects ABOVE the center row (in the top half)

PROGRESS BAR INSIDE CARDS:
- A progress bar (height 3) inside a card must end at least 1 row above the card's bottom border
- Card bottom border = card.row + card.height - 1
- Progress bottom = progress.row + 2
- Ensure: progress.row + 2 < card.row + card.height - 1

Z-INDEX:
- Higher zIndex objects render on top and overwrite lower ones
- Place container objects (browser, card, box) at lower zIndex
- Place content objects (text, buttons, inputs) at higher zIndex
`.trim();

const gridPointSchema = z.object({
  col: z.number().int().min(0).describe("Column position (0-based, integer)"),
  row: z.number().int().min(0).describe("Row position (0-based, integer)"),
});

const borderStyleSchema = z
  .enum(["single", "double", "rounded", "heavy"])
  .optional();

const fillStyleSchema = z.enum(["solid", "transparent"]).optional();

const baseFields = {
  id: z.string().optional(),
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
  layerId: z.string().optional(),
  name: z.string().optional(),
  annotation: z.string().optional(),
  groupId: z.string().optional(),
};

const boxSchema = z.object({
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
    .describe("Centered label. Max length: width - 4 characters."),
});

const textSchema = z.object({
  ...baseFields,
  type: z.literal("text"),
  content: z
    .string()
    .describe(
      "Text content. Each character = 1 cell wide. Newlines create additional rows. IMPORTANT: ensure text length fits within any parent container (container.width - 4 from the container's left edge)."
    ),
});

const lineSchema = z.object({
  ...baseFields,
  type: z.literal("line"),
  endPosition: gridPointSchema.describe(
    "End point. Supports horizontal, vertical, and diagonal lines."
  ),
});

const arrowSchema = z.object({
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

const componentTypeSchema = z.enum([
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

const alertTypeSchema = z.enum(["info", "warning", "error", "success"]);
const listStyleSchema = z.enum(["bullet", "number", "dash"]);

const componentSchema = z.object({
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
      "Height including borders. Bordered components need height>=3. Borderless components (divider, toggle, breadcrumb, stepper, rating, skeleton) can be height=1. Card/modal/browser/table need height>=5."
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
      "For checkbox ([✓]/[ ]), radio ((●)/( )), and toggle ([●━━]/[━━●]). Default: true."
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
      "Alert variant: info (ℹ), warning (⚠), error (✖), success (✓). Controls icon prefix in title bar. Default: info."
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
      "Current value for rating component (number of filled ★ stars). Default: 0."
    ),
  maxValue: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Maximum value for rating component (total number of stars). Default: 5."
    ),
});

const wireObjectSchema = z.discriminatedUnion("type", [
  boxSchema,
  textSchema,
  lineSchema,
  arrowSchema,
  componentSchema,
]);

const validatedObjectsSchema = z
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

const server = new McpServer({
  name: "wiretext",
  version: "0.1.0",
});

server.tool(
  "create_wireframe",
  `Generate an editable Wiretext URL from wire objects. Returns a URL that opens in the Wiretext editor for further editing.

Object types: box, text, line, arrow, component (button, input, select, checkbox, radio, table, modal, browser, card, navbar, tabs, progress, icon, image, divider, toggle, alert, breadcrumb, avatar, list, stepper, rating, skeleton).

Most fields have sensible defaults — only 'type' is required for a box.

${LAYOUT_GUIDE}`,
  {
    objects: validatedObjectsSchema.describe("Array of wire objects to render"),
    baseUrl: z
      .string()
      .optional()
      .describe(`Base URL for the editor (default: ${BASE_URL})`),
  },
  ({ objects, baseUrl }) => {
    try {
      const { objects: filled, layer } = fillDefaults(objects);
      const encoded = encodeDocument(filled, [layer]);
      const url = `${baseUrl ?? BASE_URL}/#${encoded}`;
      return { content: [{ type: "text", text: url }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "render_wireframe",
  `Render wire objects as ASCII/Unicode art text. Use this to preview layouts before generating a shareable URL with create_wireframe.

${LAYOUT_GUIDE}`,
  {
    objects: validatedObjectsSchema.describe("Array of wire objects to render"),
  },
  ({ objects }) => {
    try {
      const { objects: filled, layer } = fillDefaults(objects);
      const gridSize = computeRenderGridSize(filled);
      const grid = compose(filled, gridSize, [layer]);
      return { content: [{ type: "text", text: gridToString(grid) }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
