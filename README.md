# jotter

A quiet, local-first space for notes and todos.

jotter organizes your notes and todo lists into **spaces** — each with its own
resizable column layout. Everything is stored in your browser's localStorage:
no accounts, no server, no tracking.

## Features

- Multiple spaces behind tabs, reorderable by dragging
- Resizable column layout; add todo lists and notes side by side
- Inline editing, todo checkmarks, drag-to-reorder
- Dark / light paper themes, font choices, paper grain, and more in Settings
- Local-first: all data stays in your browser

## Live site

[jotter](https://dkaisers.github.io/jotter/)

## Developing

```sh
bun install
bun run dev
```

## Building

```sh
bun run build
bun run preview
```

The build is a fully static site (SvelteKit with `adapter-static`), deployed to
GitHub Pages via GitHub Actions on every push to `main`.

## License

MIT — see [LICENSE](LICENSE). See the acknowledgements in the app footer for
third-party licenses.
