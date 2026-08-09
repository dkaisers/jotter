<script lang="ts">
	import { GripVertical, Trash2 } from 'lucide-svelte';
	import { removeCard, setCardTitle, type Card, type Column, type Space } from '$lib/workspace';
	import TodoList from './TodoList.svelte';
	import NoteArea from './NoteArea.svelte';

	let {
		space,
		column,
		card,
		onDragStart,
		autofocus = false
	}: {
		space: Space;
		column: Column;
		card: Card;
		onDragStart: (e: PointerEvent, cardId: string) => void;
		autofocus?: boolean;
	} = $props();

	let editingTitle = $state(false);
	let titleDraft = $state('');
	let confirming = $state(false);
	let titleInput: HTMLInputElement | undefined = $state();

	const hasContent = $derived(card.type === 'todo' ? card.todos.length > 0 : card.text.length > 0);

	function startRename() {
		titleDraft = card.title;
		editingTitle = true;
		requestAnimationFrame(() => titleInput?.focus());
	}

	function commitRename() {
		const title = titleDraft.trim();
		if (title) setCardTitle(space.id, column.id, card.id, title);
		editingTitle = false;
	}

	function deleteCard() {
		if (hasContent) {
			confirming = true;
		} else {
			removeCard(space.id, column.id, card.id);
		}
	}
</script>

<div data-card-id={card.id} class="flex flex-col rounded-lg bg-surface shadow-sm">
	<header class="flex shrink-0 items-center gap-1 border-b border-outline-variant px-3 py-2">
		<button
			type="button"
			title="Drag to move"
			onpointerdown={(e) => onDragStart(e, card.id)}
			class="flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant active:cursor-grabbing"
		>
			<GripVertical class="size-4" />
		</button>

		{#if editingTitle}
			<input
				type="text"
				bind:this={titleInput}
				bind:value={titleDraft}
				onkeydown={(e) => {
					if (e.key === 'Enter') commitRename();
					if (e.key === 'Escape') editingTitle = false;
				}}
				onblur={commitRename}
				class="min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 py-0.5 font-semibold text-base text-on-surface focus:ring-0 focus:outline-none"
			/>
		{:else}
			<button
				type="button"
				title="Rename"
				onclick={startRename}
				class="min-w-0 flex-1 cursor-text rounded-md px-2 py-0.5 text-left font-semibold text-base text-on-surface focus:outline-none"
			>
				<span class="block truncate">{card.title}</span>
			</button>
		{/if}

		<button
			type="button"
			title="Delete card"
			onclick={deleteCard}
			class="flex h-6 shrink-0 cursor-pointer items-center rounded-md px-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
		>
			<Trash2 class="size-4" />
		</button>
	</header>

	<div class="content min-h-0 flex-1 px-3 pt-3 pb-3">
		{#if card.type === 'todo'}
			<TodoList {space} {column} {card} {autofocus} />
		{:else}
			<NoteArea {space} {column} {card} {autofocus} />
		{/if}
	</div>
</div>

{#if confirming}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-base/60 p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Delete card"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Escape') confirming = false;
		}}
		onclick={(e) => {
			if (e.target === e.currentTarget) confirming = false;
		}}
	>
		<div class="w-72 border border-outline bg-surface shadow-xl">
			<div class="border-b border-outline-variant px-4 py-3">
				<h2 class="text-sm font-semibold text-on-surface">Delete “{card.title}”?</h2>
			</div>
			<div class="px-4 py-3 text-sm text-on-surface-variant">
				This removes the card and its contents. This can't be undone.
			</div>
			<div class="flex justify-end gap-2 border-t border-outline-variant px-4 py-3">
				<button
					type="button"
					onclick={() => (confirming = false)}
					class="cursor-pointer rounded-md border border-outline-variant bg-surface-variant px-3 py-1 text-sm text-on-surface hover:bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={() => removeCard(space.id, column.id, card.id)}
					class="accent-fill cursor-pointer rounded-md px-3 py-1 text-sm font-semibold hover:opacity-80 focus:ring-2 focus:ring-primary focus:outline-none"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
