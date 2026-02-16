import { readFileSync } from "node:fs";
import { compose, gridToString } from "../src/engine/compose";
import {
  computeRenderGridSize,
  fillDefaults,
  type MinimalObject,
} from "../src/engine/defaults";
import { encodeDocument } from "../src/lib/sharing";

const DEFAULT_BASE_URL = "https://wiretext.app";

function readInput(filePath?: string): string {
  if (filePath && filePath !== "-") {
    return readFileSync(filePath, "utf-8");
  }
  return readFileSync(0, "utf-8");
}

function parseInput(raw: string): MinimalObject[] {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.objects)) {
    return parsed.objects;
  }
  throw new Error('Input must be a JSON array or { "objects": [...] }');
}

function cmdCreate(filePath?: string, baseUrl = DEFAULT_BASE_URL): void {
  const raw = readInput(filePath);
  const minimal = parseInput(raw);
  const { objects, layer } = fillDefaults(minimal);
  const encoded = encodeDocument(objects, [layer]);
  console.log(`${baseUrl}/#${encoded}`);
}

function cmdRender(filePath?: string): void {
  const raw = readInput(filePath);
  const minimal = parseInput(raw);
  const { objects, layer } = fillDefaults(minimal);
  const gridSize = computeRenderGridSize(objects);
  const grid = compose(objects, gridSize, [layer]);
  console.log(gridToString(grid));
}

function printHelp(): void {
  console.log(`Usage: wiretext <command> [file.json]

Commands:
  create [file.json]    Generate an editable Wiretext URL
  render [file.json]    Render ASCII art to stdout

Options:
  --base-url <url>      Base URL for create (default: ${DEFAULT_BASE_URL})

Input: JSON from file argument or stdin
Format: { "objects": [...] } or bare [...]`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  let baseUrl = DEFAULT_BASE_URL;
  const filteredArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--base-url" && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++;
    } else {
      filteredArgs.push(args[i]);
    }
  }

  const cmd = filteredArgs[0];
  const filePath = filteredArgs[1];

  switch (cmd) {
    case "create":
      cmdCreate(filePath, baseUrl);
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
