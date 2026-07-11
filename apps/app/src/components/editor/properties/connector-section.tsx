import type { ConnectorSide, WireObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import { FieldLabel, HeadsField } from "./shared-controls";

export const ArrowProperties = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "arrow" }>;
}) => <HeadsField obj={obj} />;

const connectorSides: (ConnectorSide | "auto")[] = [
  "auto",
  "top",
  "bottom",
  "left",
  "right",
];

/** Narrow a select value to a connector side; "auto" clears the override. */
const parseConnectorSide = (value: string): ConnectorSide | undefined => {
  switch (value) {
    case "top":
    case "bottom":
    case "left":
    case "right": {
      return value;
    }
    default: {
      return undefined;
    }
  }
};

export const ConnectorProperties = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "connector" }>;
}) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const objects = useEditorStore((s) => s.objects);
  const fromObj = objects.find((o) => o.id === obj.fromId);
  const toObj = objects.find((o) => o.id === obj.toId);

  return (
    <>
      <div>
        <FieldLabel>From</FieldLabel>
        <span className="text-text text-xs">
          {fromObj?.name ?? fromObj?.type ?? "unknown"}
        </span>
      </div>

      <div>
        <FieldLabel>To</FieldLabel>
        <span className="text-text text-xs">
          {toObj?.name ?? toObj?.type ?? "unknown"}
        </span>
      </div>

      <div>
        <FieldLabel>From side</FieldLabel>
        <select
          className="w-full rounded bg-surface-hover px-1.5 py-1 text-text text-xs outline-none"
          onChange={(e) => {
            updateObject(obj.id, {
              fromSide: parseConnectorSide(e.target.value),
            });
          }}
          value={obj.fromSide ?? "auto"}
        >
          {connectorSides.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>To side</FieldLabel>
        <select
          className="w-full rounded bg-surface-hover px-1.5 py-1 text-text text-xs outline-none"
          onChange={(e) => {
            updateObject(obj.id, {
              toSide: parseConnectorSide(e.target.value),
            });
          }}
          value={obj.toSide ?? "auto"}
        >
          {connectorSides.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>

      <HeadsField obj={obj} />

      <div>
        <label
          className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
          htmlFor="connector-label"
        >
          Label
        </label>
        <input
          className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="connector-label"
          onChange={(e) => {
            updateObject(obj.id, {
              label: e.target.value || undefined,
            });
          }}
          placeholder="Optional label"
          type="text"
          value={obj.label ?? ""}
        />
      </div>
    </>
  );
};
