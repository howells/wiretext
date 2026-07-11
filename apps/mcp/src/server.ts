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

import packageJson from "../package.json";

/** Production Wiretext host. create_wireframe's optional `baseUrl` overrides it per call. */
const BASE_URL = "https://wiretext.app";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const tryParseJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const getErrorMessage = (body: unknown): string | undefined => {
  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }
  return undefined;
};

const parseShareResponse = (body: unknown): { url: string } => {
  if (isRecord(body) && typeof body.url === "string") {
    return { url: body.url };
  }
  throw new Error("Malformed share response: missing url");
};

// Version is read from package.json so the MCP handshake advertises the exact
// published release, with no second place to keep in sync on a version bump.
const server = new McpServer({
  name: "wiretext",
  version: packageJson.version,
});

// create_wireframe: encode objects (+ optional layers) into a document, POST it
// to the share API, and return the short editor URL as text. `baseUrl` overrides
// the target host per call. Failures are returned in-band as `isError` content
// (never thrown) so the model sees the message instead of a dropped tool call.
server.registerTool(
  "create_wireframe",
  {
    description: `Generate an editable Wiretext URL from wire objects. Returns a short URL (e.g. https://wiretext.app/w/abc12345) that opens in the Wiretext editor for further editing.

Object types: box, text, line, arrow, connector, component (button, input, select, checkbox, radio, table, modal, browser, card, navbar, tabs, progress, icon, image, divider, toggle, alert, breadcrumb, avatar, list, stepper, rating, skeleton).

Most fields have sensible defaults — only 'type' is required for a box.

${LAYOUT_GUIDE}`,
    inputSchema: {
      baseUrl: z
        .string()
        .optional()
        .describe(`Base URL for the editor (default: ${BASE_URL})`),
      layers: z
        .array(layerSchema)
        .optional()
        .describe(
          "Named layers for organizing objects. Objects reference layers via layerId. If omitted, a single default layer is created."
        ),
      objects: validatedObjectsSchema.describe(
        "Array of wire objects to render"
      ),
    },
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
        body: JSON.stringify({ data: encoded }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        const body = await tryParseJson(res);
        throw new Error(
          `Share API error (${res.status}): ${getErrorMessage(body) ?? res.statusText}`
        );
      }

      const body = await tryParseJson(res);
      const { url } = parseShareResponse(body);
      return { content: [{ text: url, type: "text" as const }] };
    } catch (error) {
      return {
        content: [
          {
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            type: "text" as const,
          },
        ],
        isError: true,
      };
    }
  }
);

// render_wireframe: run the same fill/resolve/pad pipeline and return the
// composed ASCII/Unicode grid as text — a local preview with no network call.
// Like create_wireframe, errors come back as `isError` content.
server.registerTool(
  "render_wireframe",
  {
    description: `Render wire objects as ASCII/Unicode art text. Use this to preview layouts before generating a URL with create_wireframe.

${LAYOUT_GUIDE}`,
    inputSchema: {
      layers: z
        .array(layerSchema)
        .optional()
        .describe(
          "Named layers for organizing objects. Objects reference layers via layerId. If omitted, a single default layer is created."
        ),
      objects: validatedObjectsSchema.describe(
        "Array of wire objects to render"
      ),
    },
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
      return { content: [{ text: gridToString(grid), type: "text" }] };
    } catch (error) {
      return {
        content: [
          {
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            type: "text",
          },
        ],
        isError: true,
      };
    }
  }
);

/** Serve over stdio — the transport MCP clients spawn this binary with. */
const main = async (): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

// A failed connection has nowhere to go over a dead stdio channel, so log to
// stderr (stdout is reserved for the protocol) and exit non-zero for the
// parent process to observe.
try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
