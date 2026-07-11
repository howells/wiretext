import type { WireObject } from "@wiretext/engine";

import { FieldLabel } from "./shared-controls";

export const TextProperties = ({
  obj,
}: {
  obj: Extract<WireObject, { type: "text" }>;
}) => (
  <div>
    <FieldLabel>Content</FieldLabel>
    <span className="text-text text-xs">
      {obj.content.length > 30
        ? `${obj.content.slice(0, 30)}...`
        : obj.content || "(empty)"}
    </span>
  </div>
);
