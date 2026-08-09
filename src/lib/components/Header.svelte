<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import {
		settings,
		palettes,
		fonts,
		fontGroups,
		setPalette,
		setFont,
		toggleMode,
		type FontId,
		type Palette
	} from '$lib/theme';
	import { onMount } from 'svelte';

	let open = $state(false);
	let root: HTMLElement | undefined = $state();

	const isDark = $derived($settings.mode === 'dark');

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

<header
	class="mx-auto mt-2 w-[calc(100%-1rem)] max-w-[60rem] rounded-xl bg-surface px-4 py-3 shadow-lg ring-1 ring-outline-variant sm:mt-4 sm:w-[calc(100%-2rem)] sm:rounded-2xl sm:px-6"
	style="transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;"
>
	<div class="flex items-center justify-between gap-4">
		<span class="text-lg font-semibold tracking-tight text-on-surface">jotter</span>

		<div class="relative" bind:this={root}>
			<button
				type="button"
				aria-label="Settings"
				aria-haspopup="true"
				aria-expanded={open}
				onclick={() => (open = !open)}
				class="rounded-lg bg-surface-variant p-2 text-on-surface transition-colors duration-150 hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
			>
				<Settings class="size-5" />
			</button>

			{#if open}
				<div
					class="absolute right-0 z-10 mt-2 w-64 rounded-xl bg-surface p-4 shadow-xl ring-1 ring-outline-variant"
					style="transition: background-color 150ms ease, color 150ms ease;"
				>
					<div class="space-y-4">
						<div class="flex items-center justify-between gap-3">
							<label for="palette-select" class="text-sm font-medium text-on-surface">Palette</label
							>
							<select
								id="palette-select"
								value={$settings.palette}
								onchange={(e) => setPalette(e.currentTarget.value as Palette)}
								class="rounded-lg border-0 bg-surface-variant px-2.5 py-1 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{#each palettes as palette (palette.value)}
									<option value={palette.value}>{palette.label}</option>
								{/each}
							</select>
						</div>

						<div class="flex items-center justify-between gap-3">
							<span class="text-sm font-medium text-on-surface">Mode</span>
							<button
								type="button"
								onclick={toggleMode}
								class="rounded-lg bg-surface-variant px-2.5 py-1 text-sm font-medium text-on-surface transition-colors duration-150 hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{isDark ? 'Dark' : 'Light'}
							</button>
						</div>

						<div class="flex items-center justify-between gap-3">
							<label for="font-select" class="text-sm font-medium text-on-surface">Font</label>
							<select
								id="font-select"
								value={$settings.font}
								onchange={(e) => setFont(e.currentTarget.value as FontId)}
								class="rounded-lg border-0 bg-surface-variant px-2.5 py-1 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
							>
								{#each fontGroups as group (group)}
									<optgroup label={group}>
										{#each fonts.filter((f) => f.group === group) as font (font.value)}
											<option value={font.value}>{font.label}</option>
										{/each}
									</optgroup>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</header>
