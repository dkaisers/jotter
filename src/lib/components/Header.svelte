<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import {
		settings,
		modes,
		fonts,
		setMode,
		setUiFont,
		setContentFont,
		type Mode,
		type FontId
	} from '$lib/theme';
	import Spaces from './Spaces.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let open = $state(false);
	let root: HTMLElement | undefined = $state();
	let mounted = $state(false);

	function closeOnOutside(event: Event) {
		if (open && root && !root.contains(event.target as Node)) open = false;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}

	onMount(() => {
		mounted = true;
		document.addEventListener('click', closeOnOutside);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('click', closeOnOutside);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});
</script>

<div class="mx-auto w-full max-w-[60rem] px-4 pt-6 sm:px-6 sm:pt-8">
	<div class="relative" bind:this={root}>
		<header class="flex items-center justify-between">
			<h1 class="text-xl font-semibold tracking-tight text-on-surface">jotter</h1>

			<button
				type="button"
				aria-label="Settings"
				aria-haspopup="true"
				aria-expanded={open}
				onclick={() => (open = !open)}
				class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-surface text-on-surface-variant shadow-sm transition-colors hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
			>
				<Settings class="size-4" />
			</button>
		</header>

		{#if open}
			<div class="absolute top-full right-0 z-30 mt-2 w-64 rounded-xl bg-surface p-2 shadow-lg">
				<div class="p-2">
					<p
						class="px-1 pb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase"
					>
						Mode
					</p>
					<div class="flex gap-1">
						{#each modes as m (m.value)}
							<button
								type="button"
								onclick={() => setMode(m.value as Mode)}
								class:accent-fill={$settings.mode === m.value}
								class="flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-sm text-on-surface hover:bg-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{m.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="border-t border-outline-variant p-2">
					<p
						class="px-1 pb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase"
					>
						UI font
					</p>
					<div class="flex gap-1">
						{#each fonts as f (f.value)}
							<button
								type="button"
								onclick={() => setUiFont(f.value as FontId)}
								class:accent-fill={$settings.uiFont === f.value}
								class="flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-sm text-on-surface hover:bg-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{f.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="border-t border-outline-variant p-2">
					<p
						class="px-1 pb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase"
					>
						Content font
					</p>
					<div class="flex gap-1">
						{#each fonts as f (f.value)}
							<button
								type="button"
								onclick={() => setContentFont(f.value as FontId)}
								class:accent-fill={$settings.contentFont === f.value}
								class="flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-sm text-on-surface hover:bg-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{f.label}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if mounted}
		<div class="mt-4">
			<Spaces />
		</div>
	{/if}
</div>

<main class="mx-auto w-full max-w-[60rem] px-4 pt-5 pb-12 sm:px-6 sm:pt-6">
	{@render children()}
</main>
