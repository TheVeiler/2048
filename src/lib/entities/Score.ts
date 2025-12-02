class Score {
	static #instance: Score | null = null;

	#value = 0;
	get value() {
		return this.#value;
	}
	get textValue() {
		return new Intl.NumberFormat(navigator.language).format(this.value);
	}

	constructor() {
		if (Score.#instance) {
			throw new Error('Singleton class Score already has an instance.');
		}
		Score.#instance = this;
	}

	add(points: number) {
		return new Promise((resolve, reject) => {
			this.#value += points;
			resolve(this.value);
		});
	}
}

const singleton = new Score();
export default singleton;
