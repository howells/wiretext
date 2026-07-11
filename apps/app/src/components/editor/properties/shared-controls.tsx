import type { BorderStyle, WireObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

/** Button styling for the currently selected option in a control group. */
export const ACTIVE_BUTTON_CLASS = "bg-accent text-bg";

/** Button styling for unselected options in a control group. */
export const INACTIVE_BUTTON_CLASS =
  "bg-surface-hover text-text-dim hover:text-text";

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider">
    {children}
  </span>
);

const borderStyles: BorderStyle[] = ["single", "double", "rounded", "heavy"];
const borderPreviews: Record<BorderStyle, string> = {
  double: "╔═╗",
  heavy: "┏━┓",
  rounded: "╭─╮",
  single: "┌─┐",
};

/** Border style and fill controls, shared by boxes and bordered components. */
export const BorderFillFields = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "box" | "component" }>;
}) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <>
      <div>
        <FieldLabel>Border</FieldLabel>
        <div className="flex gap-1">
          {borderStyles.map((style) => (
            <button
              aria-label={style}
              className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
                obj.borderStyle === style
                  ? ACTIVE_BUTTON_CLASS
                  : INACTIVE_BUTTON_CLASS
              }`}
              key={style}
              onClick={() => {
                updateObject(obj.id, {
                  borderStyle: style,
                });
              }}
              type="button"
            >
              {borderPreviews[style]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Fill</FieldLabel>
        <div className="flex gap-1">
          {(["solid", "transparent"] as const).map((fill) => (
            <button
              className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                (obj.fill ?? "solid") === fill
                  ? ACTIVE_BUTTON_CLASS
                  : INACTIVE_BUTTON_CLASS
              }`}
              key={fill}
              onClick={() => {
                updateObject(obj.id, { fill });
              }}
              type="button"
            >
              {fill === "solid" ? "Solid" : "Clear"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const TRAILING_S = /s$/u;

export const EditableItemList = ({
  items,
  label,
  newItemLabel,
  onChange,
}: {
  items: string[];
  label: string;
  newItemLabel: (count: number) => string;
  onChange: (items: string[]) => void;
}) => {
  const singular = label.toLowerCase().replace(TRAILING_S, "");
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-col gap-1">
        {items.map((item, position) => (
          // Items are anonymous strings edited in place, so their position is
          // their identity. Position keys keep inputs mounted (and focused)
          // across keystrokes; value keys would remount on every edit.
          <div className="flex items-center gap-1" key={`item-${position}`}>
            <input
              className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
              onChange={(e) => {
                const next = items.map((v, j) =>
                  j === position ? e.target.value : v
                );
                onChange(next);
              }}
              type="text"
              value={item}
            />
            {items.length > 1 && (
              <button
                aria-label={`Remove ${singular}`}
                className="rounded px-1 text-text-dim text-xs hover:text-text"
                onClick={() => {
                  onChange(items.filter((_, j) => j !== position));
                }}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
          onClick={() => {
            onChange([...items, newItemLabel(items.length)]);
          }}
          type="button"
        >
          + Add {singular}
        </button>
      </div>
    </div>
  );
};

/** Start/end arrow-head toggles, shared by arrows and connectors. */
export const HeadsField = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "arrow" | "connector" }>;
}) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const startHead = obj.startHead === true;
  const endHead = obj.endHead !== false;

  // Toggling a head off forces the other one on
  const toggleStart = () => {
    const newStart = !startHead;
    const patch: Partial<WireObject> = { startHead: newStart };
    if (!(newStart || endHead)) {
      patch.endHead = true;
    }
    updateObject(obj.id, patch);
  };

  const toggleEnd = () => {
    const newEnd = !endHead;
    const patch: Partial<WireObject> = { endHead: newEnd };
    if (!(newEnd || startHead)) {
      patch.startHead = true;
    }
    updateObject(obj.id, patch);
  };

  return (
    <div>
      <FieldLabel>Heads</FieldLabel>
      <div className="flex gap-1">
        <button
          aria-label="Start head"
          className={`rounded px-2 py-0.5 font-mono text-xs transition-colors ${
            startHead ? ACTIVE_BUTTON_CLASS : INACTIVE_BUTTON_CLASS
          }`}
          onClick={toggleStart}
          type="button"
        >
          {startHead ? "◂─" : "──"}
        </button>
        <button
          aria-label="End head"
          className={`rounded px-2 py-0.5 font-mono text-xs transition-colors ${
            endHead ? ACTIVE_BUTTON_CLASS : INACTIVE_BUTTON_CLASS
          }`}
          onClick={toggleEnd}
          type="button"
        >
          {endHead ? "─▸" : "──"}
        </button>
      </div>
    </div>
  );
};

export const AnnotationField = ({ obj }: { obj: WireObject }) => {
  const updateObject = useEditorStore((s) => s.updateObject);

  return (
    <div>
      <label
        className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
        htmlFor="annotation"
      >
        Annotation
      </label>
      <input
        className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
        id="annotation"
        onChange={(e) => {
          updateObject(obj.id, {
            annotation: e.target.value || undefined,
          });
        }}
        placeholder="Add note..."
        type="text"
        value={obj.annotation ?? ""}
      />
    </div>
  );
};
