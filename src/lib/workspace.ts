import { writable, derived, get } from 'svelte/store';
import { settings } from '$lib/theme';

export type CardType = 'todo' | 'note';

export interface TodoItem {
	id: string;
	text: string;
	done: boolean;
	flagged: boolean;
}

interface CardBase {
	id: string;
	type: CardType;
	title: string;
}

export interface TodoCard extends CardBase {
	type: 'todo';
	todos: TodoItem[];
}

export interface NoteCard extends CardBase {
	type: 'note';
	text: string;
}

export type Card = TodoCard | NoteCard;

export interface Column {
	id: string;
	span: number;
	cards: Card[];
}

export interface Space {
	id: string;
	name: string;
	columns: Column[];
}

export interface Workspace {
	spaces: Space[];
	activeId: string;
}

export const TOTAL_UNITS = 8;

const STORAGE_KEY = 'jotter:spaces';
const LEGACY_KEY = 'jotter:workspace';

function newId(): string {
	return crypto.randomUUID();
}

function emptyTodoCard(): TodoCard {
	return { id: newId(), type: 'todo', title: 'Todos', todos: [] };
}

function emptyNoteCard(): NoteCard {
	return { id: newId(), type: 'note', title: 'Note', text: '' };
}

function defaultColumns(): Column[] {
	return [
		{ id: newId(), span: 4, cards: [emptyTodoCard()] },
		{ id: newId(), span: 4, cards: [emptyNoteCard()] }
	];
}

function sanitizeColumns(raw: unknown): Column[] {
	if (!Array.isArray(raw)) return defaultColumns();
	const cols: Column[] = [];
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue;
		const it = item as Record<string, unknown>;
		if (!Array.isArray(it.cards)) continue;
		const cards: Card[] = [];
		for (const c of it.cards) {
			if (!c || typeof c !== 'object') continue;
			const card = c as Record<string, unknown>;
			if (card.type !== 'todo' && card.type !== 'note') continue;
			const id = typeof card.id === 'string' ? card.id : newId();
			const title =
				typeof card.title === 'string' ? card.title : card.type === 'todo' ? 'Todos' : 'Note';
			if (card.type === 'todo') {
				const list = Array.isArray(card.todos) ? card.todos : [];
				cards.push({
					type: 'todo',
					id,
					title,
					todos: list
						.filter((t): t is TodoItem => !!t && typeof (t as TodoItem).text === 'string')
						.map((t) => ({
							id: typeof t.id === 'string' ? t.id : newId(),
							text: t.text,
							done: !!t.done,
							flagged: !!t.flagged
						}))
				});
			} else {
				cards.push({
					type: 'note',
					id,
					title,
					text: typeof card.text === 'string' ? card.text : ''
				});
			}
		}
		const span = clampSpan(it.span);
		cols.push({ id: typeof it.id === 'string' ? it.id : newId(), span, cards });
	}
	return cols;
}

function clampSpan(v: unknown): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return 4;
	return Math.min(TOTAL_UNITS, Math.max(1, Math.round(n)));
}

function defaultSpace(): Space {
	return { id: newId(), name: 'Unnamed', columns: defaultColumns() };
}

function sanitizeSpace(raw: unknown): Space | null {
	if (!raw || typeof raw !== 'object') return null;
	const it = raw as Record<string, unknown>;
	return {
		id: typeof it.id === 'string' ? it.id : newId(),
		name: typeof it.name === 'string' ? it.name : 'Unnamed',
		columns: sanitizeColumns(it.columns)
	};
}

function initialWorkspace(): Workspace {
	if (typeof document === 'undefined') return { spaces: [defaultSpace()], activeId: '' };
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object' && Array.isArray(parsed.spaces)) {
				const spaces = (parsed.spaces as unknown[])
					.map((s) => sanitizeSpace(s))
					.filter((s): s is Space => !!s);
				if (spaces.length > 0) {
					const activeId =
						typeof parsed.activeId === 'string' && spaces.some((s) => s.id === parsed.activeId)
							? parsed.activeId
							: spaces[0].id;
					return { spaces, activeId };
				}
			}
		}
		// migrate legacy single-workspace blob
		const legacy = window.localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			const space: Space = {
				id: newId(),
				name: 'Unnamed',
				columns: sanitizeColumns(JSON.parse(legacy))
			};
			return { spaces: [space], activeId: space.id };
		}
	} catch {
		// fall through to default
	}
	const s = defaultSpace();
	return { spaces: [s], activeId: s.id };
}

export const workspace = writable<Workspace>(initialWorkspace());

workspace.subscribe((w) => {
	if (typeof document === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
		window.localStorage.removeItem(LEGACY_KEY);
	} catch {
		// storage unavailable, ignore
	}
});

export const activeSpace = derived(workspace, (w) => {
	return w.spaces.find((s) => s.id === w.activeId) ?? w.spaces[0];
});

/** Number of flagged, not-done todos across all spaces. */
export function countFlaggedUndone(w: Workspace): number {
	let n = 0;
	for (const s of w.spaces) {
		for (const c of s.columns) {
			for (const card of c.cards) {
				if (card.type === 'todo') n += card.todos.filter((t) => t.flagged && !t.done).length;
			}
		}
	}
	return n;
}

/** Whether a space contains any flagged, not-done todo. */
export function spaceHasFlagged(space: Space): boolean {
	return space.columns.some((c) =>
		c.cards.some((card) => card.type === 'todo' && card.todos.some((t) => t.flagged && !t.done))
	);
}

/** Whether a space has no cards at all (no todo lists and no notes). */
export function spaceIsEmpty(space: Space): boolean {
	return space.columns.every((c) => c.cards.length === 0);
}

function updateSpace(spaceId: string, fn: (space: Space) => Space) {
	workspace.update((w) => ({
		...w,
		spaces: w.spaces.map((s) => (s.id === spaceId ? fn(s) : s))
	}));
}

export function totalSpan(cols: Column[]): number {
	return cols.reduce((sum, c) => sum + c.span, 0);
}

// ---- space-level operations ----

export function addSpace() {
	workspace.update((w) => {
		const s = { id: newId(), name: 'Unnamed', columns: [] as Column[] };
		return { spaces: [...w.spaces, s], activeId: s.id };
	});
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
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, card] } : c))
	}));
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
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? { ...c, cards: c.cards.map((x) => (x.id === cardId ? { ...x, title } : x)) }
				: c
		)
	}));
}

export function updateTodo(
	spaceId: string,
	columnId: string,
	cardId: string,
	todoId: string,
	patch: Partial<TodoItem>
) {
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) =>
							x.type === 'todo' && x.id === cardId
								? { ...x, todos: x.todos.map((t) => (t.id === todoId ? { ...t, ...patch } : t)) }
								: x
						)
					}
				: c
		)
	}));
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
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) => {
							if (x.type !== 'todo' || x.id !== cardId) return x;
							const idx = x.todos.findIndex((t) => t.id === todoId);
							if (idx === -1) return x;

							if (done && todoMode === 'delete') {
								if (keepImportant && x.todos[idx].flagged) {
									return {
										...x,
										todos: x.todos.map((t) => (t.id === todoId ? { ...t, done: true } : t))
									};
								}
								return { ...x, todos: x.todos.filter((t) => t.id !== todoId) };
							}

							const next = x.todos.map((t) => (t.id === todoId ? { ...t, done } : t));
							if (todoMode === 'sort') {
								return { ...x, todos: applyTodoSort(next, importantToTop, doneToBottom) };
							}
							return { ...x, todos: next };
						})
					}
				: c
		)
	}));
}

/** Stably sorts a todo card's todos according to the auto-todo-handling toggles. */
export function sortTodos(spaceId: string, columnId: string, cardId: string) {
	const { importantToTop, doneToBottom } = get(settings);
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) =>
							x.type === 'todo' && x.id === cardId
								? { ...x, todos: applyTodoSort(x.todos, importantToTop, doneToBottom) }
								: x
						)
					}
				: c
		)
	}));
}

export function addTodo(spaceId: string, columnId: string, cardId: string, text: string) {
	const trimmed = text.trim();
	if (!trimmed) return;
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) =>
							x.type === 'todo' && x.id === cardId
								? {
										...x,
										todos: [...x.todos, { id: newId(), text: trimmed, done: false, flagged: false }]
									}
								: x
						)
					}
				: c
		)
	}));
}

export function removeTodo(spaceId: string, columnId: string, cardId: string, todoId: string) {
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) =>
							x.type === 'todo' && x.id === cardId
								? { ...x, todos: x.todos.filter((t) => t.id !== todoId) }
								: x
						)
					}
				: c
		)
	}));
}

export function reorderTodo(
	spaceId: string,
	columnId: string,
	cardId: string,
	fromIndex: number,
	toIndex: number
) {
	if (fromIndex === toIndex) return;
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) => {
							if (x.type !== 'todo' || x.id !== cardId) return x;
							const todos = [...x.todos];
							const [moved] = todos.splice(fromIndex, 1);
							todos.splice(toIndex, 0, moved);
							return { ...x, todos };
						})
					}
				: c
		)
	}));
}

export function updateNote(spaceId: string, columnId: string, cardId: string, text: string) {
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) => (x.type === 'note' && x.id === cardId ? { ...x, text } : x))
					}
				: c
		)
	}));
}
