# Wiretext CLI — Agent Context

Wiretext generates ASCII/Unicode wireframes from structured JSON. The CLI accepts the same schema as the MCP server and the web editor.

## Quick Start

```bash
# Render a wireframe to stdout
echo '{ "objects": [{ "type": "box", "label": "Hello" }] }' | wiretext render

# Create an editable URL
wiretext create layout.json

# Create a permanent short URL (mutating — use --dry-run first)
wiretext share layout.json --dry-run
wiretext share layout.json
```

## Agent Guardrails

1. **Always use `--dry-run` before `share`** — share creates a permanent short URL via a POST to the API. Validate first, then share.

2. **Auto-JSON in pipes** — when stdout is not a TTY (piped), output defaults to structured JSON. No need to pass `--json` explicitly in agent pipelines.

3. **Use `wiretext schema` for input format** — get the full JSON Schema at runtime. Do not hardcode field names from documentation; introspect instead.

4. **Use `wiretext context` for layout rules** — the layout guide contains critical sizing, nesting, and z-index rules. Read it before generating wireframes.

5. **Use `wiretext render` for small previews** — preview with render before creating URLs to catch layout issues early without wasting a short URL slot.

## Output Envelope

All commands return a consistent JSON envelope when in JSON mode:

```jsonc
// Success (create/share)
{ "ok": true, "url": "https://wiretext.app/w/abc12345" }

// Success (render)
{ "ok": true, "ascii": "...", "width": 42, "height": 15, "objectCount": 3 }

// Success (share --dry-run)
{ "ok": true, "dryRun": true, "valid": true, "objectCount": 3, "encodedBytes": 184 }

// Error
{ "ok": false, "error": "Invalid input: ...", "code": "INVALID_INPUT" }
```

Failures exit `1` and carry a distinct `code` so agents can branch on the failure kind without parsing `error` text:

| Code               | Meaning                                            |
| ------------------ | -------------------------------------------------- |
| `INVALID_INPUT`    | JSON did not match the wire object schema          |
| `FILE_NOT_FOUND`   | The input file argument does not exist             |
| `INVALID_ARGUMENT` | A flag value was malformed (e.g. bad `--base-url`) |
| `SHARE_FAILED`     | The share API rejected the request                 |
| `NETWORK_ERROR`    | The share request could not reach the API          |
| `UNKNOWN_COMMAND`  | The first positional was not a known command       |

## Input Schema

The input format maps 1:1 to the engine's internal types. Use `wiretext schema` to get the full JSON Schema. The short version:

```json
{
  "objects": [
    {
      "type": "box",
      "label": "Container",
      "width": 40,
      "height": 20,
      "position": { "col": 0, "row": 0 }
    },
    { "type": "text", "content": "Hello", "position": { "col": 5, "row": 3 } },
    {
      "type": "component",
      "componentType": "button",
      "label": "Submit",
      "position": { "col": 5, "row": 6 }
    }
  ],
  "layers": [{ "id": "ui", "name": "UI Elements" }]
}
```

Object types: `box`, `text`, `line`, `arrow`, `connector`, `component`. Component types: `button`, `input`, `select`, `checkbox`, `radio`, `table`, `modal`, `browser`, `card`, `navbar`, `tabs`, `progress`, `icon`, `image`, `divider`, `toggle`, `alert`, `breadcrumb`, `avatar`, `list`, `stepper`, `rating`, `skeleton`.

## MCP Server

For typed tool invocation without shell escaping, use the MCP server instead:

```bash
npx @wiretext/mcp
```

Exposes `create_wireframe` and `render_wireframe` tools with Zod-validated schemas over stdio JSON-RPC.
