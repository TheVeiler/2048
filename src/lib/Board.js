import * as anims from './anims.js';
import Slot from './Slot.js';
import Tile from './Tile.js';

const gap = 5;

class Board {
	static #hasInstance = false;

	static #canvas;
	static #context;

	static slotsPerRow;
	static slotsPerCol;

	static tiles = [];

	static #slots = [];
	static get slots() {
		return Board.#slots;
	}
	static get emptySlots() {
		return Board.slots.filter(slot => slot.tile === null);
	}
	static get occupiedSlots() {
		return Board.slots.filter(slot => slot.tile !== null);
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

	static attachCanvas(canvas) {
		Board.#canvas = canvas;
		Board.#context = canvas.getContext('2d');

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

	static addTile(tile, slotId) {
		Board.requiresCanvas();

		return new Promise((resolve, reject) => {
			if (slotId < 0 || slotId >= Board.slotsPerRow * Board.slotsPerCol) {
				reject(`Invalid slot id: ${slotId}.`);
			}
			if (Board.slots[slotId].isOccupied()) {
				reject(`Slot ${slotId} is already occupied.`);
			}

			Board.tiles.push(tile);
			Board.slots[slotId].tile = tile;

			tile.slot = Board.slots[slotId];

			anims.tileGrowing(tile);

			resolve(tile);
		});
	}

	static draw() {
		Board.requiresCanvas();

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
			Board.#context.fillText(num, xText, yText, width);
			Board.#context.globalAlpha = 1; // cancels out text opacity
		}

		return true;
	}

	static slideUp() {
		const sortingFunction = Slot.sortFromTopToBottom;
		const condition = (x, y) => y > 0;
		const step = (x, y) => [x, y - 1];

		Board.slide(sortingFunction, condition, step);
	}
	static slideRight() {
		const sortingFunction = Slot.sortFromRightToLeft;
		const condition = (x, y) => x < Board.slotsPerRow - 1;
		const step = (x, y) => [x + 1, y];

		Board.slide(sortingFunction, condition, step);
	}
	static slideDown() {
		const sortingFunction = Slot.sortFromBottomToTop;
		const condition = (x, y) => y < Board.slotsPerCol - 1;
		const step = (x, y) => [x, y + 1];

		Board.slide(sortingFunction, condition, step);
	}
	static slideLeft() {
		const sortingFunction = Slot.sortFromLeftToRight;
		const condition = (x, y) => x > 0;
		const step = (x, y) => [x - 1, y];

		Board.slide(sortingFunction, condition, step);
	}
	static slide(sortingFunction, condition, step) {
		Board.requiresCanvas();

		const previewBoard = [...Board.slots].map(_ => []);
		const getSlot = (board, x, y) => {
			return board[y * Board.slotsPerRow + x];
		};

		const movingTiles = [];
		const vanishingTiles = [];
		const upgradingTiles = [];

		for (const tile of Board.tiles.sort(sortingFunction)) {
			let { x, y } = tile;

			for (; condition(x, y); [x, y] = step(x, y)) {
				const [nextX, nextY] = step(x, y);
				const nextSlot = getSlot(previewBoard, nextX, nextY);

				if (nextSlot[1] !== undefined) break; // next slot is full
				if (nextSlot[0] !== undefined && tile.num !== nextSlot[0].num) break; // next slot contains a tile with different num
			}

			const destinationSlot = Board.slots[y * Board.slotsPerRow + x];
			const previewSlot = getSlot(previewBoard, x, y);

			tile.slot.tile = null;
			tile.slot = destinationSlot;
			destinationSlot.addTile(tile);

			previewSlot.push(tile);

			if (x !== tile.x || y !== tile.y) {
				movingTiles.push(anims.tileMoving(tile, { x, y }));
			}

			if (previewSlot.length === 2) {
				vanishingTiles.push(previewSlot[0]);
				upgradingTiles.push(previewSlot[1]);
			}
		}

		if (movingTiles.length === 0) {
			//! dev only; normally return false
			new Tile();
			return true;
		}

		Promise.all(movingTiles)
			.then(_ => Promise.all(vanishingTiles.map(tile => tile.delete())))
			.then(_ => Promise.all(upgradingTiles.map(tile => tile.upgrade())))
			.then(_ => {
				new Tile();

				return true;
			});

		return true;
	}
}

const singleton = new Board();
export default Board;
