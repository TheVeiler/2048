import * as anims from "./anims.js";
import Tile from "./Tile.js";

const gridWidth = 4;
const gridHeight = 4;

class Grid {
  #grid;
  #width;
  get width() {
    return this.#width;
  }
  #height;
  get height() {
    return this.#height;
  }

  #tileWidth;
  get tileWidth() {
    return this.#tileWidth;
  }
  #tileHeight;
  get tileHeight() {
    return this.#tileHeight;
  }

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

  #canvas = undefined;
  #context = undefined;

  constructor(width = gridWidth, height = gridHeight) {
    this.#grid = new Array(height)
      .fill()
      .map((_, y) =>
        new Array(width).fill().map((_, x) => ({ x, y, tile: null }))
      );
    this.#width = width;
    this.#height = height;
  }

  attachCanvas(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d");

    this.#tileWidth = canvas.width / this.width;
    this.#tileHeight = canvas.height / this.height;

    Tile.fullWidth = canvas.width / this.width;
    Tile.fullHeight = canvas.height / this.height;
    Tile.spawnWidth = Tile.fullWidth / 2;
    Tile.spawnHeight = Tile.fullHeight / 2;

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

    if (x < 0 || x >= this.width) return false;
    if (y < 0 || y >= this.height) return false;
    if (xDest < 0 || xDest >= this.width) return false;
    if (yDest < 0 || yDest >= this.height) return false;

    const tile = this.#grid[y][x].tile;

    this.#grid[y][x].tile = null;
    this.#grid[yDest][xDest].tile = tile;

    //anims.tileMoving(this.#grid[y][x], { x: xDest, y: yDest });

    return true;
  }

  mergeTiles(x, y, xDest, yDest) {
    if (this.#canvas === undefined) return false;

    if (x < 0 || x >= this.width) return false;
    if (y < 0 || y >= this.height) return false;
    if (xDest < 0 || xDest >= this.width) return false;
    if (yDest < 0 || yDest >= this.height) return false;

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

    const { tileWidth, tileHeight } = this;

    for (let { x, y, tile } of this.filledCells) {
      const { width, height, style } = tile;

      const xRect = x * Tile.fullWidth + (Tile.fullWidth - width) / 2;
      const yRect = y * Tile.fullHeight + (Tile.fullHeight - width) / 2;
      this.#context.fillStyle = style.bgColor;
      this.#context.fillRect(xRect, yRect, width, height);

      const xText = x * tileWidth + tileWidth / 2;
      const yText = y * tileWidth + tileHeight / 2;
      this.#context.fillStyle = style.color;
      this.#context.font = style.fontSize + " sans-serif";
      this.#context.textAlign = "center";
      this.#context.textBaseline = "middle";
      this.#context.globalAlpha = width / Tile.fullWidth;
      this.#context.fillText(tile.num, xText, yText, tileWidth);
      this.#context.globalAlpha = 1; // cancels out text opacity
    }

    for (let { x, y } of this.emptyCells) {
      const xRect = x * Tile.fullWidth;
      const yRect = y * Tile.fullHeight;

      this.#context.fillStyle = "rgb(26, 26, 30)";
      this.#context.fillRect(xRect, yRect, Tile.fullWidth, Tile.fullHeight);
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

export default new Grid();
