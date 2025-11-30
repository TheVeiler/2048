<script lang="ts">
	import Board from '$lib/entities/Board';
	import Tile from '$lib/entities/Tile';

	const { refreshRate } = $props();

	const initCanvas = (canvas: HTMLCanvasElement) => {
		Board.attachCanvas(canvas);

		new Tile();
		new Tile();

		const gameLoop = setInterval(() => {
			Board.draw();
		}, refreshRate);
	};
</script>

<canvas width="400" height="400" use:initCanvas></canvas>

<style>
	canvas {
		border: var(--border-size) solid blue;
		height: var(--canvas-size);
		width: var(--canvas-size);
	}
</style>
