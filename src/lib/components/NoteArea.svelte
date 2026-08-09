<script lang="ts">
	import { updateNote, type Column, type NoteCard } from '$lib/workspace';

	let { column, card }: { column: Column; card: NoteCard } = $props();
</script>

<textarea
	value={card.text}
	placeholder="Write a note…"
	oninput={(e) => updateNote(column.id, card.id, e.currentTarget.value)}
	class="h-full w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant focus:border-0 focus:ring-0 focus:outline-none"
></textarea>
