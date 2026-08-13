<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TimerToast from '$lib/components/TimerToast.svelte';
	import { workspace, countFlaggedUndone } from '$lib/workspace';
	import { renderFavicon } from '$lib/favicon';
	import { startTicker } from '$lib/timer';

	let { children } = $props();

	onMount(() => {
		startTicker();
		return workspace.subscribe((w) => renderFavicon(countFlaggedUndone(w) > 0));
	});
</script>

<Header>{@render children()}</Header>
<Footer />
<TimerToast />
