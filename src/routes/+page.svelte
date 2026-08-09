<script lang="ts">
	import { FileText, ListTodo } from 'lucide-svelte';
	import { addColumn, columns, totalSpan, type CardType } from '$lib/workspace';
	import { TOTAL_UNITS } from '$lib/columnResize';
	import Column from '$lib/components/Column.svelte';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	onMount(() => (mounted = true));

	const leftover = $derived(TOTAL_UNITS - totalSpan($columns));

	function addToEmpty(type: CardType) {
		if (leftover <= 0) return;
		addColumn(type, leftover);
	}
</script>

{#if mounted}
	<div class="workspace-row flex items-start gap-3">
		{#each $columns as column (column.id)}
			<div class="min-w-0" style={`flex-grow: ${column.span}; flex-basis: 0`}>
				<Column {column} />
			</div>
		{/each}

		{#if leftover > 0}
			<div class="flex min-w-0 flex-col" style={`flex-grow: ${leftover}; flex-basis: 0`}>
				<div
					class="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed border-outline-variant px-3 py-6"
				>
					<span class="text-xs text-on-surface-variant">empty</span>
					<div class="flex items-center gap-2">
						<button
							type="button"
							title="Add todo list"
							onclick={() => addToEmpty('todo')}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-outline-variant bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface focus:ring-2 focus:ring-primary focus:outline-none"
						>
							<ListTodo class="size-4" />
						</button>
						<button
							type="button"
							title="Add note"
							onclick={() => addToEmpty('note')}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-outline-variant bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface focus:ring-2 focus:ring-primary focus:outline-none"
						>
							<FileText class="size-4" />
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
