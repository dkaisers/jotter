<script lang="ts">
	import { addTodo, reorderTodo, type Column, type Space, type TodoCard } from '$lib/workspace';
	import { settings } from '$lib/theme';
	import { startDrag } from '$lib/drag';
	import TodoRow from './TodoRow.svelte';

	let {
		space,
		column,
		card,
		autofocus = false
	}: { space: Space; column: Column; card: TodoCard; autofocus?: boolean } = $props();

	let draft = $state('');
	let draftInput: HTMLTextAreaElement | undefined = $state();

	function submit() {
		addTodo(space.id, column.id, card.id, draft);
		draft = '';
		requestAnimationFrame(() => draftInput?.focus());
	}

	function onDragStart(e: PointerEvent, todoId: string) {
		e.preventDefault();
		startDrag({
			onMove: (ev) => {
				const el = document
					.elementFromPoint(ev.clientX, ev.clientY)
					?.closest('[data-todo-id]') as HTMLElement | null;
				if (!el) return;
				const targetId = el.dataset.todoId;
				if (!targetId || targetId === todoId) return;
				const fromIndex = card.todos.findIndex((t) => t.id === todoId);
				const toIndex = card.todos.findIndex((t) => t.id === targetId);
				if (fromIndex === -1 || toIndex === -1) return;
				reorderTodo(space.id, column.id, card.id, fromIndex, toIndex);
			}
		});
	}

	$effect(() => {
		if (autofocus) draftInput?.focus();
	});
</script>

<div class="flex flex-col gap-1.5">
	{#each card.todos as todo (todo.id)}
		<TodoRow {space} {column} {card} {todo} {onDragStart} />
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
