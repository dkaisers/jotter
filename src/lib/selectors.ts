import { derived } from 'svelte/store';
import { workspace } from './store';
import type { Column, Space, Workspace } from './types';

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

export function totalSpan(cols: Column[]): number {
	return cols.reduce((sum, c) => sum + c.span, 0);
}
