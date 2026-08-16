<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import { Markdown } from 'tiptap-markdown';
	import { updateNote, type Column, type NoteCard, type Space } from '$lib/workspace';
	import { settings } from '$lib/theme';

	let {
		space,
		column,
		card,
		autofocus = false,
		editor = $bindable() as Editor | undefined
	}: {
		space: Space;
		column: Column;
		card: NoteCard;
		autofocus?: boolean;
		editor: Editor | undefined;
	} = $props();

	let mountEl: HTMLDivElement | undefined = $state();
	let syncing = false;
	let linkToOpen: string | null = null;

	onMount(() => {
		editor = new Editor({
			element: mountEl,
			extensions: [
				StarterKit.configure({ heading: false }),
				Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
				Placeholder.configure({ placeholder: 'Write a note…' }),
				Markdown.configure({
					html: false,
					tightLists: true,
					transformPastedText: true,
					transformCopiedText: true
				})
			],
			content: card.text,
			autofocus: autofocus ? 'end' : false,
			editorProps: {
				handleDOMEvents: {
					// outside edit mode, clicking a link opens it in a new tab
					mousedown: (view, event) => {
						if (event.button !== 0 || view.hasFocus()) return false;
						const a = (event.target as HTMLElement | null)?.closest?.(
							'a[href]'
						) as HTMLAnchorElement | null;
						if (!a) return false;
						linkToOpen = a.href;
						event.preventDefault();
						return true;
					},
					click: () => {
						if (linkToOpen) {
							window.open(linkToOpen, '_blank', 'noopener');
							linkToOpen = null;
						}
						return false;
					}
				}
			},
			onUpdate: ({ editor: ed }) => {
				if (syncing) return;
				updateNote(space.id, column.id, card.id, ed.storage.markdown.getMarkdown());
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	$effect(() => {
		const ed = editor;
		if (!ed) return;
		const markdown = ed.storage.markdown.getMarkdown();
		if (markdown !== card.text) {
			syncing = true;
			ed.commands.setContent(card.text);
			syncing = false;
		}
	});

	$effect(() => {
		if (editor?.view) editor.view.dom.spellcheck = $settings.spellcheck;
	});
</script>

<div bind:this={mountEl} class="note-editor min-h-[1lh] focus:outline-none"></div>
