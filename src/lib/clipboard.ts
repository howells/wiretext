import { compose, gridToString } from "@/engine/compose";
import type { GridSize, Layer, WireObject } from "@/engine/types";

export function composeToText(
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string {
  const grid = compose(objects, gridSize, layers);
  return gridToString(grid);
}

export function composeToMarkdown(
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string {
  const text = composeToText(objects, gridSize, layers);
  return `\`\`\`\n${text}\n\`\`\``;
}

export function composeToHtml(
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string {
  const text = composeToText(objects, gridSize, layers);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre style="font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.5;">${escaped}</pre>`;
}

export function composeToGitHub(
  objects: WireObject[],
  gridSize: GridSize,
  shareUrl?: string,
  layers?: Layer[]
): string {
  const text = composeToText(objects, gridSize, layers);
  const lines = [
    "<details>",
    "<summary>Wireframe</summary>",
    "",
    "```",
    text,
    "```",
  ];
  if (shareUrl) {
    lines.push("", `[Edit in Wiretext](${shareUrl})`);
  }
  lines.push("", "</details>");
  return lines.join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
