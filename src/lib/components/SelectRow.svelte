<script lang="ts">
	import { ToggleGroup } from 'bits-ui';

	let {
		label,
		value,
		items,
		onValueChange
	}: {
		label: string;
		value: string;
		items: { value: string; label: string; style?: string }[];
		onValueChange: (value: string) => void;
	} = $props();

	const itemClass =
		'flex h-6 w-16 cursor-pointer items-center justify-center rounded-md text-sm data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:bg-surface-variant/40 data-[state=off]:text-on-surface focus:outline-none';
</script>

<div class="mb-2 flex items-center justify-between px-0.5">
	<span class="text-sm text-on-surface">{label}</span>
	<ToggleGroup.Root
		type="single"
		{value}
		onValueChange={(v) => v && onValueChange(v)}
		class="flex items-center gap-1"
	>
		{#each items as item (item.value)}
			<ToggleGroup.Item value={item.value} class={itemClass} style={item.style}>
				{item.label}
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
</div>
