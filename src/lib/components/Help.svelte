<script lang="ts">
	import { CircleQuestionMark } from 'lucide-svelte';
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
	<div class="space-y-3 text-sm text-on-surface-variant">
		<div>
			<p class="text-on-surface">Spaces</p>
			<p class="mt-0.5">
				Each tab is a space with its own columns. Add one with <span class="text-on-surface">+</span
				>, rename by double-clicking the tab, drag tabs to reorder.
			</p>
		</div>
		<div>
			<p class="text-on-surface">Columns &amp; cards</p>
			<p class="mt-0.5">
				Add a todo list or a note. Drag the column edge to resize. Rename a card by clicking its
				title.
			</p>
		</div>
		<div>
			<p class="text-on-surface">Todos</p>
			<p class="mt-0.5">
				Click the circle to check off, click the text to edit, drag the grip to reorder.
				<span class="text-on-surface">Enter</span> adds a todo,
				<span class="text-on-surface">Shift+Enter</span> starts a new line.
			</p>
		</div>
		<div>
			<p class="text-on-surface">Important</p>
			<p class="mt-0.5">
				Hover a todo and click the triangle to mark it important — the checkbox gets an accent ring.
				Tabs with important undone todos show a triangle, and the favicon turns red while any exist.
			</p>
		</div>
		<div>
			<p class="text-on-surface">Timers</p>
			<p class="mt-0.5">
				Hover a todo and click the alarm to set a countdown. It counts down in a small pill next to
				the todo and ends with a notification (a toast when this tab is focused). The pill stays as
				an alarm icon until you clear or replace the timer. Marking a todo done also cancels its
				timer.
			</p>
			<p class="mt-0.5">
				Timers run as long as jotter is open somewhere. If every tab is in the background, the
				notification can arrive up to a minute late — browsers slow down hidden tabs to save
				battery.
			</p>
		</div>
		<div>
			<p class="text-on-surface">Notes</p>
			<p class="mt-0.5">Free-form text — everything is saved automatically as you type.</p>
		</div>
		<div>
			<p class="text-on-surface">Storage</p>
			<p class="mt-0.5">All data stays in your browser. Nothing is uploaded.</p>
		</div>
	</div>
</Modal>
