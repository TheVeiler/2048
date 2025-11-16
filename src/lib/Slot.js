import board from './Board.js';

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

	tile;

	isEmpty = (_) => this.tile === null;
	isOccupied = (_) => this.tile !== null;

	constructor(id = 0, x = 0, y = 0) {
		this.#id = id;
		this.#x = x;
		this.#y = y;
		this.tile = null;
	}
}
