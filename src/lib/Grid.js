import * as anims from "./anims.js";
import Tile from "./Tile.js";

const gap = 5;

class Grid {
    #canvas = undefined;
    #context = undefined;

    static cellsPerRow;
    // static get cellsPerRow() {
    //     return Grid.#cellsPerRow;
    // }
    static cellsPerCol;
    // get cellsPerCol() {
    //     return this.#cellsPerCol;
    // }
    #grid;
    #slots = [];

    get cells() {
        return this.#grid.flat();
    }
    get emptyCells() {
        return this.cells.filter((cell) => cell.tile === null);
    }
    get filledCells() {
        return this.cells.filter((cell) => cell.tile !== null);
    }

    get state() {
        return this.#grid
            .map((row) =>
                row.map((cell) => (cell.tile === null ? 0 : cell.tile.num)).join("")
            )
            .join("-");
    }

    constructor(cellsPerRow = 4, cellsPerCol = 4) {
        this.#grid = new Array(cellsPerCol)
            .fill()
            .map((_, y) =>
                new Array(cellsPerRow).fill().map((_, x) => ({ x, y, tile: null }))
            );
        Grid.cellsPerRow = cellsPerRow;
        Grid.cellsPerCol = cellsPerCol;

        for (let id = 0; id < cellsPerRow * cellsPerCol; id++) {
            this.#slots.push(new Slot(id));
        }
    }

    attachCanvas(canvas) {
        this.#canvas = canvas;
        this.#context = canvas.getContext("2d");

        Tile.fullWidth = (canvas.width - gap * (Grid.cellsPerRow + 1)) / Grid.cellsPerRow;
        Tile.fullHeight = (canvas.height - gap * (Grid.cellsPerCol + 1)) / Grid.cellsPerCol;
        Tile.spawnWidth = Tile.fullWidth / 3;
        Tile.spawnHeight = Tile.fullHeight / 3;

        return true;
    }

    getCol(x) {
        return this.#grid.map((row) => row[x]);
    }

    getRow(y) {
        return this.#grid[y];
    }

    getRandomEmptyCell() {
        const emptyCells = this.cells.filter((cell) => cell.tile === null);
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }

    addTile(x, y, tile) {
        if (this.#canvas === undefined) return false;

        if (this.#grid[y][x].tile === null) {
            this.#grid[y][x].tile = tile;
            return true;
        }
    }

    moveTile(x, y, xDest, yDest) {
        if (this.#canvas === undefined) return false;

        if (x < 0 || x >= Grid.cellsPerRow) return false;
        if (y < 0 || y >= Grid.cellsPerCol) return false;
        if (xDest < 0 || xDest >= Grid.cellsPerRow) return false;
        if (yDest < 0 || yDest >= Grid.cellsPerCol) return false;

        const tile = this.#grid[y][x].tile;

        this.#grid[y][x].tile = null;
        this.#grid[yDest][xDest].tile = tile;

        //anims.tileMoving(this.#grid[y][x], { x: xDest, y: yDest });

        return true;
    }

    mergeTiles(x, y, xDest, yDest) {
        if (this.#canvas === undefined) return false;

        if (x < 0 || x >= Grid.cellsPerRow) return false;
        if (y < 0 || y >= Grid.cellsPerCol) return false;
        if (xDest < 0 || xDest >= Grid.cellsPerRow) return false;
        if (yDest < 0 || yDest >= Grid.cellsPerCol) return false;

        if (this.#grid[y][x].tile == null) return false;
        if (this.#grid[yDest][xDest].tile == null) return false;

        if (this.#grid[y][x].tile.num !== this.#grid[yDest][xDest].tile.num)
            return false;

        this.#grid[y][x].tile = null;
        this.#grid[yDest][xDest].tile.double();

        return true;
    }

    draw() {
        if (this.#canvas === undefined) return false;

        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        // background:
        this.#context.fillStyle = "rgb(26, 26, 30)";
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        // empty slots:
        for (const { x, y } of this.#slots) {
            const xRect = x * Tile.fullWidth + gap * (x + 1);
            const yRect = y * Tile.fullHeight + gap * (y + 1);
            this.#context.fillStyle = "rgb(86, 86, 86)";
            this.#context.beginPath();
            this.#context.roundRect(xRect, yRect, Tile.fullWidth, Tile.fullHeight, gap * 2);
            this.#context.fill();
        }

        // tiles:
        for (let { x, y, tile } of this.filledCells) {
            const { width, height, style } = tile;

            const xRect = x * Tile.fullWidth + gap * (x + 1) + (Tile.fullWidth - width) / 2;
            const yRect = y * Tile.fullHeight + gap * (y + 1) + (Tile.fullHeight - width) / 2;
            this.#context.fillStyle = style.bgColor;
            this.#context.beginPath();
            this.#context.roundRect(xRect, yRect, width, height, gap * 2)
            this.#context.fill();

            const xText = xRect + width / 2;
            const yText = yRect + height / 2;

            this.#context.fillStyle = style.color;
            this.#context.font = style.fontSize + " sans-serif";
            this.#context.textAlign = "center";
            this.#context.textBaseline = "middle";
            this.#context.globalAlpha = width / Tile.fullWidth;
            this.#context.fillText(tile.num, xText, yText, width);
            this.#context.globalAlpha = 1; // cancels out text opacity
        }

        return true;
    }

    slideUp() {
        if (this.#canvas === undefined) return false;

        const fromTopToBottom = (cellA, cellB) => cellA.y - cellB.y;

        let state;
        do {
            state = this.state;

            for (let { x, y, tile } of this.filledCells.sort(fromTopToBottom)) {
                if (this.#grid[y - 1]?.[x].tile === null) {
                    this.moveTile(x, y, x, y - 1);
                }
                if (this.#grid[y - 1]?.[x].tile.num === tile.num) {
                    this.mergeTiles(x, y, x, y - 1);
                }
            }
        } while (state !== this.state);

        new Tile();

        return true;
    }
    slideRight() {
        if (this.#canvas === undefined) return false;

        const fromRightToLeft = (cellA, cellB) => cellB.x - cellA.x;

        let state;
        do {
            state = this.state;

            for (let { x, y, tile } of this.filledCells.sort(fromRightToLeft)) {
                if (this.#grid[y][x + 1]?.tile === null) {
                    this.moveTile(x, y, x + 1, y);
                }
                if (this.#grid[y][x + 1]?.tile.num === tile.num) {
                    this.mergeTiles(x, y, x + 1, y);
                }
            }
        } while (state !== this.state);

        new Tile();

        return true;
    }
    slideDown() {
        if (this.#canvas === undefined) return false;

        const fromBottomToTop = (cellA, cellB) => cellB.y - cellA.y;

        let state;
        do {
            state = this.state;

            for (let { x, y, tile } of this.filledCells.sort(fromBottomToTop)) {
                if (this.#grid[y + 1]?.[x].tile === null) {
                    this.moveTile(x, y, x, y + 1);
                }
                if (this.#grid[y + 1]?.[x].tile.num === tile.num) {
                    this.mergeTiles(x, y, x, y + 1);
                }
            }
        } while (state !== this.state);

        new Tile();

        return true;
    }
    slideLeft() {
        if (this.#canvas === undefined) return false;

        const fromLeftToRight = (cellA, cellB) => cellA.x - cellB.x;

        let state;
        do {
            state = this.state;

            for (let { x, y, tile } of this.filledCells.sort(fromLeftToRight)) {
                if (this.#grid[y][x - 1]?.tile === null) {
                    this.moveTile(x, y, x - 1, y);
                }
                if (this.#grid[y][x - 1]?.tile.num === tile.num) {
                    this.mergeTiles(x, y, x - 1, y);
                }
            }
        } while (state !== this.state);

        new Tile();

        return true;
    }
}

class Slot {
    #id
    get id() { return this.#id; }
    #x
    get x() { return this.#x; }
    #y
    get y() { return this.#y; }

    constructor(id = 0) {
        this.#id = id;
        this.#x = id % Grid.cellsPerRow;
        this.#y = Math.floor(id / Grid.cellsPerRow);
    }
}

export default new Grid(); // makes Grid a singleton
