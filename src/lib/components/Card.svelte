<script lang="ts">
	import { ArrowUpDown, Broom, GripVertical, Trash2 } from '@lucide/svelte';
	import {
		removeCard,
		removeDoneTodos,
		setCardTitle,
		sortTodos,
		type Card,
		type Column,
		type Space
	} from '$lib/workspace';
	import TodoList from './TodoList.svelte';
	import NoteArea from './NoteArea.svelte';
	import Confirm from './Confirm.svelte';
	import { settings } from '$lib/theme';

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
	const hasDoneTodos = $derived(card.type === 'todo' && card.todos.some((t) => t.done));

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
	<header class="group flex shrink-0 items-center gap-1 border-b border-outline-variant px-3 py-2">
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

		{#if card.type === 'todo'}
			<button
				type="button"
				title={$settings.doneToBottom
					? 'Sort: important first, done last'
					: 'Sort: important first'}
				onclick={() => sortTodos(space.id, column.id, card.id)}
				class="flex h-6 shrink-0 cursor-pointer items-center rounded-md px-1 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-variant hover:text-on-surface focus:outline-none"
			>
				<ArrowUpDown class="size-4" />
			</button>
			<button
				type="button"
				title="Remove done todos"
				onclick={() => removeDoneTodos(space.id, column.id, card.id)}
				disabled={!hasDoneTodos}
				class="flex h-6 shrink-0 cursor-pointer items-center rounded-md px-1 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-variant hover:text-on-surface focus:outline-none disabled:pointer-events-none disabled:text-outline"
			>
				<Broom class="size-4" />
			</button>
		{/if}

		<button
			type="button"
			title="Delete card"
			onclick={deleteCard}
			class="flex h-6 shrink-0 cursor-pointer items-center rounded-md px-1 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-variant hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
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

<Confirm
	open={confirming}
	title={`Delete “${card.title}”?`}
	message="This removes the card and its contents. This can't be undone."
	onclose={() => (confirming = false)}
	onconfirm={() => removeCard(space.id, column.id, card.id)}
/>
