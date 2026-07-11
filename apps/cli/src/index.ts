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

/** Production Wiretext host. Overridden per-invocation by `--base-url`. */
const DEFAULT_BASE_URL = "https://wiretext.app";

// Regex patterns for input hardening, kept at module scope so they compile
// once instead of on every call. Control characters (null bytes, escape
// sequences, etc.) are rejected outright because they have no legitimate use
// in a file path or hash value and are a common vector for terminal/log
// injection and path confusion.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point: this guard rejects them in untrusted input
const CONTROL_CHARS_RE = /[\u{0}-\u{1F}]/u;
const ENCODED_TRAVERSAL_RE = /%(?:2[eEfF]|5[cC])/iu;
const HASH_FRAGMENT_PREFIX_RE = /^[^#]*#/u;
const QUERY_OR_HASH_RE = /[?#]/u;

// ---------------------------------------------------------------------------
// Machine-readable output
//
// Every command speaks one JSON envelope so agents never have to guess:
//   success  { "ok": true, ... }   (plus a command-specific payload)
//   failure  { "ok": false, "error": string, "code": string }
// Failures exit 1, success exits 0. JSON is forced by --json and also
// auto-selected in any non-TTY context (piped or redirected), so the output is
// human-friendly only at an interactive terminal.
// ---------------------------------------------------------------------------

/**
 * Error carrying a machine-readable `code` for the JSON failure envelope.
 * Distinct codes let agents branch on failure type without parsing messages:
 *   INVALID_INPUT     malformed JSON or schema-invalid document
 *   FILE_NOT_FOUND    input path does not exist (ENOENT)
 *   INVALID_ARGUMENT  a guard rejected --base-url / --hash / a file path
 *   SHARE_FAILED      the share API returned a non-2xx response
 *   NETWORK_ERROR     the request never reached the share API (DNS/offline)
 * Anything thrown without a code falls back to "ERROR" in the top-level handler.
 */
class CliError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "CliError";
    this.code = code;
  }
}

/** True for Node's ErrnoException (an Error carrying a string `code`). */
const isErrnoException = (value: unknown): value is NodeJS.ErrnoException =>
  value instanceof Error && "code" in value;

type OutputMode = "human" | "json";

/**
 * Pick the output mode: JSON when `--json`/`--output json` is set, or whenever
 * stdout is not a TTY (piped into a file, process, or agent). Only a bare
 * interactive terminal gets human-readable output.
 */
const detectMode = (jsonFlag: boolean): OutputMode => {
  if (jsonFlag) {
    return "json";
  }
  if (!process.stdout.isTTY) {
    return "json";
  }
  return "human";
};

const emitJson = (data: Record<string, unknown>): void => {
  console.log(JSON.stringify(data));
};

/**
 * Report a failure and exit 1 (hence `never`). JSON mode emits the failure
 * envelope `{ ok: false, error, code }`; human mode writes just the message to
 * stderr.
 */
const emitError = (mode: OutputMode, message: string, code: string): never => {
  if (mode === "json") {
    emitJson({ code, error: message, ok: false });
  } else {
    console.error(message);
  }
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Input hardening — defend against agent hallucination patterns
// ---------------------------------------------------------------------------

/**
 * Guard a file path before it reaches the filesystem. Rejects control
 * characters (terminal/log injection) and percent-encoded `.`/`/`/`\` segments
 * (`%2e`, `%2f`, `%5c`) that smuggle traversal past a naive `..` check.
 * Resolution of the literal path is left to the OS.
 */
const validateFilePath = (filePath: string): void => {
  if (CONTROL_CHARS_RE.test(filePath)) {
    throw new CliError(
      "Invalid file path: contains control characters",
      "INVALID_ARGUMENT"
    );
  }
  if (ENCODED_TRAVERSAL_RE.test(filePath)) {
    throw new CliError(
      "Invalid file path: contains encoded path segments",
      "INVALID_ARGUMENT"
    );
  }
};

/**
 * Guard `--base-url` before it is used to build request URLs. Requires a
 * well-formed http(s) URL and forbids an embedded query or fragment, so the
 * value cannot graft attacker-controlled params onto the `/api/share` request.
 */
const validateBaseUrl = (baseUrl: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new CliError(
      `Invalid --base-url: "${baseUrl}" is not a valid URL`,
      "INVALID_ARGUMENT"
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new CliError(
      "Invalid --base-url: must use http or https protocol",
      "INVALID_ARGUMENT"
    );
  }
  if (parsed.search || parsed.hash) {
    throw new CliError(
      "Invalid --base-url: must not contain query string or fragment",
      "INVALID_ARGUMENT"
    );
  }
};

/**
 * Guard `--hash`, which accepts either a full editor URL or a bare encoded
 * fragment. Rejects control characters, then strips any leading `...#` and
 * checks the remaining fragment carries no `?`/`#` of its own — blocking
 * query/param smuggling into the shared payload.
 */
const validateHashValue = (hash: string): void => {
  if (CONTROL_CHARS_RE.test(hash)) {
    throw new CliError(
      "Invalid --hash: contains control characters",
      "INVALID_ARGUMENT"
    );
  }
  if (QUERY_OR_HASH_RE.test(hash.replace(HASH_FRAGMENT_PREFIX_RE, ""))) {
    throw new CliError(
      "Invalid --hash: contains embedded query params",
      "INVALID_ARGUMENT"
    );
  }
};

// ---------------------------------------------------------------------------
// Input parsing & validation
// ---------------------------------------------------------------------------

const objectsArraySchema = z.array(wireObjectSchema).superRefine((arr, ctx) => {
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Read raw JSON input. A real path is read from disk (after
 * {@link validateFilePath}); an omitted path, empty string, or the
 * conventional `-` all read from stdin (fd 0), so `… | wiretext render` and
 * `wiretext render -` behave identically.
 */
const readInput = (filePath?: string): string => {
  if (filePath !== undefined && filePath !== "" && filePath !== "-") {
    validateFilePath(filePath);
    try {
      return readFileSync(filePath, "utf-8");
    } catch (error) {
      if (isErrnoException(error) && error.code === "ENOENT") {
        throw new CliError(`File not found: ${filePath}`, "FILE_NOT_FOUND");
      }
      throw error;
    }
  }
  return readFileSync(0, "utf-8");
};

interface ParsedInput {
  layers?: z.infer<typeof layerSchema>[];
  objects: z.infer<typeof wireObjectSchema>[];
}

const parseInput = (raw: string): ParsedInput => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CliError("Invalid input: not valid JSON", "INVALID_INPUT");
  }
  const source = isRecord(parsed) ? parsed : undefined;

  const arr = Array.isArray(parsed) ? parsed : source?.objects;
  if (!Array.isArray(arr)) {
    throw new CliError(
      'Input must be a JSON array or { "objects": [...] }',
      "INVALID_INPUT"
    );
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
    throw new CliError(`Invalid input:\n${issues.join("\n")}`, "INVALID_INPUT");
  }

  let layers: z.infer<typeof layerSchema>[] | undefined;
  const rawLayers = source?.layers;
  if (Array.isArray(rawLayers)) {
    const layerResult = z.array(layerSchema).safeParse(rawLayers);
    if (layerResult.success) {
      layers = layerResult.data;
    }
  }

  return { layers, objects: result.data };
};

// ---------------------------------------------------------------------------
// Shell-injection-safe platform helpers (execFileSync)
// ---------------------------------------------------------------------------

const copyToClipboard = (text: string): boolean => {
  try {
    const { platform } = process;
    if (platform === "darwin") {
      execFileSync("/usr/bin/pbcopy", [], { input: text });
    } else if (platform === "win32") {
      execFileSync("C:\\Windows\\System32\\clip.exe", [], { input: text });
    } else {
      execFileSync("/usr/bin/xclip", ["-selection", "clipboard"], {
        input: text,
      });
    }
    return true;
  } catch {
    return false;
  }
};

const openInBrowser = (url: string): boolean => {
  try {
    const { platform } = process;
    if (platform === "darwin") {
      execFileSync("/usr/bin/open", [url]);
    } else if (platform === "win32") {
      execFileSync("C:\\Windows\\System32\\cmd.exe", ["/c", "start", "", url]);
    } else {
      execFileSync("/usr/bin/xdg-open", [url]);
    }
    return true;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Share API client — POST helpers and response parsing
// ---------------------------------------------------------------------------

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

const parseShareResponse = (body: unknown): { id: string; url: string } => {
  if (
    isRecord(body) &&
    typeof body.id === "string" &&
    typeof body.url === "string"
  ) {
    return { id: body.id, url: body.url };
  }
  throw new Error("Malformed share response: missing id or url");
};

/**
 * POST an encoded document to the share API and return its short id + URL.
 * A transport failure (DNS/offline/refused connection) throws NETWORK_ERROR; a
 * non-2xx response throws SHARE_FAILED with the API's own `error` field when
 * present, falling back to the HTTP status text; a 2xx body missing `id`/`url`
 * is treated as malformed ({@link parseShareResponse}).
 */
const postShare = async (
  baseUrl: string,
  data: string
): Promise<{ id: string; url: string }> => {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/share`, {
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new CliError(
      `Could not reach the Wiretext API at ${baseUrl}`,
      "NETWORK_ERROR"
    );
  }
  if (!res.ok) {
    const body = await tryParseJson(res);
    throw new CliError(
      `Share failed (${res.status}): ${getErrorMessage(body) ?? res.statusText}`,
      "SHARE_FAILED"
    );
  }
  const body = await tryParseJson(res);
  return parseShareResponse(body);
};

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

const emitUrl = (
  mode: OutputMode,
  url: string,
  copyLabel: string,
  options: { copy: boolean; open: boolean }
): void => {
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
};

const cmdCreate = (
  filePath: string | undefined,
  options: CommandOptions
): void => {
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
};

const cmdShare = async (
  filePath: string | undefined,
  options: ShareCommandOptions
): Promise<void> => {
  let encoded: string;
  let objectCount: number | undefined;

  if (options.hash !== undefined && options.hash !== "") {
    validateHashValue(options.hash);
    const hashValue = options.hash.includes("#")
      ? (options.hash.split("#")[1] ?? "")
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

  // --dry-run runs the full encode/validate pipeline but stops before the POST,
  // reporting encoded byte size and object count so callers can vet input
  // (and estimate URL length) without creating anything.
  if (options.dryRun) {
    if (options.mode === "json") {
      emitJson({
        dryRun: true,
        encodedBytes: encoded.length,
        objectCount: objectCount ?? null,
        ok: true,
        valid: true,
      });
    } else {
      const countMsg =
        objectCount === undefined ? "" : `, ${objectCount} object(s)`;
      console.log(
        `Dry run: valid input${countMsg}, ${encoded.length} bytes encoded. No URL created.`
      );
    }
    return;
  }

  const { url } = await postShare(options.baseUrl, encoded);
  emitUrl(options.mode, url, "Short URL", options);
};

const cmdRender = (
  filePath: string | undefined,
  options: { mode: OutputMode }
): void => {
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

  // structured output includes dimensions for context window awareness
  if (options.mode === "json") {
    emitJson({
      ascii,
      height: gridSize.rows,
      objectCount: minimal.length,
      ok: true,
      width: gridSize.cols,
    });
    return;
  }
  console.log(ascii);
};

// ---------------------------------------------------------------------------
// Schema introspection — runtime JSON Schema from Zod definitions
// ---------------------------------------------------------------------------

const cmdSchema = (): void => {
  const documentSchema = z.object({
    layers: z
      .array(layerSchema)
      .optional()
      .describe(
        "Named layers for organizing objects. Objects reference layers via layerId."
      ),
    objects: z
      .array(wireObjectSchema)
      .describe("Array of wire objects to render"),
  });
  const jsonSchema = z.toJSONSchema(documentSchema);
  console.log(JSON.stringify(jsonSchema, null, 2));
};

// ---------------------------------------------------------------------------
// Agent knowledge packaging — layout guide accessible via CLI
// ---------------------------------------------------------------------------

const cmdContext = (): void => {
  console.log(LAYOUT_GUIDE);
};

// ---------------------------------------------------------------------------
// Help — structured in JSON mode, human-readable otherwise
// ---------------------------------------------------------------------------

const printHelp = (mode: OutputMode): void => {
  if (mode === "json") {
    emitJson({
      commands: {
        context: "Print the layout guide for AI agent use",
        create: "Generate an editable Wiretext URL (hash fragment)",
        render: "Render ASCII art to stdout",
        schema: "Print JSON Schema for the wire object input format",
        share: "Generate a short Wiretext URL via the share API",
      },
      errorCodes: {
        ERROR: "Uncategorized failure",
        FILE_NOT_FOUND: "Input file path does not exist",
        INVALID_ARGUMENT: "A flag or path failed validation",
        INVALID_INPUT: "Malformed JSON or schema-invalid document",
        NETWORK_ERROR: "The share API was unreachable",
        SHARE_FAILED: "The share API returned a non-2xx response",
        UNKNOWN_COMMAND: "Unrecognized command",
      },
      input: '{ "objects": [...], "layers": [...] } or bare [...]',
      ok: true,
      options: {
        "--base-url <url>": `Base URL (default: ${DEFAULT_BASE_URL})`,
        "--copy, -c": "Copy URL to clipboard (create/share)",
        "--dry-run": "Validate without posting (share only)",
        "--hash <url|hash>": "Share an existing hash URL (share only)",
        "--json": "Structured JSON output (auto-enabled when piped)",
        "--open, -o": "Open URL in default browser (create/share)",
      },
      outputFormats: {
        error: '{ "ok": false, "error": "...", "code": "..." }',
        success:
          '{ "ok": true, "url": "..." } or { "ok": true, "ascii": "...", "width": N, "height": N }',
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
};

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
  "--copy": "shouldCopy",
  "--dry-run": "dryRun",
  "--json": "jsonFlag",
  "--open": "shouldOpen",
  "-c": "shouldCopy",
  "-o": "shouldOpen",
};

/**
 * Parse argv into a flat options record. Grammar:
 *   - boolean flags from {@link BOOLEAN_FLAGS} (`--json`, `--open`/`-o`,
 *     `--copy`/`-c`, `--dry-run`)
 *   - `--output json` — agent-friendly alias for `--json`
 *   - `--base-url <url>` and `--hash <url|hash>` each consume the next token
 *   - everything else is positional: `[0]` is the command, `[1]` the file path
 *     (where `-` means stdin, per {@link readInput})
 * Unknown flags fall through to positionals rather than erroring.
 */
const parseArgs = (args: string[]): ParsedArgs => {
  let baseUrl = DEFAULT_BASE_URL;
  let hashValue: string | undefined;
  const booleans: Record<string, boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === undefined) {
      continue;
    }
    const next = args[i + 1];
    const boolKey = BOOLEAN_FLAGS[arg];
    if (boolKey) {
      booleans[boolKey] = true;
    } else if (arg === "--output" && next === "json") {
      booleans.jsonFlag = true;
      i += 1;
    } else if (arg === "--base-url" && next !== undefined) {
      baseUrl = next;
      i += 1;
    } else if (arg === "--hash" && next !== undefined) {
      hashValue = next;
      i += 1;
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
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  const parsed = parseArgs(process.argv.slice(2));
  const mode = detectMode(parsed.jsonFlag);

  if (
    parsed.cmd === undefined ||
    parsed.cmd === "" ||
    parsed.cmd === "--help" ||
    parsed.cmd === "-h"
  ) {
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
    case "create": {
      cmdCreate(parsed.filePath, cmdOptions);
      break;
    }
    case "share": {
      await cmdShare(parsed.filePath, {
        ...cmdOptions,
        dryRun: parsed.dryRun,
        hash: parsed.hashValue,
      });
      break;
    }
    case "render": {
      cmdRender(parsed.filePath, { mode });
      break;
    }
    case "schema": {
      cmdSchema();
      break;
    }
    case "context": {
      cmdContext();
      break;
    }
    default: {
      emitError(mode, `Unknown command: ${parsed.cmd}`, "UNKNOWN_COMMAND");
    }
  }
};

// Last-resort handler for anything main() throws (bad input, fs/network errors).
// Mode is re-derived straight from argv because arg parsing may itself have
// failed, and errors must still honor --json / non-TTY output.
try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof CliError ? error.code : "ERROR";
  const mode = detectMode(process.argv.includes("--json"));
  emitError(mode, message, code);
}
