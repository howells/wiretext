"use client";

import type { BorderStyle, WireObject } from "@/engine/types";
import { useEditorStore } from "@/store";

const borderStyles: BorderStyle[] = ["single", "double", "rounded", "heavy"];
const borderPreviews: Record<BorderStyle, string> = {
	single: "┌─┐",
	double: "╔═╗",
	rounded: "╭─╮",
	heavy: "┏━┓",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="mb-1 block text-[10px] uppercase tracking-wider text-text-dim">
			{children}
		</span>
	);
}

export function PropertiesPanel() {
	const selection = useEditorStore((s) => s.selection);
	const objects = useEditorStore((s) => s.objects);

	const selectedObjects = objects.filter((o) => selection.has(o.id));

	if (selectedObjects.length === 0) {
		return (
			<div className="flex w-52 flex-col border-l border-border bg-surface p-3">
				<p className="text-xs text-text-dim">No selection</p>
			</div>
		);
	}

	if (selectedObjects.length > 1) {
		return (
			<div className="flex w-52 flex-col border-l border-border bg-surface p-3">
				<p className="text-xs text-text-dim">
					{selectedObjects.length} objects selected
				</p>
			</div>
		);
	}

	const obj = selectedObjects[0];

	return (
		<div className="flex w-52 flex-col gap-3 border-l border-border bg-surface p-3">
			<div>
				<FieldLabel>Type</FieldLabel>
				<span className="text-xs text-text">{obj.type}</span>
			</div>

			<div>
				<FieldLabel>Position</FieldLabel>
				<span className="text-xs text-text">
					{obj.position.col}, {obj.position.row}
				</span>
			</div>

			{obj.type === "box" && <BoxProperties obj={obj} />}
			{obj.type === "text" && <TextProperties obj={obj} />}

			<AnnotationField obj={obj} />
		</div>
	);
}

function BoxProperties({ obj }: { obj: Extract<WireObject, { type: "box" }> }) {
	const updateObject = useEditorStore((s) => s.updateObject);

	return (
		<>
			<div>
				<FieldLabel>Size</FieldLabel>
				<span className="text-xs text-text">
					{obj.width} x {obj.height}
				</span>
			</div>

			<div>
				<FieldLabel>Border</FieldLabel>
				<div className="flex gap-1">
					{borderStyles.map((style) => (
						<button
							key={style}
							type="button"
							title={style}
							className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
								obj.borderStyle === style
									? "bg-accent text-bg"
									: "bg-surface-hover text-text-dim hover:text-text"
							}`}
							onClick={() =>
								updateObject(obj.id, {
									borderStyle: style,
								} as Partial<WireObject>)
							}
						>
							{borderPreviews[style]}
						</button>
					))}
				</div>
			</div>

			<div>
				<label
					htmlFor="box-label"
					className="mb-1 block text-[10px] uppercase tracking-wider text-text-dim"
				>
					Label
				</label>
				<input
					id="box-label"
					type="text"
					value={obj.label ?? ""}
					onChange={(e) =>
						updateObject(obj.id, {
							label: e.target.value || undefined,
						} as Partial<WireObject>)
					}
					placeholder="Optional label"
					className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-text outline-none focus:border-accent"
				/>
			</div>
		</>
	);
}

function TextProperties({
	obj,
}: { obj: Extract<WireObject, { type: "text" }> }) {
	return (
		<div>
			<FieldLabel>Content</FieldLabel>
			<span className="text-xs text-text">
				{obj.content.length > 30
					? `${obj.content.slice(0, 30)}...`
					: obj.content || "(empty)"}
			</span>
		</div>
	);
}

function AnnotationField({ obj }: { obj: WireObject }) {
	const updateObject = useEditorStore((s) => s.updateObject);

	return (
		<div>
			<label
				htmlFor="annotation"
				className="mb-1 block text-[10px] uppercase tracking-wider text-text-dim"
			>
				Annotation
			</label>
			<input
				id="annotation"
				type="text"
				value={obj.annotation ?? ""}
				onChange={(e) =>
					updateObject(obj.id, {
						annotation: e.target.value || undefined,
					} as Partial<WireObject>)
				}
				placeholder="Add note..."
				className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-text outline-none focus:border-accent"
			/>
		</div>
	);
}
