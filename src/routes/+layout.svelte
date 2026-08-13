<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TimerToast from '$lib/components/TimerToast.svelte';
	import { workspace, countFlaggedUndone, hasDueTimer } from '$lib/workspace';
	import { renderFavicon } from '$lib/favicon';
	import { now, startTicker } from '$lib/timer';

	let { children } = $props();

	let prevFlagged = false;
	let prevTimer = false;

	function updateFavicon() {
		const flagged = countFlaggedUndone(get(workspace)) > 0;
		const timerDue = hasDueTimer(get(workspace));
		if (flagged !== prevFlagged || timerDue !== prevTimer) {
			prevFlagged = flagged;
			prevTimer = timerDue;
			renderFavicon(flagged, timerDue);
		}
	}

	onMount(() => {
		startTicker();
		const unsubs = [workspace.subscribe(updateFavicon), now.subscribe(updateFavicon)];
		return () => unsubs.forEach((u) => u());
	});
</script>

<Header>{@render children()}</Header>
<Footer />
<TimerToast />
