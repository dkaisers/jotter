import { describe, expect, it } from 'vitest';
import {
	applyTodoDone,
	applyTodoPatch,
	applyTodoReorder,
	applyTodoSort,
	placeNewTodo
} from './todoSort';
import type { Card, TodoCard, TodoItem } from './types';

/** Builds a todo with a short, readable id. */
function t(id: string, done = false, flagged = false): TodoItem {
	return { id, text: id, done, flagged };
}

/** Builds a todo card holding the given todos. */
function card(...todos: TodoItem[]): TodoCard {
	return { id: 'c', type: 'todo', title: 'Todos', todos };
}

/** Narrows a card back to a todo card (these helpers only operate on todo cards). */
function tc(next: Card): TodoCard {
	if (next.type !== 'todo') throw new Error('expected a todo card');
	return next;
}

/** Reduces a list of todos to their ids for readable assertions. */
function ids(todos: TodoItem[]): string[] {
	return todos.map((x) => x.id);
}

describe('applyTodoSort (full re-canonicalization)', () => {
	const mixed = () => [t('d1', true), t('u1'), t('f2', false, true), t('u2'), t('d2', true)];

	it('with both toggles on, orders F → U → D stably', () => {
		const sorted = applyTodoSort(mixed(), true, true);
		expect(ids(sorted)).toEqual(['f2', 'u1', 'u2', 'd1', 'd2']);
	});

	it('with only importantToTop, flagged undone items rise to the top', () => {
		const sorted = applyTodoSort(mixed(), true, false);
		expect(ids(sorted)).toEqual(['f2', 'd1', 'u1', 'u2', 'd2']);
	});

	it('with only doneToBottom, done items sink to the bottom (flags are plain undone)', () => {
		const sorted = applyTodoSort(mixed(), false, true);
		expect(ids(sorted)).toEqual(['u1', 'f2', 'u2', 'd1', 'd2']);
	});

	it('with no toggles, order is unchanged', () => {
		const sorted = applyTodoSort(mixed(), false, false);
		expect(ids(sorted)).toEqual(['d1', 'u1', 'f2', 'u2', 'd2']);
	});

	it('is stable: relative order within each class is preserved', () => {
		const sorted = applyTodoSort([t('f1', false, true), t('f2', false, true)], true, true);
		expect(ids(sorted)).toEqual(['f1', 'f2']);
	});
});

describe('applyTodoPatch', () => {
	it('flagging an undone todo rises to the top in sort mode', () => {
		const next = tc(
			applyTodoPatch(card(t('a'), t('b')), 'b', { flagged: true }, 'sort', true, true)
		);
		expect(ids(next.todos)).toEqual(['b', 'a']);
	});

	it('unflagging keeps the item in place among undone items', () => {
		const next = tc(
			applyTodoPatch(card(t('f', false, true), t('a')), 'f', { flagged: false }, 'sort', true, true)
		);
		expect(ids(next.todos)).toEqual(['f', 'a']);
		expect(next.todos[0].flagged).toBe(false);
	});

	it('flagging a done item does not move it (done class wins)', () => {
		const next = tc(
			applyTodoPatch(card(t('a'), t('d1', true)), 'd1', { flagged: true }, 'sort', true, true)
		);
		expect(ids(next.todos)).toEqual(['a', 'd1']);
		expect(next.todos[1].flagged).toBe(true);
	});

	it('text edits never reposition', () => {
		const next = tc(
			applyTodoPatch(card(t('a'), t('b')), 'b', { text: 'changed' }, 'sort', true, true)
		);
		expect(ids(next.todos)).toEqual(['a', 'b']);
		expect(next.todos[1].text).toBe('changed');
	});

	it('flagging in non-sort mode only patches', () => {
		const next = tc(
			applyTodoPatch(card(t('a'), t('b')), 'b', { flagged: true }, 'none', true, true)
		);
		expect(ids(next.todos)).toEqual(['a', 'b']);
		expect(next.todos[1].flagged).toBe(true);
	});

	it('flagging in sort mode without importantToTop does not reposition', () => {
		const next = tc(
			applyTodoPatch(card(t('a'), t('b')), 'b', { flagged: true }, 'sort', false, true)
		);
		expect(ids(next.todos)).toEqual(['a', 'b']);
	});
});

describe('applyTodoDone', () => {
	it('sort mode with doneToBottom moves the done todo to the done group', () => {
		const next = tc(applyTodoDone(card(t('a'), t('b')), 'a', true, 'sort', true, true, false));
		expect(ids(next.todos)).toEqual(['b', 'a']);
		expect(next.todos[1].done).toBe(true);
	});

	it('sort mode without doneToBottom only flips done', () => {
		const next = tc(applyTodoDone(card(t('a'), t('b')), 'a', true, 'sort', true, false, false));
		expect(ids(next.todos)).toEqual(['a', 'b']);
		expect(next.todos[0].done).toBe(true);
	});

	it('none mode only flips done', () => {
		const next = tc(applyTodoDone(card(t('a'), t('b')), 'a', true, 'none', true, true, false));
		expect(ids(next.todos)).toEqual(['a', 'b']);
		expect(next.todos[0].done).toBe(true);
	});

	it('delete mode removes a done todo', () => {
		const next = tc(applyTodoDone(card(t('a'), t('b')), 'a', true, 'delete', true, true, false));
		expect(ids(next.todos)).toEqual(['b']);
	});

	it('delete mode with keepImportant keeps flagged todos as done', () => {
		const next = tc(
			applyTodoDone(card(t('a', false, true), t('b')), 'a', true, 'delete', true, true, true)
		);
		expect(ids(next.todos)).toEqual(['a', 'b']);
		expect(next.todos[0].done).toBe(true);
	});

	it('un-done rises to the flagged group when the item was flagged', () => {
		const next = tc(
			applyTodoDone(card(t('a'), t('d', true, true)), 'd', false, 'sort', true, true, false)
		);
		expect(ids(next.todos)).toEqual(['d', 'a']);
		expect(next.todos[0].flagged).toBe(true);
	});

	it('flag a done item, then un-done: the item ends up at the top', () => {
		let next = tc(
			applyTodoPatch(card(t('a'), t('d', true)), 'd', { flagged: true }, 'sort', true, true)
		);
		next = tc(applyTodoDone(next, 'd', false, 'sort', true, true, false));
		expect(ids(next.todos)).toEqual(['d', 'a']);
	});
});

describe('placeNewTodo', () => {
	it('appends at the bottom in non-sort mode', () => {
		const todos = [t('a'), t('d1', true)];
		const next = placeNewTodo(todos, t('n'), 'none', true, true);
		expect(ids(next)).toEqual(['a', 'd1', 'n']);
	});

	it('in sort mode with doneToBottom on, new todos land above the done section', () => {
		const todos = [t('a'), t('d1', true)];
		const next = placeNewTodo(todos, t('n'), 'sort', true, true);
		expect(ids(next)).toEqual(['a', 'n', 'd1']);
	});

	it('in sort mode without doneToBottom, new todos land at the bottom', () => {
		const todos = [t('f1', false, true), t('a')];
		const next = placeNewTodo(todos, t('n'), 'sort', true, false);
		expect(ids(next)).toEqual(['f1', 'a', 'n']);
	});
});

describe('applyTodoReorder', () => {
	it('reordering within a class survives in sort mode', () => {
		const todos = [t('u1'), t('u2'), t('u3')];
		const next = applyTodoReorder(todos, 2, 0, 'sort', true, true);
		expect(ids(next)).toEqual(['u3', 'u1', 'u2']);
	});

	it('dropping across a class boundary snaps back in sort mode', () => {
		const todos = [t('u1'), t('u2'), t('d1', true)];
		const next = applyTodoReorder(todos, 2, 0, 'sort', true, true);
		expect(ids(next)).toEqual(['u1', 'u2', 'd1']);
	});

	it('reordering is free in non-sort mode', () => {
		const todos = [t('u1'), t('u2'), t('d1', true)];
		const next = applyTodoReorder(todos, 2, 0, 'none', true, true);
		expect(ids(next)).toEqual(['d1', 'u1', 'u2']);
	});

	it('no-op when moving to the same index', () => {
		const todos = [t('u1'), t('u2')];
		const next = applyTodoReorder(todos, 1, 1, 'sort', true, true);
		expect(ids(next)).toEqual(['u1', 'u2']);
	});
});
