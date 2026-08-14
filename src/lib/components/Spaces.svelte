<script lang="ts">
	import { ChevronLeft, ChevronRight, Plus, TriangleAlert, X } from '@lucide/svelte';
	import {
		activeSpace,
		addSpace,
		removeSpace,
		renameSpace,
		reorderSpace,
		setActiveSpace,
		workspace
	} from '$lib/workspace';
	import { onMount } from 'svelte';
	import { startDrag } from '$lib/drag';
	import Settings from './Settings.svelte';
	import Help from './Help.svelte';
	import Confirm from './Confirm.svelte';
	import { spaceHasFlagged, spaceIsEmpty } from '$lib/workspace';

	let scrollEl: HTMLElement | undefined = $state();
	let canLeft = $state(false);
	let canRight = $state(false);
	let editingId: string | null = $state(null);
	let nameDraft = $state('');
	let confirmingId: string | null = $state(null);
	let renameInput: HTMLInputElement | undefined = $state();

	const active = $derived($activeSpace);

	const nameWidth = $derived.by(() => {
		const font = renameInput
			? getComputedStyle(renameInput).font
			: '1rem ui-sans-serif, system-ui, sans-serif';
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return nameDraft.length * 8;
		ctx.font = font;
		return Math.ceil(ctx.measureText(nameDraft || ' ').width);
	});

	function updateArrows() {
		if (!scrollEl) return;
		canLeft = scrollEl.scrollLeft > 0;
		canRight = scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1;
	}

	function onWheel(e: WheelEvent) {
		if (!scrollEl) return;
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			e.preventDefault();
			scrollEl.scrollBy({ left: e.deltaY, behavior: 'smooth' });
		}
	}

	onMount(() => {
		const el = scrollEl;
		el?.addEventListener('scroll', updateArrows, { passive: true });
		el?.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('resize', updateArrows);
		return () => {
			el?.removeEventListener('scroll', updateArrows);
			el?.removeEventListener('wheel', onWheel);
			window.removeEventListener('resize', updateArrows);
		};
	});

	$effect(() => {
		void $workspace.spaces.map((s) => s.id + ':' + s.name).join('|');
		requestAnimationFrame(updateArrows);
	});

	function scrollBy(dir: -1 | 1) {
		scrollEl?.scrollBy({ left: dir * 180, behavior: 'smooth' });
	}

	function startRename(spaceId: string, name: string) {
		editingId = spaceId;
		nameDraft = name;
		requestAnimationFrame(() => renameInput?.focus());
	}

	function commitRename() {
		if (editingId) renameSpace(editingId, nameDraft);
		editingId = null;
	}

	function onCloseClick(spaceId: string) {
		const s = $workspace.spaces.find((x) => x.id === spaceId);
		const hasContent = s && s.columns.some((c) => c.cards.length > 0);
		if (hasContent) {
			confirmingId = spaceId;
		} else {
			removeSpace(spaceId);
		}
	}

	function onDragStart(e: PointerEvent, spaceId: string) {
		e.preventDefault();
		startDrag({
			onMove: (ev) => {
				const el = document.elementFromPoint(ev.clientX, ev.clientY);
				const target = el?.closest('[data-space-id]') as HTMLElement | null;
				if (!target) return;
				const targetId = target.dataset.spaceId!;
				if (targetId !== spaceId) reorderSpace(spaceId, targetId);
			}
		});
	}

	function nameOf(id: string | null): string {
		return $workspace.spaces.find((s) => s.id === id)?.name ?? '';
	}
</script>

<div class="flex items-end gap-1 border-b border-outline-variant">
	<div bind:this={scrollEl} class="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
		{#each $workspace.spaces as space (space.id)}
			<div
				data-space-id={space.id}
				class="flex shrink-0 items-center gap-0.5 rounded-t-md border-b-2 px-3.5 py-1.5 text-base"
				class:border-primary={active?.id === space.id}
				class:border-transparent={active?.id !== space.id}
				style={`background-color: ${active?.id === space.id ? 'var(--surface)' : 'color-mix(in srgb, var(--surface) 40%, transparent)'}`}
			>
				{#if spaceHasFlagged(space)}
					<TriangleAlert class="mr-1 size-3.5 shrink-0 text-primary" />
				{/if}

				{#if editingId === space.id}
					<input
						type="text"
						bind:this={renameInput}
						bind:value={nameDraft}
						style={`width: ${Math.max(nameWidth, 1)}px`}
						onkeydown={(e) => {
							if (e.key === 'Enter') commitRename();
							if (e.key === 'Escape') editingId = null;
						}}
						onblur={commitRename}
						class="min-w-0 rounded-none border-0 bg-transparent px-0 py-0 text-base text-on-surface focus:ring-0 focus:outline-none"
					/>
				{:else}
					<button
						type="button"
						role="tab"
						aria-selected={active?.id === space.id}
						onpointerdown={(e) => onDragStart(e, space.id)}
						onclick={() => setActiveSpace(space.id)}
						ondblclick={() => startRename(space.id, space.name)}
						class="cursor-pointer active:cursor-grabbing"
						class:opacity-50={spaceIsEmpty(space)}
						class:text-on-surface={active?.id === space.id}
						class:text-on-surface-variant={active?.id !== space.id}
					>
						{space.name}
					</button>
				{/if}

				{#if $workspace.spaces.length > 1}
					<button
						type="button"
						title="Close space"
						onclick={(e) => {
							e.stopPropagation();
							onCloseClick(space.id);
						}}
						class="-mr-1 ml-1 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant focus:ring-2 focus:ring-outline focus:outline-none"
					>
						<X class="size-3.5" />
					</button>
				{/if}
			</div>
		{/each}

		<button
			type="button"
			title="Add space"
			onclick={(e) => {
				e.currentTarget.blur();
				addSpace();
			}}
			class="mr-2 flex w-8 shrink-0 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none"
		>
			<Plus class="size-4" />
		</button>
	</div>

	{#if canLeft || canRight}
		<div class="flex shrink-0 self-stretch">
			<button
				type="button"
				title="Scroll tabs left"
				disabled={!canLeft}
				onclick={() => scrollBy(-1)}
				class="flex w-8 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none disabled:cursor-default disabled:opacity-40"
			>
				<ChevronLeft class="size-4" />
			</button>
			<button
				type="button"
				title="Scroll tabs right"
				disabled={!canRight}
				onclick={() => scrollBy(1)}
				class="flex w-8 cursor-pointer items-center justify-center self-stretch rounded-t-md border-b-2 border-transparent text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus:outline-none disabled:cursor-default disabled:opacity-40"
			>
				<ChevronRight class="size-4" />
			</button>
		</div>
	{/if}

	<Help />
	<Settings />
</div>

<Confirm
	open={confirmingId !== null}
	title={confirmingId ? `Delete “${nameOf(confirmingId)}”?` : ''}
	message="This removes the space and everything in it. This can't be undone."
	onclose={() => (confirmingId = null)}
	onconfirm={() => {
		removeSpace(confirmingId!);
		confirmingId = null;
	}}
/>
