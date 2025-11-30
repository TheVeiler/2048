import * as anims from '$lib/scripts/anims';
import Slot from '$lib/entities/Slot';
import Tile from '$lib/entities/Tile';

const gap = 5;

class Board {
	static #hasInstance = false;

	static #canvas: HTMLCanvasElement;
	static #context: CanvasRenderingContext2D;

	static #isLocked = false;
	static get isLocked() {
		return Board.#isLocked;
	}

	static slotsPerRow: number;
	static slotsPerCol: number;

	static tiles: Tile[] = [];

	static #slots: Slot[] = [];
	static get slots() {
		return Board.#slots;
	}
	static get emptySlots() {
		return Board.slots.filter((slot) => slot.tile === null);
	}
	static get occupiedSlots() {
		return Board.slots.filter((slot) => slot.tile !== null);
	}

	constructor(cellsPerRow = 4, cellsPerCol = 4) {
		if (Board.#hasInstance) {
			throw new Error('Singleton class Board already has an instance.');
		}
		Board.#hasInstance = true;

		Board.slotsPerRow = cellsPerRow;
		Board.slotsPerCol = cellsPerCol;

		for (let id = 0; id < cellsPerRow * cellsPerCol; id++) {
			const x = id % cellsPerRow;
			const y = Math.floor(id / cellsPerRow);

			Board.slots.push(new Slot(id, x, y));
		}
	}

	static attachCanvas(canvas: HTMLCanvasElement) {
		Board.#canvas = canvas;
		Board.#context = canvas.getContext('2d') as CanvasRenderingContext2D;

		Tile.fullWidth = (canvas.width - gap * (Board.slotsPerRow + 1)) / Board.slotsPerRow;
		Tile.fullHeight = (canvas.height - gap * (Board.slotsPerCol + 1)) / Board.slotsPerCol;
		Tile.spawnWidth = Tile.fullWidth / 3;
		Tile.spawnHeight = Tile.fullHeight / 3;

		return true;
	}
	static requiresCanvas() {
		if (Board.#canvas === undefined) {
			throw new Error('Canvas is not set.');
		}
		return true;
	}

	static getRandomEmptySlot() {
		const randomIndex = Math.floor(Math.random() * Board.emptySlots.length);
		return Board.emptySlots[randomIndex];
	}

	static addTile(tile: Tile, slotId: Slot['id']) {
		Board.requiresCanvas();

		return new Promise((resolve, reject) => {
			if (slotId < 0 || slotId >= Board.slotsPerRow * Board.slotsPerCol) {
				reject(`Invalid slot id: ${slotId}.`);
			}

			const slot = Board.slots[slotId];

			if (slot.isOccupied()) {
				reject(`Slot ${slotId} is already occupied.`);
			}

			slot.addTile(tile);

			Board.tiles.push(tile);
			anims.tileGrowing(tile);
		});
	}

	static draw() {
		Board.requiresCanvas();

		return new Promise((resolve, reject) => {
			Board.#context.clearRect(0, 0, Board.#canvas.width, Board.#canvas.height);

			// background:
			Board.#context.fillStyle = 'rgb(26, 26, 30)';
			Board.#context.fillRect(0, 0, Board.#canvas.width, Board.#canvas.height);

			// empty slots:
			for (const { x, y } of Board.slots) {
				const xRect = x * Tile.fullWidth + gap * (x + 1);
				const yRect = y * Tile.fullHeight + gap * (y + 1);
				Board.#context.fillStyle = 'rgb(86, 86, 86)';
				Board.#context.beginPath();
				Board.#context.roundRect(xRect, yRect, Tile.fullWidth, Tile.fullHeight, gap * 2);
				Board.#context.fill();
			}

			// tiles:
			for (const { x, y, width, height, style, num } of Board.tiles) {
				const xRect = x * Tile.fullWidth + gap * (x + 1) + (Tile.fullWidth - width) / 2;
				const yRect = y * Tile.fullHeight + gap * (y + 1) + (Tile.fullHeight - width) / 2;
				Board.#context.fillStyle = style.bgColor;
				Board.#context.beginPath();
				Board.#context.roundRect(xRect, yRect, width, height, gap * 2);
				Board.#context.fill();

				const xText = xRect + width / 2;
				const yText = yRect + height / 2;

				Board.#context.fillStyle = style.color;
				Board.#context.font = style.fontSize + ' sans-serif';
				Board.#context.textAlign = 'center';
				Board.#context.textBaseline = 'middle';
				Board.#context.globalAlpha = width / Tile.fullWidth;
				Board.#context.fillText(num.toString(), xText, yText, width);
				Board.#context.globalAlpha = 1; // cancels out text opacity
			}

			resolve(true);
		});
	}

	static slideUp() {
		const sortingFunction = Tile.sortFromTopToBottom;
		const condition: Board.TslideCondition = (x, y) => y > 0;
		const step: Board.TslideStep = (x, y) => [x, y - 1];

		Board.slide(sortingFunction, condition, step);
	}
	static slideRight() {
		const sortingFunction = Tile.sortFromRightToLeft;
		const condition: Board.TslideCondition = (x, y) => x < Board.slotsPerRow - 1;
		const step: Board.TslideStep = (x, y) => [x + 1, y];

		Board.slide(sortingFunction, condition, step);
	}
	static slideDown() {
		const sortingFunction = Tile.sortFromBottomToTop;
		const condition: Board.TslideCondition = (x, y) => y < Board.slotsPerCol - 1;
		const step: Board.TslideStep = (x, y) => [x, y + 1];

		Board.slide(sortingFunction, condition, step);
	}
	static slideLeft() {
		const sortingFunction = Tile.sortFromLeftToRight;
		const condition: Board.TslideCondition = (x, y) => x > 0;
		const step: Board.TslideStep = (x, y) => [x - 1, y];

		Board.slide(sortingFunction, condition, step);
	}
	static slide(
		sortingFunction: Tile.TsortingFunction,
		condition: Board.TslideCondition,
		step: Board.TslideStep
	) {
		Board.requiresCanvas();

		//? be careful not to get the game locked if returning without cancelling:
		Board.#isLocked = true;

		const previewBoard = [...Board.slots].map(() => []);
		const getSlot = (board: Tile[][], x: number, y: number) => {
			return board[y * Board.slotsPerRow + x];
		};

		const movingTiles: Tile[] = [];
		const vanishingTiles: Tile[] = [];
		const upgradingTiles: Tile[] = [];

		for (const tile of Board.tiles.sort(sortingFunction)) {
			let { x, y } = tile;

			for (; condition(x, y); [x, y] = step(x, y)) {
				const [nextX, nextY] = step(x, y);
				const nextSlot = getSlot(previewBoard, nextX, nextY);

				// next slot is full:
				if (nextSlot.length === 2) break;
				// next slot contains a tile with a different num:
				if (nextSlot.length === 1 && tile.num !== nextSlot[0].num) break;
			}

			const destinationSlot = Board.slots[y * Board.slotsPerRow + x];
			const previewSlot = getSlot(previewBoard, x, y);

			if (tile.slot) {
				tile.slot.tile = null;
			}
			tile.slot = destinationSlot;
			destinationSlot.addTile(tile);

			if (x !== tile.x || y !== tile.y) {
				tile.nextX = x;
				tile.nextY = y;
				movingTiles.push(tile);
			}

			previewSlot.push(tile);

			if (previewSlot.length === 2) {
				vanishingTiles.push(previewSlot[0]);
				upgradingTiles.push(previewSlot[1]);
			}
		}

		// cancels slide if resulting in no change:
		if (movingTiles.length === 0) {
			Board.#isLocked = false;
			return false;
		}

		Promise.all(movingTiles)
			.then(() => Promise.all(movingTiles.map((tile) => tile.move())))
			.then(() => Promise.all(vanishingTiles.map((tile) => tile.delete())))
			.then(() => Promise.all(upgradingTiles.map((tile) => tile.upgrade())))
			.then(() => {
				new Tile();

				Board.#isLocked = false;

				return true;
			});

		return true;
	}
}

const singleton = new Board();
export default Board;
