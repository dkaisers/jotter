<script lang="ts">
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	let {
		label,
		value,
		min,
		max,
		step,
		unit,
		onChange
	}: {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		unit: string;
		onChange: (value: number) => void;
	} = $props();

	const maxIdx = $derived(Math.round((max - min) / step) + 1);

	function stepBy(delta: number) {
		const idx = Math.round((value - min) / step);
		const next = (((idx + delta) % maxIdx) + maxIdx) % maxIdx;
		onChange(min + next * step);
	}
</script>

<div
	class="flex items-center gap-0.5"
	onwheel={(e) => {
		e.preventDefault();
		stepBy(e.deltaY < 0 ? 1 : -1);
	}}
>
	<button
		type="button"
		title="Decrease"
		onclick={() => stepBy(-1)}
		class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:outline-none"
	>
		<ChevronDown class="size-3.5" />
	</button>
	<div
		role="spinbutton"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
				e.preventDefault();
				stepBy(1);
			} else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
				e.preventDefault();
				stepBy(-1);
			}
		}}
		class="w-10 cursor-ns-resize rounded-md py-0.5 text-center text-sm font-semibold text-on-surface tabular-nums select-none focus:ring-2 focus:ring-primary focus:outline-none"
	>
		{value}{unit}
	</div>
	<button
		type="button"
		title="Increase"
		onclick={() => stepBy(1)}
		class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:outline-none"
	>
		<ChevronUp class="size-3.5" />
	</button>
</div>
