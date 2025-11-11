<script>
    import grid from './Grid.js';
    import Tile from './Tile.js';

    const refreshRate = 1000/60;

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

    let initCanvas = (canva) => {
        grid.attachCanvas(canva);

        new Tile();
        new Tile();

        const gameLoop = setInterval(() => grid.draw(), refreshRate);
    }
</script>

<svelte:window on:keydown|preventDefault={keyboardHandler} />

<canvas width="400" height="400" use:initCanvas></canvas>

<br /><button on:click={() => grid.slideUp()}>slide up</button>
<br /><button on:click={() => grid.slideLeft()}>slide left</button><button on:click={() => grid.slideRight()}>slide right</button>
<br /><button on:click={() => grid.slideDown()}>slide down</button>

<style>
    canvas {
        border: 10px solid blue;
        /* user-select: none; */
    }
</style>