<script lang="ts">
	import { ListTodo, NotepadText } from 'lucide-svelte';
	import { activeSpace, addColumn, totalSpan, type CardType } from '$lib/workspace';
	import { TOTAL_UNITS } from '$lib/columnResize';
	import Column from '$lib/components/Column.svelte';
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
					class="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant px-3 py-6"
				>
					{#if cols.length === 0}
						<p class="text-sm text-on-surface-variant">
							No columns yet — add a todo list or a note to get started.
						</p>
					{:else}
						<span class="text-xs text-on-surface-variant">empty</span>
					{/if}
					<div class="flex items-center gap-2">
						<button
							type="button"
							title="Add todo list"
							onclick={() => addToEmpty('todo')}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
						>
							<ListTodo class="size-4" />
						</button>
						<button
							type="button"
							title="Add note"
							onclick={() => addToEmpty('note')}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
						>
							<NotepadText class="size-4" />
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
