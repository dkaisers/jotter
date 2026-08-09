<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import {
		settings,
		palettes,
		modes,
		fonts,
		setPalette,
		setMode,
		setFont,
		type Palette,
		type Mode,
		type FontId
	} from '$lib/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	let open = $state(false);
	let root: HTMLElement | undefined = $state();

	function closeOnOutside(event: Event) {
		if (open && root && !root.contains(event.target as Node)) open = false;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}

	onMount(() => {
		document.addEventListener('click', closeOnOutside);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('click', closeOnOutside);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});
</script>

<div
	class="relative mx-auto mt-4 w-[calc(100%-1rem)] max-w-[60rem] border border-outline bg-surface sm:mt-6 sm:w-[calc(100%-2rem)]"
>
	<span
		class="absolute top-0 left-3 -translate-y-1/2 bg-base px-2 text-sm font-semibold tracking-tight text-on-surface sm:left-4"
	>
		jotter
	</span>

	<div class="absolute top-0 right-0" bind:this={root}>
		<button
			type="button"
			aria-label="Settings"
			aria-haspopup="true"
			aria-expanded={open}
			onclick={() => (open = !open)}
			class:bg-on-surface={open}
			class:text-surface={open}
			class="absolute top-0 right-2 -translate-y-1/2 bg-base p-1.5 text-on-surface hover:bg-on-surface hover:text-surface focus:ring-2 focus:ring-outline focus:outline-none sm:right-4"
		>
			<Settings class="size-4" />
		</button>

		{#if open}
			<div
				class="absolute top-2 right-2 z-10 w-60 border border-outline bg-surface-variant sm:right-4"
			>
				<div class="px-3 pt-2.5 pb-2">
					<p class="mb-1 text-xs tracking-widest text-on-surface-variant uppercase">Palette</p>
					{#each palettes as p (p.value)}
						<button
							type="button"
							onclick={() => setPalette(p.value as Palette)}
							class:tui-invert={$settings.palette === p.value}
							class="block w-full px-2 py-1 text-left text-sm text-on-surface hover:bg-on-surface hover:text-surface"
						>
							{p.label}
						</button>
					{/each}
				</div>

				<div class="border-t border-outline-variant px-3 py-2">
					<p class="mb-1 text-xs tracking-widest text-on-surface-variant uppercase">Mode</p>
					{#each modes as m (m.value)}
						<button
							type="button"
							onclick={() => setMode(m.value as Mode)}
							class:tui-invert={$settings.mode === m.value}
							class="block w-full px-2 py-1 text-left text-sm text-on-surface hover:bg-on-surface hover:text-surface"
						>
							{m.label}
						</button>
					{/each}
				</div>

				<div class="border-t border-outline-variant px-3 py-2">
					<p class="mb-1 text-xs tracking-widest text-on-surface-variant uppercase">Font</p>
					{#each fonts as f (f.value)}
						<button
							type="button"
							onclick={() => setFont(f.value as FontId)}
							class:tui-invert={$settings.font === f.value}
							class="block w-full px-2 py-1 text-left text-sm text-on-surface hover:bg-on-surface hover:text-surface"
						>
							{f.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<main class="px-4 py-5 sm:px-6 sm:py-8">{@render children()}</main>
</div>
