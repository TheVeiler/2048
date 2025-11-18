export default class Score {
	static #value = 0;
	static get value() {
		return Score.#value;
	}

	constructor() {}

	static add(points) {
		return new Promise(resolve => {
			Score.#value += points;
			resolve(Score.value);
		});
	}
}
