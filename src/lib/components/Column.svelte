<script lang="ts">
	import { FileText, ListTodo } from 'lucide-svelte';
	import { addCard, moveCard, setColumnSpan, type Column } from '$lib/workspace';
	import { columnResize } from '$lib/columnResize';
	import Card from './Card.svelte';

	let { column }: { column: Column } = $props();

	let dragCardId = $state<string | null>(null);

	function onDragStart(e: PointerEvent, cardId: string) {
		e.preventDefault();
		dragCardId = cardId;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!dragCardId) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const target = el?.closest('[data-column-id]') as HTMLElement | null;
		if (!target) return;
		const targetColumnId = target.dataset.columnId!;
		const before = [...target.querySelectorAll('[data-card-id]')] as HTMLElement[];
		let index = before.length;
		for (let i = 0; i < before.length; i++) {
			const r = before[i].getBoundingClientRect();
			if (e.clientY < r.top + r.height / 2) {
				index = i;
				break;
			}
		}
		moveCard(dragCardId, targetColumnId, index);
	}

	function onDragEnd() {
		dragCardId = null;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}
</script>

<div data-column-id={column.id} class="relative flex min-w-0 flex-1 flex-col">
	<div class="flex flex-col gap-3">
		{#each column.cards as card (card.id)}
			<Card {column} {card} {onDragStart} />
		{/each}
	</div>

	<div class="mt-3 flex items-center justify-center gap-2 border-t border-outline-variant pt-3">
		<button
			type="button"
			title="Add todo list"
			onclick={() => addCard(column.id, 'todo')}
			class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-outline-variant bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface focus:ring-2 focus:ring-primary focus:outline-none"
		>
			<ListTodo class="size-4" />
		</button>
		<button
			type="button"
			title="Add note"
			onclick={() => addCard(column.id, 'note')}
			class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-outline-variant bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface focus:ring-2 focus:ring-primary focus:outline-none"
		>
			<FileText class="size-4" />
		</button>
	</div>

	<div
		use:columnResize={{
			container: () => document.querySelector('.workspace-row') as HTMLElement | null,
			getSpan: () => column.span,
			onResize: (span) => setColumnSpan(column.id, span)
		}}
		class="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-outline-variant"
	></div>
</div>
