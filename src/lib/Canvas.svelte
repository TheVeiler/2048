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

	let initCanvas = canvas => {
		board.attachCanvas(canvas);

		new Tile();
		new Tile();

		const gameLoop = setInterval(() => board.draw(), refreshRate);
	};
</script>

<svelte:window on:keydown={keyboardHandler} />

<div id="game">
	<div id="score-container">
		<p>
			Score&nbsp;:
			<span>0</span>
		</p>
	</div>

	<canvas width="400" height="400" use:initCanvas></canvas>

	<br /><button on:click={() => board.slideUp()}>slide up</button>
	<br /><button on:click={() => board.slideLeft()}>slide left</button><button
		on:click={() => board.slideRight()}>slide right</button
	>
	<br /><button on:click={() => board.slideDown()}>slide down</button>
</div>

<style>
	#game {
		--canvas-size: 400px;
		--border-size: 10px;

		width: calc(var(--canvas-size) + 2 * var(--border-size));
	}

	#score-container {
		display: inline-block;
		text-align: right;
		width: 100%;
	}

	canvas {
		border: var(--border-size) solid blue;
		height: var(--canvas-size);
		width: var(--canvas-size);
		/* user-select: none; */
	}
</style>
