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

	tile = null;

	isEmpty = _ => this.tile === null;
	isOccupied = _ => this.tile !== null;

	constructor(id = 0, x = 0, y = 0) {
		this.#id = id;
		this.#x = x;
		this.#y = y;
	}

	addTile(tile) {
		this.tile = tile;
		tile.slot = this;
		return true;
	}

    static sortFromTopToBottom = (slotA, slotB) => slotA.y - slotB.y;
    static sortFromRightToLeft = (slotA, slotB) => slotB.x - slotA.x;
    static sortFromBottomToTop = (slotA, slotB) => slotB.y - slotA.y;
    static sortFromLeftToRight = (slotA, slotB) => slotA.x - slotB.x;
}
