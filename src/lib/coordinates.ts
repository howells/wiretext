import type { CharMetrics, GridPoint, Viewport } from "@/engine/types";

export function screenToGrid(
	screenX: number,
	screenY: number,
	viewport: Viewport,
	metrics: CharMetrics,
): GridPoint {
	const worldX = (screenX - viewport.panX) / viewport.zoom;
	const worldY = (screenY - viewport.panY) / viewport.zoom;
	return {
		col: Math.floor(worldX / metrics.charWidth),
		row: Math.floor(worldY / metrics.lineHeight),
	};
}

export function gridToScreen(
	col: number,
	row: number,
	viewport: Viewport,
	metrics: CharMetrics,
): { x: number; y: number } {
	return {
		x: col * metrics.charWidth * viewport.zoom + viewport.panX,
		y: row * metrics.lineHeight * viewport.zoom + viewport.panY,
	};
}
