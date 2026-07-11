"use client";

import { useEditorStore } from "@/store";

import { BoxProperties } from "./properties/box-section";
import { ComponentProperties } from "./properties/component-section";
import {
  ArrowProperties,
  ConnectorProperties,
} from "./properties/connector-section";
import { AnnotationField, FieldLabel } from "./properties/shared-controls";
import { TextProperties } from "./properties/text-section";

export const PropertiesPanel = () => {
  const selection = useEditorStore((s) => s.selection);
  const objects = useEditorStore((s) => s.objects);

  const selectedObjects = objects.filter((o) => selection.has(o.id));

  if (selectedObjects.length === 0) {
    return <p className="text-text-dim text-xs">No selection</p>;
  }

  if (selectedObjects.length > 1) {
    // Check if selection forms a single group
    const groupIds = new Set(
      selectedObjects.flatMap((o) =>
        o.groupId !== undefined && o.groupId !== "" ? [o.groupId] : []
      )
    );
    const [firstGroupId] = groupIds;
    const isSingleGroup =
      groupIds.size === 1 &&
      selectedObjects.every((o) => o.groupId === firstGroupId);

    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-dim text-xs">
          {isSingleGroup
            ? `Group (${selectedObjects.length} objects)`
            : `${selectedObjects.length} objects selected`}
        </p>
        {isSingleGroup && (
          <button
            className="rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
            onClick={() => {
              useEditorStore.getState().ungroupSelection();
            }}
            type="button"
          >
            Ungroup
          </button>
        )}
      </div>
    );
  }

  const [obj] = selectedObjects;
  if (!obj) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <FieldLabel>Type</FieldLabel>
        <span className="text-text text-xs">{obj.type}</span>
      </div>

      <div>
        <FieldLabel>Position</FieldLabel>
        <span className="text-text text-xs">
          {obj.position.col}, {obj.position.row}
        </span>
      </div>

      {obj.type === "box" && <BoxProperties obj={obj} />}
      {obj.type === "text" && <TextProperties obj={obj} />}
      {obj.type === "arrow" && <ArrowProperties obj={obj} />}
      {obj.type === "connector" && <ConnectorProperties obj={obj} />}
      {obj.type === "component" && <ComponentProperties obj={obj} />}

      <AnnotationField obj={obj} />
    </div>
  );
};
