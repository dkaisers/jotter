# Contributing

Thanks for considering contributing to jotter. This is a small, personal
project, so keep changes focused and small.

## Setup

```sh
git clone https://github.com/dkaisers/jotter.git
cd jotter
bun install
bun run dev
```

## Checks

Every commit should pass:

```sh
bun run check   # type checking
bun run lint    # prettier + eslint
bun run build   # production build
```

Run `bun run format` to fix formatting issues.

## Making changes

- Branch off `main`: `git checkout -b your-branch-name`
- Keep commits small and focused, with clear messages
- Push the branch and open a pull request against `main`
- The GitHub Actions workflow runs `check` and `lint` on every push and
  deploys the `main` branch to GitHub Pages

## Conventions

- Svelte 5 runes only (`$state`, `$props`, `$derived`, ...)
- TypeScript throughout; new code should be typed
- Style with the existing Tailwind classes — no new CSS unless needed
- No comments unless they explain something non-obvious

## Reporting issues

Open an issue describing the problem, steps to reproduce, and what you
expected instead.
