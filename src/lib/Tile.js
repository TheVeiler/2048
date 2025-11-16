import board from './Board.js';

export default class Tile {
	static #lastUsedId = -1;
	#id;
	get id() {
		return this.#id;
	}

	width;
	height;

	x;
	y;
	slot;

	#num;
	get num() {
		return this.#num;
	}

	#styleList = {
		2: {
			bgColor: 'rgb(238,228,218)',
			color: 'rgb(119,110,101)',
			fontSize: '30px'
		},
		4: {
			bgColor: 'rgb(237,224,200)',
			color: 'rgb(119,110,101)',
			fontSize: '30px'
		},
		8: {
			bgColor: 'rgb(242,177,121)',
			color: 'rgb(249,246,242)',
			fontSize: '30px'
		},
		16: {
			bgColor: 'rgb(245,149,99)',
			color: 'rgb(249,246,242)',
			fontSize: '25px'
		},
		32: {
			bgColor: 'rgb(246,124,96)',
			color: 'rgb(249,246,242)',
			fontSize: '25px'
		},
		64: {
			bgColor: 'rgb(246,94,59)',
			color: 'rgb(249,246,242)',
			fontSize: '25px'
		},
		128: {
			bgColor: 'rgb(237,207,115)',
			color: 'rgb(249,246,242)',
			fontSize: '20px'
		},
		256: {
			bgColor: 'rgb(237,204,98)',
			color: 'rgb(249,246,242)',
			fontSize: '20px'
		},
		512: {
			bgColor: 'rgb(237,200,80)',
			color: 'rgb(249,246,242)',
			fontSize: '20px'
		},
		1024: {
			bgColor: 'rgb(237,197,63)',
			color: 'rgb(249,246,242)',
			fontSize: '15px'
		},
		2048: {
			bgColor: 'rgb(237,194,45)',
			color: 'rgb(249,246,242)',
			fontSize: '15px'
		}
	};
	get style() {
		return this.#styleList[this.#num];
	}

	static spawnWidth;
	static fullWidth;
	static spawnHeight;
	static fullHeight;

	constructor(num = Math.random() >= 0.9 ? 4 : 2) {
		this.#id = Tile.#lastUsedId + 1;
		Tile.#lastUsedId += 1;

		this.width = Tile.spawnWidth;
		this.height = Tile.spawnHeight;
		this.#num = num;

		const { x, y, id: slotId } = board.getRandomEmptySlot();

		this.x = x;
		this.y = y;

		board.addTile(this, slotId).catch((errorMessage) => {
			console.error(errorMessage);
		});
	}

	double() {
		this.#num *= 2;
		return true;
	}
}
