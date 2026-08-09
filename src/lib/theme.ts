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

const FAVICON_PALETTE: Record<Mode, { bg: string; fg: string }> = {
	dark: { bg: '#1f1d1a', fg: '#d0765a' },
	light: { bg: '#f5f1e8', fg: '#c05b3c' }
};

function setFavicon(mode: Mode) {
	let { bg, fg } = FAVICON_PALETTE[mode];
	const cs = getComputedStyle(document.documentElement);
	const cssBase = cs.getPropertyValue('--base').trim();
	const cssPrimary = cs.getPropertyValue('--primary').trim();
	if (cssBase) bg = cssBase;
	if (cssPrimary) fg = cssPrimary;
	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>` +
		`<rect x='1' y='1' width='22' height='22' rx='6' fill='${bg}'/>` +
		`<g transform='translate(12.5 11.5) scale(0.8) translate(-12.5 -11.5)' fill='none' stroke='${fg}' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>` +
		`<path d='M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z'/>` +
		`<path d='m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18'/>` +
		`<path d='m2.3 2.3 7.286 7.286'/>` +
		`<circle cx='11' cy='11' r='2'/></g></svg>`;
	let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		link.type = 'image/svg+xml';
		document.head.appendChild(link);
	}
	link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
	const themeColor = document.querySelector('meta[name="theme-color"]');
	if (themeColor) themeColor.setAttribute('content', bg);
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
