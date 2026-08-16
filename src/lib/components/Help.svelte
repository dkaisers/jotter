<script lang="ts">
	import { CircleQuestionMark } from '@lucide/svelte';
	import Modal from './Modal.svelte';

	let open = $state(false);
</script>

<div class="relative flex self-stretch">
	<button
		type="button"
		aria-label="Help"
		aria-haspopup="true"
		aria-expanded={open}
		onclick={() => (open = !open)}
		class="flex w-8 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
	>
		<CircleQuestionMark class="size-4" />
	</button>
</div>

<Modal {open} title="Help" onclose={() => (open = false)} width="max-w-xl">
	<div class="space-y-4 text-sm text-on-surface-variant">
		<div>
			<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Layout</p>
			<div class="space-y-3">
				<div>
					<p class="text-on-surface">Spaces</p>
					<p class="mt-0.5">
						Each tab is a space with its own columns. Add one with <span class="text-on-surface"
							>+</span
						>, rename by double-clicking a tab, drag tabs to reorder, and close with
						<span class="text-on-surface">×</span>.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Columns &amp; cards</p>
					<p class="mt-0.5">
						Add a todo list or a note with the buttons in a column. Drag a column's edge to resize
						it; drag a card to reorder it or move it to another column, or drop it into empty space
						to start a new column. Rename a card by clicking its title.
					</p>
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Todos</p>
			<div class="space-y-3">
				<div>
					<p class="text-on-surface">Editing</p>
					<p class="mt-0.5">
						Click the circle to check off, click the text to edit, drag the grip to reorder.
						<span class="text-on-surface">Enter</span> adds a todo,
						<span class="text-on-surface">Shift+Enter</span> starts a new line.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Important</p>
					<p class="mt-0.5">
						Hover a todo and click the triangle to mark it important — its checkbox gets an accent
						ring. Spaces with important undone todos show a triangle, and the favicon turns red
						while any exist.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Timers</p>
					<p class="mt-0.5">
						Hover a todo and click the alarm to set a countdown. It counts down in a pill next to
						the todo and ends with a notification — an in-app toast when this tab is focused. Once
						due, the pill becomes an alarm icon and stays until you clear or replace the timer;
						checking the todo off also cancels it.
					</p>
					<p class="mt-0.5">
						Timers run as long as jotter is open somewhere. If every tab is in the background, the
						notification can arrive up to a minute late — browsers slow down hidden tabs to save
						battery.
					</p>
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">Notes</p>
			<div class="space-y-3">
				<div>
					<p class="text-on-surface">Editing</p>
					<p class="mt-0.5">
						Notes are rich text, saved as markdown as you type. Click into a note to start editing;
						click away to stop. A formatting bar appears below the title while you're editing.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Formatting bar</p>
					<p class="mt-0.5">
						The bar covers bold, italic, and strikethrough; inline code, links, and code blocks; and
						bullet and numbered lists plus quotes. Hover any button to see its keyboard shortcut.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Markdown</p>
					<p class="mt-0.5">
						Typing markdown syntax like <span class="text-on-surface">&gt; </span>,
						<span class="text-on-surface">- </span>, or <span class="text-on-surface">1. </span>
						converts it as you go. Pasting markdown renders it, and copying text from a note gives you
						markdown — so notes move cleanly between jotter and other tools.
					</p>
					<p class="mt-0.5">
						Click a link in a note to open it in a new tab. While editing, a click puts the cursor
						in the link instead, so you can change it.
					</p>
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
				General
			</p>
			<div class="space-y-3">
				<div>
					<p class="text-on-surface">Settings</p>
					<p class="mt-0.5">
						The gear opens settings: theme, fonts, and paper grain; auto todo handling (none, sort,
						or delete), spell checking, and the timer chime; plus export, import, and clear for your
						data.
					</p>
				</div>
				<div>
					<p class="text-on-surface">Storage</p>
					<p class="mt-0.5">
						Everything stays in this browser — nothing is uploaded. Your workspace lives in this
						browser's local storage, tied to this browser and profile, so a different browser, a
						private window, or another device won't load the same data.
					</p>
					<p class="mt-0.5">
						Clearing this site's data (or browser storage in general) erases your workspace, and
						private/incognito windows start empty. Use the backup export in settings to keep your
						notes safe.
					</p>
				</div>
			</div>
		</div>
	</div>
</Modal>
