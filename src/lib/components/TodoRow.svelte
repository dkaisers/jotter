<script lang="ts">
	import { AlarmClock, Check, GripVertical, Trash2, TriangleAlert } from 'lucide-svelte';
	import { updateTodo, removeTodo, setTodoDone } from '$lib/workspace';
	import type { Column, Space, TodoCard, TodoItem } from '$lib/workspace';
	import { now, openTimerId, formatRemaining } from '$lib/timer';
	import TimerPopover from './TimerPopover.svelte';

	let {
		space,
		column,
		card,
		todo,
		onDragStart
	}: {
		space: Space;
		column: Column;
		card: TodoCard;
		todo: TodoItem;
		onDragStart: (e: PointerEvent, todoId: string) => void;
	} = $props();

	let editing = $state(false);
	let draftEdit = $state('');
	let editInput: HTMLTextAreaElement | undefined = $state();
	let alarmBtn: HTMLButtonElement | undefined = $state();

	const popOpen = $derived($openTimerId === todo.id);

	function toggleDone() {
		setTodoDone(space.id, column.id, card.id, todo.id, !todo.done);
	}

	function patchTodo(patch: Partial<TodoItem>) {
		updateTodo(space.id, column.id, card.id, todo.id, patch);
	}

	function startEdit() {
		editing = true;
		draftEdit = todo.text;
		requestAnimationFrame(() => editInput?.focus());
	}

	function commitEdit() {
		const text = draftEdit.trim();
		if (text) {
			updateTodo(space.id, column.id, card.id, todo.id, { text });
		} else {
			removeTodo(space.id, column.id, card.id, todo.id);
		}
		editing = false;
	}
</script>

<div data-todo-id={todo.id} class="group relative flex items-start gap-2 pl-2">
	<button
		type="button"
		title="Drag to reorder"
		onpointerdown={(e) => onDragStart(e, todo.id)}
		class="absolute top-[1px] -left-3 flex h-5 w-5 cursor-grab items-center justify-center text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 focus:outline-none active:cursor-grabbing"
	>
		<GripVertical class="size-3.5" />
	</button>

	<button
		type="button"
		role="checkbox"
		aria-checked={todo.done}
		title={todo.done ? 'Mark as not done' : 'Mark as done'}
		onclick={toggleDone}
		class="mt-[3px] flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border text-on-surface hover:border-primary hover:bg-primary-container hover:text-primary focus:outline-none"
		class:border-primary={todo.done || todo.flagged}
		class:border-outline-variant={!todo.done && !todo.flagged}
		class:bg-primary-container={todo.done}
	>
		{#if todo.done}
			<Check class="size-3" />
		{/if}
	</button>

	{#if editing}
		<textarea
			rows="1"
			bind:this={editInput}
			bind:value={draftEdit}
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					commitEdit();
				}
				if (e.key === 'Escape') editing = false;
			}}
			onblur={commitEdit}
			class="min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-0 text-sm leading-5 text-on-surface focus:ring-0 focus:outline-none"
			class:pr-11={!!todo.timer}
			style="field-sizing: content; min-height: 1lh;"></textarea>
	{:else}
		<button
			type="button"
			onclick={startEdit}
			class="w-full min-w-0 flex-1 cursor-text rounded-md px-1 text-left text-sm break-words whitespace-pre-wrap focus:outline-none"
			class:text-on-surface-variant={todo.done}
			class:line-through={todo.done}
			class:pr-11={!!todo.timer}
		>
			{todo.text}
		</button>
	{/if}

	{#if todo.timer}
		<span
			class="absolute top-[3px] right-0 z-0 flex h-4 items-center rounded bg-primary-container px-1 text-[11px] font-medium text-on-primary-container tabular-nums group-hover:hidden"
			class:hidden={popOpen}
			style="font-family: var(--font-ui)"
		>
			{#if todo.timer.endsAt <= $now}
				<AlarmClock class="size-3" />
			{:else}
				{formatRemaining(todo.timer.endsAt - $now)}
			{/if}
		</span>
	{/if}

	<div
		class="absolute top-0 right-0 z-10 items-center gap-0.5 rounded-full bg-surface-variant px-1 py-0.5 shadow"
		class:flex={popOpen}
		class:hidden={!popOpen}
		class:group-hover:flex={!popOpen}
	>
		<button
			type="button"
			bind:this={alarmBtn}
			title={todo.timer ? 'Edit timer' : 'Set timer'}
			onclick={() => openTimerId.set($openTimerId === todo.id ? null : todo.id)}
			class="flex h-4 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
			class:text-primary={!!todo.timer}
		>
			<AlarmClock class="size-3.5" />
		</button>

		<button
			type="button"
			title={todo.flagged ? 'Unmark as important' : 'Mark as important'}
			onclick={() => patchTodo({ flagged: !todo.flagged })}
			class="flex h-4 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
			class:text-primary={todo.flagged}
		>
			<TriangleAlert class="size-3.5" />
		</button>

		<button
			type="button"
			title="Delete todo"
			onclick={() => removeTodo(space.id, column.id, card.id, todo.id)}
			class="flex h-4 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
		>
			<Trash2 class="size-3.5" />
		</button>
	</div>

	<TimerPopover
		ref={{ spaceId: space.id, columnId: column.id, cardId: card.id, todoId: todo.id }}
		{todo}
		anchor={alarmBtn}
		open={$openTimerId === todo.id}
		onclose={() => openTimerId.set(null)}
	/>
</div>
