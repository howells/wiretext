import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { compose, gridToString } from "../src/engine/compose";
import { computeRenderGridSize, fillDefaults } from "../src/engine/defaults";
import { resolveLayers } from "../src/engine/layers";
import { addPadding } from "../src/engine/padding";
import { validateContentWidth } from "../src/engine/validate";
import { encodeDocument } from "../src/lib/sharing";

const DEFAULT_BASE_URL = "https://wiretext.app";

const gridPointSchema = z.object({
  col: z.number().int().min(0),
  row: z.number().int().min(0),
});

const borderStyleSchema = z
  .enum(["single", "double", "rounded", "heavy"])
  .optional();

const fillStyleSchema = z.enum(["solid", "transparent"]).optional();

const baseFields = {
  id: z.string().optional(),
  position: gridPointSchema.optional(),
  zIndex: z.number().int().optional(),
  layerId: z.string().optional(),
  name: z.string().optional(),
  annotation: z.string().optional(),
  groupId: z.string().optional(),
};

const boxSchema = z.object({
  ...baseFields,
  type: z.literal("box"),
  width: z.number().int().min(3).optional(),
  height: z.number().int().min(3).optional(),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema,
  label: z.string().optional(),
});

const textSchema = z.object({
  ...baseFields,
  type: z.literal("text"),
  content: z.string(),
});

const lineSchema = z.object({
  ...baseFields,
  type: z.literal("line"),
  endPosition: gridPointSchema,
});

const arrowSchema = z.object({
  ...baseFields,
  type: z.literal("arrow"),
  endPosition: gridPointSchema,
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
  componentType: componentTypeSchema,
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  borderStyle: borderStyleSchema,
  fill: fillStyleSchema,
  label: z.string().optional(),
  icon: z.string().optional(),
  align: z.enum(["center", "left"]).optional(),
  iconPosition: z.enum(["left", "right"]).optional(),
  checked: z.boolean().optional(),
  progress: z.number().min(0).max(100).optional(),
  filterable: z.boolean().optional(),
  columns: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  tabs: z.array(z.string()).optional(),
  navItems: z.array(z.string()).optional(),
  alertType: alertTypeSchema.optional(),
  items: z.array(z.string()).optional(),
  separator: z.string().optional(),
  listStyle: listStyleSchema.optional(),
  activeStep: z.number().int().min(0).optional(),
  value: z.number().min(0).optional(),
  maxValue: z.number().int().min(1).optional(),
  body: z.string().optional(),
});

const wireObjectSchema = z.discriminatedUnion("type", [
  boxSchema,
  textSchema,
  lineSchema,
  arrowSchema,
  componentSchema,
]);

const objectsArraySchema = z.array(wireObjectSchema).superRefine((arr, ctx) => {
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

const layerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

function readInput(filePath?: string): string {
  if (filePath && filePath !== "-") {
    return readFileSync(filePath, "utf-8");
  }
  return readFileSync(0, "utf-8");
}

interface ParsedInput {
  objects: z.infer<typeof wireObjectSchema>[];
  layers?: z.infer<typeof layerSchema>[];
}

function parseInput(raw: string): ParsedInput {
  const parsed = JSON.parse(raw);

  const arr = Array.isArray(parsed) ? parsed : parsed?.objects;
  if (!Array.isArray(arr)) {
    throw new Error('Input must be a JSON array or { "objects": [...] }');
  }

  const result = objectsArraySchema.safeParse(arr);
  if (!result.success) {
    const issues = result.error.issues.map((i) => {
      const path =
        i.path.length > 0
          ? `objects[${i.path[0]}].${i.path.slice(1).join(".")}`
          : "root";
      return `  - ${path}: ${i.message}`;
    });
    throw new Error(`Invalid input:\n${issues.join("\n")}`);
  }

  let layers: z.infer<typeof layerSchema>[] | undefined;
  if (!Array.isArray(parsed) && Array.isArray(parsed?.layers)) {
    const layerResult = z.array(layerSchema).safeParse(parsed.layers);
    if (layerResult.success) {
      layers = layerResult.data;
    }
  }

  return { objects: result.data, layers };
}

function copyToClipboard(text: string): boolean {
  try {
    const platform = process.platform;
    if (platform === "darwin") {
      execSync("pbcopy", { input: text });
    } else if (platform === "win32") {
      execSync("clip", { input: text });
    } else {
      execSync("xclip -selection clipboard", { input: text });
    }
    return true;
  } catch {
    return false;
  }
}

function openInBrowser(url: string): boolean {
  try {
    const platform = process.platform;
    if (platform === "darwin") {
      execSync(`open "${url}"`);
    } else if (platform === "win32") {
      execSync(`start "" "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
    return true;
  } catch {
    return false;
  }
}

interface CreateOptions {
  baseUrl: string;
  open: boolean;
  copy: boolean;
}

function cmdCreate(
  filePath?: string,
  options: CreateOptions = {
    baseUrl: DEFAULT_BASE_URL,
    open: false,
    copy: false,
  }
): void {
  const raw = readInput(filePath);
  const { objects: minimal, layers: userLayers } = parseInput(raw);
  const { objects: filled, layer: defaultLayer } = fillDefaults(minimal);
  const { objects: resolved, layers } = resolveLayers(
    filled,
    defaultLayer,
    userLayers
  );
  const objects = addPadding(resolved, 1);
  const encoded = encodeDocument(objects, layers);
  const url = `${options.baseUrl}/#${encoded}`;

  if (options.copy) {
    if (copyToClipboard(url)) {
      console.log("URL copied to clipboard");
    } else {
      console.error("Failed to copy to clipboard");
      console.log(url);
    }
  }

  if (options.open) {
    if (openInBrowser(url)) {
      if (!options.copy) {
        console.log("Opened in browser");
      }
    } else {
      console.error("Failed to open browser");
      console.log(url);
    }
  }

  if (!(options.copy || options.open)) {
    console.log(url);
  }
}

function cmdRender(filePath?: string): void {
  const raw = readInput(filePath);
  const { objects: minimal, layers: userLayers } = parseInput(raw);
  const { objects: filled, layer: defaultLayer } = fillDefaults(minimal);
  const { objects: resolved, layers } = resolveLayers(
    filled,
    defaultLayer,
    userLayers
  );
  const objects = addPadding(resolved, 1);
  const gridSize = computeRenderGridSize(objects);
  const grid = compose(objects, gridSize, layers);
  console.log(gridToString(grid));
}

function printHelp(): void {
  console.log(`Usage: wiretext <command> [file.json] [options]

Commands:
  create [file.json]    Generate an editable Wiretext URL
  render [file.json]    Render ASCII art to stdout

Options:
  --open, -o            Open the URL in your default browser
  --copy, -c            Copy the URL to clipboard
  --base-url <url>      Base URL for create (default: ${DEFAULT_BASE_URL})

Input: JSON from file argument or stdin
Format: { "objects": [...], "layers": [...] } or bare [...]
Layers: [{ "id": "ui", "name": "UI Elements" }, ...]`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  let baseUrl = DEFAULT_BASE_URL;
  let shouldOpen = false;
  let shouldCopy = false;
  const filteredArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--base-url" && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++;
    } else if (args[i] === "--open" || args[i] === "-o") {
      shouldOpen = true;
    } else if (args[i] === "--copy" || args[i] === "-c") {
      shouldCopy = true;
    } else {
      filteredArgs.push(args[i]);
    }
  }

  const cmd = filteredArgs[0];
  const filePath = filteredArgs[1];

  switch (cmd) {
    case "create":
      cmdCreate(filePath, { baseUrl, open: shouldOpen, copy: shouldCopy });
      break;
    case "render":
      cmdRender(filePath);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
