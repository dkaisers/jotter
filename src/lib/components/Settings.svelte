<script lang="ts">
	import { Settings as SettingsIcon } from 'lucide-svelte';
	import { Switch, ToggleGroup } from 'bits-ui';
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
	import Modal from './Modal.svelte';

	const fontStack: Record<FontId, string> = {
		sans: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
		serif: "'Lora Variable', Georgia, 'Times New Roman', serif",
		mono: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', monospace"
	};

	const itemClass =
		'flex h-6 w-16 cursor-pointer items-center justify-center rounded-md text-sm data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:bg-surface-variant/40 data-[state=off]:text-on-surface focus:outline-none';

	let open = $state(false);
</script>

<div class="relative flex self-stretch">
	<button
		type="button"
		aria-label="Settings"
		aria-haspopup="true"
		aria-expanded={open}
		onclick={() => (open = !open)}
		class="flex w-8 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
	>
		<SettingsIcon class="size-4" />
	</button>
</div>

<Modal {open} title="Settings" onclose={() => (open = false)}>
	<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Appearance</p>

	<div class="mb-2 flex items-center justify-between px-0.5">
		<span class="text-sm text-on-surface">Mode</span>
		<ToggleGroup.Root
			type="single"
			value={$settings.mode}
			onValueChange={(v) => v && setMode(v as Mode)}
			class="flex items-center gap-1"
		>
			{#each modes as m (m.value)}
				<ToggleGroup.Item value={m.value} class={itemClass}>
					{m.label}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="mb-2 flex items-center justify-between px-0.5">
		<span class="text-sm text-on-surface">UI font</span>
		<ToggleGroup.Root
			type="single"
			value={$settings.uiFont}
			onValueChange={(v) => v && setUiFont(v as FontId)}
			class="flex items-center gap-1"
		>
			{#each fonts as f (f.value)}
				<ToggleGroup.Item
					value={f.value}
					class={itemClass}
					style={`font-family: ${fontStack[f.value]}`}
				>
					{f.label}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="mb-2 flex items-center justify-between px-0.5">
		<span class="text-sm text-on-surface">Content font</span>
		<ToggleGroup.Root
			type="single"
			value={$settings.contentFont}
			onValueChange={(v) => v && setContentFont(v as FontId)}
			class="flex items-center gap-1"
		>
			{#each fonts as f (f.value)}
				<ToggleGroup.Item
					value={f.value}
					class={itemClass}
					style={`font-family: ${fontStack[f.value]}`}
				>
					{f.label}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="flex items-center justify-between px-0.5 py-1">
		<span class="text-sm text-on-surface">Paper grain</span>
		<Switch.Root
			checked={$settings.grain}
			onCheckedChange={(c) => setGrain(c)}
			class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-variant"
		>
			<Switch.Thumb
				class={`size-4 rounded-full bg-white shadow transition-transform ${
					$settings.grain ? 'translate-x-4' : ''
				}`}
			/>
		</Switch.Root>
	</div>

	<div class="mt-4 border-t border-outline-variant pt-3">
		<p class="mb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
			Behavior
		</p>
		<div class="flex items-center justify-between px-0.5 py-1">
			<span class="text-sm text-on-surface">Auto-delete done todos</span>
			<Switch.Root
				checked={$settings.autoDeleteDone}
				onCheckedChange={(c) => setAutoDeleteDone(c)}
				class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-variant"
			>
				<Switch.Thumb
					class={`size-4 rounded-full bg-white shadow transition-transform ${
						$settings.autoDeleteDone ? 'translate-x-4' : ''
					}`}
				/>
			</Switch.Root>
		</div>

		<div class="flex items-center justify-between px-0.5 py-1">
			<span class="text-sm text-on-surface">Spell checking</span>
			<Switch.Root
				checked={$settings.spellcheck}
				onCheckedChange={(c) => setSpellcheck(c)}
				class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-variant"
			>
				<Switch.Thumb
					class={`size-4 rounded-full bg-white shadow transition-transform ${
						$settings.spellcheck ? 'translate-x-4' : ''
					}`}
				/>
			</Switch.Root>
		</div>
	</div>
</Modal>
