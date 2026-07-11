import type { WireObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import { BorderFillFields, FieldLabel } from "./shared-controls";

export const BoxProperties = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "box" }>;
}) => {
  const updateObject = useEditorStore((s) => s.updateObject);

  return (
    <>
      <div>
        <FieldLabel>Size</FieldLabel>
        <span className="text-text text-xs">
          {obj.width} x {obj.height}
        </span>
      </div>

      <BorderFillFields obj={obj} />

      <div>
        <label
          className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
          htmlFor="box-label"
        >
          Label
        </label>
        <textarea
          className="w-full resize-y rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="box-label"
          onChange={(e) => {
            updateObject(obj.id, {
              label: e.target.value || undefined,
            });
          }}
          placeholder="Optional label (use Enter for multiline)"
          rows={2}
          value={obj.label ?? ""}
        />
      </div>
    </>
  );
};
