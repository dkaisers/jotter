<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Header />
<main class="mx-auto w-full max-w-[60rem] px-4 py-6 sm:px-6 sm:py-10">
	{@render children()}
</main>
