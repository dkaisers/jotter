<script lang="ts">
	import { Settings as SettingsIcon } from 'lucide-svelte';
	import {
		settings,
		modes,
		fonts,
		setMode,
		setUiFont,
		setContentFont,
		setGrain,
		setAutoDeleteDone,
		setSpellcheck,
		type Mode,
		type FontId
	} from '$lib/theme';
	import { onMount } from 'svelte';

	const fontStack: Record<FontId, string> = {
		sans: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
		serif: "'Lora Variable', Georgia, 'Times New Roman', serif",
		mono: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', monospace"
	};

	let open = $state(false);
	let root: HTMLElement | undefined = $state();
	let btn: HTMLButtonElement | undefined = $state();

	function closeOnOutside(event: Event) {
		if (!open) return;
		const t = event.target as Node;
		if (root?.contains(t)) return;
		if (btn?.contains(t)) return;
		open = false;
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

<div class="relative flex self-stretch">
	<button
		bind:this={btn}
		type="button"
		aria-label="Settings"
		aria-haspopup="true"
		aria-expanded={open}
		onclick={() => (open = !open)}
		class="flex w-8 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
	>
		<SettingsIcon class="size-4" />
	</button>

	{#if open}
		<div
			bind:this={root}
			class="absolute top-full right-0 z-30 mt-3 w-96 overflow-hidden rounded-xl border border-outline bg-surface shadow-xl shadow-black/25"
		>
			<header
				class="border-b border-outline-variant bg-surface-variant/40 px-4 py-2.5 text-sm font-semibold text-on-surface"
			>
				Settings
			</header>

			<div class="px-4 py-3">
				<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
					Appearance
				</p>

				<div class="mb-2 flex items-center justify-between px-0.5">
					<span class="text-sm text-on-surface">Mode</span>
					<div class="flex items-center gap-1">
						{#each modes as m (m.value)}
							<button
								type="button"
								title={m.label}
								onclick={() => setMode(m.value as Mode)}
								class="h-6 w-16 cursor-pointer rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
								class:accent-fill={$settings.mode === m.value}
								style={`background-color: ${$settings.mode !== m.value ? 'color-mix(in srgb, var(--surface-variant) 40%, transparent)' : ''}`}
							>
								{m.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="mb-2 flex items-center justify-between px-0.5">
					<span class="text-sm text-on-surface">UI font</span>
					<div class="flex items-center gap-1">
						{#each fonts as f (f.value)}
							<button
								type="button"
								title={`UI font: ${f.label}`}
								onclick={() => setUiFont(f.value as FontId)}
								class="h-6 w-16 cursor-pointer rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
								style={`font-family: ${fontStack[f.value]}; background-color: ${$settings.uiFont === f.value ? 'var(--primary)' : 'color-mix(in srgb, var(--surface-variant) 40%, transparent)'}; color: ${$settings.uiFont === f.value ? 'var(--on-primary)' : 'var(--on-surface)'}`}
							>
								{f.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="mb-2 flex items-center justify-between px-0.5">
					<span class="text-sm text-on-surface">Content font</span>
					<div class="flex items-center gap-1">
						{#each fonts as f (f.value)}
							<button
								type="button"
								title={`Content font: ${f.label}`}
								onclick={() => setContentFont(f.value as FontId)}
								class="h-6 w-16 cursor-pointer rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
								style={`font-family: ${fontStack[f.value]}; background-color: ${$settings.contentFont === f.value ? 'var(--primary)' : 'color-mix(in srgb, var(--surface-variant) 40%, transparent)'}; color: ${$settings.contentFont === f.value ? 'var(--on-primary)' : 'var(--on-surface)'}`}
							>
								{f.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex items-center justify-between px-0.5 py-1">
					<span class="text-sm text-on-surface">Paper grain</span>
					<button
						type="button"
						role="switch"
						aria-checked={$settings.grain}
						aria-label="Toggle paper grain"
						onclick={() => setGrain(!$settings.grain)}
						class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
						class:accent-fill={$settings.grain}
						class:bg-surface-variant={!$settings.grain}
					>
						<span
							class="size-4 rounded-full bg-white shadow transition-transform"
							class:translate-x-4={$settings.grain}
						></span>
					</button>
				</div>
			</div>

			<div class="border-t border-outline-variant px-4 py-3">
				<p class="mb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
					Behavior
				</p>
				<div class="flex items-center justify-between px-0.5 py-1">
					<span class="text-sm text-on-surface">Auto-delete done todos</span>
					<button
						type="button"
						role="switch"
						aria-checked={$settings.autoDeleteDone}
						aria-label="Toggle auto-delete done todos"
						onclick={() => setAutoDeleteDone(!$settings.autoDeleteDone)}
						class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
						class:accent-fill={$settings.autoDeleteDone}
						class:bg-surface-variant={!$settings.autoDeleteDone}
					>
						<span
							class="size-4 rounded-full bg-white shadow transition-transform"
							class:translate-x-4={$settings.autoDeleteDone}
						></span>
					</button>
				</div>

				<div class="flex items-center justify-between px-0.5 py-1">
					<span class="text-sm text-on-surface">Spell checking</span>
					<button
						type="button"
						role="switch"
						aria-checked={$settings.spellcheck}
						aria-label="Toggle spell checking"
						onclick={() => setSpellcheck(!$settings.spellcheck)}
						class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
						class:accent-fill={$settings.spellcheck}
						class:bg-surface-variant={!$settings.spellcheck}
					>
						<span
							class="size-4 rounded-full bg-white shadow transition-transform"
							class:translate-x-4={$settings.spellcheck}
						></span>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
