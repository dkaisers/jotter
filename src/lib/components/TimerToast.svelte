<script lang="ts">
	import { AlarmClock, X } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { toasts, focusTodo, type TimerToast } from '$lib/timer';

	let scheduled = new SvelteSet<number>();

	$effect(() => {
		for (const t of $toasts) {
			if (scheduled.has(t.id)) continue;
			scheduled.add(t.id);
			setTimeout(() => dismiss(t.id), 5000);
		}
	});

	function dismiss(id: number) {
		scheduled.delete(id);
		toasts.update((list) => list.filter((t) => t.id !== id));
	}

	function jump(t: TimerToast) {
		focusTodo(t.ref);
		dismiss(t.id);
	}
</script>

{#if $toasts.length > 0}
	<div class="fixed top-4 right-4 z-[90] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
		{#each $toasts as t (t.id)}
			<div
				class="flex items-start gap-2 rounded-lg border border-outline bg-surface p-3 shadow-xl shadow-black/25"
			>
				<button
					type="button"
					onclick={() => jump(t)}
					title="Jump to todo"
					class="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 text-left focus:outline-none"
				>
					<AlarmClock class="mt-0.5 size-4 shrink-0 text-primary" />
					<div class="min-w-0">
						<p class="text-sm font-semibold text-on-surface">Time's up</p>
						<p
							class="mt-0.5 line-clamp-2 text-sm break-words whitespace-pre-wrap text-on-surface-variant"
						>
							{t.body}
						</p>
					</div>
				</button>
				<button
					type="button"
					title="Dismiss"
					onclick={() => dismiss(t.id)}
					class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface focus:outline-none"
				>
					<X class="size-3.5" />
				</button>
			</div>
		{/each}
	</div>
{/if}
