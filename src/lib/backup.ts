import { get } from 'svelte/store';
import { workspace, sanitizeSpace, newId, type Space, type Workspace } from '$lib/workspace';

export function exportWorkspace() {
	const w = get(workspace);
	const payload = JSON.stringify(
		{ version: 1, exportedAt: new Date().toISOString(), workspace: w },
		null,
		2
	);
	const blob = new Blob([payload], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `jotter-backup-${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

/** Parses a backup file into a valid workspace, or null if invalid. */
export function parseBackup(text: string): Workspace | null {
	try {
		const parsed = JSON.parse(text);
		const raw = Array.isArray(parsed) ? parsed : parsed?.workspace;
		if (!Array.isArray(raw?.spaces)) return null;
		const spaces = (raw.spaces as unknown[])
			.map((s) => sanitizeSpace(s))
			.filter((s): s is Space => !!s);
		if (spaces.length === 0) return null;
		const activeId =
			typeof raw.activeId === 'string' && spaces.some((s) => s.id === raw.activeId)
				? raw.activeId
				: spaces[0].id;
		return { spaces, activeId };
	} catch {
		return null;
	}
}

/** Deep-copies a space with fresh ids so appended imports never collide with existing keys. */
function cloneWithFreshIds(space: Space): Space {
	return {
		...space,
		id: newId(),
		columns: space.columns.map((c) => ({
			...c,
			id: newId(),
			cards: c.cards.map((card) =>
				card.type === 'todo'
					? { ...card, id: newId(), todos: card.todos.map((t) => ({ ...t, id: newId() })) }
					: { ...card, id: newId() }
			)
		}))
	};
}

/** Applies imported spaces: replaces or merges into the current workspace. */
export function applyImport(imported: Workspace, mode: 'replace' | 'merge') {
	if (mode === 'replace') {
		workspace.set(imported);
		return;
	}
	workspace.update((w) => ({
		spaces: [...w.spaces, ...imported.spaces.map(cloneWithFreshIds)],
		activeId: w.activeId
	}));
}
