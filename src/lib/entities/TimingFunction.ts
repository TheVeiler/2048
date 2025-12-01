import { cubicBezier } from '$lib/scripts/utils';

const precision = 100;

export default class TimingFunction {
	#positions: number[] = [];

	constructor(x2: number, y2: number, x3: number, y3: number) {
		const curve = cubicBezier(x2, y2, x3, y3);

		for (let i = 0; i <= precision; i++) {
			this.#positions.push(curve(i / precision).y);
		}
	}

	at(progress: number) {
		progress = Math.min(Math.max(0, progress), 1);

		return this.#positions[Math.floor(progress * (precision + 1))];
	}
}
