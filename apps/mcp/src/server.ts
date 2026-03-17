import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  addPadding,
  compose,
  computeRenderGridSize,
  encodeDocument,
  fillDefaults,
  gridToString,
  LAYOUT_GUIDE,
  resolveLayers,
} from "@wiretext/engine";
import { layerSchema, validatedObjectsSchema } from "@wiretext/schemas";
import { z } from "zod";

const BASE_URL = "https://wiretext.app";

const server = new McpServer({
  name: "wiretext",
  version: "0.1.0",
});

server.tool(
  "create_wireframe",
  `Generate an editable Wiretext URL from wire objects. Returns a short URL (e.g. https://wiretext.app/w/abc12345) that opens in the Wiretext editor for further editing.

Object types: box, text, line, arrow, connector, component (button, input, select, checkbox, radio, table, modal, browser, card, navbar, tabs, progress, icon, image, divider, toggle, alert, breadcrumb, avatar, list, stepper, rating, skeleton).

Most fields have sensible defaults — only 'type' is required for a box.

${LAYOUT_GUIDE}`,
  {
    objects: validatedObjectsSchema.describe("Array of wire objects to render"),
    layers: z
      .array(layerSchema)
      .optional()
      .describe(
        "Named layers for organizing objects. Objects reference layers via layerId. If omitted, a single default layer is created."
      ),
    baseUrl: z
      .string()
      .optional()
      .describe(`Base URL for the editor (default: ${BASE_URL})`),
  },
  async ({ objects, layers: userLayers, baseUrl }) => {
    try {
      const { objects: filled, layer: defaultLayer } = fillDefaults(objects);
      const { objects: resolved, layers } = resolveLayers(
        filled,
        defaultLayer,
        userLayers
      );
      const finalObjects = addPadding(resolved, 1);
      const encoded = encodeDocument(finalObjects, layers);
      const target = baseUrl ?? BASE_URL;

      const res = await fetch(`${target}/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: encoded }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          `Share API error (${res.status}): ${(body as { error?: string }).error ?? res.statusText}`
        );
      }

      const { url } = (await res.json()) as { url: string };
      return { content: [{ type: "text" as const, text: url }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
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
  `Render wire objects as ASCII/Unicode art text. Use this to preview layouts before generating a URL with create_wireframe.

${LAYOUT_GUIDE}`,
  {
    objects: validatedObjectsSchema.describe("Array of wire objects to render"),
    layers: z
      .array(layerSchema)
      .optional()
      .describe(
        "Named layers for organizing objects. Objects reference layers via layerId. If omitted, a single default layer is created."
      ),
  },
  ({ objects, layers: userLayers }) => {
    try {
      const { objects: filled, layer: defaultLayer } = fillDefaults(objects);
      const { objects: resolved, layers } = resolveLayers(
        filled,
        defaultLayer,
        userLayers
      );
      const finalObjects = addPadding(resolved, 1);
      const gridSize = computeRenderGridSize(finalObjects);
      const grid = compose(finalObjects, gridSize, layers);
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
