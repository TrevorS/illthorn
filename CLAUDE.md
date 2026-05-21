# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

direct-commits-allowed: true

## Project

Illthorn is an Electron front-end for Gemstone IV, a Lich-driven MUD. Three-process Electron app (`src/main.ts`, `src/preload.ts`, `src/frontend/index.ts`) connecting to Lich over TCP.

## Toolchain

- **pnpm 11.x** (not yarn/npm). `nodeLinker: hoisted` is required in `pnpm-workspace.yaml` — electron-forge can't resolve pnpm's symlinked layout.
- **Node 22.20.0** (pinned in `.node-version`, `package.json` volta, and CI). **Do not bump to Node 24** — `extract-zip` silently truncates Electron's postinstall on Node 24. Revisit when upstream fixes it.
- **Vite 7.3.3** — don't jump to Vite 8 until `@electron-forge/plugin-vite` ships Rolldown support (Vite 8 renamed `build.rollupOptions` → `build.rolldownOptions`).
- TypeScript 6 with `strict: true` and `moduleResolution: "bundler"`. Catch blocks: `error` is `unknown` — narrow with `error instanceof Error ? error.message : String(error)`.

## Commands

- `pnpm check` — format + lint + typecheck + test (full validation)
- `pnpm start` — Electron dev runtime
- `pnpm package` — non-installer Forge bundle (faster smoke test than `pnpm make`)
- `pnpm make` — full distributables (zip, deb, rpm, squirrel)
- `pnpm test path/to/file.spec.ts` — single spec
- `pnpm test:coverage` — coverage report at `coverage/index.html`

## Code conventions

- **Never use single-line if statements** — always block braces. Biome doesn't enforce this; it's project style.
- **Prefer `Array<T>` over `T[]`** for array type declarations.
- **`// ABOUTME:` header** on the first two lines of every new component file describing purpose + implementation note.
- **Lit components**: `@customElement('illthorn-*-lit')` decorator, `static styles` as first class member, `declare global { interface HTMLElementTagNameMap }` block at file bottom.

## Light DOM Lit pattern

A few components opt out of Shadow DOM via `createRenderRoot() { return this; }` (e.g. `app.lit.ts`, `sessions-menu.lit.ts`, `session-button.lit.ts`, `session-layout.lit.ts`). Their `static styles` are NOT auto-injected. Required pattern:

1. CSS selectors use the actual element name, not `:host`:
   ```ts
   static styles = css`illthorn-my-component { display: grid; }`;
   ```
2. Manually adopt styles in `connectedCallback`:
   ```ts
   private _adoptStyles() {
     if (document.head.querySelector('style[data-lit-component="my-component"]')) return;
     const style = document.createElement("style");
     style.setAttribute("data-lit-component", "my-component");
     style.textContent = MyComponent.styles.cssText;
     document.head.appendChild(style);
   }
   ```

## Architecture notes

- **IPC pattern**: each backend module (`src/backend/<module>/`) has three files — `ipc-handlers.ts` (main process), `mainworld-api.ts` (preload bridge), `methods.ts` (business logic).
- **Bus**: components communicate via `CustomEvent` on a `Bus` instance per session (`session.bus.subscribeEvent<GameTag>("metadata/...")`). Event namespace is `metadata/<tagName>/<id?>`.
- **Parser**: `src/frontend/parser/saxophone-parser.ts` tokenizes Lich's XML stream into `GameTag` objects. `saxophone` is abandoned (last release 2022) — works fine, flagged for eventual replacement.
- **Stories** are typechecked by the main `tsconfig.json` (no exclusion). Each `*.stories.ts` defines a local `FeedElement` type — keep methods non-optional or `pnpm typecheck` fails.

## Testing

- Vitest + JSDOM. Tests in `test/` mirror `src/`. Path alias `@` → `src/`.
- Mock sessions via `createMockSession()` from `test/mocks/`.
- Await `updateComplete` after property changes for Lit components.

## Debug logging

Disabled by default. Enable via env var or localStorage:

```bash
DEBUG=illthorn:* pnpm start
```

```js
localStorage.setItem('debug', 'illthorn:effects,illthorn:metadata');
```

Namespaces: `bus`, `metadata`, `raw-input`, `effects`, `session`, `session-connect`, `app`, `feed`, `injuries`, `parser`, `macros`, `commands`. Grep for `debug(` calls in `src/` for the full list.

## CLI command surface

Frontend commands use vim-style `:` prefix (`:theme`, `:connect`, `:focus`, `:set`, `:ui`, `:stream`, `:hilite`, `:rename`, `:swap`, `:config`). Implementation: `src/frontend/illthorn.ts` → `handleCommand`.

## Repo etiquette

- Conventional commits — `feat:`, `fix:`, `build:`, `ci:`, `chore:`, `refactor:`, `docs:`. See `git log --oneline`.
- Direct commits to `master` are allowed (see marker above). The branch-protection hook reads it.
- Push: SSH origin (`git@github.com:TrevorS/illthorn.git`). CI runs on every push.
