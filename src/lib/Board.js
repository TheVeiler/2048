import * as anims from "./anims.js";
import Slot from "./Slot.js";
import Tile from "./Tile.js";

const gap = 5;

class Board {
    static #hasInstance = false;

    static #canvas;
    static #context;

    static slotsPerRow;
    static slotsPerCol;

    static #tiles = [];
    static get tiles() {
        return Board.#tiles;
    }

    static #slots = [];
    static get slots() {
        return Board.#slots;
    }
    static get emptySlots() {
        return Board.slots.filter((slot) => slot.tile === null);
    }
    static get occupiedSlots() {
        return Board.slots.filter((slot) => slot.tile !== null);
    }

    static get state() {
        return Board.slots
            .map((slot) => (slot.tile === null ? 0 : slot.tile.num))
            .join("");
    }

    constructor(cellsPerRow = 4, cellsPerCol = 4) {
        if (Board.#hasInstance) {
            throw new Error("Singleton class Board already has an instance.");
        }
        Board.#hasInstance = true;

        Board.slotsPerRow = cellsPerRow;
        Board.slotsPerCol = cellsPerCol;

        for (let id = 0; id < cellsPerRow * cellsPerCol; id++) {
            const x = id % cellsPerRow;
            const y = Math.floor(id / cellsPerRow);

            Board.slots.push(new Slot(id, x, y));
        }
    }

    static attachCanvas(canvas) {
        Board.#canvas = canvas;
        Board.#context = canvas.getContext("2d");

        Tile.fullWidth =
            (canvas.width - gap * (Board.slotsPerRow + 1)) / Board.slotsPerRow;
        Tile.fullHeight =
            (canvas.height - gap * (Board.slotsPerCol + 1)) / Board.slotsPerCol;
        Tile.spawnWidth = Tile.fullWidth / 3;
        Tile.spawnHeight = Tile.fullHeight / 3;

        return true;
    }
    static requiresCanvas() {
        if (Board.#canvas === undefined) {
            throw new Error("Canvas is not set.");
        }
        return true;
    }

    static getTopSlot(slot) {
        return Board.slots[slot.id - Board.slotsPerRow];
    }
    static getRightSlot(slot) {
        return Board.slots[slot.id + 1];
    }
    static getBottomSlot(slot) {
        return Board.slots[slot.id + Board.slotsPerRow];
    }
    static getLeftSlot(slot) {
        return Board.slots[slot.id - 1];
    }

    static getRandomEmptySlot() {
        const randomIndex = Math.floor(Math.random() * Board.emptySlots.length);
        return Board.emptySlots[randomIndex];
    }

    static addTile(tile, slotId) {
        Board.requiresCanvas();

        return new Promise((resolve, reject) => {
            if (slotId < 0 || slotId >= Board.slotsPerRow * Board.slotsPerCol) {
                reject(`Invalid slot id: ${slotId}.`);
            }
            if (Board.slots[slotId].isOccupied()) {
                reject(`Slot ${slotId} already occupied.`);
            }

            Board.tiles.push(tile);
            Board.slots[slotId].tile = tile;

            tile.slot = Board.slots[slotId];

            anims.tileGrowing(tile);

            resolve(tile);
        });
    }

    static moveTile(startSlotId, endSlotId) {
        Board.requiresCanvas();

        return new Promise((resolve, reject) => {
            if (startSlotId < 0 || startSlotId >= Board.slotsPerRow * Board.slotsPerCol) {
                reject(`Invalid slot id: ${startSlotId}.`);
            }
            if (endSlotId < 0 || endSlotId >= Board.slotsPerRow * Board.slotsPerCol) {
                reject(`Invalid slot id: ${endSlotId}.`);
            }

            const startSlot = Board.slots[startSlotId];
            const endSlot = Board.slots[endSlotId];

            const tile = startSlot.tile;
            tile.x = endSlot.x;
            tile.y = endSlot.y;

            startSlot.tile = null;
            endSlot.tile = tile;

            resolve(tile);
        });
    }

    static removeTiles(...tileIds) {
        Board.requiresCanvas();

        for (const tileId of tileIds) {
            const tile = Board.tiles.find(tile => tile.id === tileId);

            tile.slot.tile = null;

            Board.#tiles = Board.tiles.filter(tile => tile.id !== tileId);
        }

        return true;
    }

    static upgradeTiles(...tileIds) {
        Board.requiresCanvas();

        for (const tileId of tileIds) {
            const tile = Board.tiles.find(tile => tile.id === tileId);

            if (tile === undefined) return false;

            tile.double();
        }

        return true;
    }

    static draw() {
        Board.requiresCanvas();

        Board.#context.clearRect(0, 0, Board.#canvas.width, Board.#canvas.height);

        // background:
        Board.#context.fillStyle = "rgb(26, 26, 30)";
        Board.#context.fillRect(0, 0, Board.#canvas.width, Board.#canvas.height);

        // empty slots:
        for (const { x, y } of Board.slots) {
            const xRect = x * Tile.fullWidth + gap * (x + 1);
            const yRect = y * Tile.fullHeight + gap * (y + 1);
            Board.#context.fillStyle = "rgb(86, 86, 86)";
            Board.#context.beginPath();
            Board.#context.roundRect(
                xRect,
                yRect,
                Tile.fullWidth,
                Tile.fullHeight,
                gap * 2
            );
            Board.#context.fill();
        }

        // tiles:
        for (const { x, y, width, height, style, num } of Board.tiles) {
            const xRect =
                x * Tile.fullWidth + gap * (x + 1) + (Tile.fullWidth - width) / 2;
            const yRect =
                y * Tile.fullHeight + gap * (y + 1) + (Tile.fullHeight - width) / 2;
            Board.#context.fillStyle = style.bgColor;
            Board.#context.beginPath();
            Board.#context.roundRect(xRect, yRect, width, height, gap * 2);
            Board.#context.fill();

            const xText = xRect + width / 2;
            const yText = yRect + height / 2;

            Board.#context.fillStyle = style.color;
            Board.#context.font = style.fontSize + " sans-serif";
            Board.#context.textAlign = "center";
            Board.#context.textBaseline = "middle";
            Board.#context.globalAlpha = width / Tile.fullWidth;
            Board.#context.fillText(num, xText, yText, width);
            Board.#context.globalAlpha = 1; // cancels out text opacity
        }

        return true;
    }

    static slideUp() {
        Board.requiresCanvas();

        const fromTopToBottom = (slotA, slotB) => slotA.y - slotB.y;

        const movingTiles = [];

        const disappearingTiles = [];
        const upgradingTiles = [];
        const canUpgrade = slot => !upgradingTiles.includes(slot.id);

        for (const tile of Board.tiles.sort(fromTopToBottom)) {
            let { x, y } = tile;
            let neighborSlot = Board.getTopSlot(tile.slot);

            while (neighborSlot?.isEmpty()) {
                tile.slot.tile = null;

                tile.slot = neighborSlot;
                neighborSlot.tile = tile;

                y -= 1;
                neighborSlot = Board.getTopSlot(tile.slot);
            }

            if (neighborSlot?.tile.num === tile.num && canUpgrade(neighborSlot)) {
                y -= 1;
                disappearingTiles.push(tile.id);
                upgradingTiles.push(neighborSlot.tile.id);
            }

            if (y !== tile.y) {
                movingTiles.push(anims.tileMoving(tile, { x, y }));
            }
        }

        Board.slide__after(movingTiles, disappearingTiles, upgradingTiles);
    }
    static slideRight() { }
    static slideDown() {
        Board.requiresCanvas();

        const fromBottomToTop = (slotA, slotB) => slotB.y - slotA.y; //? change required here

        const movingTiles = [];

        const disappearingTiles = [];
        const upgradingTiles = [];
        const canUpgrade = slot => !upgradingTiles.includes(slot.id);

        for (const tile of Board.tiles.sort(fromBottomToTop)) { //? change required here
            let { x, y } = tile;
            let neighborSlot = Board.getBottomSlot(tile.slot); //? change required here

            while (neighborSlot?.isEmpty()) {
                tile.slot.tile = null;

                tile.slot = neighborSlot;
                neighborSlot.tile = tile;

                y += 1; //? change required here
                neighborSlot = Board.getBottomSlot(tile.slot); //? change required here
            }

            if (neighborSlot?.tile.num === tile.num && canUpgrade(neighborSlot)) {
                y += 1; //? change required here
                disappearingTiles.push(tile.id);
                upgradingTiles.push(neighborSlot.tile.id);
            }

            if (y !== tile.y) { //? change required here
                movingTiles.push(anims.tileMoving(tile, { x, y }));
            }
        }

        Board.slide__after(movingTiles, disappearingTiles, upgradingTiles);
    }
    static slideLeft() { }

    static slide__after(movingTiles, disappearingTiles, upgradingTiles) {
        if (movingTiles.length === 0) {
            new Tile();
            return true;
        }

        Promise.all(movingTiles).then(() => {
            Board.removeTiles(...disappearingTiles);
            Board.upgradeTiles(...upgradingTiles);

            new Tile();
        });

        return true;
    }
}

const singleton = new Board();
export default Board;
