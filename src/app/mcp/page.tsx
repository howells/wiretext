import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiretext MCP Server — AI Wireframe Generation",
  description:
    "An MCP server that lets AI assistants generate wireframes programmatically. Works with Claude Desktop, Claude Code, Cursor, and Codex.",
};

const installConfigs = [
  {
    name: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
    config: `{
  "mcpServers": {
    "wiretext": {
      "command": "npx",
      "args": ["-y", "@wiretext/mcp"]
    }
  }
}`,
  },
  {
    name: "Cursor",
    path: ".cursor/mcp.json",
    config: `{
  "mcpServers": {
    "wiretext": {
      "command": "npx",
      "args": ["-y", "@wiretext/mcp"]
    }
  }
}`,
  },
  {
    name: "Codex",
    path: "~/.codex/config.toml",
    config: `[mcp_servers.wiretext]
command = "npx"
args = ["-y", "@wiretext/mcp"]`,
  },
];

const components = [
  { type: "button", desc: "Clickable button", props: "label, icon, align" },
  { type: "input", desc: "Text input field", props: "label, icon" },
  { type: "select", desc: "Dropdown select", props: "label" },
  { type: "checkbox", desc: "Checkbox with label", props: "label, checked" },
  { type: "radio", desc: "Radio button", props: "label, checked" },
  { type: "toggle", desc: "On/off switch", props: "label, checked" },
  { type: "table", desc: "Data table", props: "columns, rows, filterable" },
  { type: "modal", desc: "Modal dialog", props: "label" },
  { type: "browser", desc: "Browser window", props: "label (URL)" },
  { type: "card", desc: "Content card", props: "label (title)" },
  { type: "navbar", desc: "Navigation bar", props: "navItems" },
  { type: "tabs", desc: "Tab bar", props: "tabs" },
  { type: "progress", desc: "Progress bar", props: "progress (0-100)" },
  { type: "icon", desc: "Single icon character", props: "icon" },
  { type: "image", desc: "Image placeholder", props: "label, icon" },
  { type: "alert", desc: "Alert banner", props: "label, alertType" },
  { type: "avatar", desc: "User avatar", props: "label (initials), icon" },
  { type: "divider", desc: "Horizontal rule", props: "label" },
  { type: "breadcrumb", desc: "Breadcrumb nav", props: "items, separator" },
  { type: "list", desc: "Bulleted/numbered list", props: "items, listStyle" },
  { type: "stepper", desc: "Step indicator", props: "items, activeStep" },
  { type: "rating", desc: "Dot rating", props: "value, maxValue" },
  { type: "skeleton", desc: "Loading placeholder", props: "width, height" },
];

const exampleJson = `[
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
    "width": 22, "height": 10,
    "label": "MacBook Pro"
  },
  {
    "type": "component",
    "componentType": "rating",
    "position": { "col": 4, "row": 13 },
    "value": 4, "maxValue": 5
  }
]`;

export default function McpPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <a className="text-text-dim text-xs hover:text-text" href="/">
          &larr; Back to editor
        </a>

        <h1 className="mt-6 font-mono text-2xl">Wiretext MCP Server</h1>
        <p className="mt-2 text-text-dim">
          An{" "}
          <a
            className="text-accent hover:underline"
            href="https://modelcontextprotocol.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            MCP
          </a>{" "}
          server that lets AI assistants generate wireframes programmatically.
          Returns editable Wiretext URLs or renders ASCII art directly.
        </p>

        {/* Claude Code */}
        <h2 className="mt-10 font-mono text-lg">Install</h2>

        <h3 className="mt-6 font-mono text-accent text-sm">Claude Code</h3>
        <pre className="mt-2 overflow-x-auto rounded border border-border bg-surface p-4 text-sm">
          claude mcp add wiretext -- npx -y @wiretext/mcp
        </pre>

        {/* Other clients */}
        {installConfigs.map((cfg) => (
          <div key={cfg.name}>
            <h3 className="mt-6 font-mono text-accent text-sm">{cfg.name}</h3>
            <p className="mt-1 text-text-dim text-xs">{cfg.path}</p>
            <pre className="mt-2 overflow-x-auto rounded border border-border bg-surface p-4 text-sm">
              {cfg.config}
            </pre>
          </div>
        ))}

        {/* Tools */}
        <h2 className="mt-10 font-mono text-lg">Tools</h2>

        <h3 className="mt-4 font-mono text-accent text-sm">create_wireframe</h3>
        <p className="mt-1 text-sm text-text-dim">
          Generate an editable Wiretext URL from wire objects. Returns a
          shareable link that opens in the editor.
        </p>

        <h3 className="mt-4 font-mono text-accent text-sm">render_wireframe</h3>
        <p className="mt-1 text-sm text-text-dim">
          Render wire objects as ASCII art. Useful for previewing layouts
          inline.
        </p>

        {/* Components */}
        <h2 className="mt-10 font-mono text-lg">Components</h2>
        <p className="mt-2 text-sm text-text-dim">
          Primitives: <code className="text-text">box</code>,{" "}
          <code className="text-text">text</code>,{" "}
          <code className="text-text">line</code>,{" "}
          <code className="text-text">arrow</code>
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border border-b text-text-dim text-xs">
                <th className="pr-4 pb-2 font-normal">Type</th>
                <th className="pr-4 pb-2 font-normal">Description</th>
                <th className="pb-2 font-normal">Key Props</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr className="border-border border-b" key={c.type}>
                  <td className="py-1.5 pr-4 font-mono text-accent">
                    {c.type}
                  </td>
                  <td className="py-1.5 pr-4 text-text-dim">{c.desc}</td>
                  <td className="py-1.5 font-mono text-text-dim text-xs">
                    {c.props}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example */}
        <h2 className="mt-10 font-mono text-lg">Example</h2>
        <pre className="mt-4 overflow-x-auto rounded border border-border bg-surface p-4 text-xs leading-relaxed">
          {exampleJson}
        </pre>

        {/* Footer */}
        <div className="mt-16 border-border border-t pt-4 text-text-dim text-xs">
          <a className="hover:text-text" href="/">
            wiretext.app
          </a>
        </div>
      </div>
    </div>
  );
}
