<script lang="ts">
	import Score from '$lib/components/Score.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Controls from '$lib/components/Controls.svelte';

    const fps = (n: number) => n <= 0 ? 1000 : 1000 / n;
	const refreshRate = fps(60);

	let { data } = $props();
	let { bestScore } = data;
</script>

<svelte:head>
	<title>2048</title>
</svelte:head>

<main id="game" class="flex items-center flex-col gap-4">
	<Score best={bestScore} />
	<Canvas {refreshRate} />
	<Controls />
</main>

<style>
	#game {
		--canvas-size: 400px;
		--border-size: 10px;

		/* user-select: none; */
		width: var(--canvas-size);
	}
</style>
