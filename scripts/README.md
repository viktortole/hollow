# scripts/

Small Node-only operational tools. Each script is a single `.mjs` file with a top-of-file comment explaining its purpose.

| Script | Invoke via | Purpose |
|---|---|---|
| `health.mjs` | `npm run health` | Runs every release-blocking gate in one command — typecheck, Vite build, and 4 architectural pattern scans (no stray fasting-clock `setInterval`, no direct `@tauri-apps/api/window` imports outside `platform/desktop`, no `z-[N]` / `z-NN` / `rounded-2xl/xl/lg`, no `useStore()` without selector). Pure JS scans, works on every OS. CI runs the same command. **Run before opening a PR, before tagging a release, and as the first thing when picking up the project.** |
| `bump-version.mjs` | `npm run version:bump <ver>` | Single-command sync of `package.json` + `tauri.conf.json` + `Cargo.toml` versions. Cargo bump is scoped to the `[package]` section so it can't accidentally bump a dependency. Validates input as semver. Idempotent (bumping to current version is a no-op). |

## Why pure Node?

We avoid shell scripts for two reasons:

1. **Cross-platform.** The codebase is developed on Windows (where `bash` and `grep` are not guaranteed) and built on Linux CI. Pure Node runs identically on both.
2. **Readable.** A Node script is regular JavaScript. Future contributors don't need to remember sed/awk/grep flag conventions.

## Adding a new script

1. Create `scripts/<name>.mjs` with a top-of-file JSDoc-style comment explaining its purpose.
2. Add an `npm run <verb>` alias in `package.json` `scripts`.
3. Add a row to the table above.
4. If the script enforces a release-blocker invariant, also wire it into `health.mjs` so `npm run health` covers it.
