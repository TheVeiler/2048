export function cubicBezier(x2: number, y2: number, x3: number, y3: number) {
	const x1 = 0;
	const y1 = 0;
	const x4 = 1;
	const y4 = 1;

	return (t: number) => {
		const xt =
			x1 * (1 - t) ** 3 + 3 * x2 * t * (1 - t) ** 2 + 3 * x3 * t ** 2 * (1 - t) + x4 * t ** 3;
		const yt =
			y1 * (1 - t) ** 3 + 3 * y2 * t * (1 - t) ** 2 + 3 * y3 * t ** 2 * (1 - t) + y4 * t ** 3;

		return (xt * yt) / t || 0;
	};
}
