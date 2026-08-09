import { writable } from 'svelte/store';

export type CardType = 'todo' | 'note';

export interface TodoItem {
	id: string;
	text: string;
	done: boolean;
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

export const TOTAL_UNITS = 8;

const STORAGE_KEY = 'jotter:workspace';

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

function sanitize(raw: unknown): Column[] {
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
							done: !!t.done
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
	return cols.length > 0 ? cols : defaultColumns();
}

function clampSpan(v: unknown): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return 4;
	return Math.min(TOTAL_UNITS, Math.max(1, Math.round(n)));
}

function initialColumns(): Column[] {
	if (typeof document === 'undefined') return defaultColumns();
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return raw ? sanitize(JSON.parse(raw)) : defaultColumns();
	} catch {
		return defaultColumns();
	}
}

export const columns = writable<Column[]>(initialColumns());

columns.subscribe((cols) => {
	if (typeof document === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
	} catch {
		// storage unavailable, ignore
	}
});

export function totalSpan(cols: Column[]): number {
	return cols.reduce((sum, c) => sum + c.span, 0);
}

export function addColumn(type: CardType, span: number) {
	columns.update((cols) => [
		...cols,
		{
			id: newId(),
			span: Math.min(TOTAL_UNITS, Math.max(1, span)),
			cards: [type === 'todo' ? emptyTodoCard() : emptyNoteCard()]
		}
	]);
}

export function addCard(columnId: string, type: CardType) {
	columns.update((cols) =>
		cols.map((c) =>
			c.id === columnId
				? { ...c, cards: [...c.cards, type === 'todo' ? emptyTodoCard() : emptyNoteCard()] }
				: c
		)
	);
}

export function removeCard(columnId: string, cardId: string) {
	columns.update((cols) =>
		cols.map((c) =>
			c.id === columnId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c
		)
	);
}

/** Moves a card to a column at an index. Returns false if source/target are missing. */
export function moveCard(cardId: string, toColumnId: string, index: number): boolean {
	let ok = false;
	columns.update((cols) => {
		let card: Card | undefined;
		const without = cols.map((c) => {
			const found = c.cards.find((x) => x.id === cardId);
			if (found) {
				card = found;
				return { ...c, cards: c.cards.filter((x) => x.id !== cardId) };
			}
			return c;
		});
		if (!card) return cols;
		const next = without.map((c) => {
			if (c.id !== toColumnId) return c;
			const cards = [...c.cards];
			const idx = Math.max(0, Math.min(cards.length, index));
			cards.splice(idx, 0, card!);
			return { ...c, cards };
		});
		ok = next.some((c) => c.id === toColumnId);
		return next;
	});
	return ok;
}

/** Resizes a column's span. Freed space becomes trailing empty column; growth is capped by available space. */
export function setColumnSpan(columnId: string, newSpan: number) {
	columns.update((cols) => {
		const idx = cols.findIndex((c) => c.id === columnId);
		if (idx === -1) return cols;
		const col = cols[idx];
		const usedByOthers = totalSpan(cols) - col.span;
		const available = TOTAL_UNITS - usedByOthers;
		const span = Math.min(available, Math.max(1, Math.round(newSpan)));
		return cols.map((c, i) => (i === idx ? { ...c, span } : c));
	});
}

export function setCardTitle(columnId: string, cardId: string, title: string) {
	columns.update((cols) =>
		cols.map((c) =>
			c.id === columnId
				? { ...c, cards: c.cards.map((x) => (x.id === cardId ? { ...x, title } : x)) }
				: c
		)
	);
}

export function updateTodo(
	columnId: string,
	cardId: string,
	todoId: string,
	patch: Partial<TodoItem>
) {
	columns.update((cols) =>
		cols.map((c) =>
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
	);
}

export function addTodo(columnId: string, cardId: string, text: string) {
	const trimmed = text.trim();
	if (!trimmed) return;
	columns.update((cols) =>
		cols.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) =>
							x.type === 'todo' && x.id === cardId
								? { ...x, todos: [...x.todos, { id: newId(), text: trimmed, done: false }] }
								: x
						)
					}
				: c
		)
	);
}

export function removeTodo(columnId: string, cardId: string, todoId: string) {
	columns.update((cols) =>
		cols.map((c) =>
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
	);
}

export function updateNote(columnId: string, cardId: string, text: string) {
	columns.update((cols) =>
		cols.map((c) =>
			c.id === columnId
				? {
						...c,
						cards: c.cards.map((x) => (x.type === 'note' && x.id === cardId ? { ...x, text } : x))
					}
				: c
		)
	);
}
