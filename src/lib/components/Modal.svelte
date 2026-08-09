<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	let {
		open,
		title,
		onclose,
		children
	}: {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	} = $props();

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	$effect(() => {
		if (!open) return;
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<button
			type="button"
			aria-label="Close"
			class="absolute inset-0 h-full w-full cursor-default bg-black/40"
			onclick={onclose}
		></button>
		<div
			class="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-outline bg-surface p-6 shadow-xl shadow-black/25"
		>
			<div class="flex items-start justify-between gap-4">
				<h2 class="font-semibold text-base text-on-surface">{title}</h2>
				<button
					type="button"
					title="Close"
					onclick={onclose}
					class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface focus:outline-none"
				>
					<X class="size-4" />
				</button>
			</div>
			<div class="mt-3 text-sm text-on-surface-variant">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
