"use client";

import type { ToolType } from "@/engine/types";
import { useEditorStore } from "@/store";

const tools: { type: ToolType; label: string; shortcut: string }[] = [
	{ type: "select", label: "Select", shortcut: "V" },
	{ type: "box", label: "Box", shortcut: "B" },
	{ type: "text", label: "Text", shortcut: "T" },
	{ type: "line", label: "Line", shortcut: "L" },
	{ type: "arrow", label: "Arrow", shortcut: "A" },
];

export function Toolbar() {
	const activeTool = useEditorStore((s) => s.activeTool);
	const setActiveTool = useEditorStore((s) => s.setActiveTool);

	return (
		<div className="flex w-10 flex-col items-center gap-1 border-r border-border bg-surface py-2">
			{tools.map((tool) => (
				<button
					key={tool.type}
					type="button"
					title={`${tool.label} (${tool.shortcut})`}
					className={`flex h-8 w-8 items-center justify-center rounded text-xs transition-colors ${
						activeTool === tool.type
							? "bg-accent text-bg"
							: "text-text-dim hover:bg-surface-hover hover:text-text"
					}`}
					onClick={() => setActiveTool(tool.type)}
				>
					{tool.shortcut}
				</button>
			))}
		</div>
	);
}
