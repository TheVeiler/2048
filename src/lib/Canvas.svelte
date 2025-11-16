<script>
	import board from './Board.js';
	import Tile from './Tile.js';

	const refreshRate = 1000 / 60;

	function keyboardHandler(ev) {
		switch (ev.keyCode) {
			case 37:
				ev.preventDefault();
				board.slideLeft();
				break;
			case 38:
				ev.preventDefault();
				board.slideUp();
				break;
			case 39:
				ev.preventDefault();
				board.slideRight();
				break;
			case 40:
				ev.preventDefault();
				board.slideDown();
				break;
		}
	}

	let initCanvas = (canva) => {
		board.attachCanvas(canva);

		new Tile();
		new Tile();

		const gameLoop = setInterval(() => board.draw(), refreshRate);
	};
</script>

<svelte:window on:keydown={keyboardHandler} />

<canvas width="400" height="400" use:initCanvas></canvas>

<br /><button on:click={() => board.slideUp()}>slide up</button>
<br /><button on:click={() => board.slideLeft()}>slide left</button><button
	on:click={() => board.slideRight()}>slide right</button
>
<br /><button on:click={() => board.slideDown()}>slide down</button>

<style>
	canvas {
		border: 10px solid blue;
		/* user-select: none; */
	}
</style>
