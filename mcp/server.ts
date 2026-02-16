import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { compose, gridToString } from "../src/engine/compose";
import { computeRenderGridSize, fillDefaults } from "../src/engine/defaults";
import { encodeDocument } from "../src/lib/sharing";

const BASE_URL = "https://wiretext.app";

const gridPointSchema = z.object({
  col: z.number().describe("Column position (0-based)"),
  row: z.number().describe("Row position (0-based)"),
});

const borderStyleSchema = z
  .enum(["single", "double", "rounded", "heavy"])
  .optional();

const fillStyleSchema = z.enum(["solid", "transparent"]).optional();

const baseFields = {
  id: z.string().optional(),
  position: gridPointSchema.optional().describe("Grid position (default: 0,0)"),
  zIndex: z.number().optional(),
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
    .optional()
    .describe("Box width in grid cells (default: 10)"),
  height: z
    .number()
    .optional()
    .describe("Box height in grid cells (default: 5)"),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema,
  label: z.string().optional(),
});

const textSchema = z.object({
  ...baseFields,
  type: z.literal("text"),
  content: z.string().describe("Text content (supports newlines)"),
});

const lineSchema = z.object({
  ...baseFields,
  type: z.literal("line"),
  endPosition: gridPointSchema.describe("End point of the line"),
});

const arrowSchema = z.object({
  ...baseFields,
  type: z.literal("arrow"),
  endPosition: gridPointSchema.describe("End point of the arrow"),
  startHead: z.boolean().optional(),
  endHead: z.boolean().optional(),
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
]);

const componentSchema = z.object({
  ...baseFields,
  type: z.literal("component"),
  componentType: componentTypeSchema.describe("UI component type"),
  width: z.number().optional(),
  height: z.number().optional(),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema,
  label: z.string().optional(),
  icon: z.string().optional().describe("Single character icon"),
  checked: z.boolean().optional(),
  progress: z.number().optional().describe("Progress percentage (0-100)"),
  columns: z.array(z.string()).optional().describe("Table column headers"),
  tabs: z.array(z.string()).optional().describe("Tab labels"),
  navItems: z.array(z.string()).optional().describe("Navbar items"),
});

const wireObjectSchema = z.discriminatedUnion("type", [
  boxSchema,
  textSchema,
  lineSchema,
  arrowSchema,
  componentSchema,
]);

const server = new McpServer({
  name: "wiretext",
  version: "0.1.0",
});

server.tool(
  "create_wireframe",
  "Generate an editable Wiretext URL from wire objects. Objects can be boxes, text, lines, arrows, or UI components (button, input, select, checkbox, radio, table, modal, browser, card, navbar, tabs, progress, icon). Most fields have sensible defaults — only 'type' is required for a box.",
  {
    objects: z
      .array(wireObjectSchema)
      .describe("Array of wire objects to render"),
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
  "Render wire objects as ASCII/Unicode art. Returns a text block preview of the wireframe. Useful for previewing layouts before generating a shareable URL.",
  {
    objects: z
      .array(wireObjectSchema)
      .describe("Array of wire objects to render"),
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
