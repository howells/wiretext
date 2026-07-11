// Named wrappers over posthog.capture, one per product event. When PostHog was
// never initialized (no key — see posthog.ts), capture is a silent no-op, so
// these are safe to call unconditionally from actions and components.
import type { ToolType } from "@wiretext/engine";
import posthog from "posthog-js";

export const trackToolSelected = (tool: ToolType) => {
  posthog.capture("tool_selected", { tool });
};

export const trackObjectCreated = (objectType: string) => {
  posthog.capture("object_created", { object_type: objectType });
};

export const trackExport = (format: string) => {
  posthog.capture("document_exported", { format });
};

export const trackShare = () => {
  posthog.capture("document_shared");
};

export const trackClearAll = () => {
  posthog.capture("canvas_cleared");
};

export const trackDocumentLoaded = () => {
  posthog.capture("shared_document_loaded");
};
