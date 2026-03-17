import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  addPadding,
  compose,
  computeRenderGridSize,
  encodeDocument,
  fillDefaults,
  gridToString,
  LAYOUT_GUIDE,
  resolveLayers,
  validateContentWidth,
} from "@wiretext/engine";
import { layerSchema, wireObjectSchema } from "@wiretext/schemas";
import { z } from "zod";

const DEFAULT_BASE_URL = "https://wiretext.app";

// Top-level regex patterns for input hardening (biome requires top-level scope)
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional — reject null bytes and control chars in untrusted input
const CONTROL_CHARS_RE = /[\u0000-\u001f]/;
const ENCODED_TRAVERSAL_RE = /%(?:2[eEfF]|5[cC])/i;
const HASH_FRAGMENT_PREFIX_RE = /^[^#]*#/;
const QUERY_OR_HASH_RE = /[?#]/;

// ---------------------------------------------------------------------------
// Axis 1: Machine-Readable Output — structured JSON, auto-detected in non-TTY
// ---------------------------------------------------------------------------

type OutputMode = "human" | "json";

function detectMode(jsonFlag: boolean): OutputMode {
  if (jsonFlag) {
    return "json";
  }
  if (!process.stdout.isTTY) {
    return "json";
  }
  return "human";
}

function emitJson(data: Record<string, unknown>): void {
  console.log(JSON.stringify(data));
}

function emitError(mode: OutputMode, message: string, code: string): never {
  if (mode === "json") {
    emitJson({ ok: false, error: message, code });
  } else {
    console.error(message);
  }
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Axis 5: Input Hardening — defend against agent hallucination patterns
// ---------------------------------------------------------------------------

function validateFilePath(filePath: string): void {
  if (CONTROL_CHARS_RE.test(filePath)) {
    throw new Error("Invalid file path: contains control characters");
  }
  if (ENCODED_TRAVERSAL_RE.test(filePath)) {
    throw new Error("Invalid file path: contains encoded path segments");
  }
}

function validateBaseUrl(baseUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error(`Invalid --base-url: "${baseUrl}" is not a valid URL`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid --base-url: must use http or https protocol");
  }
  if (parsed.search || parsed.hash) {
    throw new Error(
      "Invalid --base-url: must not contain query string or fragment"
    );
  }
}

function validateHashValue(hash: string): void {
  if (CONTROL_CHARS_RE.test(hash)) {
    throw new Error("Invalid --hash: contains control characters");
  }
  if (QUERY_OR_HASH_RE.test(hash.replace(HASH_FRAGMENT_PREFIX_RE, ""))) {
    throw new Error("Invalid --hash: contains embedded query params");
  }
}

// ---------------------------------------------------------------------------
// Input parsing & validation
// ---------------------------------------------------------------------------

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

function readInput(filePath?: string): string {
  if (filePath && filePath !== "-") {
    validateFilePath(filePath);
    return readFileSync(filePath, "utf-8");
  }
  return readFileSync(0, "utf-8");
}

interface ParsedInput {
  layers?: z.infer<typeof layerSchema>[];
  objects: z.infer<typeof wireObjectSchema>[];
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
          ? `objects[${String(i.path[0])}].${i.path.slice(1).map(String).join(".")}`
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

// ---------------------------------------------------------------------------
// Axis 5 continued: shell-injection-safe platform helpers (execFileSync)
// ---------------------------------------------------------------------------

function copyToClipboard(text: string): boolean {
  try {
    const platform = process.platform;
    if (platform === "darwin") {
      execFileSync("pbcopy", [], { input: text });
    } else if (platform === "win32") {
      execFileSync("clip", [], { input: text });
    } else {
      execFileSync("xclip", ["-selection", "clipboard"], { input: text });
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
      execFileSync("open", [url]);
    } else if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", url]);
    } else {
      execFileSync("xdg-open", [url]);
    }
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Axis 6: Safety Rails — dry-run for mutating commands
// ---------------------------------------------------------------------------

async function postShare(
  baseUrl: string,
  data: string
): Promise<{ id: string; url: string }> {
  const res = await fetch(`${baseUrl}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Share failed (${res.status}): ${(body as { error?: string }).error ?? res.statusText}`
    );
  }
  return res.json() as Promise<{ id: string; url: string }>;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

interface CommandOptions {
  baseUrl: string;
  copy: boolean;
  mode: OutputMode;
  open: boolean;
}

interface ShareCommandOptions extends CommandOptions {
  dryRun: boolean;
  hash?: string;
}

function emitUrl(
  mode: OutputMode,
  url: string,
  copyLabel: string,
  options: { copy: boolean; open: boolean }
): void {
  if (mode === "json") {
    emitJson({ ok: true, url });
    return;
  }
  if (options.copy) {
    if (copyToClipboard(url)) {
      console.log(`${copyLabel} copied to clipboard`);
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

function cmdCreate(
  filePath: string | undefined,
  options: CommandOptions
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
  emitUrl(options.mode, url, "URL", options);
}

async function cmdShare(
  filePath: string | undefined,
  options: ShareCommandOptions
): Promise<void> {
  let encoded: string;
  let objectCount: number | undefined;

  if (options.hash) {
    validateHashValue(options.hash);
    const hashValue = options.hash.includes("#")
      ? options.hash.split("#")[1]
      : options.hash;
    encoded = hashValue;
  } else {
    const raw = readInput(filePath);
    const { objects: minimal, layers: userLayers } = parseInput(raw);
    objectCount = minimal.length;
    const { objects: filled, layer: defaultLayer } = fillDefaults(minimal);
    const { objects: resolved, layers } = resolveLayers(
      filled,
      defaultLayer,
      userLayers
    );
    const objects = addPadding(resolved, 1);
    encoded = encodeDocument(objects, layers);
  }

  // Axis 6: --dry-run validates without POSTing
  if (options.dryRun) {
    if (options.mode === "json") {
      emitJson({
        ok: true,
        dryRun: true,
        valid: true,
        objectCount: objectCount ?? null,
        encodedBytes: encoded.length,
      });
    } else {
      const countMsg =
        objectCount !== undefined ? `, ${objectCount} object(s)` : "";
      console.log(
        `Dry run: valid input${countMsg}, ${encoded.length} bytes encoded. No URL created.`
      );
    }
    return;
  }

  const { url } = await postShare(options.baseUrl, encoded);
  emitUrl(options.mode, url, "Short URL", options);
}

function cmdRender(
  filePath: string | undefined,
  options: { mode: OutputMode }
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
  const gridSize = computeRenderGridSize(objects);
  const grid = compose(objects, gridSize, layers);
  const ascii = gridToString(grid);

  // Axis 4: structured output includes dimensions for context window awareness
  if (options.mode === "json") {
    emitJson({
      ok: true,
      ascii,
      width: gridSize.cols,
      height: gridSize.rows,
      objectCount: minimal.length,
    });
    return;
  }
  console.log(ascii);
}

// ---------------------------------------------------------------------------
// Axis 3: Schema Introspection — runtime JSON Schema from Zod definitions
// ---------------------------------------------------------------------------

function cmdSchema(): void {
  const documentSchema = z.object({
    objects: z
      .array(wireObjectSchema)
      .describe("Array of wire objects to render"),
    layers: z
      .array(layerSchema)
      .optional()
      .describe(
        "Named layers for organizing objects. Objects reference layers via layerId."
      ),
  });
  const jsonSchema = z.toJSONSchema(documentSchema);
  console.log(JSON.stringify(jsonSchema, null, 2));
}

// ---------------------------------------------------------------------------
// Axis 7: Agent Knowledge Packaging — layout guide accessible via CLI
// ---------------------------------------------------------------------------

function cmdContext(): void {
  console.log(LAYOUT_GUIDE);
}

// ---------------------------------------------------------------------------
// Help — structured in JSON mode, human-readable otherwise
// ---------------------------------------------------------------------------

function printHelp(mode: OutputMode): void {
  if (mode === "json") {
    emitJson({
      ok: true,
      commands: {
        create: "Generate an editable Wiretext URL (hash fragment)",
        share: "Generate a short Wiretext URL via the share API",
        render: "Render ASCII art to stdout",
        schema: "Print JSON Schema for the wire object input format",
        context: "Print the layout guide for AI agent use",
      },
      options: {
        "--json": "Structured JSON output (auto-enabled when piped)",
        "--open, -o": "Open URL in default browser (create/share)",
        "--copy, -c": "Copy URL to clipboard (create/share)",
        "--dry-run": "Validate without posting (share only)",
        "--base-url <url>": `Base URL (default: ${DEFAULT_BASE_URL})`,
        "--hash <url|hash>": "Share an existing hash URL (share only)",
      },
      input: '{ "objects": [...], "layers": [...] } or bare [...]',
      outputFormats: {
        success:
          '{ "ok": true, "url": "..." } or { "ok": true, "ascii": "...", "width": N, "height": N }',
        error: '{ "ok": false, "error": "...", "code": "..." }',
      },
    });
    return;
  }

  console.log(`Usage: wiretext <command> [file.json] [options]

Commands:
  create [file.json]    Generate an editable Wiretext URL (hash fragment)
  share  [file.json]    Generate a short Wiretext URL via the share API
  render [file.json]    Render ASCII art to stdout
  schema                Print JSON Schema for the wire object input format
  context               Print the layout guide for AI agent use

Options:
  --json                Structured JSON output (auto-enabled when piped)
  --open, -o            Open the URL in your default browser
  --copy, -c            Copy the URL to clipboard
  --dry-run             (share only) Validate without posting to the API
  --base-url <url>      Base URL (default: ${DEFAULT_BASE_URL})
  --hash <url|hash>     (share only) Share an existing hash URL

Input: JSON from file argument or stdin
Format: { "objects": [...], "layers": [...] } or bare [...]
Layers: [{ "id": "ui", "name": "UI Elements" }, ...]

JSON output (auto-enabled in non-TTY / piped contexts):
  Success: { "ok": true, "url": "..." }                        (create/share)
           { "ok": true, "ascii": "...", "width": N, ... }     (render)
           { "ok": true, "dryRun": true, "valid": true, ... }  (share --dry-run)
  Error:   { "ok": false, "error": "...", "code": "..." }

Agent introspection:
  wiretext schema       Full JSON Schema for the input format
  wiretext context      Layout guide with sizing rules and gotchas`);
}

// ---------------------------------------------------------------------------
// Arg parsing (extracted for complexity budget)
// ---------------------------------------------------------------------------

interface ParsedArgs {
  baseUrl: string;
  cmd: string | undefined;
  dryRun: boolean;
  filePath: string | undefined;
  hashValue: string | undefined;
  jsonFlag: boolean;
  shouldCopy: boolean;
  shouldOpen: boolean;
}

const BOOLEAN_FLAGS: Record<string, keyof ParsedArgs> = {
  "--json": "jsonFlag",
  "--open": "shouldOpen",
  "-o": "shouldOpen",
  "--copy": "shouldCopy",
  "-c": "shouldCopy",
  "--dry-run": "dryRun",
};

function parseArgs(args: string[]): ParsedArgs {
  let baseUrl = DEFAULT_BASE_URL;
  let hashValue: string | undefined;
  const booleans: Record<string, boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const boolKey = BOOLEAN_FLAGS[arg];
    if (boolKey) {
      booleans[boolKey] = true;
    } else if (arg === "--output" && args[i + 1] === "json") {
      booleans.jsonFlag = true;
      i++;
    } else if (arg === "--base-url" && i + 1 < args.length) {
      baseUrl = args[++i];
    } else if (arg === "--hash" && i + 1 < args.length) {
      hashValue = args[++i];
    } else {
      positional.push(arg);
    }
  }

  return {
    baseUrl,
    cmd: positional[0],
    dryRun: booleans.dryRun ?? false,
    filePath: positional[1],
    hashValue,
    jsonFlag: booleans.jsonFlag ?? false,
    shouldCopy: booleans.shouldCopy ?? false,
    shouldOpen: booleans.shouldOpen ?? false,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  const mode = detectMode(parsed.jsonFlag);

  if (!parsed.cmd || parsed.cmd === "--help" || parsed.cmd === "-h") {
    printHelp(mode);
    process.exit(0);
  }

  if (parsed.baseUrl !== DEFAULT_BASE_URL) {
    validateBaseUrl(parsed.baseUrl);
  }

  const cmdOptions: CommandOptions = {
    baseUrl: parsed.baseUrl,
    copy: parsed.shouldCopy,
    mode,
    open: parsed.shouldOpen,
  };

  switch (parsed.cmd) {
    case "create":
      cmdCreate(parsed.filePath, cmdOptions);
      break;
    case "share":
      await cmdShare(parsed.filePath, {
        ...cmdOptions,
        dryRun: parsed.dryRun,
        hash: parsed.hashValue,
      });
      break;
    case "render":
      cmdRender(parsed.filePath, { mode });
      break;
    case "schema":
      cmdSchema();
      break;
    case "context":
      cmdContext();
      break;
    default:
      emitError(mode, `Unknown command: ${parsed.cmd}`, "UNKNOWN_COMMAND");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const mode = detectMode(process.argv.includes("--json"));
  emitError(mode, message, "ERROR");
});
