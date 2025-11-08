<script>
    let context;
    let grid;

    let initCanva = (canva) => {
        grid = new Grid();
        context = canva.getContext('2d');

        // context.fillStyle = 'red';
        // context.fillRect(0, 0, 200, 200);

        // console.log(grid.cells);

        new Tile();
        // console.log(grid);
    }

    class Grid {
        #grid;
        #width;
        get width() { return this.#width; }
        #height;
        get height() { return this.#height; }
        get cells() { return this.#grid.flat(); }
        get emptyCells() { return this.cells.filter(cell => cell.tile === null); }
        get filledCells() { return this.cells.filter(cell => cell.tile !== null); }

        constructor(width = 5, height = 5) {
            this.#width = width;
            this.#height = height;
            this.#grid = new Array(height).fill().map((row, y) => new Array(width).fill().map((_, x) => ({ x, y, tile: null })));
        }

        getCol(x) {
            return this.#grid.map(row => row[x]);
        }

        getRow(y) {
            return this.#grid[y];
        }

        getRandomEmptyCell() {
            const emptyCells = this.cells.filter(cell => cell.tile === null);
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            return emptyCells[randomIndex];
        }

        addTile(x, y, tile) {
            console.log('new tile:', x, y, tile);

            if (this.#grid[y][x].tile === null) {
                this.#grid[y][x].tile = tile;
            }
        }

        draw() {
            
        }

        shiftToTop() {

        }

        shiftToRight() {

        }

        shiftToBottom() {
            
        }

        shiftToLeft() {

        }
    }

    class Tile {
        #number;
        get number() { return this.#number; }

        #width = 40;
        #height = 40;

        constructor(number) {
            if (number === undefined) number = Math.floor(Math.random() * 2) + 1;
            this.#number = number;
            const {x, y} = grid.getRandomEmptyCell();
            grid.addTile(x, y, this);
        }
    }
</script>

<canvas width="400" height="400" use:initCanva></canvas>

<style>
    canvas {
        border: 10px solid blue;
    }
</style>