<script lang="ts">
	import { activeSpace, addColumn, totalSpan, type CardType } from '$lib/workspace';
	import { TOTAL_UNITS } from '$lib/columnResize';
	import Column from '$lib/components/Column.svelte';
	import AddCardButtons from '$lib/components/AddCardButtons.svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	onMount(() => (mounted = true));

	const space = $derived($activeSpace);
	const cols = $derived(space?.columns ?? []);
	const leftover = $derived(space ? TOTAL_UNITS - totalSpan(cols) : 0);

	function addToEmpty(type: CardType) {
		if (!space || leftover <= 0) return;
		const span = space.columns.length === 0 ? Math.floor(TOTAL_UNITS / 2) : leftover;
		addColumn(space.id, type, span);
	}
</script>

{#if mounted && space}
	<div class="workspace-row flex items-stretch gap-6">
		{#each cols as column (column.id)}
			<div class="min-w-0" style={`flex-grow: ${column.span}; flex-basis: 0`}>
				<Column {space} {column} />
			</div>
		{/each}

		{#if leftover > 0}
			<div
				data-empty-slot
				class="flex min-w-0 flex-col"
				style={`flex-grow: ${leftover}; flex-basis: 0`}
			>
				<div
					class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant px-3 py-6"
					class:flex-1={cols.length === 0}
				>
					{#if cols.length === 0}
						<p class="text-sm text-on-surface-variant">
							No columns yet — add a todo list or a note to get started.
						</p>
					{/if}
					<div class="flex items-center gap-2">
						<AddCardButtons onadd={addToEmpty} />
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
