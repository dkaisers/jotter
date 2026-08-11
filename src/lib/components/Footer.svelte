<script lang="ts">
	import Modal from './Modal.svelte';

	const LICENSE_URL = 'https://github.com/dkaisers/jotter/blob/main/LICENSE';
	const GITHUB_PRIVACY_URL =
		'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';

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
	class="mx-auto flex w-full max-w-[60rem] items-center justify-end px-4 py-4 text-xs text-on-surface-variant sm:px-6"
>
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

<Modal open={open !== null} title={open ? titles[open] : ''} onclose={close} width="max-w-xl">
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
		<p>
			jotter is local-first. Your notes and todos stay in your browser's localStorage — they are
			never uploaded or transmitted anywhere.
		</p>
		<ul class="mt-3 list-disc space-y-1 pl-4">
			<li>No accounts, no sign-up</li>
			<li>No analytics, no tracking, no cookies</li>
			<li>Clearing your browser data removes everything</li>
		</ul>
		<p class="mt-3">
			The app itself is served as static files from GitHub Pages. When you load the page, GitHub may
			log standard request information (such as your IP address) in line with
			<a
				href={GITHUB_PRIVACY_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="text-primary hover:underline">GitHub's Privacy Statement</a
			>.
		</p>
	{:else if open === 'credits'}
		<p>jotter is built with open-source software:</p>
		<ul class="mt-3 list-disc space-y-1 pl-4">
			<li>
				<a
					href="https://svelte.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Svelte</a
				>
				&amp;
				<a
					href="https://svelte.dev/docs/kit"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">SvelteKit</a
				>
				— MIT
			</li>
			<li>
				<a
					href="https://tailwindcss.com"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Tailwind CSS</a
				>
				— MIT
			</li>
			<li>
				<a
					href="https://lucide.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Lucide</a
				>
				icons — ISC
			</li>
			<li>
				<a
					href="https://www.bits-ui.com"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Bits UI</a
				>
				— MIT
			</li>
			<li>
				<a
					href="https://rsms.me/inter/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Inter</a
				>,
				<a
					href="https://fonts.google.com/specimen/Lora"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">Lora</a
				>
				&amp;
				<a
					href="https://www.jetbrains.com/lp/mono/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">JetBrains Mono</a
				>
				fonts — SIL OFL 1.1
			</li>
			<li>
				<a
					href="https://github.com/logos"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline">GitHub logo</a
				>
				— trademark of GitHub, Inc., used to link to the source
			</li>
		</ul>
	{/if}
</Modal>
