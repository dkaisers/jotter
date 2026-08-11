<script lang="ts">
	import Modal from './Modal.svelte';

	let {
		open,
		title,
		message,
		confirmLabel = 'Delete',
		destructive = true,
		onclose,
		onconfirm
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		destructive?: boolean;
		onclose: () => void;
		onconfirm: () => void;
	} = $props();
</script>

<Modal {open} {title} {onclose} width="max-w-sm" stacked>
	<p>{message}</p>
	<div class="mt-4 flex items-center gap-2">
		<button
			type="button"
			onclick={onclose}
			class="h-8 flex-1 cursor-pointer rounded-md bg-surface-variant/40 text-sm text-on-surface hover:bg-surface-variant focus:outline-none"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={onconfirm}
			class={`h-8 flex-1 cursor-pointer rounded-md text-sm font-semibold focus:outline-none ${
				destructive ? 'bg-error/15 text-error hover:bg-error/25' : 'accent-fill hover:opacity-80'
			}`}
		>
			{confirmLabel}
		</button>
	</div>
</Modal>
