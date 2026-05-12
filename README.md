# Wiretext

Wiretext is a spatial design tool for generating editable wireframes as plain text. It turns structured JSON into ASCII/Unicode layouts that can be rendered in a terminal, opened in the web editor, or created through an MCP server.

The public value is the reusable tooling:

- `wiretext` — CLI for rendering, validating, creating, and sharing wireframes
- `@wiretext/mcp` — MCP server for typed wireframe generation from AI assistants
- `@wiretext/engine` — layout, composition, validation, sharing, and rendering engine
- `@wiretext/schemas` — Zod schemas for tool and document contracts

## Install

```bash
npm install -g wiretext
```

Or run without installing:

```bash
npx wiretext --help
```

## CLI

Render a wireframe from JSON:

```bash
echo '{ "objects": [{ "type": "box", "label": "Hello", "width": 20, "height": 5 }] }' | wiretext render
```

Create an editable Wiretext URL:

```bash
wiretext create layout.json
```

Create a permanent short URL:

```bash
wiretext share layout.json --dry-run
wiretext share layout.json
```

Use `--dry-run` before `share`; sharing creates a permanent URL through the hosted Wiretext API.

## MCP

Wiretext also ships an MCP server:

```bash
npx -y @wiretext/mcp
```

For Codex:

```toml
[mcp_servers.wiretext]
command = "npx"
args = ["-y", "@wiretext/mcp"]
```

The MCP server exposes typed tools for rendering wireframes and creating editable Wiretext URLs without shell escaping.

## Agent Workflow

Wiretext is designed for coding agents and design agents:

- `wiretext schema` prints the runtime JSON Schema.
- `wiretext context` prints the layout guide agents should read before generating wireframes.
- Non-TTY output defaults to structured JSON.
- Mutating share operations support `--dry-run`.
- Input is validated with Zod before rendering or sharing.

## Workspace

```text
apps/
  app/      Hosted web editor
  cli/      Published `wiretext` CLI
  mcp/      Published `@wiretext/mcp` server
packages/
  engine/   Layout and rendering engine
  schemas/  Shared Zod schemas
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
