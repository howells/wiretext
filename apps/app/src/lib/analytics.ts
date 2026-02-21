import type { ToolType } from "@wiretext/engine";
import posthog from "posthog-js";

export function trackToolSelected(tool: ToolType) {
  posthog.capture("tool_selected", { tool });
}

export function trackObjectCreated(objectType: string) {
  posthog.capture("object_created", { object_type: objectType });
}

export function trackExport(format: string) {
  posthog.capture("document_exported", { format });
}

export function trackShare() {
  posthog.capture("document_shared");
}

export function trackClearAll() {
  posthog.capture("canvas_cleared");
}

export function trackDocumentLoaded() {
  posthog.capture("shared_document_loaded");
}
