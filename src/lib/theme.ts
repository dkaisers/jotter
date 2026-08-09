import { writable } from 'svelte/store';

export type Mode = 'light' | 'dark';
export type FontId = 'sans' | 'serif' | 'mono';

export interface Settings {
	mode: Mode;
	uiFont: FontId;
	contentFont: FontId;
	grain: boolean;
	autoDeleteDone: boolean;
	spellcheck: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	mode: 'dark',
	uiFont: 'sans',
	contentFont: 'serif',
	grain: true,
	autoDeleteDone: false,
	spellcheck: true
};

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
		let autoDeleteDone = DEFAULT_SETTINGS.autoDeleteDone;
		let spellcheck = DEFAULT_SETTINGS.spellcheck;
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (typeof parsed.autoDeleteDone === 'boolean') autoDeleteDone = parsed.autoDeleteDone;
				if (typeof parsed.spellcheck === 'boolean') spellcheck = parsed.spellcheck;
			}
		} catch {
			// ignore
		}
		return {
			mode: mode ?? DEFAULT_SETTINGS.mode,
			uiFont: uiFont ?? DEFAULT_SETTINGS.uiFont,
			contentFont: contentFont ?? DEFAULT_SETTINGS.contentFont,
			grain: grain ?? DEFAULT_SETTINGS.grain,
			autoDeleteDone,
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

export function setAutoDeleteDone(autoDeleteDone: boolean) {
	settings.update((s) => {
		const next: Settings = { ...s, autoDeleteDone };
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
