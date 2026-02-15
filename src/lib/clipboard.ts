import { getObjectBounds } from "@/engine/bounds";
import { compose, gridToString } from "@/engine/compose";
import { getEffectiveGridSize } from "@/engine/grid-size";
import type { GridSize, Layer, ObjectId, WireObject } from "@/engine/types";

export function composeToText(
  objects: WireObject[],
  gridSize: GridSize,
  layers?: Layer[]
): string {
  const grid = compose(objects, gridSize, layers);
  return gridToString(grid);
}

/**
 * Compose only the selected objects into text, shifted so the bounding box
 * starts at (0,0). Produces a minimal grid containing just the selection.
 */
export function composeSelectionToText(
  objects: WireObject[],
  selection: Set<ObjectId>
): string {
  const selected = objects.filter((obj) => selection.has(obj.id));
  if (selected.length === 0) {
    return "";
  }

  // Find the min col/row across all selected objects (including endPosition for lines/arrows)
  let minCol = Number.POSITIVE_INFINITY;
  let minRow = Number.POSITIVE_INFINITY;

  for (const obj of selected) {
    const bounds = getObjectBounds(obj);
    minCol = Math.min(minCol, bounds.col);
    minRow = Math.min(minRow, bounds.row);
  }

  // Shift all selected objects so the selection starts at (0,0)
  const shifted = selected.map((obj): WireObject => {
    const base = {
      ...obj,
      position: {
        col: obj.position.col - minCol,
        row: obj.position.row - minRow,
      },
    };
    if ("endPosition" in obj) {
      return {
        ...base,
        endPosition: {
          col: obj.endPosition.col - minCol,
          row: obj.endPosition.row - minRow,
        },
      } as WireObject;
    }
    return base as WireObject;
  });

  const gridSize = getEffectiveGridSize(shifted, { cols: 1, rows: 1 }, 1);
  const grid = compose(shifted, gridSize);
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
