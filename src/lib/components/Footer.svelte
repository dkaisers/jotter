<script lang="ts">
	import Modal from './Modal.svelte';

	const LICENSE_URL = 'https://github.com/dkaisers/jotter/blob/main/LICENSE';
	const YEAR = new Date().getFullYear();

	type Section = 'license' | 'privacy' | 'credits';

	let open: Section | null = $state(null);

	const titles: Record<Section, string> = {
		license: 'License',
		privacy: 'Privacy',
		credits: 'Acknowledgements'
	};

	let close = () => (open = null);
</script>

<footer
	class="mx-auto flex w-full max-w-[60rem] items-center justify-between px-4 py-4 text-xs text-on-surface-variant sm:px-6"
>
	<span>© {YEAR} Dominik Kaisers</span>
	<nav class="flex items-center gap-4">
		<button
			type="button"
			onclick={() => (open = 'license')}
			class="cursor-pointer hover:text-on-surface focus:outline-none">License</button
		>
		<button
			type="button"
			onclick={() => (open = 'privacy')}
			class="cursor-pointer hover:text-on-surface focus:outline-none">Privacy</button
		>
		<button
			type="button"
			onclick={() => (open = 'credits')}
			class="cursor-pointer hover:text-on-surface focus:outline-none">Acknowledgements</button
		>
	</nav>
</footer>

<Modal open={open !== null} title={open ? titles[open] : ''} onclose={close}>
	{#if open === 'license'}
		<p>jotter is released under the <span class="text-on-surface">MIT License</span>.</p>
		<p class="mt-3">Copyright (c) 2026 Dominik Kaisers</p>
		<p class="mt-3">
			Permission is hereby granted, free of charge, to any person obtaining a copy of this software
			and associated documentation files (the "Software"), to deal in the Software without
			restriction, including without limitation the rights to use, copy, modify, merge, publish,
			distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
			Software is furnished to do so, subject to the following conditions:
		</p>
		<p class="mt-3">
			The above copyright notice and this permission notice shall be included in all copies or
			substantial portions of the Software.
		</p>
		<p class="mt-3">
			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
			BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
			NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
			DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		</p>
		<a
			href={LICENSE_URL}
			target="_blank"
			rel="noopener noreferrer"
			class="mt-4 inline-block text-primary hover:underline">View the LICENSE file on GitHub →</a
		>
	{:else if open === 'privacy'}
		<p>jotter is local-first. Everything you write is stored in your browser's localStorage.</p>
		<ul class="mt-3 list-disc space-y-1 pl-4">
			<li>No accounts, no sign-up</li>
			<li>No server — nothing is uploaded or transmitted</li>
			<li>No analytics, no tracking, no cookies</li>
			<li>Clearing your browser data removes everything</li>
		</ul>
	{:else if open === 'credits'}
		<p>jotter is built with open-source software.</p>
		<ul class="mt-3 list-disc space-y-1 pl-4">
			<li>Svelte &amp; SvelteKit — <span class="text-on-surface">MIT</span></li>
			<li>Tailwind CSS — <span class="text-on-surface">MIT</span></li>
			<li>lucide icons — <span class="text-on-surface">ISC</span></li>
			<li>
				Inter, Lora &amp; JetBrains Mono fonts — <span class="text-on-surface">SIL OFL 1.1</span>
			</li>
		</ul>
	{/if}
</Modal>
