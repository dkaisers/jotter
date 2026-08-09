const PALETTE: Record<'dark' | 'light', { base: string; primary: string }> = {
	dark: { base: '#1f1d1a', primary: '#d0765a' },
	light: { base: '#f5f1e8', primary: '#c05b3c' }
};

const RED = '#d64545';

let hasDue = false;

const PEN_PATHS =
	`<path d='M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z'/>` +
	`<path d='m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18'/>` +
	`<path d='m2.3 2.3 7.286 7.286'/>` +
	`<circle cx='11' cy='11' r='2'/>`;

export function renderFavicon(due: boolean) {
	hasDue = due;
	if (typeof document === 'undefined') return;
	const mode = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
	const cs = getComputedStyle(document.documentElement);
	const base = cs.getPropertyValue('--base').trim() || PALETTE[mode].base;
	const primary = cs.getPropertyValue('--primary').trim() || PALETTE[mode].primary;
	const bg = due ? RED : base;
	const fg = due ? base : primary;

	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>` +
		`<rect x='1' y='1' width='22' height='22' rx='6' fill='${bg}'/>` +
		`<g transform='translate(12.5 11.5) scale(0.8) translate(-12.5 -11.5)' fill='none' stroke='${fg}' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>${PEN_PATHS}</g>` +
		`</svg>`;

	let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		link.type = 'image/svg+xml';
		document.head.appendChild(link);
	}
	link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** Re-renders the favicon with the last-seen state (e.g. after a theme change). */
export function refreshFavicon() {
	renderFavicon(hasDue);
}
