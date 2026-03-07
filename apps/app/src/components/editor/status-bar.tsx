"use client";

import { COMPONENT_BY_TYPE } from "@wiretext/engine";
import Link from "next/link";
import { version } from "@/../package.json";
import { useEditorStore } from "@/store";

interface StatusBarProps {
  hoverCol: number;
  hoverRow: number;
}

export function StatusBar({ hoverCol, hoverRow }: StatusBarProps) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const objects = useEditorStore((s) => s.objects);
  const viewport = useEditorStore((s) => s.viewport);
  const selection = useEditorStore((s) => s.selection);
  const pendingComponent = useEditorStore((s) => s.pendingComponent);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  return (
    <div className="flex h-7 shrink-0 items-center gap-4 border-border border-t bg-surface px-3 text-text-dim text-xs">
      <span className="w-16">
        {hoverCol},{hoverRow}
      </span>
      <span className="text-accent">{activeTool.toUpperCase()}</span>
      <span>{Math.round(viewport.zoom * 100)}%</span>
      <span className={snapEnabled ? "text-accent" : "opacity-40"}>SNAP</span>
      <span>
        {objects.length} {objects.length === 1 ? "object" : "objects"}
      </span>
      {selection.size > 0 && (
        <span className="text-accent">{selection.size} selected</span>
      )}
      {activeTool === "connector" && (
        <span className="text-text-dim">Click a box, drag to another</span>
      )}
      {pendingComponent && (
        <span className="text-accent">
          Place {COMPONENT_BY_TYPE[pendingComponent].name}
        </span>
      )}
      <span className="ml-auto flex items-center gap-2">
        <span className="text-text-dim/50">v{version}</span>
        <span className="text-text-dim/30">·</span>
        <Link className="text-text-dim/50 hover:text-text" href="/mcp">
          MCP
        </Link>
        <span className="text-text-dim/30">·</span>
        <span>
          by{" "}
          <a
            className="text-text-dim underline hover:text-text"
            href="https://danielhowells.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Howells
          </a>
        </span>
      </span>
    </div>
  );
}
