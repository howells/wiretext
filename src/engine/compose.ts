import { ARROW_CHARS, LINE_CHARS, getBoxChars } from "./characters";
import type {
	ArrowObject,
	BoxObject,
	GridSize,
	LineObject,
	TextObject,
	WireObject,
} from "./types";

export function createGrid(size: GridSize): string[][] {
	const grid: string[][] = [];
	for (let r = 0; r < size.rows; r++) {
		grid.push(new Array(size.cols).fill(" "));
	}
	return grid;
}

function setChar(grid: string[][], col: number, row: number, char: string) {
	if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
		grid[row][col] = char;
	}
}

function stampBox(grid: string[][], obj: BoxObject) {
	const chars = getBoxChars(obj.borderStyle);
	const { col, row } = obj.position;
	const { width, height } = obj;

	// Corners
	setChar(grid, col, row, chars.topLeft);
	setChar(grid, col + width - 1, row, chars.topRight);
	setChar(grid, col, row + height - 1, chars.bottomLeft);
	setChar(grid, col + width - 1, row + height - 1, chars.bottomRight);

	// Top and bottom edges
	for (let c = 1; c < width - 1; c++) {
		setChar(grid, col + c, row, chars.horizontal);
		setChar(grid, col + c, row + height - 1, chars.horizontal);
	}

	// Left and right edges
	for (let r = 1; r < height - 1; r++) {
		setChar(grid, col, row + r, chars.vertical);
		setChar(grid, col + width - 1, row + r, chars.vertical);
	}

	// Optional centered label
	if (obj.label) {
		const labelRow = row + Math.floor(height / 2);
		const maxLabelLen = width - 4;
		const label =
			obj.label.length > maxLabelLen
				? `${obj.label.slice(0, maxLabelLen - 1)}…`
				: obj.label;
		const labelCol = col + Math.floor((width - label.length) / 2);
		for (let i = 0; i < label.length; i++) {
			setChar(grid, labelCol + i, labelRow, label[i]);
		}
	}
}

function stampText(grid: string[][], obj: TextObject) {
	const lines = obj.content.split("\n");
	for (let r = 0; r < lines.length; r++) {
		for (let c = 0; c < lines[r].length; c++) {
			setChar(grid, obj.position.col + c, obj.position.row + r, lines[r][c]);
		}
	}
}

function stampLine(grid: string[][], obj: LineObject) {
	const { col: c1, row: r1 } = obj.position;
	const { col: c2, row: r2 } = obj.endPosition;

	if (r1 === r2) {
		// Horizontal
		const minC = Math.min(c1, c2);
		const maxC = Math.max(c1, c2);
		for (let c = minC; c <= maxC; c++) {
			setChar(grid, c, r1, LINE_CHARS.horizontal);
		}
	} else if (c1 === c2) {
		// Vertical
		const minR = Math.min(r1, r2);
		const maxR = Math.max(r1, r2);
		for (let r = minR; r <= maxR; r++) {
			setChar(grid, c1, r, LINE_CHARS.vertical);
		}
	}
}

function stampArrow(grid: string[][], obj: ArrowObject) {
	const { col: c1, row: r1 } = obj.position;
	const { col: c2, row: r2 } = obj.endPosition;

	if (r1 === r2) {
		// Horizontal
		const minC = Math.min(c1, c2);
		const maxC = Math.max(c1, c2);
		for (let c = minC; c <= maxC; c++) {
			setChar(grid, c, r1, LINE_CHARS.horizontal);
		}
		// Arrow head at end position
		setChar(grid, c2, r2, c2 > c1 ? ARROW_CHARS.right : ARROW_CHARS.left);
	} else if (c1 === c2) {
		// Vertical
		const minR = Math.min(r1, r2);
		const maxR = Math.max(r1, r2);
		for (let r = minR; r <= maxR; r++) {
			setChar(grid, c1, r, LINE_CHARS.vertical);
		}
		setChar(grid, c2, r2, r2 > r1 ? ARROW_CHARS.down : ARROW_CHARS.up);
	}
}

export function compose(objects: WireObject[], gridSize: GridSize): string[][] {
	const grid = createGrid(gridSize);
	const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);

	for (const obj of sorted) {
		switch (obj.type) {
			case "box":
				stampBox(grid, obj);
				break;
			case "text":
				stampText(grid, obj);
				break;
			case "line":
				stampLine(grid, obj);
				break;
			case "arrow":
				stampArrow(grid, obj);
				break;
		}
	}

	return grid;
}

export function gridToString(grid: string[][]): string {
	return grid
		.map((row) => {
			// Trim trailing spaces
			let end = row.length - 1;
			while (end >= 0 && row[end] === " ") end--;
			return row.slice(0, end + 1).join("");
		})
		.join("\n");
}
