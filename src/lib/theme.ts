import { writable } from 'svelte/store';
import { refreshFavicon } from '$lib/favicon';

export type Mode = 'light' | 'dark';
export type FontId = 'sans' | 'serif' | 'mono';
export type TodoMode = 'none' | 'sort' | 'delete';

export interface Settings {
	mode: Mode;
	uiFont: FontId;
	contentFont: FontId;
	grain: boolean;
	todoMode: TodoMode;
	importantToTop: boolean;
	doneToBottom: boolean;
	keepImportant: boolean;
	spellcheck: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	mode: 'dark',
	uiFont: 'sans',
	contentFont: 'serif',
	grain: true,
	todoMode: 'none',
	importantToTop: false,
	doneToBottom: false,
	keepImportant: false,
	spellcheck: true
};

export const todoModes: { value: TodoMode; label: string }[] = [
	{ value: 'none', label: 'None' },
	{ value: 'sort', label: 'Sort' },
	{ value: 'delete', label: 'Delete' }
];

export const modes: { value: Mode; label: string }[] = [
	{ value: 'dark', label: 'Dark' },
	{ value: 'light', label: 'Light' }
];

export const fonts: { value: FontId; label: string }[] = [
	{ value: 'sans', label: 'Sans' },
	{ value: 'serif', label: 'Serif' },
	{ value: 'mono', label: 'Mono' }
];

const STORAGE_KEY = 'jotter:theme';

const THEME_COLORS: Record<Mode, { bg: string }> = {
	dark: { bg: '#1f1d1a' },
	light: { bg: '#f5f1e8' }
};

function setFavicon(mode: Mode) {
	refreshFavicon();
	const themeColor = document.querySelector('meta[name="theme-color"]');
	if (themeColor) themeColor.setAttribute('content', THEME_COLORS[mode].bg);
}

function parseMode(mode: string | null | undefined): Mode | null {
	if (mode === 'light' || mode === 'dark') return mode;
	return null;
}

function parseFont(font: string | null | undefined): FontId | null {
	if (fonts.some((f) => f.value === font)) return font as FontId;
	return null;
}

function initialSettings(): Settings {
	if (typeof document !== 'undefined') {
		const mode = parseMode(document.documentElement.getAttribute('data-theme'));
		const uiFont = parseFont(document.documentElement.getAttribute('data-ui-font'));
		const contentFont = parseFont(document.documentElement.getAttribute('data-content-font'));
		const grain = document.documentElement.getAttribute('data-grain') === '1';
		let todoMode = DEFAULT_SETTINGS.todoMode;
		let importantToTop = DEFAULT_SETTINGS.importantToTop;
		let doneToBottom = DEFAULT_SETTINGS.doneToBottom;
		let keepImportant = DEFAULT_SETTINGS.keepImportant;
		let spellcheck = DEFAULT_SETTINGS.spellcheck;
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (todoModes.some((m) => m.value === parsed.todoMode)) todoMode = parsed.todoMode;
				if (typeof parsed.importantToTop === 'boolean') importantToTop = parsed.importantToTop;
				if (typeof parsed.doneToBottom === 'boolean') doneToBottom = parsed.doneToBottom;
				if (typeof parsed.keepImportant === 'boolean') keepImportant = parsed.keepImportant;
				if (typeof parsed.spellcheck === 'boolean') spellcheck = parsed.spellcheck;
				// migrate the old two toggles into the mode
				if (!todoModes.some((m) => m.value === parsed.todoMode)) {
					if (parsed.autoDeleteDone === true) todoMode = 'delete';
					else if (parsed.autoSortDone === true) todoMode = 'sort';
				}
			}
		} catch {
			// ignore
		}
		return {
			mode: mode ?? DEFAULT_SETTINGS.mode,
			uiFont: uiFont ?? DEFAULT_SETTINGS.uiFont,
			contentFont: contentFont ?? DEFAULT_SETTINGS.contentFont,
			grain: grain ?? DEFAULT_SETTINGS.grain,
			todoMode,
			importantToTop,
			doneToBottom,
			keepImportant,
			spellcheck
		};
	}
	return DEFAULT_SETTINGS;
}

export const settings = writable<Settings>(initialSettings());

function applySettings(s: Settings) {
	document.documentElement.setAttribute('data-theme', s.mode);
	document.documentElement.setAttribute('data-ui-font', s.uiFont);
	document.documentElement.setAttribute('data-content-font', s.contentFont);
	document.documentElement.setAttribute('data-grain', s.grain ? '1' : '0');
	setFavicon(s.mode);
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// storage unavailable, ignore
	}
}

export function setMode(mode: Mode) {
	settings.update((s) => {
		const next: Settings = { ...s, mode };
		applySettings(next);
		return next;
	});
}

export function setUiFont(uiFont: FontId) {
	settings.update((s) => {
		const next: Settings = { ...s, uiFont };
		applySettings(next);
		return next;
	});
}

export function setContentFont(contentFont: FontId) {
	settings.update((s) => {
		const next: Settings = { ...s, contentFont };
		applySettings(next);
		return next;
	});
}

export function setGrain(grain: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, grain };
		applySettings(next);
		return next;
	});
}

export function setTodoMode(todoMode: TodoMode) {
	settings.update((s) => {
		const next: Settings = { ...s, todoMode };
		applySettings(next);
		return next;
	});
}

export function setImportantToTop(importantToTop: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, importantToTop };
		applySettings(next);
		return next;
	});
}

export function setDoneToBottom(doneToBottom: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, doneToBottom };
		applySettings(next);
		return next;
	});
}

export function setKeepImportant(keepImportant: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, keepImportant };
		applySettings(next);
		return next;
	});
}

export function setSpellcheck(spellcheck: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, spellcheck };
		applySettings(next);
		return next;
	});
}
