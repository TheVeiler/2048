import Tile from '$lib/entities/Tile';
import TimingFunction from '$lib/entities/TimingFunction';

export function tileGrowing(target: Tile, duration = 180) {
	const startTime = new Date().getTime();
	const endTime = startTime + duration;

	const timingFunction = new TimingFunction(0, 0, 1, 1);

	const startWidth = target.width;
	const startHeight = target.height;

	const endWidth = Tile.fullWidth;
	const endHeight = Tile.fullHeight;

	const deltaWidth = endWidth - startWidth;
	const deltaHeight = endHeight - startHeight;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			const time = new Date().getTime();

			const deltaTime = (time - startTime) / (endTime - startTime);
			target.width = startWidth + deltaWidth * timingFunction.at(deltaTime);
			target.height = startHeight + deltaHeight * timingFunction.at(deltaTime);

			if (time >= endTime) {
				clearInterval(interval);
				// locking definitive values:
				target.width = endWidth;
				target.height = endHeight;
				resolve(target);
			}
		}, 5);
	});
}

export function tileMoving(target: Tile, end = { x: 0, y: 0 }, duration = 260) {
	const startTime = new Date().getTime();
	const endTime = startTime + duration;

	const timingFunction = new TimingFunction(0.42, 0, 0.58, 1);

	const start = { x: target.x, y: target.y };

	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			const time = new Date().getTime();

			const deltaTime = (time - startTime) / (endTime - startTime);
			target.x = start.x + deltaX * timingFunction.at(deltaTime);
			target.y = start.y + deltaY * timingFunction.at(deltaTime);

			if (time >= endTime) {
				clearInterval(interval);
				// locking definitive values:
				target.x = end.x;
				target.y = end.y;
				resolve(target);
			}
		}, 5);
	});
}

export function tileUpgrading(target: Tile, duration = 180) {
	const startTime = new Date().getTime();
	const endTime = startTime + duration;

	const timingFunction = new TimingFunction(0.25, 1.95, 0.8, -0.09);

	const startWidth = Tile.fullWidth / 2;
	const startHeight = Tile.fullHeight / 2;

	const endWidth = Tile.fullWidth;
	const endHeight = Tile.fullHeight;

	const deltaWidth = endWidth - startWidth;
	const deltaHeight = endHeight - startHeight;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			const time = new Date().getTime();

			const deltaTime = (time - startTime) / (endTime - startTime);
			target.width = startWidth + deltaWidth * timingFunction.at(deltaTime);
			target.height = startHeight + deltaHeight * timingFunction.at(deltaTime);

			if (time >= endTime) {
				clearInterval(interval);
				// locking definitive values:
				target.width = endWidth;
				target.height = endHeight;
				resolve(target);
			}
		}, 5);
	});
}
