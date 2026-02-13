import { compose, gridToString } from "@/engine/compose";
import type { GridSize, WireObject } from "@/engine/types";

export function composeToText(
  objects: WireObject[],
  gridSize: GridSize
): string {
  const grid = compose(objects, gridSize);
  return gridToString(grid);
}

export function composeToMarkdown(
  objects: WireObject[],
  gridSize: GridSize
): string {
  const text = composeToText(objects, gridSize);
  return `\`\`\`\n${text}\n\`\`\``;
}

export function composeToHtml(
  objects: WireObject[],
  gridSize: GridSize
): string {
  const text = composeToText(objects, gridSize);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre style="font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.5;">${escaped}</pre>`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
