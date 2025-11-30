import type Tile from '$lib/entities/Tile';

import Board from '$lib/entities/Board';

export default class Slot {
	#id;
	get id() {
		return this.#id;
	}
	#x;
	get x() {
		return this.#x;
	}
	#y;
	get y() {
		return this.#y;
	}

	tile: Tile | null = null;

	isEmpty = () => this.tile === null;
	isOccupied = () => this.tile !== null;

	constructor(id = 0, x = 0, y = 0) {
		this.#id = id;
		this.#x = x;
		this.#y = y;
	}

	addTile(tile: Tile) {
		return new Promise((resolve, reject) => {
			this.tile = tile;
			tile.slot = this;

			resolve(this);
		});
	}

	removeTile(tile: Tile) {
		return new Promise((resolve, reject) => {
			let warnings = 0;

			if (this.tile?.id === tile.id) {
				this.tile = null;
			} else {
				warnings++;
			}

			if (tile.slot?.id === this.id) {
				tile.slot = null;
			} else {
				warnings++;
			}

			if (warnings === 2) {
				console.warn(
					`Attempted to remove tile ${tile.id} from slot ${this.id} but they are not bound.`
				);
			}

			resolve(this);
		});
	}

	getNeighbor(direction: 'top' | 'right' | 'bottom' | 'left') {
		const height = Board.slotsPerCol;
		const width = Board.slotsPerRow;

		switch (direction) {
			case 'top':
				return this.y > 0 ? Board.slots[this.#id - width] : null;
			case 'right':
				return this.x < width - 1 ? Board.slots[this.#id + 1] : null;
			case 'bottom':
				return this.y < height - 1 ? Board.slots[this.#id + width] : null;
			case 'left':
				return this.x > 0 ? Board.slots[this.#id - 1] : null;
			default:
				console.error(`Expected direction, received: ${direction}.`);
                return null;
		}
	}
}
