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
			<p class="mb-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
				General
			</p>
			<div class="space-y-3">
				<div>
					<p class="text-on-surface">Notes</p>
					<p class="mt-0.5">
						Rich text in a note card, saved as markdown as you type. While editing, a formatting bar
						appears below the title. Keyboard shortcuts:
						<span class="text-on-surface">Ctrl/Cmd+B</span> bold,
						<span class="text-on-surface">I</span> italic,
						<span class="text-on-surface">E</span> strikethrough,
						<span class="text-on-surface">Ctrl/Cmd+Alt+5</span>, lists with
						<span class="text-on-surface">Ctrl/Cmd+Shift+7/8</span>, indent lists with
						<span class="text-on-surface">Tab</span>/<span class="text-on-surface">Shift+Tab</span>,
						and undo with <span class="text-on-surface">Ctrl/Cmd+Z</span>. Typing markdown like
						<span class="text-on-surface">&gt; </span>, <span class="text-on-surface">- </span>, or
						<span class="text-on-surface">1. </span> converts as you go; pasted markdown renders, and
						copied text comes out as markdown.
					</p>
				</div>
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
					<p class="mt-0.5">Everything stays in your browser. Nothing is uploaded.</p>
				</div>
			</div>
		</div>
	</div>
</Modal>
