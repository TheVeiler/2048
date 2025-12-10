<script lang="ts">
	import Board from '$lib/entities/Board';

	function slide(direction: 'up' | 'left' | 'right' | 'down') {
		if (Board.isLocked) return false;

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
	}

	function keyboardHandler(ev: KeyboardEvent) {
		switch (ev.key) {
			case 'ArrowLeft':
			case 'a': // QWERTY
			case 'q': // AZERTY
				ev.preventDefault();
				slide('left');
				break;
			case 'ArrowUp':
			case 'w': // QWERTY
			case 'z': // AZERTY
				ev.preventDefault();
				slide('up');
				break;
			case 'ArrowRight':
			case 'd':
				ev.preventDefault();
				slide('right');
				break;
			case 'ArrowDown':
			case 's':
				ev.preventDefault();
				slide('down');
				break;
		}
	}
</script>

<div id="controls" class="grid w-1/2 grid-rows-3 grid-cols-7">
	<button onclick={() => slide('up')}>up</button>
	<button onclick={() => slide('left')}>left</button>
	<button onclick={() => slide('right')}>right</button>
	<button onclick={() => slide('down')}>down</button>
</div>

<svelte:window on:keydown={keyboardHandler} />

<style>
	#controls {
		button {
			text-transform: uppercase;
		}

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
	}
</style>
