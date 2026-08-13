export type CardType = 'todo' | 'note';

export interface TimerState {
	endsAt: number;
}

export interface TodoItem {
	id: string;
	text: string;
	done: boolean;
	flagged: boolean;
	timer?: TimerState;
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
