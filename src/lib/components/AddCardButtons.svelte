<script lang="ts">
	import { ListTodo, NotepadText } from 'lucide-svelte';
	import type { CardType } from '$lib/workspace';

	let { onadd }: { onadd: (type: CardType) => void } = $props();
</script>

<button
	type="button"
	title="Add todo list"
	onclick={() => onadd('todo')}
	class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
>
	<ListTodo class="size-4" />
</button>
<button
	type="button"
	title="Add note"
	onclick={() => onadd('note')}
	class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
>
	<NotepadText class="size-4" />
</button>
