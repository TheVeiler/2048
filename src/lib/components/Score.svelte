<script lang="ts">
	import Score from '$lib/entities/Score';

	let { best } = $props();
	let { value } = $state(Score);
</script>

<div id="score-container" class="inline-block text-right self-end">
	<p>
		Score: <span>{value}</span>
	</p>
	<p class="text-xs">
		Best: <span>{best}</span>
	</p>
</div>
