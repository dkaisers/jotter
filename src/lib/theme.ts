import { writable } from 'svelte/store';

export type Palette = 'solarized' | 'catppuccin';
export type Mode = 'light' | 'dark';
export type FontId = 'jetbrains-mono' | 'roboto-mono';

export interface Settings {
	palette: Palette;
	mode: Mode;
	font: FontId;
}

export const DEFAULT_SETTINGS: Settings = {
	palette: 'catppuccin',
	mode: 'dark',
	font: 'jetbrains-mono'
};

export const palettes: { value: Palette; label: string }[] = [
	{ value: 'catppuccin', label: 'Catppuccin' },
	{ value: 'solarized', label: 'Solarized' }
];

export const modes: { value: Mode; label: string }[] = [
	{ value: 'dark', label: 'dark' },
	{ value: 'light', label: 'light' }
];

export const fonts: { value: FontId; label: string }[] = [
	{ value: 'jetbrains-mono', label: 'JetBrains Mono' },
	{ value: 'roboto-mono', label: 'Roboto Mono' }
];

const STORAGE_KEY = 'jotter:theme';

export function settingsId(s: Settings): string {
	return `${s.palette}-${s.mode}`;
}

function parseTheme(id: string | null | undefined): { palette: Palette; mode: Mode } | null {
	if (!id) return null;
	const [palette, mode] = id.split('-');
	if (
		(palette === 'solarized' || palette === 'catppuccin') &&
		(mode === 'light' || mode === 'dark')
	) {
		return { palette, mode };
	}
	return null;
}

function parseFont(font: string | null | undefined): FontId | null {
	if (fonts.some((f) => f.value === font)) return font as FontId;
	return null;
}

function initialSettings(): Settings {
	if (typeof document !== 'undefined') {
		const theme = parseTheme(document.documentElement.getAttribute('data-theme'));
		const font = parseFont(document.documentElement.getAttribute('data-font'));
		return {
			palette: theme?.palette ?? DEFAULT_SETTINGS.palette,
			mode: theme?.mode ?? DEFAULT_SETTINGS.mode,
			font: font ?? DEFAULT_SETTINGS.font
		};
	}
	return DEFAULT_SETTINGS;
}

export const settings = writable<Settings>(initialSettings());

function applySettings(s: Settings) {
	document.documentElement.setAttribute('data-theme', settingsId(s));
	document.documentElement.setAttribute('data-font', s.font);
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// storage unavailable, ignore
	}
}

export function setPalette(palette: Palette) {
	settings.update((s) => {
		const next: Settings = { ...s, palette };
		applySettings(next);
		return next;
	});
}

export function setMode(mode: Mode) {
	settings.update((s) => {
		const next: Settings = { ...s, mode };
		applySettings(next);
		return next;
	});
}

export function setFont(font: FontId) {
	settings.update((s) => {
		const next: Settings = { ...s, font };
		applySettings(next);
		return next;
	});
}
