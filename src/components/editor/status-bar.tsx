"use client";

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

	return (
		<div className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-surface px-3 text-xs text-text-dim">
			<span className="w-16">
				{hoverCol},{hoverRow}
			</span>
			<span className="text-accent">{activeTool.toUpperCase()}</span>
			<span>{Math.round(viewport.zoom * 100)}%</span>
			<span>
				{objects.length} {objects.length === 1 ? "object" : "objects"}
			</span>
			{selection.size > 0 && (
				<span className="text-accent">{selection.size} selected</span>
			)}
		</div>
	);
}
