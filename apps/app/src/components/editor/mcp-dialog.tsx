"use client";

import { useCallback, useEffect, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface McpDialogProps {
  onClose: () => void;
  open: boolean;
}

interface InstallConfig {
  code: string;
  name: string;
  path?: string;
}

const INSTALL_CONFIGS: InstallConfig[] = [
  {
    name: "Claude Code",
    code: "claude mcp add wiretext -- npx -y @wiretext/mcp",
  },
  {
    name: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
    code: `{
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
    code: `{
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
    code: `[mcp_servers.wiretext]
command = "npx"
args = ["-y", "@wiretext/mcp"]`,
  },
];

const COMPONENTS = [
  { type: "button", desc: "Clickable button", props: "label, icon, align" },
  { type: "input", desc: "Text input field", props: "label, icon" },
  { type: "select", desc: "Dropdown select", props: "label" },
  { type: "checkbox", desc: "Checkbox with label", props: "label, checked" },
  { type: "radio", desc: "Radio button", props: "label, checked" },
  { type: "toggle", desc: "On/off switch", props: "label, checked" },
  { type: "table", desc: "Data table", props: "columns, rows, filterable" },
  { type: "modal", desc: "Modal dialog", props: "label, body" },
  { type: "browser", desc: "Browser window", props: "label (URL)" },
  { type: "card", desc: "Content card", props: "label (title), body" },
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
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      className="absolute top-2 right-2 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-dim hover:text-text"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function McpDialog({ open, onClose }: McpDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-label="MCP Server"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        type="button"
      />
      <div className="relative flex max-h-[80vh] w-[560px] flex-col rounded-lg border border-border bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-border border-b px-5 py-4">
          <div>
            <h2 className="font-mono text-base text-text">MCP Server</h2>
            <p className="mt-0.5 text-[11px] text-text-dim">
              Let AI assistants generate wireframes with{" "}
              <a
                className="text-accent hover:underline"
                href="https://modelcontextprotocol.io"
                rel="noopener noreferrer"
                target="_blank"
              >
                MCP
              </a>
            </p>
          </div>
          <button
            className="text-text-dim hover:text-text"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Install */}
          <div className="border-border border-b px-5 py-4">
            <h3 className="mb-3 text-[10px] text-text-dim uppercase tracking-wider">
              Install
            </h3>
            <div className="flex flex-col gap-3">
              {INSTALL_CONFIGS.map((cfg) => (
                <div key={cfg.name}>
                  <span className="font-mono text-accent text-xs">
                    {cfg.name}
                  </span>
                  {cfg.path && (
                    <span className="ml-2 text-[10px] text-text-dim">
                      {cfg.path}
                    </span>
                  )}
                  <div className="relative mt-1">
                    <pre className="overflow-x-auto rounded border border-border bg-bg p-2.5 pr-14 font-mono text-[11px] text-text leading-relaxed">
                      {cfg.code}
                    </pre>
                    <CopyButton text={cfg.code} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="border-border border-b px-5 py-4">
            <h3 className="mb-3 text-[10px] text-text-dim uppercase tracking-wider">
              Tools
            </h3>
            <div className="flex flex-col gap-2">
              <div>
                <span className="font-mono text-accent text-xs">
                  create_wireframe
                </span>
                <p className="mt-0.5 text-[11px] text-text-dim">
                  Generate an editable Wiretext URL from wire objects.
                </p>
              </div>
              <div>
                <span className="font-mono text-accent text-xs">
                  render_wireframe
                </span>
                <p className="mt-0.5 text-[11px] text-text-dim">
                  Render wire objects as ASCII art inline.
                </p>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="px-5 py-4">
            <h3 className="mb-2 text-[10px] text-text-dim uppercase tracking-wider">
              Components
            </h3>
            <p className="mb-3 text-[11px] text-text-dim">
              Primitives: <code className="text-text">box</code>,{" "}
              <code className="text-text">text</code>,{" "}
              <code className="text-text">line</code>,{" "}
              <code className="text-text">arrow</code>,{" "}
              <code className="text-text">connector</code>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-border border-b text-[10px] text-text-dim">
                    <th className="pr-3 pb-1.5 font-normal">Type</th>
                    <th className="pr-3 pb-1.5 font-normal">Description</th>
                    <th className="pb-1.5 font-normal">Key Props</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPONENTS.map((c) => (
                    <tr
                      className="border-border border-b last:border-b-0"
                      key={c.type}
                    >
                      <td className="py-1 pr-3 font-mono text-[11px] text-accent">
                        {c.type}
                      </td>
                      <td className="py-1 pr-3 text-[11px] text-text-dim">
                        {c.desc}
                      </td>
                      <td className="py-1 font-mono text-[10px] text-text-dim">
                        {c.props}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
