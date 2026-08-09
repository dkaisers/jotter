<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

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
</script>

<Dialog.Root
	{open}
	onOpenChange={(o) => {
		if (!o) onclose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/40" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-outline bg-surface p-6 shadow-xl shadow-black/25 focus:outline-none"
		>
			<div class="flex items-start justify-between gap-4">
				<Dialog.Title class="font-semibold text-base text-on-surface">{title}</Dialog.Title>
				<Dialog.Close
					class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface focus:outline-none"
				>
					<X class="size-4" />
				</Dialog.Close>
			</div>
			<div class="mt-3 text-sm text-on-surface-variant">
				{@render children()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
