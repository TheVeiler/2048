import { cubicBezier } from '$lib/scripts/utils';
import Tile from '$lib/entities/Tile';

export function tileGrowing(target: Tile, duration = 100) {
	const startTime = new Date().getTime();
	const endTime = startTime + duration;

	const timingFunction = cubicBezier(0, 0, 1, 1);

	const startWidth = target.width;
	const startHeight = target.height;

	const endWidth = Tile.fullWidth;
	const endHeight = Tile.fullHeight;

	const deltaWidth = endWidth - startWidth;
	const deltaHeight = endHeight - startHeight;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			const time = new Date().getTime();

			if (time >= endTime) {
				clearInterval(interval);
				// locking definitive values:
				target.width = endWidth;
				target.height = endHeight;
				resolve(target);
				//? strangely, resolve doesnt stop the function:
				return true;
			}

			const deltaTime = (time - startTime) / (endTime - startTime);
			target.width = startWidth + deltaWidth * timingFunction(deltaTime);
			target.height = startHeight + deltaHeight * timingFunction(deltaTime);
		}, 5);
	});
}

export function tileMoving(target: Tile, end = { x: 0, y: 0 }, duration = 300) {
	const startTime = new Date().getTime();
	const endTime = startTime + duration;

	const timingFunction = cubicBezier(0.42, 0, 0.58, 1);

	const start = { x: target.x, y: target.y };

	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			const time = new Date().getTime();

			if (time >= endTime) {
				clearInterval(interval);
				// locking definitive values:
				target.x = end.x;
				target.y = end.y;
				resolve(target);
				//? strangely, resolve doesnt stop the function:
				return true;
			}

			const deltaTime = (time - startTime) / (endTime - startTime);
			target.x = start.x + deltaX * timingFunction(deltaTime);
			target.y = start.y + deltaY * timingFunction(deltaTime);
		}, 5);
	});
}

export function tileUpgrading(target: Tile, duration = 300) {
	// const startTime = new Date().getTime();
	// const endTime = startTime + duration;
	// const timingFunction = cubicBezier(0.13, 1.8, 0.45, 0.82);
	// const startWidth = target.width;
	// const startHeight = target.height;
	// const endWidth = Tile.fullWidth;
	// const endHeight = Tile.fullHeight;
	// const deltaWidth = endWidth - startWidth;
	// const deltaHeight = endHeight - startHeight;
	// return new Promise((resolve, reject) => {
	// 	const interval = setInterval(() => {
	// 		const time = new Date().getTime();
	//  		if (time >= endTime) {
	// 			clearInterval(interval);
	// 			// locking definitive values:
	// 			target.width = endWidth;
	// 			target.height = endHeight;
	// 			resolve(target);
	// 			//? strangely, resolve doesnt stop the function:
	// 			return true;
	// 		}
	// 		const deltaTime = (time - startTime) / (endTime - startTime);
	// 		target.width = startWidth + deltaWidth * timingFunction(deltaTime);
	// 		target.height = startHeight + deltaHeight * timingFunction(deltaTime);
	// 	}, 5);
	// });
}
