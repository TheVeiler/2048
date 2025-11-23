import type Tile from '$lib/entities/Tile';

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
}
