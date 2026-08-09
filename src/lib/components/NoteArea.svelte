<script lang="ts">
	import { updateNote, type Column, type NoteCard, type Space } from '$lib/workspace';
	import { settings } from '$lib/theme';

	let {
		space,
		column,
		card,
		autofocus = false
	}: { space: Space; column: Column; card: NoteCard; autofocus?: boolean } = $props();

	let area: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		if (autofocus) area?.focus();
	});
</script>

<textarea
	bind:this={area}
	value={card.text}
	spellcheck={$settings.spellcheck}
	placeholder="Write a note…"
	oninput={(e) => updateNote(space.id, column.id, card.id, e.currentTarget.value)}
	class="w-full resize-none border-0 bg-transparent py-0 pr-3 pl-2 text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant focus:border-0 focus:ring-0 focus:outline-none"
	style="field-sizing: content; min-height: 1lh;"></textarea>
