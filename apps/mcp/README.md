# Wiretext MCP Server

An [MCP](https://modelcontextprotocol.io) server that lets AI assistants generate wireframes programmatically. Returns editable Wiretext URLs or renders ASCII art directly.

## Install

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wiretext": {
      "command": "npx",
      "args": ["-y", "@wiretext/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add wiretext -- npx -y @wiretext/mcp
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wiretext": {
      "command": "npx",
      "args": ["-y", "@wiretext/mcp"]
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.wiretext]
command = "npx"
args = ["-y", "@wiretext/mcp"]
```

## Tools

### `create_wireframe`

Generate an editable Wiretext URL from wire objects.

```
"Create a wireframe with a navbar, a sidebar with navigation links, and a main content area with a card grid"
```

Returns a URL like `https://wiretext.app/#...` that opens in the editor.

### `render_wireframe`

Render wire objects as ASCII art. Useful for previewing layouts inline.

## Object Types

**Primitives:** `box`, `text`, `line`, `arrow`

**Components:**

| Type | Description | Key Props |
|------|-------------|-----------|
| `button` | Clickable button | `label`, `icon`, `align` |
| `input` | Text input field | `label`, `icon` |
| `select` | Dropdown select | `label` |
| `checkbox` | Checkbox with label | `label`, `checked` |
| `radio` | Radio button with label | `label`, `checked` |
| `toggle` | On/off switch | `label`, `checked` |
| `table` | Data table | `columns`, `rows`, `filterable` |
| `modal` | Modal dialog | `label` |
| `browser` | Browser window | `label` (URL) |
| `card` | Content card | `label` (title) |
| `navbar` | Navigation bar | `navItems` |
| `tabs` | Tab bar | `tabs` |
| `progress` | Progress bar | `progress` (0-100) |
| `icon` | Single icon character | `icon` |
| `image` | Image placeholder | `label`, `icon` |
| `alert` | Alert banner | `label`, `alertType` |
| `avatar` | User avatar | `label` (initials), `icon` |
| `divider` | Horizontal rule | `label` |
| `breadcrumb` | Breadcrumb nav | `items`, `separator` |
| `list` | Bulleted/numbered list | `items`, `listStyle` |
| `stepper` | Step indicator | `items`, `activeStep` |
| `rating` | Dot rating | `value`, `maxValue` |
| `skeleton` | Loading placeholder | width, height |

## Example

```json
[
  {
    "type": "component",
    "componentType": "navbar",
    "position": { "col": 0, "row": 0 },
    "width": 50,
    "navItems": ["Home", "Products", "About"]
  },
  {
    "type": "component",
    "componentType": "breadcrumb",
    "position": { "col": 2, "row": 4 },
    "items": ["Home", "Products", "Laptops"]
  },
  {
    "type": "component",
    "componentType": "card",
    "position": { "col": 2, "row": 6 },
    "width": 22,
    "height": 10,
    "label": "MacBook Pro"
  },
  {
    "type": "component",
    "componentType": "rating",
    "position": { "col": 4, "row": 13 },
    "value": 4,
    "maxValue": 5
  }
]
```
