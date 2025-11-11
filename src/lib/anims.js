import { cubicBezier } from "./utils.js";
import Tile from "./Tile.js";

export function tileGrowing(target, duration = 200) {
    const startTime = new Date().getTime();
    const endTime = startTime + duration;

    const timingFunction = cubicBezier(0, 0, 1, 1);

    const startWidth = target.width;
    const startHeight = target.height;

    const endWidth = Tile.fullWidth;
    const endHeight = Tile.fullHeight;

    const deltaWidth = endWidth - startWidth;
    const deltaHeight = endHeight - startHeight;

    const interval = setInterval((_) => {
        let time = new Date().getTime();

        if (time >= endTime) {
            clearInterval(interval);
            // locking definitive values:
            target.width = endWidth;
            target.height = endHeight;
            return;
        }

        const deltaTime = (time - startTime) / (endTime - startTime);
        target.width = startWidth + deltaWidth * timingFunction(deltaTime);
        target.height = startHeight + deltaHeight * timingFunction(deltaTime);
    }, 5);
}

export function tileMoving(
    target,
    end = { x: 0, y: 0 },
    duration = 300
) {
    const startTime = new Date().getTime();
    const endTime = startTime + duration;

    const timingFunction = cubicBezier(0.75, 0, 0, 1);

    const start = { x: target.x, y: target.y };

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    const interval = setInterval((_) => {
        let time = new Date().getTime();

        if (time >= endTime) {
            clearInterval(interval);
            // locking definitive values:
            target.x = end.x;
            target.y = end.y;
            return;
        }

        const deltaTime = (time - startTime) / (endTime - startTime);
        target.x = start.x + deltaX * timingFunction(deltaTime);
        target.y = start.y + deltaY * timingFunction(deltaTime);
    }, 5);
}

export function tilesMerging(target, duration = 300) { }
