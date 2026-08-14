<script lang="ts">
	import { ChevronDown, Settings as SettingsIcon } from '@lucide/svelte';
	import { Select } from 'bits-ui';
	import {
		settings,
		modes,
		fonts,
		todoModes,
		chimes,
		setMode,
		setUiFont,
		setContentFont,
		setGrain,
		setTodoMode,
		setImportantToTop,
		setDoneToBottom,
		setKeepImportant,
		setSpellcheck,
		setTimerChime,
		type Mode,
		type FontId,
		type TodoMode,
		type ChimeId
	} from '$lib/theme';
	import { playChime } from '$lib/timer';
	import Modal from './Modal.svelte';
	import Confirm from './Confirm.svelte';
	import ToggleRow from './ToggleRow.svelte';
	import SelectRow from './SelectRow.svelte';
	import { exportWorkspace, parseBackup, applyImport } from '$lib/backup';
	import { clearWorkspace, sortAllTodoCards } from '$lib/workspace';
	import type { Workspace } from '$lib/workspace';

	const fontStack: Record<FontId, string> = {
		sans: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
		serif: "'Lora Variable', Georgia, 'Times New Roman', serif",
		mono: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', monospace"
	};

	const fontItems = fonts.map((f) => ({ ...f, style: `font-family: ${fontStack[f.value]}` }));

	let open = $state(false);
	let pendingImport: Workspace | null = $state(null);
	let confirmClear = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	function changeTodoMode(v: string) {
		const mode = v as TodoMode;
		setTodoMode(mode);
		if (mode === 'sort') sortAllTodoCards();
	}

	function changeImportantToTop(v: boolean) {
		setImportantToTop(v);
		if (v) sortAllTodoCards();
	}

	function changeDoneToBottom(v: boolean) {
		setDoneToBottom(v);
		if (v) sortAllTodoCards();
	}

	function onFileSelected(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const parsed = parseBackup(String(reader.result ?? ''));
			if (parsed) {
				pendingImport = parsed;
			} else {
				alert('That file is not a valid jotter backup.');
			}
		};
		reader.readAsText(file);
		(e.currentTarget as HTMLInputElement).value = '';
	}

	function doImport(mode: 'replace' | 'merge') {
		if (!pendingImport) return;
		applyImport(pendingImport, mode);
		pendingImport = null;
	}
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

<Modal {open} title="Settings" onclose={() => (open = false)} width="max-w-xl">
	<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Appearance</p>

	<SelectRow
		label="Mode"
		items={modes}
		value={$settings.mode}
		onValueChange={(v) => setMode(v as Mode)}
	/>

	<SelectRow
		label="UI font"
		items={fontItems}
		value={$settings.uiFont}
		onValueChange={(v) => setUiFont(v as FontId)}
	/>

	<SelectRow
		label="Content font"
		items={fontItems}
		value={$settings.contentFont}
		onValueChange={(v) => setContentFont(v as FontId)}
	/>

	<ToggleRow label="Paper grain" checked={$settings.grain} onCheckedChange={setGrain} />

	<div class="mt-4 border-t border-outline-variant pt-3">
		<p class="mb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
			Behavior
		</p>
		<SelectRow
			label="Auto todo handling"
			items={todoModes}
			value={$settings.todoMode}
			onValueChange={changeTodoMode}
		/>

		{#if $settings.todoMode === 'sort'}
			<ToggleRow
				label="Important to top"
				checked={$settings.importantToTop}
				onCheckedChange={changeImportantToTop}
			/>

			<ToggleRow
				label="Done to bottom"
				checked={$settings.doneToBottom}
				onCheckedChange={changeDoneToBottom}
			/>
		{:else if $settings.todoMode === 'delete'}
			<ToggleRow
				label="Keep important todos"
				checked={$settings.keepImportant}
				onCheckedChange={setKeepImportant}
			/>
		{/if}

		<ToggleRow
			label="Spell checking"
			checked={$settings.spellcheck}
			onCheckedChange={setSpellcheck}
		/>

		<div class="flex items-center justify-between px-0.5 py-1">
			<span class="text-sm text-on-surface">Timer chime</span>
			<Select.Root
				type="single"
				items={chimes}
				value={$settings.timerChime}
				onValueChange={(v) => {
					const kind = v as ChimeId;
					setTimerChime(kind);
					playChime(kind);
				}}
			>
				<Select.Trigger
					class="flex h-6 w-32 cursor-pointer items-center justify-between rounded-md border border-outline-variant bg-surface-variant/40 px-2 text-sm text-on-surface hover:bg-surface-variant focus:outline-none data-[state=open]:bg-surface-variant"
				>
					<Select.Value placeholder="Choose…" />
					<ChevronDown class="size-3.5 text-on-surface-variant" />
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						side="bottom"
						align="end"
						sideOffset={4}
						class="z-[80] rounded-lg border border-outline bg-surface p-1 shadow-xl shadow-black/25"
					>
						<Select.Viewport class="min-w-32">
							{#each chimes as chime (chime.value)}
								<Select.Item
									value={chime.value}
									label={chime.label}
									class="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-on-surface focus:outline-none data-[highlighted]:bg-surface-variant data-[state=checked]:text-primary"
								>
									{chime.label}
								</Select.Item>
							{/each}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</div>
	</div>

	<div class="mt-4 border-t border-outline-variant pt-3">
		<p class="mb-1.5 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Data</p>
		<div class="flex items-center gap-2 px-0.5">
			<button
				type="button"
				onclick={exportWorkspace}
				class="h-7 flex-1 cursor-pointer rounded-md bg-surface-variant/40 text-sm text-on-surface hover:bg-surface-variant focus:outline-none"
			>
				Export data
			</button>
			<button
				type="button"
				onclick={() => fileInput?.click()}
				class="h-7 flex-1 cursor-pointer rounded-md bg-surface-variant/40 text-sm text-on-surface hover:bg-surface-variant focus:outline-none"
			>
				Import data
			</button>
			<button
				type="button"
				onclick={() => (confirmClear = true)}
				class="h-7 flex-1 cursor-pointer rounded-md bg-surface-variant/40 text-sm text-error hover:bg-surface-variant focus:outline-none"
			>
				Clear data
			</button>
		</div>
		<input
			bind:this={fileInput}
			type="file"
			accept=".json,application/json"
			class="hidden"
			onchange={onFileSelected}
		/>
	</div>
</Modal>

<Modal
	open={pendingImport !== null}
	title="Import data"
	onclose={() => (pendingImport = null)}
	width="max-w-sm"
	stacked
>
	{#if pendingImport}
		<p>
			This backup contains {pendingImport.spaces.length} space{pendingImport.spaces.length === 1
				? ''
				: 's'}.
		</p>
		<p class="mt-2">Replace your current data, or merge the imported spaces into it?</p>
		<div class="mt-4 flex items-center gap-2">
			<button
				type="button"
				onclick={() => doImport('merge')}
				class="h-8 flex-1 cursor-pointer rounded-md bg-surface-variant/40 text-sm text-on-surface hover:bg-surface-variant focus:outline-none"
			>
				Merge
			</button>
			<button
				type="button"
				onclick={() => doImport('replace')}
				class="accent-fill h-8 flex-1 cursor-pointer rounded-md text-sm font-semibold hover:opacity-80 focus:outline-none"
			>
				Replace
			</button>
		</div>
	{/if}
</Modal>

<Confirm
	open={confirmClear}
	title="Clear data"
	message="This removes all spaces and their contents. This can't be undone."
	confirmLabel="Clear"
	onclose={() => (confirmClear = false)}
	onconfirm={() => {
		clearWorkspace();
		confirmClear = false;
	}}
/>
