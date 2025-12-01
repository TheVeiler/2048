import type Slot from '$lib/entities/Slot';

import * as anims from '$lib/scripts/anims';
import Board from '$lib/entities/Board';
import Score from '$lib/entities/Score';

export default class Tile {
	static #lastUsedId = 0;
	#id;
	get id() {
		return this.#id;
	}

	width;
	height;

	x;
	y;
	slot: Slot | null = null;

	nextX;
	nextY;

	#num: TpowerOfTwo;
	get num() {
		return this.#num;
	}

	#styleList: Record<TpowerOfTwo, Tile.Tstyle> = {
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

	static spawnWidth: number;
	static fullWidth: number;
	static spawnHeight: number;
	static fullHeight: number;

	constructor(num: TpowerOfTwo = Math.random() >= 0.9 ? 4 : 2) {
		this.#id = Tile.#lastUsedId++;

		this.width = Tile.spawnWidth;
		this.height = Tile.spawnHeight;
		this.#num = num;

		const { x, y, id: slotId } = Board.getRandomEmptySlot();

		this.x = x;
		this.y = y;
		this.nextX = x;
		this.nextY = y;

		Board.addTile(this, slotId).catch((errorMessage) => {
			console.error(errorMessage);
		});
	}

	move() {
		return new Promise((resolve, reject) => {
			const x = this.nextX;
			const y = this.nextY;

			anims
				.tileMoving(this, { x, y })
				// wait for the animation to end:
				.then(() => resolve(true));
		});
	}

	upgrade() {
		return new Promise((resolve, reject) => {
			this.#num *= 2;
			Score.add(this.#num);

			anims
				.tileUpgrading(this)
				// wait for the animation to end:
				.then(() => resolve(true));
		});
	}

	delete() {
		return new Promise((resolve, reject) => {
			Board.tiles = Board.tiles.filter((tile) => tile.id !== this.id);

			if (this.slot !== null) {
				this.slot.removeTile(this);
			}

			resolve(true);
		});
	}

	static sortFromTopToBottom: Tile.TsortingFunction = (tileA, tileB) => tileA.y - tileB.y;
	static sortFromRightToLeft: Tile.TsortingFunction = (tileA, tileB) => tileB.x - tileA.x;
	static sortFromBottomToTop: Tile.TsortingFunction = (tileA, tileB) => tileB.y - tileA.y;
	static sortFromLeftToRight: Tile.TsortingFunction = (tileA, tileB) => tileA.x - tileB.x;
}
