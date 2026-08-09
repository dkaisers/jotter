<script lang="ts">
	import Spaces from './Spaces.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="mx-auto w-full max-w-[60rem] px-4 pt-6 sm:px-6 sm:pt-8">
	<h1
		class="text-2xl font-semibold tracking-tight text-on-surface"
		style="font-family: 'Lora Variable', Georgia, 'Times New Roman', serif;"
	>
		jotter
	</h1>

	{#if mounted}
		<div class="mt-4">
			<Spaces />
		</div>
	{/if}
</div>

<main class="mx-auto w-full max-w-[60rem] px-4 pt-5 pb-12 sm:px-6 sm:pt-6">
	{@render children()}
</main>
