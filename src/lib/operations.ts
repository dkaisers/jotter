import { get } from 'svelte/store';
import { settings } from '$lib/theme';
import { totalSpan } from './selectors';
import {
	workspace,
	updateSpace,
	mapColumn,
	mapCard,
	mapTodo,
	newId,
	emptyTodoCard,
	emptyNoteCard
} from './store';
import { TOTAL_UNITS, type Card, type CardType, type Column, type TodoItem } from './types';

// ---- space-level operations ----

export function addSpace() {
	workspace.update((w) => {
		const s = { id: newId(), name: 'Unnamed', columns: [] as Column[] };
		return { spaces: [...w.spaces, s], activeId: s.id };
	});
}

/** Resets the workspace to a single empty space. */
export function clearWorkspace() {
	const s = { id: newId(), name: 'Unnamed', columns: [] as Column[] };
	workspace.set({ spaces: [s], activeId: s.id });
}

export function removeSpace(spaceId: string) {
	workspace.update((w) => {
		if (w.spaces.length <= 1) return w;
		const idx = w.spaces.findIndex((s) => s.id === spaceId);
		if (idx === -1) return w;
		const spaces = w.spaces.filter((s) => s.id !== spaceId);
		let activeId = w.activeId;
		if (activeId === spaceId) {
			activeId = spaces[Math.min(idx, spaces.length - 1)].id;
		}
		return { spaces, activeId };
	});
}

export function renameSpace(spaceId: string, name: string) {
	updateSpace(spaceId, (s) => ({ ...s, name: name.trim() || 'Unnamed' }));
}

export function setActiveSpace(spaceId: string) {
	workspace.update((w) =>
		w.spaces.some((s) => s.id === spaceId) ? { ...w, activeId: spaceId } : w
	);
}

export function reorderSpace(fromId: string, toId: string) {
	workspace.update((w) => {
		const from = w.spaces.findIndex((s) => s.id === fromId);
		const to = w.spaces.findIndex((s) => s.id === toId);
		if (from === -1 || to === -1 || from === to) return w;
		const spaces = [...w.spaces];
		const [moved] = spaces.splice(from, 1);
		spaces.splice(from < to ? to - 1 : to, 0, moved);
		return { ...w, spaces };
	});
}

// ---- column/card operations (target a space by its id) ----

export function addColumn(spaceId: string, type: CardType, span: number) {
	updateSpace(spaceId, (s) => ({
		...s,
		columns: [
			...s.columns,
			{
				id: newId(),
				span: Math.min(TOTAL_UNITS, Math.max(1, span)),
				cards: [type === 'todo' ? emptyTodoCard() : emptyNoteCard()]
			}
		]
	}));
}

export function addCard(spaceId: string, columnId: string, type: CardType): string {
	const card = type === 'todo' ? emptyTodoCard() : emptyNoteCard();
	mapColumn(spaceId, columnId, (col) => ({ ...col, cards: [...col.cards, card] }));
	return card.id;
}

export function removeCard(spaceId: string, columnId: string, cardId: string) {
	updateSpace(spaceId, (s) => {
		const columns = s.columns.map((c) =>
			c.id === columnId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c
		);
		const idx = columns.findIndex((c) => c.id === columnId);
		const isEmptyLast = idx !== -1 && idx === columns.length - 1 && columns[idx].cards.length === 0;
		return { ...s, columns: isEmptyLast ? columns.slice(0, -1) : columns };
	});
}

/** Moves a card to a column at an index. Returns false if source/target are missing. */
export function moveCard(
	spaceId: string,
	cardId: string,
	toColumnId: string,
	index: number
): boolean {
	let ok = false;
	updateSpace(spaceId, (s) => {
		let card: Card | undefined;
		const without = s.columns.map((c) => {
			const found = c.cards.find((x) => x.id === cardId);
			if (found) {
				card = found;
				return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };
			}
			return c;
		});
		if (!card) return s;
		const next = without.map((c) => {
			if (c.id !== toColumnId) return c;
			const cards = [...c.cards];
			const idx = Math.max(0, Math.min(cards.length, index));
			cards.splice(idx, 0, card!);
			return { ...c, cards };
		});
		ok = next.some((c) => c.id === toColumnId);
		// only an emptied *last* column collapses into leftover; others stay in place
		const last = next[next.length - 1];
		const columns = last && last.cards.length === 0 ? next.slice(0, -1) : next;
		return { ...s, columns };
	});
	return ok;
}

/** Moves a card into a brand-new column occupying the given span of leftover space. */
export function moveCardToNewColumn(spaceId: string, cardId: string, span: number) {
	updateSpace(spaceId, (s) => {
		let card: Card | undefined;
		const without = s.columns.map((c) => {
			const found = c.cards.find((x) => x.id === cardId);
			if (found) {
				card = found;
				return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };
			}
			return c;
		});
		if (!card) return s;
		// keep the emptied source column in place; the new column takes the slot position
		return {
			...s,
			columns: [...without, { id: newId(), span: Math.max(1, span), cards: [card] }]
		};
	});
}

/** Resizes a column's span. Freed space becomes trailing empty column; growth is capped by available space. */
export function setColumnSpan(spaceId: string, columnId: string, newSpan: number) {
	updateSpace(spaceId, (s) => {
		const idx = s.columns.findIndex((c) => c.id === columnId);
		if (idx === -1) return s;
		const col = s.columns[idx];
		const usedByOthers = totalSpan(s.columns) - col.span;
		const available = TOTAL_UNITS - usedByOthers;
		const span = Math.min(available, Math.round(newSpan));
		if (span <= 0 && col.cards.length === 0) {
			// an empty column shrunk to zero width is removed, freeing its space as leftover
			return { ...s, columns: s.columns.filter((c) => c.id !== columnId) };
		}
		return {
			...s,
			columns: s.columns.map((c, i) => (i === idx ? { ...c, span: Math.max(1, span) } : c))
		};
	});
}

export function setCardTitle(spaceId: string, columnId: string, cardId: string, title: string) {
	mapCard(spaceId, columnId, cardId, (card) => ({ ...card, title }));
}

// ---- todo operations ----

export function updateTodo(
	spaceId: string,
	columnId: string,
	cardId: string,
	todoId: string,
	patch: Partial<TodoItem>
) {
	mapTodo(spaceId, columnId, cardId, todoId, (t) => ({ ...t, ...patch }));
}

/** Stably reorders todos: important (flagged undone) first, and done last when enabled. */
function applyTodoSort(
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

/** Sets a todo's done state according to the auto-todo-handling mode. */
export function setTodoDone(
	spaceId: string,
	columnId: string,
	cardId: string,
	todoId: string,
	done: boolean
) {
	const { todoMode, importantToTop, doneToBottom, keepImportant } = get(settings);
	mapCard(spaceId, columnId, cardId, (card) => {
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

		const next = card.todos.map((t) => (t.id === todoId ? { ...t, done } : t));
		if (todoMode === 'sort') {
			return { ...card, todos: applyTodoSort(next, importantToTop, doneToBottom) };
		}
		return { ...card, todos: next };
	});
}

/** Stably sorts a todo card's todos according to the auto-todo-handling toggles. */
export function sortTodos(spaceId: string, columnId: string, cardId: string) {
	const { importantToTop, doneToBottom } = get(settings);
	mapCard(spaceId, columnId, cardId, (card) =>
		card.type === 'todo'
			? { ...card, todos: applyTodoSort(card.todos, importantToTop, doneToBottom) }
			: card
	);
}

export function addTodo(spaceId: string, columnId: string, cardId: string, text: string) {
	const trimmed = text.trim();
	if (!trimmed) return;
	mapCard(spaceId, columnId, cardId, (card) =>
		card.type === 'todo'
			? {
					...card,
					todos: [...card.todos, { id: newId(), text: trimmed, done: false, flagged: false }]
				}
			: card
	);
}

export function removeTodo(spaceId: string, columnId: string, cardId: string, todoId: string) {
	mapCard(spaceId, columnId, cardId, (card) =>
		card.type === 'todo' ? { ...card, todos: card.todos.filter((t) => t.id !== todoId) } : card
	);
}

export function reorderTodo(
	spaceId: string,
	columnId: string,
	cardId: string,
	fromIndex: number,
	toIndex: number
) {
	if (fromIndex === toIndex) return;
	mapCard(spaceId, columnId, cardId, (card) => {
		if (card.type !== 'todo') return card;
		const todos = [...card.todos];
		const [moved] = todos.splice(fromIndex, 1);
		todos.splice(toIndex, 0, moved);
		return { ...card, todos };
	});
}

// ---- note operations ----

export function updateNote(spaceId: string, columnId: string, cardId: string, text: string) {
	mapCard(spaceId, columnId, cardId, (card) => (card.type === 'note' ? { ...card, text } : card));
}
