export default class Score {
	static #value = 0;
	static get value() {
		return Score.#value;
	}
	static get textValue() {
		return new Intl.NumberFormat(navigator.language).format(this.value);
	}

	constructor() {}

	static add(points: number) {
		return new Promise((resolve) => {
			Score.#value += points;
			resolve(Score.value);
		});
	}
}
