import { get } from 'svelte/store';
import { settings } from '$lib/theme';
import { totalSpan } from './selectors';
import {
	workspace,
	updateSpace,
	mapColumn,
	mapCard,
	newId,
	emptyTodoCard,
	emptyNoteCard
} from './store';
import {
	applyTodoPatch,
	applyTodoDone,
	applyTodoSort,
	applyTodoReorder,
	placeNewTodo
} from './todoSort';
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

/** Pulls a card out of its column, returning the card and the columns without it. */
function takeCard(
	columns: Column[],
	cardId: string
): { columns: Column[]; card: Card | undefined } {
	let card: Card | undefined;
	const without = columns.map((c) => {
		const found = c.cards.find((x) => x.id === cardId);
		if (found) {
			card = found;
			return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };
		}
		return c;
	});
	return { columns: without, card };
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
		const { columns: without, card } = takeCard(s.columns, cardId);
		if (!card) return s;
		const next = without.map((c) => {
			if (c.id !== toColumnId) return c;
			const cards = [...c.cards];
			const idx = Math.max(0, Math.min(cards.length, index));
			cards.splice(idx, 0, card);
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
		const { columns: without, card } = takeCard(s.columns, cardId);
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
	const { todoMode, importantToTop, doneToBottom } = get(settings);
	mapCard(spaceId, columnId, cardId, (card) =>
		applyTodoPatch(card, todoId, patch, todoMode, importantToTop, doneToBottom)
	);
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
	mapCard(spaceId, columnId, cardId, (card) =>
		applyTodoDone(card, todoId, done, todoMode, importantToTop, doneToBottom, keepImportant)
	);
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
	const { todoMode, importantToTop, doneToBottom } = get(settings);
	mapCard(spaceId, columnId, cardId, (card) =>
		card.type === 'todo'
			? {
					...card,
					todos: placeNewTodo(
						card.todos,
						{ id: newId(), text: trimmed, done: false, flagged: false },
						todoMode,
						importantToTop,
						doneToBottom
					)
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
	const { todoMode, importantToTop, doneToBottom } = get(settings);
	mapCard(spaceId, columnId, cardId, (card) => {
		if (card.type !== 'todo') return card;
		return {
			...card,
			todos: applyTodoReorder(
				card.todos,
				fromIndex,
				toIndex,
				todoMode,
				importantToTop,
				doneToBottom
			)
		};
	});
}

/** Re-sorts every todo card to canonical order (used when a sort toggle is enabled). */
export function sortAllTodoCards() {
	const { todoMode, importantToTop, doneToBottom } = get(settings);
	if (todoMode !== 'sort') return;
	workspace.update((w) => ({
		...w,
		spaces: w.spaces.map((s) => ({
			...s,
			columns: s.columns.map((c) => ({
				...c,
				cards: c.cards.map((card) =>
					card.type === 'todo'
						? { ...card, todos: applyTodoSort(card.todos, importantToTop, doneToBottom) }
						: card
				)
			}))
		}))
	}));
}

// ---- note operations ----

export function updateNote(spaceId: string, columnId: string, cardId: string, text: string) {
	mapCard(spaceId, columnId, cardId, (card) => (card.type === 'note' ? { ...card, text } : card));
}
