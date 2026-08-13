<script lang="ts">
	import { AlarmClock, Trash2, X } from 'lucide-svelte';
	import { startTimer, clearTimer, formatRemaining, type TimerRef } from '$lib/timer';
	import type { TodoItem } from '$lib/workspace';
	import NumberWheel from './NumberWheel.svelte';

	let {
		ref,
		todo,
		anchor,
		open,
		onclose
	}: {
		ref: TimerRef;
		todo: TodoItem;
		anchor: HTMLElement | null | undefined;
		open: boolean;
		onclose: () => void;
	} = $props();

	let hours = $state(0);
	let minutes = $state(30);
	let popEl: HTMLDivElement | undefined = $state();
	let style = $state('');

	const running = $derived(!!todo.timer && todo.timer.endsAt > Date.now());
	const due = $derived(!!todo.timer && todo.timer.endsAt <= Date.now());

	$effect(() => {
		if (open) {
			if (todo.timer) {
				const rem = Math.max(0, Math.ceil((todo.timer.endsAt - Date.now()) / 60000));
				let h = Math.floor(rem / 60);
				let m = Math.round((rem % 60) / 5) * 5;
				if (m === 60) {
					m = 0;
					h += 1;
				}
				hours = h;
				minutes = m;
			} else {
				hours = 0;
				minutes = 30;
			}
		}
	});

	$effect(() => {
		if (!open) {
			style = '';
			return;
		}
		requestAnimationFrame(() => {
			if (!anchor) return;
			const r = anchor.getBoundingClientRect();
			const h = popEl?.offsetHeight ?? 150;
			const w = popEl?.offsetWidth ?? 180;
			const top =
				r.bottom + h + 8 > window.innerHeight && r.top - h - 8 > 0 ? r.top - h - 8 : r.bottom + 8;
			const left = Math.max(8, r.right - w);
			style = `position: fixed; top: ${Math.max(8, top)}px; left: ${left}px; z-index: 80; font-family: var(--font-ui);`;
		});
	});

	$effect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			const t = e.target as Node;
			if (popEl && !popEl.contains(t) && anchor && !anchor.contains(t)) onclose();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onclose();
		};
		const onScroll = () => onclose();
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKey);
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onScroll);
		};
	});

	function start() {
		const total = hours * 60 + minutes;
		if (total <= 0) return;
		startTimer(ref, total);
		onclose();
	}
</script>

{#if open}
	<div
		bind:this={popEl}
		{style}
		class="relative w-max rounded-xl border border-outline bg-surface p-2.5 shadow-xl shadow-black/25"
	>
		<button
			type="button"
			title="Close"
			onclick={onclose}
			class="absolute top-1.5 right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:outline-none"
		>
			<X class="size-3.5" />
		</button>

		{#if due}
			<p
				class="mb-1.5 flex items-center gap-1.5 pr-6 text-sm font-semibold text-on-primary-container"
			>
				<AlarmClock class="size-4" />
				Due
			</p>
		{:else if running}
			<p
				class="mb-1.5 flex items-center gap-1.5 pr-6 text-sm font-semibold text-on-primary-container"
			>
				<AlarmClock class="size-4" />
				{formatRemaining(todo.timer!.endsAt - Date.now())} left
			</p>
		{:else}
			<p class="mb-1.5 pr-6 text-sm font-semibold text-on-surface">Set a timer</p>
		{/if}

		<div class="flex items-center justify-center gap-2">
			<NumberWheel
				label="Hours"
				value={hours}
				min={0}
				max={99}
				step={1}
				unit="h"
				onChange={(v) => (hours = v)}
			/>
			<NumberWheel
				label="Minutes"
				value={minutes}
				min={0}
				max={55}
				step={5}
				unit="m"
				onChange={(v) => (minutes = v)}
			/>
		</div>

		<div class="mt-2 flex items-center justify-between gap-2">
			<button
				type="button"
				title="Clear timer"
				onclick={() => {
					clearTimer(ref);
					onclose();
				}}
				disabled={!running && !due}
				class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:outline-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-40"
			>
				<Trash2 class="size-4" />
			</button>
			<button
				type="button"
				onclick={start}
				disabled={hours * 60 + minutes <= 0}
				class="accent-fill h-7 cursor-pointer rounded-md px-3 text-sm font-semibold hover:opacity-80 focus:outline-none disabled:cursor-default disabled:opacity-40"
			>
				{running ? 'Replace' : 'Start'}
			</button>
		</div>
	</div>
{/if}
