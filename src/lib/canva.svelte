<script>
    let canvas;
    let context;
    let grid;
    let interval;

    const fps = 20;
    const gridWidth = 4;
    const gridHeight = 4;

    function keyboardHandler(ev) {
        switch(ev.keyCode) {
            case 37:
                grid.slideLeft();
                break;
            case 38:
                grid.slideUp();
                break;
            case 39:
                grid.slideRight();
                break;
            case 40:
                grid.slideDown();
                break;
        }
    }

    let initCanva = (canva) => {
        canvas = canva;
        context = canva.getContext('2d');
        grid = new Grid();

        new Tile();
        new Tile();

        //grid.draw();
        interval = setInterval(() => grid.draw(), 1000/fps);
    }

    class Grid {
        #grid;
        #width;
        get width() { return this.#width; }
        #height;
        get height() { return this.#height; }

        #tileWidth;
        get tileWidth() { return this.#tileWidth; }
        #tileHeight;
        get tileHeight() { return this.#tileHeight; }

        get cells() { return this.#grid.flat(); }
        get emptyCells() { return this.cells.filter(cell => cell.tile === null); }
        get filledCells() { return this.cells.filter(cell => cell.tile !== null); }

        get state() { return this.#grid.map(row => row.map(cell => cell.tile === null ? 0 : cell.tile.num).join('')).join('-'); }

        constructor(width = gridWidth, height = gridHeight) {
            this.#grid = new Array(height).fill().map((_, y) => new Array(width).fill().map((_, x) => ({ x, y, tile: null })));
            this.#width = width;
            this.#height = height;
            
            this.#tileWidth = canvas.width / this.width;
            this.#tileHeight = canvas.height / this.height;
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
            if (this.#grid[y][x].tile === null) {
                this.#grid[y][x].tile = tile;
                return true;
            }
        }

        moveTile(x, y, xDest, yDest) {
            if (x < 0 || x >= this.width) return false;
            if (y < 0 || y >= this.height) return false;
            if (xDest < 0 || xDest >= this.width) return false;
            if (yDest < 0 || yDest >= this.height) return false;

            const tile = this.#grid[y][x].tile;

            this.#grid[y][x].tile = null;
            this.#grid[yDest][xDest].tile = tile;

            return true;
        }

        mergeTiles(x, y, xDest, yDest) {
            if (x < 0 || x >= this.width) return false;
            if (y < 0 || y >= this.height) return false;
            if (xDest < 0 || xDest >= this.width) return false;
            if (yDest < 0 || yDest >= this.height) return false;

            if (this.#grid[y][x].tile == null) return false;
            if (this.#grid[yDest][xDest].tile == null) return false;

            if (this.#grid[y][x].tile.num !== this.#grid[yDest][xDest].tile.num) return false;

            this.#grid[y][x].tile = null;
            this.#grid[yDest][xDest].tile.double();

            return true;
        }

        draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            const { tileWidth, tileHeight } = this;

            for (let {x, y, tile} of this.filledCells) {
                const style = tile.style;

                context.fillStyle = style.bgColor;
                context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);

                const xText = x * tileWidth + tileWidth / 2;
                const yText = y * tileWidth + tileHeight / 2;
                context.fillStyle = style.color;
                context.font = style.fontSize + " sans-serif"
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(tile.num, xText, yText, tileWidth);
            }

            return true;
        }

        slideUp() {
            const fromTopToBottom = (cellA, cellB) => cellA.y - cellB.y;

            let state;
            do {
                state = this.state;

                for (let {x, y, tile} of this.filledCells.sort(fromTopToBottom)) {
                    if (this.#grid[y - 1]?.[x].tile === null) {
                        this.moveTile(x, y, x, y - 1);
                    }
                    if (this.#grid[y - 1]?.[x].tile.num === tile.num) {
                        this.mergeTiles(x, y, x, y - 1);
                    }
                }
            } while (state !== this.state)

            new Tile();

            return true;
        }
        slideRight() {
            const fromRightToLeft = (cellA, cellB) => cellB.x - cellA.x;

            let state;
            do {
                state = this.state;

                for (let {x, y, tile} of this.filledCells.sort(fromRightToLeft)) {
                    if (this.#grid[y][x + 1]?.tile === null) {
                        this.moveTile(x, y, x + 1, y);
                    }
                    if (this.#grid[y][x + 1]?.tile.num === tile.num) {
                        this.mergeTiles(x, y, x + 1, y);
                    }
                }
            } while (state !== this.state)

            new Tile();

            return true;
        }
        slideDown() {
            const fromBottomToTop = (cellA, cellB) => cellB.y - cellA.y;

            let state;
            do {
                state = this.state;

                for (let {x, y, tile} of this.filledCells.sort(fromBottomToTop)) {
                    if (this.#grid[y + 1]?.[x].tile === null) {
                        this.moveTile(x, y, x, y + 1);
                    }
                    if (this.#grid[y + 1]?.[x].tile.num === tile.num) {
                        this.mergeTiles(x, y, x, y + 1);
                    }
                }
            } while (state !== this.state)

            new Tile();

            return true;
        }
        slideLeft() {
            const fromLeftToRight = (cellA, cellB) => cellA.x - cellB.x;

            let state;
            do {
                state = this.state;

                for (let {x, y, tile} of this.filledCells.sort(fromLeftToRight)) {
                    if (this.#grid[y][x - 1]?.tile === null) {
                        this.moveTile(x, y, x - 1, y);
                    }
                    if (this.#grid[y][x - 1]?.tile.num === tile.num) {
                        this.mergeTiles(x, y, x - 1, y);
                    }
                }
            } while (state !== this.state)

            new Tile();

            return true;
        }
    }

    class Tile {
        #num;
        get num() { return this.#num; }

        #styleList = {
            2: {
                bgColor: 'rgb(238,228,218)',
                color: 'rgb(119,110,101)',
                fontSize: '30px'
            },
            4: {
                bgColor: 'rgb(237,224,200)',
                color: 'rgb(119,110,101)',
                fontSize: '30px'
            },
            8: {
                bgColor: 'rgb(242,177,121)',
                color: 'rgb(249,246,242)',
                fontSize: '30px'
            },
            16: {
                bgColor: 'rgb(245,149,99)',
                color: 'rgb(249,246,242)',
                fontSize: '25px'
            },
            32: {
                bgColor: 'rgb(246,124,96)',
                color: 'rgb(249,246,242)',
                fontSize: '25px'
            },
            64: {
                bgColor: 'rgb(246,94,59)',
                color: 'rgb(249,246,242)',
                fontSize: '25px'
            },
            128: {
                bgColor: 'rgb(237,207,115)',
                color: 'rgb(249,246,242)',
                fontSize: '20px'
            },
            256: {
                bgColor: 'rgb(237,204,98)',
                color: 'rgb(249,246,242)',
                fontSize: '20px'
            },
            512: {
                bgColor: 'rgb(237,200,80)',
                color: 'rgb(249,246,242)',
                fontSize: '20px'
            },
            1024: {
                bgColor: 'rgb(237,197,63)',
                color: 'rgb(249,246,242)',
                fontSize: '15px'
            },
            2048: {
                bgColor: 'rgb(237,194,45)',
                color: 'rgb(249,246,242)',
                fontSize: '15px'
            }
        };
        get style() { return this.#styleList[this.#num]; }

        constructor(num) {
            if (num === undefined) num = Math.random() >= .9 ? 4 : 2;
            this.#num = num;
            const {x, y} = grid.getRandomEmptyCell();
            grid.addTile(x, y, this);
        }

        double() {
            this.#num *= 2;
        }
    }
</script>

<svelte:window on:keydown|preventDefault={keyboardHandler} />

<canvas width="400" height="400" use:initCanva></canvas>

<br /><button on:click={() => grid.slideUp()}>slide up</button>
<br /><button on:click={() => grid.slideLeft()}>slide left</button><button on:click={() => grid.slideRight()}>slide right</button>
<br /><button on:click={() => grid.slideDown()}>slide down</button>

<style>
    canvas {
        border: 10px solid blue;
        user-select: none;
    }
</style>