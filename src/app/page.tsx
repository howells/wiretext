"use client";

import { Canvas } from "@/components/editor/canvas";
import { ExportDialog } from "@/components/editor/export-dialog";
import { PropertiesPanel } from "@/components/editor/properties-panel";
import { StatusBar } from "@/components/editor/status-bar";
import { TextEditorOverlay } from "@/components/editor/text-editor-overlay";
import { Toolbar } from "@/components/editor/toolbar";
import { copyToClipboard } from "@/lib/clipboard";
import { decodeDocument, getShareUrl } from "@/lib/sharing";
import { useCanvasEvents } from "@/lib/use-canvas-events";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useKeyboard } from "@/lib/use-keyboard";
import { useEditorStore } from "@/store";
import { useCallback, useEffect, useState } from "react";

export default function EditorPage() {
	const { onMouseDown, onMouseMove, onMouseUp, cursor } = useCanvasEvents();
	const objects = useEditorStore((s) => s.objects);
	const metrics = useCharMetrics();
	const [hoverCoord, setHoverCoord] = useState({ col: 0, row: 0 });
	const [exportOpen, setExportOpen] = useState(false);
	const [shareMsg, setShareMsg] = useState("");
	const toggleExport = useCallback(() => setExportOpen((v) => !v), []);
	useKeyboard(toggleExport);

	// Load from URL hash on mount
	useEffect(() => {
		const hash = window.location.hash.slice(1);
		if (!hash) return;
		const decoded = decodeDocument(hash);
		if (decoded && decoded.length > 0) {
			const store = useEditorStore.getState();
			for (const obj of decoded) {
				store.addObject(obj);
			}
		}
	}, []);

	const handleGridHover = useCallback((col: number, row: number) => {
		setHoverCoord({ col, row });
	}, []);

	const handleShare = useCallback(async () => {
		const url = getShareUrl(useEditorStore.getState().objects);
		const ok = await copyToClipboard(url);
		if (ok) {
			window.history.replaceState(null, "", url);
			setShareMsg("URL copied!");
			setTimeout(() => setShareMsg(""), 2000);
		}
	}, []);

	return (
		<div className="flex h-screen w-screen flex-col bg-bg">
			<div className="flex flex-1 overflow-hidden">
				<Toolbar />

				<div className="relative flex-1" style={{ cursor }}>
					<Canvas
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onGridHover={handleGridHover}
					/>
					{metrics && <TextEditorOverlay metrics={metrics} />}

					{/* Empty state prompt */}
					{objects.length === 0 && (
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
							<p className="text-text-dim text-sm opacity-60">
								Press <kbd className="text-accent">B</kbd> to draw a box, or{" "}
								<kbd className="text-accent">T</kbd> to add text
							</p>
						</div>
					)}

					{/* Top-right action buttons */}
					<div className="absolute right-3 top-3 flex gap-2">
						<button
							type="button"
							onClick={() => setExportOpen(true)}
							className="rounded border border-border bg-surface px-3 py-1.5 text-xs text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
						>
							Export
						</button>
						<button
							type="button"
							onClick={handleShare}
							className="rounded border border-border bg-surface px-3 py-1.5 text-xs text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
						>
							{shareMsg || "Share"}
						</button>
					</div>
				</div>

				<PropertiesPanel />
			</div>

			<StatusBar hoverCol={hoverCoord.col} hoverRow={hoverCoord.row} />
			<ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
		</div>
	);
}
