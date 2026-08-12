import type { Card, TodoItem } from './types';
import type { TodoMode } from './theme';

/**
 * Auto todo handling — "Sort" mode logic.
 *
 * Maintained-invariant model: while "Auto todo handling" is "sort", every todo
 * list always obeys the canonical order
 *
 *      F → U → D
 *
 *   F   flagged & undone          ← "Important to top"
 *   U   any undone todo
 *   D   done                      ← "Done to bottom"
 *
 * A class only exists while its toggle is on: without "Important to top",
 * flagged items are plain undone; without "Done to bottom", done items are
 * plain undone. Done beats flagged, so a done+flagged todo is D.
 *
 * Because the list is already canonical, a full stable re-sort after a change
 * only visibly moves the toggled item — nothing else jumps. Stable sorting
 * also preserves the user's manual within-class order.
 *
 *   toggle done / important / add / drag-release
 *      │
 *      ├─ mode "none"   ──► just flip the flag (no re-sort)
 *      ├─ mode "delete" ──► remove the done todo (keep it if important)
 *      └─ mode "sort"   ──► stable re-sort to canonical order
 *
 * Dragging is free: the manual move is applied first, then the stable re-sort.
 * Reordering within a class survives; dropping across a class boundary snaps
 * the item back to its group.
 */

/** Stably reorders all todos into canonical order: F → U → D. */
export function applyTodoSort(
	todos: TodoItem[],
	importantToTop: boolean,
	doneToBottom: boolean
): TodoItem[] {
	let ordered = todos;
	if (importantToTop) {
		const flagged = todos.filter((t) => t.flagged && !t.done);
		ordered = [...flagged, ...todos.filter((t) => !(t.flagged && !t.done))];
	}
	if (doneToBottom) {
		ordered = [...ordered.filter((t) => !t.done), ...ordered.filter((t) => t.done)];
	}
	return ordered;
}

/**
 * Applies a partial patch to a todo. In sort mode the list is re-sorted when
 * the important flag changes; text edits never re-sort.
 */
export function applyTodoPatch(
	card: Card,
	todoId: string,
	patch: Partial<TodoItem>,
	todoMode: TodoMode,
	importantToTop: boolean,
	doneToBottom: boolean
): Card {
	if (card.type !== 'todo') return card;
	const todos = card.todos.map((t) => (t.id === todoId ? { ...t, ...patch } : t));
	if (todoMode === 'sort' && patch.flagged !== undefined) {
		return { ...card, todos: applyTodoSort(todos, importantToTop, doneToBottom) };
	}
	return { ...card, todos };
}

/**
 * Applies a done-state change according to the auto-todo-handling mode.
 * "delete" removes the todo (or keeps it marked done when it is important and
 * keep-important is on); "sort" re-sorts to canonical order; "none" only
 * flips the flag.
 */
export function applyTodoDone(
	card: Card,
	todoId: string,
	done: boolean,
	todoMode: TodoMode,
	importantToTop: boolean,
	doneToBottom: boolean,
	keepImportant: boolean
): Card {
	if (card.type !== 'todo') return card;
	const idx = card.todos.findIndex((t) => t.id === todoId);
	if (idx === -1) return card;

	if (done && todoMode === 'delete') {
		if (keepImportant && card.todos[idx].flagged) {
			return {
				...card,
				todos: card.todos.map((t) => (t.id === todoId ? { ...t, done: true } : t))
			};
		}
		return { ...card, todos: card.todos.filter((t) => t.id !== todoId) };
	}

	const todos = card.todos.map((t) => (t.id === todoId ? { ...t, done } : t));
	if (todoMode === 'sort') {
		return { ...card, todos: applyTodoSort(todos, importantToTop, doneToBottom) };
	}
	return { ...card, todos };
}

/** Appends a new todo and, in sort mode, re-sorts it into canonical position. */
export function placeNewTodo(
	todos: TodoItem[],
	todo: TodoItem,
	todoMode: TodoMode,
	importantToTop: boolean,
	doneToBottom: boolean
): TodoItem[] {
	const next = [...todos, todo];
	if (todoMode !== 'sort') return next;
	return applyTodoSort(next, importantToTop, doneToBottom);
}

/**
 * Applies a manual drag reorder. In sort mode the moved item then snaps back
 * to the first valid position: reordering within its own class survives, but
 * dropping across a class boundary restores the canonical order.
 */
export function applyTodoReorder(
	todos: TodoItem[],
	fromIndex: number,
	toIndex: number,
	todoMode: TodoMode,
	importantToTop: boolean,
	doneToBottom: boolean
): TodoItem[] {
	if (fromIndex === toIndex) return todos;
	const next = [...todos];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	if (todoMode !== 'sort') return next;
	return applyTodoSort(next, importantToTop, doneToBottom);
}
