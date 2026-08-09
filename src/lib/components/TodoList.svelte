<script lang="ts">
	import { Check, Plus, Trash2 } from 'lucide-svelte';
	import {
		addTodo,
		removeTodo,
		updateTodo,
		type Column,
		type Space,
		type TodoCard
	} from '$lib/workspace';

	let { space, column, card }: { space: Space; column: Column; card: TodoCard } = $props();

	let draft = $state('');
	let editingId: string | null = $state(null);
	let draftEdit = $state('');

	function submit() {
		addTodo(space.id, column.id, card.id, draft);
		draft = '';
	}

	function startEdit(todoId: string, text: string) {
		editingId = todoId;
		draftEdit = text;
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
</script>

<div class="flex flex-col gap-2">
	<ul class="flex flex-col gap-1">
		{#each card.todos as todo (todo.id)}
			<li class="group flex items-center gap-2">
				<button
					type="button"
					role="checkbox"
					aria-checked={todo.done}
					title={todo.done ? 'Mark as not done' : 'Mark as done'}
					onclick={() => updateTodo(space.id, column.id, card.id, todo.id, { done: !todo.done })}
					class:accent-fill={todo.done}
					class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-outline-variant text-on-primary hover:border-primary hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
				>
					{#if todo.done}
						<Check class="size-3.5" />
					{/if}
				</button>

				{#if editingId === todo.id}
					<input
						type="text"
						bind:value={draftEdit}
						onkeydown={(e) => {
							if (e.key === 'Enter') commitEdit(todo.id);
							if (e.key === 'Escape') editingId = null;
						}}
						onblur={() => commitEdit(todo.id)}
						class="w-full rounded-md border border-outline-variant bg-base px-2 py-0.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
					/>
				{:else}
					<button
						type="button"
						onclick={() => startEdit(todo.id, todo.text)}
						class="w-full min-w-0 flex-1 cursor-text rounded-md px-2 py-0.5 text-left text-sm hover:bg-surface-variant focus:ring-2 focus:ring-primary focus:outline-none"
						class:text-on-surface-variant={todo.done}
						class:line-through={todo.done}
					>
						{todo.text}
					</button>
				{/if}

				<button
					type="button"
					title="Delete todo"
					onclick={() => removeTodo(space.id, column.id, card.id, todo.id)}
					class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface focus:opacity-100 focus:ring-2 focus:ring-primary focus:outline-none"
				>
					<Trash2 class="size-3.5" />
				</button>
			</li>
		{/each}
	</ul>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
		class="flex items-center gap-2"
	>
		<input
			type="text"
			placeholder="Add todo…"
			bind:value={draft}
			class="w-full rounded-md border border-outline-variant bg-base px-2 py-1 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
		/>
		<button
			type="submit"
			title="Add todo"
			class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
		>
			<Plus class="size-4" />
		</button>
	</form>
</div>
