const PALETTE: Record<'dark' | 'light', { base: string; primary: string }> = {
	dark: { base: '#1f1d1a', primary: '#d0765a' },
	light: { base: '#f5f1e8', primary: '#c05b3c' }
};

const RED = '#d64545';

let hasFlaggedDue = false;
let hasTimerDue = false;

const PEN_PATHS =
	`<path d='M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z'/>` +
	`<path d='m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18'/>` +
	`<path d='m2.3 2.3 7.286 7.286'/>` +
	`<circle cx='11' cy='11' r='2'/>`;

const TIMER_PATHS =
	`<circle cx='12' cy='13' r='8'/>` +
	`<path d='M12 9v4l2 2'/>` +
	`<path d='M5 3 2 6'/>` +
	`<path d='m22 6-3-3'/>` +
	`<path d='M6.38 18.7 4 21'/>` +
	`<path d='M17.64 18.67 20 21'/>`;

export function renderFavicon(flaggedDue: boolean, timerDue: boolean) {
	hasFlaggedDue = flaggedDue;
	hasTimerDue = timerDue;
	if (typeof document === 'undefined') return;
	const mode = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
	const cs = getComputedStyle(document.documentElement);
	const base = cs.getPropertyValue('--base').trim() || PALETTE[mode].base;
	const primary = cs.getPropertyValue('--primary').trim() || PALETTE[mode].primary;
	const due = timerDue || flaggedDue;
	const bg = due ? RED : base;
	const fg = due ? base : primary;
	const icon = timerDue ? TIMER_PATHS : PEN_PATHS;
	const transform = timerDue
		? 'transform="translate(12 13) scale(0.78) translate(-12 -13)"'
		: 'transform="translate(16.5 15.5) scale(0.8) translate(-16.5 -15.5)"';

	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>` +
		`<rect x='1' y='1' width='22' height='22' rx='6' fill='${bg}'/>` +
		`<g ${transform} fill='none' stroke='${fg}' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>${icon}</g>` +
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
	renderFavicon(hasFlaggedDue, hasTimerDue);
}
