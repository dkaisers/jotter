<script lang="ts">
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
	import { startDrag } from '$lib/drag';
	import Card from './Card.svelte';
	import AddCardButtons from './AddCardButtons.svelte';

	let { space, column }: { space: Space; column: Column } = $props();

	let focusCardId = $state<string | null>(null);
	let overSlot = $state(false);

	function addCardOfType(type: CardType) {
		focusCardId = addCard(space.id, column.id, type);
	}

	function onDragStart(e: PointerEvent, cardId: string) {
		e.preventDefault();
		startDrag({
			onMove: (ev) => {
				const el = document.elementFromPoint(ev.clientX, ev.clientY);
				const slotEl = el?.closest('[data-empty-slot]') as HTMLElement | null;
				if (slotEl) {
					if (!overSlot) {
						overSlot = true;
						moveCardToNewColumn(space.id, cardId, TOTAL_UNITS - totalSpan(space.columns));
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
					if (ev.clientY < r.top + r.height / 2) {
						index = i;
						break;
					}
				}
				moveCard(space.id, cardId, targetColumnId, index);
			},
			onEnd: () => (overSlot = false)
		});
	}
</script>

<div
	data-column-id={column.id}
	class="relative flex min-w-0 flex-col"
	class:h-full={column.cards.length > 0}
>
	{#if column.cards.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant px-3 py-6"
		>
			<div class="flex items-center gap-2">
				<AddCardButtons onadd={addCardOfType} />
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each column.cards as card (card.id)}
				<Card {space} {column} {card} {onDragStart} autofocus={card.id === focusCardId} />
			{/each}
		</div>

		<div class="mt-3 flex items-center justify-center gap-2">
			<AddCardButtons onadd={addCardOfType} />
		</div>
	{/if}

	<div
		use:columnResize={{
			container: () => document.querySelector('.workspace-row') as HTMLElement | null,
			getSpan: () => column.span,
			onResize: (span) => setColumnSpan(space.id, column.id, span)
		}}
		class="group absolute inset-y-0 -right-4 z-20 flex w-2 cursor-col-resize items-center justify-center"
	>
		<div class="h-full w-0.5 rounded-full transition-colors group-hover:bg-outline-variant"></div>
	</div>
</div>
