<script>
	import Board from './Board.js';
	import Score from './Score.js';
	import Tile from './Tile.js';

	const refreshRate = 1000 / 60;

	let score = $state({ value: 0, textValue: '0' });
	let disabled = $state(false);

	function keyboardHandler(ev) {
		if (disabled) return false;

		switch (ev.keyCode) {
			case 37:
				ev.preventDefault();
				slide('left');
				break;
			case 38:
				ev.preventDefault();
				slide('up');
				break;
			case 39:
				ev.preventDefault();
				slide('right');
				break;
			case 40:
				ev.preventDefault();
				slide('down');
				break;
		}
	}

	function slide(direction) {
		disabled = true;

		switch (direction) {
			case 'up':
				Board.slideUp();
				break;
			case 'right':
				Board.slideRight();
				break;
			case 'down':
				Board.slideDown();
				break;
			case 'left':
				Board.slideLeft();
				break;
		}

		disabled = false;
	}

	let initCanvas = canvas => {
		Board.attachCanvas(canvas);

		new Tile();
		new Tile();

		const gameLoop = setInterval(() => {
			Board.draw();

			score.value = Score.value;
			score.textValue = Score.textValue;
		}, refreshRate);
	};
</script>

<svelte:window on:keydown={keyboardHandler} />

<div id="game">
	<div id="score-container">
		<p>
			Score&nbsp;:
			<span>{score.textValue}</span>
		</p>
	</div>

	<canvas width="400" height="400" use:initCanvas></canvas>

	<div id="controls">
		<button {disabled} onclick={() => slide('up')}>slide up</button>
		<button {disabled} onclick={() => slide('left')}>slide left</button>
		<button {disabled} onclick={() => slide('right')}>slide right</button>
		<button {disabled} onclick={() => slide('down')}>slide down</button>
	</div>
</div>

<style>
	#game {
		--canvas-size: 400px;
		--border-size: 10px;

		align-items: center;
		display: flex;
		flex-direction: column;
		/* user-select: none; */
		width: calc(var(--canvas-size) + 2 * var(--border-size));
	}

	#score-container {
		display: inline-block;
		text-align: right;
		width: 100%;
	}

	canvas {
		border: var(--border-size) solid blue;
		display: block;
		height: var(--canvas-size);
		margin-bottom: 1rem;
		width: var(--canvas-size);
	}

	#controls {
		display: grid;
		grid-template: repeat(3, 1fr) / repeat(7, 1fr);
		width: 70%;

		> :nth-child(1) {
			grid-area: 1 / 3 / 2 / 6;
		}
		> :nth-child(2) {
			grid-area: 2 / 1 / 3 / 4;
		}
		> :nth-child(3) {
			grid-area: 2 / 5 / 3 / 8;
		}
		> :nth-child(4) {
			grid-area: 3 / 3 / 4 / 6;
		}

		> :disabled {
			background-color: red;
		}
	}
</style>
