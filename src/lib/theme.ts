import { writable, get } from 'svelte/store';
import { refreshFavicon } from '$lib/favicon';

export type Mode = 'auto' | 'light' | 'dark';
export type FontId = 'sans' | 'serif' | 'mono';
export type TodoMode = 'none' | 'sort' | 'delete';
export type ChimeId = 'none' | 'ping' | 'boom' | 'bubbles';

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
	timerChime: ChimeId;
}

export const DEFAULT_SETTINGS: Settings = {
	mode: 'auto',
	uiFont: 'sans',
	contentFont: 'serif',
	grain: true,
	todoMode: 'none',
	importantToTop: false,
	doneToBottom: false,
	keepImportant: false,
	spellcheck: true,
	timerChime: 'ping'
};

export const chimes: { value: ChimeId; label: string }[] = [
	{ value: 'none', label: 'No sound' },
	{ value: 'ping', label: 'Ping' },
	{ value: 'boom', label: 'Boom' },
	{ value: 'bubbles', label: 'Bubbles' }
];

export const todoModes: { value: TodoMode; label: string }[] = [
	{ value: 'none', label: 'None' },
	{ value: 'sort', label: 'Sort' },
	{ value: 'delete', label: 'Delete' }
];

export const modes: { value: Mode; label: string }[] = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'light', label: 'Light' }
];

export const fonts: { value: FontId; label: string }[] = [
	{ value: 'sans', label: 'Sans' },
	{ value: 'serif', label: 'Serif' },
	{ value: 'mono', label: 'Mono' }
];

const STORAGE_KEY = 'jotter:theme';

const THEME_COLORS: Record<'light' | 'dark', { bg: string }> = {
	dark: { bg: '#1f1d1a' },
	light: { bg: '#f5f1e8' }
};

function setFavicon(mode: 'light' | 'dark') {
	refreshFavicon();
	const themeColor = document.querySelector('meta[name="theme-color"]');
	if (themeColor) themeColor.setAttribute('content', THEME_COLORS[mode].bg);
}

function parseFont(font: string | null | undefined): FontId | null {
	if (fonts.some((f) => f.value === font)) return font as FontId;
	return null;
}

function systemPrefersDark(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function effectiveMode(mode: Mode): 'light' | 'dark' {
	return mode === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
}

let mediaQuery: MediaQueryList | null = null;

function setupAutoModeListener() {
	if (typeof window === 'undefined' || mediaQuery) return;
	mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		if (get(settings).mode === 'auto') applySettings(get(settings));
	});
}

function initialSettings(): Settings {
	if (typeof document !== 'undefined') {
		const uiFont = parseFont(document.documentElement.getAttribute('data-ui-font'));
		const contentFont = parseFont(document.documentElement.getAttribute('data-content-font'));
		const grain = document.documentElement.getAttribute('data-grain') === '1';
		let mode = DEFAULT_SETTINGS.mode;
		let todoMode = DEFAULT_SETTINGS.todoMode;
		let importantToTop = DEFAULT_SETTINGS.importantToTop;
		let doneToBottom = DEFAULT_SETTINGS.doneToBottom;
		let keepImportant = DEFAULT_SETTINGS.keepImportant;
		let spellcheck = DEFAULT_SETTINGS.spellcheck;
		let timerChime = DEFAULT_SETTINGS.timerChime;
		try {
			const parsed: Record<string, unknown> = JSON.parse(
				window.localStorage.getItem(STORAGE_KEY) ?? ''
			);
			mode = pick(
				parsed,
				'mode',
				modes.map((m) => m.value),
				mode
			);
			todoMode = pick(
				parsed,
				'todoMode',
				todoModes.map((m) => m.value),
				todoMode
			);
			importantToTop = pickBool(parsed, 'importantToTop', importantToTop);
			doneToBottom = pickBool(parsed, 'doneToBottom', doneToBottom);
			keepImportant = pickBool(parsed, 'keepImportant', keepImportant);
			spellcheck = pickBool(parsed, 'spellcheck', spellcheck);
			timerChime = pick(
				parsed,
				'timerChime',
				chimes.map((c) => c.value),
				timerChime
			);
			// migrate the old two toggles into the mode
			if (!todoModes.some((m) => m.value === parsed.todoMode)) {
				if (pickBool(parsed, 'autoDeleteDone', false)) todoMode = 'delete';
				else if (pickBool(parsed, 'autoSortDone', false)) todoMode = 'sort';
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
			spellcheck,
			timerChime
		};
	}
	return DEFAULT_SETTINGS;
}

/** Reads a value from a parsed object if it's one of the allowed values. */
function pick<T>(obj: Record<string, unknown>, key: string, allowed: T[], fallback: T): T {
	const v = obj[key];
	return allowed.includes(v as T) ? (v as T) : fallback;
}

/** Reads a boolean from a parsed object. */
function pickBool(obj: Record<string, unknown>, key: string, fallback: boolean): boolean {
	return typeof obj[key] === 'boolean' ? (obj[key] as boolean) : fallback;
}

export const settings = writable<Settings>(initialSettings());

setupAutoModeListener();

function applyToDom(s: Settings) {
	const eff = effectiveMode(s.mode);
	document.documentElement.setAttribute('data-theme', eff);
	document.documentElement.setAttribute('data-ui-font', s.uiFont);
	document.documentElement.setAttribute('data-content-font', s.contentFont);
	document.documentElement.setAttribute('data-grain', s.grain ? '1' : '0');
	setFavicon(eff);
	setupAutoModeListener();
}

function applySettings(s: Settings) {
	applyToDom(s);
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// storage unavailable, ignore
	}
}

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (e) => {
		if (e.key !== STORAGE_KEY) return;
		const fresh = initialSettings();
		settings.set(fresh);
		applyToDom(fresh);
	});
}

function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
	settings.update((s) => {
		const next: Settings = { ...s, [key]: value };
		applySettings(next);
		return next;
	});
}

export function setMode(mode: Mode) {
	updateSetting('mode', mode);
}

export function setUiFont(uiFont: FontId) {
	updateSetting('uiFont', uiFont);
}

export function setContentFont(contentFont: FontId) {
	updateSetting('contentFont', contentFont);
}

export function setGrain(grain: boolean) {
	updateSetting('grain', grain);
}

export function setTodoMode(todoMode: TodoMode) {
	updateSetting('todoMode', todoMode);
}

export function setImportantToTop(importantToTop: boolean) {
	updateSetting('importantToTop', importantToTop);
}

export function setDoneToBottom(doneToBottom: boolean) {
	updateSetting('doneToBottom', doneToBottom);
}

export function setKeepImportant(keepImportant: boolean) {
	updateSetting('keepImportant', keepImportant);
}

export function setSpellcheck(spellcheck: boolean) {
	updateSetting('spellcheck', spellcheck);
}

export function setTimerChime(timerChime: ChimeId) {
	updateSetting('timerChime', timerChime);
}
