<script lang="ts">
	import {
		Bold,
		Code,
		Italic,
		Link2,
		List,
		ListOrdered,
		Quote,
		SquareCode,
		Strikethrough
	} from '@lucide/svelte';
	import type { Editor } from 'svelte-tiptap';

	let { editor }: { editor: Editor } = $props();

	let tick = $state(0);

	$effect(() => {
		const bump = () => tick++;
		editor.on('transaction', bump);
		editor.on('selectionUpdate', bump);
		return () => {
			editor.off('transaction', bump);
			editor.off('selectionUpdate', bump);
		};
	});

	const active = $derived.by(() => {
		void tick;
		return {
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			strike: editor.isActive('strike'),
			code: editor.isActive('code'),
			link: editor.isActive('link'),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			blockquote: editor.isActive('blockquote'),
			codeBlock: editor.isActive('codeBlock')
		};
	});

	function toggleLink() {
		const prev = (editor.getAttributes('link').href as string | undefined) ?? '';
		const url = window.prompt('Link URL', prev);
		if (url === null) return;
		if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
		else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}

	function btnClass(on: boolean): string {
		return `flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
			on ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
		}`;
	}
</script>

<div
	role="toolbar"
	aria-label="Formatting"
	tabindex="-1"
	class="flex shrink-0 items-center gap-1"
	onmousedown={(e) => e.preventDefault()}
>
	<button
		type="button"
		title="Bold (Ctrl/Cmd+B)"
		onclick={() => editor.chain().focus().toggleBold().run()}
		class={btnClass(active.bold)}
	>
		<Bold class="size-3.5" />
	</button>
	<button
		type="button"
		title="Italic (Ctrl/Cmd+I)"
		onclick={() => editor.chain().focus().toggleItalic().run()}
		class={btnClass(active.italic)}
	>
		<Italic class="size-3.5" />
	</button>
	<button
		type="button"
		title="Strikethrough (Ctrl/Cmd+Alt+5)"
		onclick={() => editor.chain().focus().toggleStrike().run()}
		class={btnClass(active.strike)}
	>
		<Strikethrough class="size-3.5" />
	</button>
	<button
		type="button"
		title="Inline code"
		onclick={() => editor.chain().focus().toggleCode().run()}
		class={btnClass(active.code)}
	>
		<Code class="size-3.5" />
	</button>
	<button type="button" title="Link" onclick={toggleLink} class={btnClass(active.link)}>
		<Link2 class="size-3.5" />
	</button>

	<span class="mx-0.5 h-4 w-px bg-outline-variant" aria-hidden="true"></span>

	<button
		type="button"
		title="Bullet list (Ctrl/Cmd+Shift+7)"
		onclick={() => editor.chain().focus().toggleBulletList().run()}
		class={btnClass(active.bulletList)}
	>
		<List class="size-3.5" />
	</button>
	<button
		type="button"
		title="Ordered list (Ctrl/Cmd+Shift+8)"
		onclick={() => editor.chain().focus().toggleOrderedList().run()}
		class={btnClass(active.orderedList)}
	>
		<ListOrdered class="size-3.5" />
	</button>
	<button
		type="button"
		title="Quote"
		onclick={() => editor.chain().focus().toggleBlockquote().run()}
		class={btnClass(active.blockquote)}
	>
		<Quote class="size-3.5" />
	</button>
	<button
		type="button"
		title="Code block (Ctrl/Cmd+Alt+C)"
		onclick={() => editor.chain().focus().toggleCodeBlock().run()}
		class={btnClass(active.codeBlock)}
	>
		<SquareCode class="size-3.5" />
	</button>
</div>
