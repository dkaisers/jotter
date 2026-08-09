<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { workspace, countFlaggedUndone } from '$lib/workspace';
	import { renderFavicon } from '$lib/favicon';

	let { children } = $props();

	onMount(() => {
		return workspace.subscribe((w) => renderFavicon(countFlaggedUndone(w) > 0));
	});
</script>

<Header>{@render children()}</Header>
<Footer />
