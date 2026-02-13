import { describe, expect, it } from "vitest";
import { compose, gridToString } from "./compose";
import type { ArrowObject, BoxObject, LineObject, TextObject } from "./types";

describe("compose", () => {
	it("creates an empty grid", () => {
		const result = gridToString(compose([], { cols: 5, rows: 3 }));
		expect(result).toBe("\n\n");
	});

	it("stamps a single-border box", () => {
		const box: BoxObject = {
			id: "1",
			type: "box",
			position: { col: 0, row: 0 },
			width: 5,
			height: 3,
			borderStyle: "single",
			zIndex: 0,
		};
		const result = gridToString(compose([box], { cols: 10, rows: 5 }));
		expect(result).toContain("┌───┐");
		expect(result).toContain("│   │");
		expect(result).toContain("└───┘");
	});

	it("stamps a double-border box", () => {
		const box: BoxObject = {
			id: "1",
			type: "box",
			position: { col: 0, row: 0 },
			width: 5,
			height: 3,
			borderStyle: "double",
			zIndex: 0,
		};
		const result = gridToString(compose([box], { cols: 10, rows: 5 }));
		expect(result).toContain("╔═══╗");
		expect(result).toContain("║   ║");
		expect(result).toContain("╚═══╝");
	});

	it("stamps a box with a label", () => {
		const box: BoxObject = {
			id: "1",
			type: "box",
			position: { col: 0, row: 0 },
			width: 10,
			height: 3,
			borderStyle: "single",
			label: "Hello",
			zIndex: 0,
		};
		const result = gridToString(compose([box], { cols: 15, rows: 5 }));
		expect(result).toContain("│ Hello  │");
	});

	it("stamps text", () => {
		const text: TextObject = {
			id: "1",
			type: "text",
			position: { col: 2, row: 1 },
			content: "Hi",
			zIndex: 0,
		};
		const result = gridToString(compose([text], { cols: 10, rows: 5 }));
		const lines = result.split("\n");
		expect(lines[1]).toContain("Hi");
	});

	it("stamps multiline text", () => {
		const text: TextObject = {
			id: "1",
			type: "text",
			position: { col: 0, row: 0 },
			content: "AB\nCD",
			zIndex: 0,
		};
		const result = gridToString(compose([text], { cols: 5, rows: 5 }));
		const lines = result.split("\n");
		expect(lines[0]).toBe("AB");
		expect(lines[1]).toBe("CD");
	});

	it("stamps a horizontal line", () => {
		const line: LineObject = {
			id: "1",
			type: "line",
			position: { col: 1, row: 1 },
			endPosition: { col: 5, row: 1 },
			zIndex: 0,
		};
		const result = gridToString(compose([line], { cols: 10, rows: 5 }));
		const lines = result.split("\n");
		expect(lines[1]).toContain("─────");
	});

	it("stamps a vertical line", () => {
		const line: LineObject = {
			id: "1",
			type: "line",
			position: { col: 2, row: 0 },
			endPosition: { col: 2, row: 3 },
			zIndex: 0,
		};
		const result = gridToString(compose([line], { cols: 5, rows: 5 }));
		const lines = result.split("\n");
		for (let r = 0; r <= 3; r++) {
			expect(lines[r]).toContain("│");
		}
	});

	it("stamps a horizontal arrow pointing right", () => {
		const arrow: ArrowObject = {
			id: "1",
			type: "arrow",
			position: { col: 0, row: 0 },
			endPosition: { col: 4, row: 0 },
			zIndex: 0,
		};
		const result = gridToString(compose([arrow], { cols: 10, rows: 3 }));
		expect(result).toContain("────→");
	});

	it("stamps a vertical arrow pointing down", () => {
		const arrow: ArrowObject = {
			id: "1",
			type: "arrow",
			position: { col: 0, row: 0 },
			endPosition: { col: 0, row: 3 },
			zIndex: 0,
		};
		const result = gridToString(compose([arrow], { cols: 5, rows: 5 }));
		const lines = result.split("\n");
		expect(lines[0]).toBe("│");
		expect(lines[3]).toBe("↓");
	});

	it("respects zIndex ordering", () => {
		const box: BoxObject = {
			id: "1",
			type: "box",
			position: { col: 0, row: 0 },
			width: 5,
			height: 3,
			borderStyle: "single",
			zIndex: 0,
		};
		const text: TextObject = {
			id: "2",
			type: "text",
			position: { col: 0, row: 0 },
			content: "X",
			zIndex: 1,
		};
		const result = gridToString(compose([box, text], { cols: 10, rows: 5 }));
		const lines = result.split("\n");
		// Text (zIndex 1) overwrites box corner (zIndex 0)
		expect(lines[0][0]).toBe("X");
	});

	it("clips objects to grid bounds", () => {
		const box: BoxObject = {
			id: "1",
			type: "box",
			position: { col: -1, row: -1 },
			width: 5,
			height: 3,
			borderStyle: "single",
			zIndex: 0,
		};
		// Should not throw
		const result = compose([box], { cols: 3, rows: 3 });
		expect(result.length).toBe(3);
	});
});
