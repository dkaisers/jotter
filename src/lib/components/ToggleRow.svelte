<script lang="ts">
	import { Switch } from 'bits-ui';

	let {
		label,
		checked,
		onCheckedChange
	}: {
		label: string;
		checked: boolean;
		onCheckedChange: (checked: boolean) => void;
	} = $props();
</script>

<div class="flex items-center justify-between px-0.5 py-1">
	<span class="text-sm text-on-surface">{label}</span>
	<Switch.Root
		{checked}
		{onCheckedChange}
		class="flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-variant"
	>
		<Switch.Thumb
			class={`size-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
		/>
	</Switch.Root>
</div>
