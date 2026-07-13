import { validateContentWidth } from "@wiretext/engine";
import { layerSchema, wireObjectSchema } from "@wiretext/schemas";
import { z } from "zod";

/** Production Wiretext host. Overridden per-invocation by `--base-url`. */
export const DEFAULT_BASE_URL = "https://wiretext.app";

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
export class CliError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "CliError";
    this.code = code;
  }
}

/** True for a non-null object value (a record with unknown-typed members). */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// ---------------------------------------------------------------------------
// Input hardening — defend against agent hallucination patterns
// ---------------------------------------------------------------------------

/**
 * Guard a file path before it reaches the filesystem. Rejects control
 * characters (terminal/log injection) and percent-encoded `.`/`/`/`\` segments
 * (`%2e`, `%2f`, `%5c`) that smuggle traversal past a naive `..` check.
 * Resolution of the literal path is left to the OS.
 */
export const validateFilePath = (filePath: string): void => {
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
export const validateBaseUrl = (baseUrl: string): void => {
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
export const validateHashValue = (hash: string): void => {
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

export interface ParsedInput {
  layers?: z.infer<typeof layerSchema>[];
  objects: z.infer<typeof wireObjectSchema>[];
}

export const parseInput = (raw: string): ParsedInput => {
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
// Arg parsing (extracted for complexity budget)
// ---------------------------------------------------------------------------

export interface ParsedArgs {
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
 *     (where the bare `-` sentinel means stdin, per `readInput`)
 * Any other two-dash (`--…`) token — an unrecognized flag, or a value-taking
 * flag (`--base-url`/`--hash`) missing its following value — throws
 * INVALID_ARGUMENT rather than silently degrading into a positional (which
 * would otherwise mask the real command). The lone `-` sentinel is deliberately
 * exempt so stdin input keeps working.
 */
export const parseArgs = (args: string[]): ParsedArgs => {
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
    } else if (arg.startsWith("--")) {
      throw new CliError(
        `Unrecognized or malformed argument: ${arg}`,
        "INVALID_ARGUMENT"
      );
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
