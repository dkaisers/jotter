<script lang="ts">
	import { ListTodo, NotepadText } from 'lucide-svelte';
	import {
		addCard,
		moveCard,
		moveCardToNewColumn,
		setColumnSpan,
		totalSpan,
		type CardType,
		type Column,
		type Space
	} from '$lib/workspace';
	import { columnResize, TOTAL_UNITS } from '$lib/columnResize';
	import Card from './Card.svelte';

	let { space, column }: { space: Space; column: Column } = $props();

	let dragCardId = $state<string | null>(null);
	let focusCardId = $state<string | null>(null);
	let overSlot = $state(false);

	function addCardOfType(type: CardType) {
		focusCardId = addCard(space.id, column.id, type);
	}

	function onDragStart(e: PointerEvent, cardId: string) {
		e.preventDefault();
		dragCardId = cardId;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!dragCardId) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const slotEl = el?.closest('[data-empty-slot]') as HTMLElement | null;
		if (slotEl) {
			if (!overSlot) {
				overSlot = true;
				moveCardToNewColumn(space.id, dragCardId, TOTAL_UNITS - totalSpan(space.columns));
			}
			return;
		}
		overSlot = false;
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
		moveCard(space.id, dragCardId, targetColumnId, index);
	}

	function onDragEnd() {
		dragCardId = null;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}
</script>

<div data-column-id={column.id} class="relative flex h-full min-w-0 flex-col">
	{#if column.cards.length === 0}
		<div
			class="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant px-3 py-6"
		>
			<span class="text-xs text-on-surface-variant">empty</span>
			<div class="flex items-center gap-2">
				<button
					type="button"
					title="Add todo list"
					onclick={() => addCardOfType('todo')}
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
				>
					<ListTodo class="size-4" />
				</button>
				<button
					type="button"
					title="Add note"
					onclick={() => addCardOfType('note')}
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
				>
					<NotepadText class="size-4" />
				</button>
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each column.cards as card (card.id)}
				<Card {space} {column} {card} {onDragStart} autofocus={card.id === focusCardId} />
			{/each}
		</div>

		<div class="mt-3 flex items-center justify-center gap-2">
			<button
				type="button"
				title="Add todo list"
				onclick={() => addCardOfType('todo')}
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
			>
				<ListTodo class="size-4" />
			</button>
			<button
				type="button"
				title="Add note"
				onclick={() => addCardOfType('note')}
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
			>
				<NotepadText class="size-4" />
			</button>
		</div>
	{/if}

	<div
		use:columnResize={{
			container: () => document.querySelector('.workspace-row') as HTMLElement | null,
			getSpan: () => column.span,
			onResize: (span) => setColumnSpan(space.id, column.id, span)
		}}
		class="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-outline-variant"
	></div>
</div>
