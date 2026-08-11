import { writable } from 'svelte/store';
import {
	TOTAL_UNITS,
	type Card,
	type Column,
	type Space,
	type TodoCard,
	type TodoItem,
	type NoteCard,
	type Workspace
} from './types';

const STORAGE_KEY = 'jotter:spaces';
const LEGACY_KEY = 'jotter:workspace';

export function newId(): string {
	return crypto.randomUUID();
}

export function emptyTodoCard(): TodoCard {
	return { id: newId(), type: 'todo', title: 'Todos', todos: [] };
}

export function emptyNoteCard(): NoteCard {
	return { id: newId(), type: 'note', title: 'Note', text: '' };
}

function defaultColumns(): Column[] {
	return [
		{ id: newId(), span: 4, cards: [emptyTodoCard()] },
		{ id: newId(), span: 4, cards: [emptyNoteCard()] }
	];
}

function clampSpan(v: unknown): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return 4;
	return Math.min(TOTAL_UNITS, Math.max(1, Math.round(n)));
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return !!v && typeof v === 'object';
}

function asString(v: unknown): string | null {
	return typeof v === 'string' ? v : null;
}

function sanitizeTodo(raw: unknown): TodoItem | null {
	if (!isRecord(raw) || typeof raw.text !== 'string') return null;
	return {
		id: asString(raw.id) ?? newId(),
		text: raw.text,
		done: !!raw.done,
		flagged: !!raw.flagged
	};
}

function sanitizeCard(raw: unknown): Card | null {
	if (!isRecord(raw)) return null;
	const id = asString(raw.id) ?? newId();
	const title = asString(raw.title) ?? (raw.type === 'todo' ? 'Todos' : 'Note');
	if (raw.type === 'todo') {
		const todos = Array.isArray(raw.todos)
			? raw.todos.map(sanitizeTodo).filter((t): t is TodoItem => !!t)
			: [];
		return { type: 'todo', id, title, todos };
	}
	if (raw.type === 'note') {
		return { type: 'note', id, title, text: asString(raw.text) ?? '' };
	}
	return null;
}

function sanitizeColumn(raw: unknown): Column | null {
	if (!isRecord(raw) || !Array.isArray(raw.cards)) return null;
	const cards = raw.cards.map(sanitizeCard).filter((c): c is Card => !!c);
	return {
		id: asString(raw.id) ?? newId(),
		span: clampSpan(raw.span),
		cards
	};
}

function sanitizeColumns(raw: unknown): Column[] {
	if (!Array.isArray(raw)) return defaultColumns();
	return raw.map(sanitizeColumn).filter((c): c is Column => !!c);
}

function defaultSpace(): Space {
	return { id: newId(), name: 'Unnamed', columns: defaultColumns() };
}

export function sanitizeSpace(raw: unknown): Space | null {
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
		const next = JSON.stringify(w);
		// skip writes that just echo a synced value back (avoids cross-tab loops)
		if (window.localStorage.getItem(STORAGE_KEY) === next) return;
		window.localStorage.setItem(STORAGE_KEY, next);
		window.localStorage.removeItem(LEGACY_KEY);
	} catch {
		// storage unavailable, ignore
	}
});

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (e) => {
		if (e.key !== STORAGE_KEY) return;
		workspace.set(initialWorkspace());
	});
}

export function updateSpace(spaceId: string, fn: (space: Space) => Space) {
	workspace.update((w) => ({
		...w,
		spaces: w.spaces.map((s) => (s.id === spaceId ? fn(s) : s))
	}));
}

export function mapColumn(spaceId: string, columnId: string, fn: (col: Column) => Column) {
	updateSpace(spaceId, (s) => ({
		...s,
		columns: s.columns.map((c) => (c.id === columnId ? fn(c) : c))
	}));
}

export function mapCard(
	spaceId: string,
	columnId: string,
	cardId: string,
	fn: (card: Card) => Card
) {
	mapColumn(spaceId, columnId, (col) => ({
		...col,
		cards: col.cards.map((x) => (x.id === cardId ? fn(x) : x))
	}));
}

export function mapTodo(
	spaceId: string,
	columnId: string,
	cardId: string,
	todoId: string,
	fn: (todo: TodoItem) => TodoItem
) {
	mapCard(spaceId, columnId, cardId, (card) =>
		card.type === 'todo'
			? { ...card, todos: card.todos.map((t) => (t.id === todoId ? fn(t) : t)) }
			: card
	);
}
