export const TOTAL_UNITS = 8;

interface ResizeOptions {
	container: () => HTMLElement | null;
	getSpan: () => number;
	onResize: (span: number) => void;
}

export function columnResize(node: HTMLElement, options: ResizeOptions) {
	let startX = 0;
	let startSpan = 0;
	let unit = 0;
	let active = false;

	function onDown(e: PointerEvent) {
		e.preventDefault();
		const container = options.container();
		if (!container) return;
		unit = container.getBoundingClientRect().width / TOTAL_UNITS;
		startX = e.clientX;
		startSpan = options.getSpan();
		active = true;
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	function onMove(e: PointerEvent) {
		if (!active) return;
		const delta = e.clientX - startX;
		options.onResize(Math.round(startSpan + delta / unit));
	}

	function onUp() {
		active = false;
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onUp);
	}

	node.addEventListener('pointerdown', onDown);
	return {
		destroy() {
			node.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
	};
}
