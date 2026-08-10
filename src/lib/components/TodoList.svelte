<script lang="ts">
	import { Check, GripVertical, Trash2, TriangleAlert } from 'lucide-svelte';
	import {
		addTodo,
		removeTodo,
		reorderTodo,
		updateTodo,
		type Column,
		type Space,
		type TodoCard,
		type TodoItem
	} from '$lib/workspace';
	import { settings } from '$lib/theme';

	let {
		space,
		column,
		card,
		autofocus = false
	}: { space: Space; column: Column; card: TodoCard; autofocus?: boolean } = $props();

	let draft = $state('');
	let editingId: string | null = $state(null);
	let draftEdit = $state('');
	let draftInput: HTMLTextAreaElement | undefined = $state();
	let editInput: HTMLTextAreaElement | undefined = $state();
	let dragTodoId: string | null = $state(null);

	function toggleTodo(todoId: string, done: boolean) {
		if (done && $settings.autoDeleteDone) {
			removeTodo(space.id, column.id, card.id, todoId);
		} else {
			updateTodo(space.id, column.id, card.id, todoId, { done });
		}
	}

	function patchTodo(todoId: string, patch: Partial<TodoItem>) {
		updateTodo(space.id, column.id, card.id, todoId, patch);
	}

	function submit() {
		addTodo(space.id, column.id, card.id, draft);
		draft = '';
		requestAnimationFrame(() => draftInput?.focus());
	}

	function startEdit(todoId: string, text: string) {
		editingId = todoId;
		draftEdit = text;
		requestAnimationFrame(() => editInput?.focus());
	}

	function commitEdit(todoId: string) {
		const text = draftEdit.trim();
		if (text) {
			updateTodo(space.id, column.id, card.id, todoId, { text });
		} else {
			removeTodo(space.id, column.id, card.id, todoId);
		}
		editingId = null;
	}

	function onDragStart(e: PointerEvent, todoId: string) {
		e.preventDefault();
		dragTodoId = todoId;
		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!dragTodoId) return;
		const el = document
			.elementFromPoint(e.clientX, e.clientY)
			?.closest('[data-todo-id]') as HTMLElement | null;
		if (!el) return;
		const targetId = el.dataset.todoId;
		if (!targetId || targetId === dragTodoId) return;
		const fromIndex = card.todos.findIndex((t) => t.id === dragTodoId);
		const toIndex = card.todos.findIndex((t) => t.id === targetId);
		if (fromIndex === -1 || toIndex === -1) return;
		reorderTodo(space.id, column.id, card.id, fromIndex, toIndex);
	}

	function onDragEnd() {
		dragTodoId = null;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}

	$effect(() => {
		if (autofocus) draftInput?.focus();
	});
</script>

<div class="flex flex-col gap-1.5">
	{#each card.todos as todo (todo.id)}
		<div data-todo-id={todo.id} class="group relative flex items-start gap-2 pl-2">
			<button
				type="button"
				title="Drag to reorder"
				onpointerdown={(e) => onDragStart(e, todo.id)}
				class="absolute top-0.5 -left-3 flex h-5 w-5 cursor-grab items-center justify-center text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 focus:outline-none active:cursor-grabbing"
			>
				<GripVertical class="size-3.5" />
			</button>

			<button
				type="button"
				role="checkbox"
				aria-checked={todo.done}
				title={todo.done ? 'Mark as not done' : 'Mark as done'}
				onclick={() => toggleTodo(todo.id, !todo.done)}
				class="mt-[3px] flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border text-on-surface hover:border-primary hover:text-primary focus:outline-none"
				class:border-primary={todo.done || todo.flagged}
				class:border-outline-variant={!todo.done && !todo.flagged}
				class:bg-primary-container={todo.done}
			>
				{#if todo.done}
					<Check class="size-3" />
				{/if}
			</button>

			{#if editingId === todo.id}
				<textarea
					rows="1"
					bind:this={editInput}
					bind:value={draftEdit}
					spellcheck={$settings.spellcheck}
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							commitEdit(todo.id);
						}
						if (e.key === 'Escape') editingId = null;
					}}
					onblur={() => commitEdit(todo.id)}
					class="min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-0 text-sm leading-5 text-on-surface focus:ring-0 focus:outline-none"
					style="field-sizing: content; min-height: 1lh;"></textarea>
			{:else}
				<button
					type="button"
					onclick={() => startEdit(todo.id, todo.text)}
					class="w-full min-w-0 flex-1 cursor-text rounded-md px-1 text-left text-sm break-words whitespace-pre-wrap focus:outline-none"
					class:text-on-surface-variant={todo.done}
					class:line-through={todo.done}
				>
					{todo.text}
				</button>
			{/if}

			<div
				class="absolute top-0 right-0 z-10 hidden items-center gap-0.5 rounded-full bg-surface-variant px-1 py-0.5 shadow group-hover:flex"
			>
				<button
					type="button"
					title={todo.flagged ? 'Unmark as important' : 'Mark as important'}
					onclick={() => patchTodo(todo.id, { flagged: !todo.flagged })}
					class="flex h-4 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
				>
					<TriangleAlert class="size-3.5" />
				</button>

				<button
					type="button"
					title="Delete todo"
					onclick={() => removeTodo(space.id, column.id, card.id, todo.id)}
					class="flex h-4 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
				>
					<Trash2 class="size-3.5" />
				</button>
			</div>
		</div>
	{/each}

	<form
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
		class="flex items-start gap-2 pl-2"
	>
		<span
			class="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed border-outline-variant opacity-60"
			aria-hidden="true"
		></span>
		<textarea
			rows="1"
			bind:this={draftInput}
			placeholder="Add todo…"
			spellcheck={$settings.spellcheck}
			bind:value={draft}
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					submit();
				}
			}}
			class="w-full resize-none border-0 bg-transparent px-1 py-0 text-sm leading-5 text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:outline-none"
			style="field-sizing: content; min-height: 1lh;"></textarea>
	</form>
</div>
