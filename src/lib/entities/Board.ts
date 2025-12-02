import * as anims from '$lib/scripts/anims';
import Slot from '$lib/entities/Slot';
import Tile from '$lib/entities/Tile';

const gap = 5;

class Board {
	static #instance: Board | null = null;

	#canvas: HTMLCanvasElement | null = null;
	#context: CanvasRenderingContext2D | null = null;

	#isLocked = false;
	get isLocked() {
		return this.#isLocked;
	}

	#slotsPerRow: number;
	get slotsPerRow() {
		return this.#slotsPerRow;
	}
	#slotsPerCol: number;
	get slotsPerCol() {
		return this.#slotsPerCol;
	}

	tiles: Tile[] = [];

	#slots: Slot[] = [];
	get slots() {
		return this.#slots;
	}
	get emptySlots() {
		return this.slots.filter((slot) => slot.tile === null);
	}
	get occupiedSlots() {
		return this.slots.filter((slot) => slot.tile !== null);
	}

	constructor(cellsPerRow = 4, cellsPerCol = 4) {
		if (Board.#instance) {
			throw new Error('Singleton class Board already has an instance.');
		}
		Board.#instance = this;

		this.#slotsPerRow = cellsPerRow;
		this.#slotsPerCol = cellsPerCol;

		for (let id = 0; id < cellsPerRow * cellsPerCol; id++) {
			const x = id % cellsPerRow;
			const y = Math.floor(id / cellsPerRow);

			this.slots.push(new Slot(id, x, y));
		}
	}

	attachCanvas(canvas: HTMLCanvasElement) {
		this.#canvas = canvas;
		this.#context = canvas.getContext('2d') as CanvasRenderingContext2D;

		Tile.fullWidth = (canvas.width - gap * (this.slotsPerRow + 1)) / this.slotsPerRow;
		Tile.fullHeight = (canvas.height - gap * (this.slotsPerCol + 1)) / this.slotsPerCol;
		Tile.spawnWidth = Tile.fullWidth / 3;
		Tile.spawnHeight = Tile.fullHeight / 3;

		return true;
	}

	getRandomEmptySlot() {
		const randomIndex = Math.floor(Math.random() * this.emptySlots.length);
		return this.emptySlots[randomIndex];
	}

	addTile(tile: Tile, slotId: Slot['id']) {
		return new Promise((resolve, reject) => {
			if (this.#canvas === null || this.#context === null) {
				reject('Canvas is not set.');
				return;
			}

			if (slotId < 0 || slotId >= this.slotsPerRow * this.slotsPerCol) {
				reject(`Invalid slot id: ${slotId}.`);
			}

			const slot = this.slots[slotId];

			if (slot.isOccupied()) {
				reject(`Slot ${slotId} is already occupied.`);
			}

			slot.addTile(tile);

			this.tiles.push(tile);
			anims.tileGrowing(tile); //! should it be waiting for the anim to end?

			if (this.emptySlots.length === 0) {
				if (
					this.slots.every((slot) => {
						const { num } = slot.tile as Tile;

						const rightNeighbor = slot.getNeighbor('right');
						const bottomNeighbor = slot.getNeighbor('bottom');

						return (
							(rightNeighbor === null || rightNeighbor.tile?.num !== num) &&
							(bottomNeighbor === null || bottomNeighbor.tile?.num !== num)
						);
					})
				) {
					//! trigger game over
					console.log('Game over');
				}
			}
		});
	}

	draw() {
		return new Promise((resolve, reject) => {
			if (this.#canvas === null || this.#context === null) {
				reject('Canvas is not set.');
				return;
			}

			this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

			// background:
			this.#context.fillStyle = 'rgb(26, 26, 30)';
			this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

			// empty slots:
			for (const { x, y } of this.slots) {
				const xRect = x * Tile.fullWidth + gap * (x + 1);
				const yRect = y * Tile.fullHeight + gap * (y + 1);
				this.#context.fillStyle = 'rgb(86, 86, 86)';
				this.#context.beginPath();
				this.#context.roundRect(xRect, yRect, Tile.fullWidth, Tile.fullHeight, gap * 2);
				this.#context.fill();
			}

			// tiles:
			for (const { x, y, width, height, style, num } of this.tiles) {
				const xRect = x * Tile.fullWidth + gap * (x + 1) + (Tile.fullWidth - width) / 2;
				const yRect = y * Tile.fullHeight + gap * (y + 1) + (Tile.fullHeight - width) / 2;
				this.#context.fillStyle = style.bgColor;
				this.#context.beginPath();
				this.#context.roundRect(xRect, yRect, width, height, gap * 2);
				this.#context.fill();

				const xText = xRect + width / 2;
				const yText = yRect + height / 2;

				this.#context.fillStyle = style.color;
				this.#context.font = style.fontSize + ' sans-serif';
				this.#context.textAlign = 'center';
				this.#context.textBaseline = 'middle';
				this.#context.globalAlpha = width / Tile.fullWidth;
				this.#context.fillText(num.toString(), xText, yText, width);
				this.#context.globalAlpha = 1; // cancels out text opacity
			}

			resolve(true);
		});
	}

	slideUp() {
		const sortingFunction = Tile.sortFromTopToBottom;
		const condition: Board.TslideCondition = (x, y) => y > 0;
		const step: Board.TslideStep = (x, y) => [x, y - 1];

		this.slide(sortingFunction, condition, step);
	}
	slideRight() {
		const sortingFunction = Tile.sortFromRightToLeft;
		const condition: Board.TslideCondition = (x, y) => x < this.slotsPerRow - 1;
		const step: Board.TslideStep = (x, y) => [x + 1, y];

		this.slide(sortingFunction, condition, step);
	}
	slideDown() {
		const sortingFunction = Tile.sortFromBottomToTop;
		const condition: Board.TslideCondition = (x, y) => y < this.slotsPerCol - 1;
		const step: Board.TslideStep = (x, y) => [x, y + 1];

		this.slide(sortingFunction, condition, step);
	}
	slideLeft() {
		const sortingFunction = Tile.sortFromLeftToRight;
		const condition: Board.TslideCondition = (x, y) => x > 0;
		const step: Board.TslideStep = (x, y) => [x - 1, y];

		this.slide(sortingFunction, condition, step);
	}
	slide(
		sortingFunction: Tile.TsortingFunction,
		condition: Board.TslideCondition,
		step: Board.TslideStep
	) {
		return new Promise((resolve, reject) => {
			if (this.#canvas === null || this.#context === null) {
				reject('Canvas is not set.');
				return;
			}

			//? be careful not to get the game locked if returning without cancelling:
			this.#isLocked = true;

			const previewBoard = [...this.slots].map(() => []);
			const getSlot = (board: Tile[][], x: number, y: number) => {
				return board[y * this.slotsPerRow + x];
			};

			const movingTiles: Tile[] = [];
			const vanishingTiles: Tile[] = [];
			const upgradingTiles: Tile[] = [];

			for (const tile of this.tiles.sort(sortingFunction)) {
				let { x, y } = tile;

				for (; condition(x, y); [x, y] = step(x, y)) {
					const [nextX, nextY] = step(x, y);
					const nextSlot = getSlot(previewBoard, nextX, nextY);

					// next slot is full:
					if (nextSlot.length === 2) break;
					// next slot contains a tile with a different num:
					if (nextSlot.length === 1 && tile.num !== nextSlot[0].num) break;
				}

				const destinationSlot = this.slots[y * this.slotsPerRow + x];
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
				this.#isLocked = false;
				return false;
			}

			Promise.all(movingTiles)
				.then(() => Promise.all(movingTiles.map((tile) => tile.move())))
				.then(() => Promise.all(vanishingTiles.map((tile) => tile.delete())))
				// Upgrade tiles in the same time as adding a new one:
				.then(() =>
					Promise.all([...upgradingTiles.map((tile) => tile.upgrade()), new Tile()])
				)
				.then(() => {
					this.#isLocked = false;

					return true;
				});

			resolve(true);
		});
	}
}

const singleton = new Board();
export default singleton;
