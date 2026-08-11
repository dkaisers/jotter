/** Runs a pointer-based drag: invokes onMove while the pointer moves, then onEnd on release. */
export function startDrag(options: { onMove: (e: PointerEvent) => void; onEnd?: () => void }) {
	const onMove = (e: PointerEvent) => options.onMove(e);
	const onEnd = () => {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onEnd);
		options.onEnd?.();
	};
	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', onEnd);
}
