"use client";

import {
	composeToHtml,
	composeToMarkdown,
	composeToText,
	copyToClipboard,
} from "@/lib/clipboard";
import { useEditorStore } from "@/store";
import { useCallback, useEffect, useState } from "react";

type ExportFormat = "text" | "markdown" | "html";

interface ExportDialogProps {
	open: boolean;
	onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
	const objects = useEditorStore((s) => s.objects);
	const gridSize = useEditorStore((s) => s.gridSize);
	const [format, setFormat] = useState<ExportFormat>("text");
	const [copied, setCopied] = useState(false);

	const getOutput = useCallback(() => {
		switch (format) {
			case "text":
				return composeToText(objects, gridSize);
			case "markdown":
				return composeToMarkdown(objects, gridSize);
			case "html":
				return composeToHtml(objects, gridSize);
		}
	}, [objects, gridSize, format]);

	const handleCopy = useCallback(async () => {
		const ok = await copyToClipboard(getOutput());
		if (ok) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, [getOutput]);

	useEffect(() => {
		if (!open) setCopied(false);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	if (!open) return null;

	const output = getOutput();

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<div
				className="w-[640px] max-h-[80vh] flex flex-col rounded-lg border border-border bg-surface"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={() => {}}
			>
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-sm font-medium text-text">Export</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-text-dim hover:text-text"
					>
						x
					</button>
				</div>

				{/* Format tabs */}
				<div className="flex gap-1 border-b border-border px-4 py-2">
					{(["text", "markdown", "html"] as ExportFormat[]).map((f) => (
						<button
							key={f}
							type="button"
							className={`rounded px-3 py-1 text-xs transition-colors ${
								format === f
									? "bg-accent text-bg"
									: "text-text-dim hover:text-text"
							}`}
							onClick={() => setFormat(f)}
						>
							{f === "text"
								? "Plain Text"
								: f === "markdown"
									? "Markdown"
									: "HTML"}
						</button>
					))}
				</div>

				{/* Preview */}
				<div className="flex-1 overflow-auto p-4">
					<pre className="max-h-80 overflow-auto whitespace-pre rounded border border-border bg-bg p-3 font-mono text-xs leading-[1.5] text-text">
						{output}
					</pre>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
					<button
						type="button"
						onClick={handleCopy}
						className="rounded bg-accent px-4 py-1.5 text-xs font-medium text-bg transition-colors hover:opacity-90"
					>
						{copied ? "Copied!" : "Copy to Clipboard"}
					</button>
				</div>
			</div>
		</div>
	);
}
