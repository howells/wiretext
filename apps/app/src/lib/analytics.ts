// Named wrappers over posthog.capture, one per product event. Every helper
// routes through `capture`, which no-ops unless PostHog was initialized with a
// key (see posthog.ts). This keeps the helpers safe to call unconditionally
// from actions and components, and keeps a keyless clone free of posthog-js
// "not initialized" warnings.
import type { ToolType } from "@wiretext/engine";
import posthog from "posthog-js";

import { isPostHogEnabled } from "./posthog";

const capture = (event: string, properties?: Record<string, unknown>): void => {
  if (!isPostHogEnabled()) {
    return;
  }
  posthog.capture(event, properties);
};

export const trackToolSelected = (tool: ToolType) => {
  capture("tool_selected", { tool });
};

export const trackObjectCreated = (objectType: string) => {
  capture("object_created", { object_type: objectType });
};

export const trackExport = (format: string) => {
  capture("document_exported", { format });
};

export const trackShare = () => {
  capture("document_shared");
};

export const trackClearAll = () => {
  capture("canvas_cleared");
};

export const trackDocumentLoaded = () => {
  capture("shared_document_loaded");
};
