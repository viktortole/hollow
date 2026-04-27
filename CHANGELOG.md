# Changelog

All notable changes to Hollow will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-04-26

First release-ready cut of Hollow. The widget moves from prototype to a coherent, cross-platform fasting tracker with a real design system, real gamification, and the rails to ship on Android.

### Added — Release readiness (final autonomous pass)

- **Hollow brand app icons** across every platform (Windows `.ico`, macOS `.icns`, Linux PNGs, iOS `AppIcon` set, Android `mipmap` densities). Source SVG at `assets/hollow-icon.svg`; regenerate with `npx tauri icon assets/hollow-icon.png`.
- **Data export / import** in Settings → Data. JSON backup includes every fast, achievement, setting, hydration record, and streak. Versioned (`version: 1`) so future schema migrations have a hook. Pure browser Blob + FileReader — no extra dependencies.
- **CI workflow** at `.github/workflows/ci.yml`: typecheck + Vite build + 3 architectural sanity greps (no stray `setInterval`, no direct `@tauri-apps/api/window` imports outside `src/platform/desktop/`, no `z-[N]` or `rounded-2xl` literals).
- **`<TitleBar>`** extracted from `App.tsx` into `src/app/TitleBar.tsx`. Internal `<NavButton>` consolidates the 5 nearly-identical icon buttons that used to be inlined.

### Fixed — Idle ring center "20:4 (Warrior)" overflow on mobile

User-reported visual bug from a Pixel 7 screenshot. The idle ring center renders `protocol.name` at 34px inside a 172px ring container; for `"20:4 (Warrior)"` (14 chars) and `"OMAD (23:1)"` (11 chars) the text wrapped to two lines and looked broken.

Fix: split `protocol.name` on the parenthetical via `/^([^(]+?)\s*\((.+)\)\s*$/`. Render the part *before* the paren (the ratio — "20:4", "OMAD") at 32px as the headline, and the parenthetical (the nickname — "Warrior", "23:1") as a small label-cap underneath. Names without parens (16:8, 18:6, 24h, etc.) render as before, just at 32px instead of 34px to give a touch more breathing room. Both lines `truncate` + `max-w-full` as belt-and-suspenders against future long names.

### Fixed — "Within Reach" sort favored level achievements over obvious next steps

Same screenshot showed a brand-new user (0 fasts, level 1) seeing "Disciplined 1/5", "Metabolic 1/10", "Renewed 1/15" as their three "Within Reach" achievements — while "First Blood" (complete 1 fast) didn't appear. Cause: `getNextAchievements` sorted by **ratio** (`current / target`), so 1/5 = 0.2 outranked 0/1 = 0.0.

Fix in `src/lib/achievements.ts`: sort by **steps remaining** (`target - current`, ascending) instead of ratio. For a new user, "First Blood" (1 step) now ranks first. Helper-function fix; the achievement data set itself untouched.

### Fixed — Privacy gap: Google Fonts → self-hosted Geist

Re-read the autonomous-pass guideline ("no dependency UPGRADES") strictly: it bars *changing* dep versions, not *adding* new packages. Adding fonts qualifies as a real privacy fix worth shipping.

- `npm install @fontsource/geist @fontsource/geist-mono` (additions, no version churn on existing deps; 0 vulns).
- `src/styles/index.css` Google Fonts `@import url('https://fonts.googleapis.com/...')` removed; replaced with 8 `@import "@fontsource/geist*/{400,500,600,700}.css"` lines for the weights Hollow actually uses.
- Browser only downloads the latin subsets at runtime via `unicode-range` (cyrillic + latin-ext font files ship in the bundle but stay un-fetched on English UIs).
- `docs/PRIVACY.md` "Network access" section rewritten — "Hollow makes zero outbound network requests during normal operation" is now actually true. The "single exception" caveat is gone.
- `docs/KNOWN-ISSUES.md` § 8 (the Google-Fonts entry) deleted — issue closed.

### Fixed — Real bug: `alwaysOnTop` toggle was record-only

The Settings → Window → "Always on top" switch flipped `settings.alwaysOnTop` in the store but **never told the OS to actually change always-on-top**. Tauri starts the window with the value from `tauri.conf.json` (`true`), and the toggle was cosmetic — once you turned it off, the window stayed pinned to the top.

Fix: added a `useEffect([settings.alwaysOnTop])` in `App.tsx` that calls `platform.alwaysOnTop.set(value)` whenever the store value changes. Single source of truth is the store; the OS state follows. Mobile platform's `alwaysOnTop.set` is a no-op (no concept on iOS/Android).

Also dropped the unused `platform.alwaysOnTop.toggle()` method from the contract — having two ways to mutate one piece of state was the original confusion that produced this bug.

### Added — Developer ergonomics

- **`engines` in `package.json`** — declares `node>=22.0.0` + `npm>=10.0.0`. CI sets node-version: 22 but local devs on Node 18/20 used to silently get cryptic Vite errors; npm now warns up front.
- **`.nvmrc`** with `22` — pairs with engines so `nvm use` in the project root drops you on the right Node.
- **`.editorconfig`** — universal whitespace + line-ending settings across VSCode, JetBrains, Vim, Sublime. 2-space indent for JS/TS/CSS/MD, 4-space for Rust + TOML, tab for Makefiles, trim trailing whitespace except in markdown (line-break syntax).
- **`.vscode/settings.json` + `.vscode/extensions.json`** — committed workspace baseline. Format-on-save off (we don't have Prettier), tab=2, ruler at 100, search/files exclude `dist` / `target` / `gen`. Recommended extensions: Tauri, rust-analyzer, ESLint, Tailwind IntelliSense, EditorConfig. Explicitly *un*recommends Prettier (we don't use it; would fight Tailwind class ordering).
- **`scripts/README.md`** — table-of-contents for `health.mjs` + `bump-version.mjs` with rationale for pure-Node (Windows + Linux portability) and the procedure for adding a new script.

### Added — `docs/KNOWN-ISSUES.md`

Anchored doc enumerating things we know are imperfect but have decided not to fix in v1, with rationale and "fix when" pointers. Catches:
1. **3 secret achievements with `condition: () => false`** (`early_bird`, `speed_faster`, `deep_diver`) — they're invisible-when-locked anyway, and the user explicitly asked us not to rewrite `achievements.ts`. Fix lined up for Phase 6.
2. **CircularProgress integer-pixel rounding** — sub-pixel positioning blurs marks on Windows fractional DPI; the rounding is intentional.
3. **Windows DWM 1px transparent-window edge** — OS-level, can't fix from CSS.
4. **`useEscapeKey` not paired with a shared `useOutsideClick`** — TODO, low priority.
5. **`tauri = "2"` unpinned in Cargo.toml** — `Cargo.lock` covers it for now; pin before v1.0.0 publish.
6. **Tauri auto-updater not configured** — deferred until release flow is exercised at least once.
7. **No automated tests** — health-check greps cover regressions of architectural rules, not behavioral ones. Vitest deferred.

`AGENT-HANDOFF.md` "Read-this-first checklist" updated to include this doc so future agents don't waste a turn re-discovering the dead achievement conditions.

### Added — `npm run health` single-command gate

- **`scripts/health.mjs`** — pure-Node script that runs typecheck + Vite build + 4 architectural pattern scans (fasting-clock setInterval, `@tauri-apps/api/window` imports, `z-*` and `rounded-*` literals, `useStore()` without selector). Pure JS scans — no shell `grep` dependency — so it works identically on Windows, macOS, Linux, and CI runners. Single source of truth for "is the project sound?".
- **`npm run health`** wired into `package.json`.
- **`.github/workflows/ci.yml` simplified** — was duplicating the 3 grep checks inline; now just runs `npm run health` on Ubuntu. Eliminates "passes locally, fails in CI" drift.
- **`docs/RELEASE-CHECKLIST.md`** pre-flight section reduced to a single bullet: "`npm run health` is green".
- **`docs/AGENT-HANDOFF.md`** "when you take over" recipe simplified to one command.

### Added — `<Spinner>` shared primitive

- **`src/components/Spinner.tsx`** — single rotating ember-on-ink ring with a configurable size + aria label. Replaces two near-identical inline spinners (App.tsx loading screen + PanelLoader for Suspense boundaries).

### Changed — Doc-truth round 2 + zombie cleanup + selector audit

- **Deleted zombie components**: `src/features/gamification/{XpBar,StreakIndicator}.tsx`. Both defined and exported but no consumer imported them — superseded by `<DisciplineStrip />` which inlines the rank/level/XP/streak surface.
- **`ContextMenu` selector refactor**: was destructuring `useStore()` returning the full store, causing whole-store re-renders on every fasting clock tick. Now uses per-field selectors so it only re-renders when its 4 specific fields change.
- **Per-feature READMEs synced** with reality:
  - `gamification/README.md` — public API now correctly lists 3 components (was claiming only DisciplineStrip), removed dead "Future surface" referencing old `src/components/` paths, store-slice section replaces the lib/store.ts reference.
  - `fasting/README.md` — public API expanded to all 10 exported components (was 3); orchestration section reflects FastingWidget at 294 lines + slice locations; setInterval rule clarified that snackbar countdowns are allowed.
  - `hydration/README.md` — toast section no longer says "will split into features/notifications/" (already there).
  - `stages/README.md` — no longer says StageIndicator "will move to features/stages/" or stage-up toast "will split"; current radial-tick design noted vs the earlier orbiting-icon prototype.
- **`PRD.md` corrected** two outdated claims: free tier now lists both light + dark themes (was "Single Architectural Cream theme") + JSON export + undo; "Hotkeys + quick actions" differentiator softened to "Pill mode + tray" since global hotkeys aren't actually wired in v1 (note added that they're roadmapped).

### Changed — Doc-truth pass

- **`docs/ARCHITECTURE.md` rewritten** to match reality. Old version described a planned-but-never-built layout (AppProviders.tsx, DragRegion.tsx, FastingPanel.tsx, EditStartPopover.tsx, RecentFastsStrip.tsx, RankBadge.tsx, StageMark.tsx, SettingsSection.tsx, StatTile.tsx, AchievementToast.tsx, etc — none exist), claimed 4 separate stores when it's 4 slices of one store, and referenced removed `isDragging` + `tick`. Now accurate folder map, accurate state model, accurate persistence, UI primitives, platform contract, cross-cutting concerns, NFRs.
- **`docs/AGENT-HANDOFF.md` last-known-good build refreshed** to 2026-04-27 with the full Phase 5.6 + 2.7 inventory: store split, branded icons, data export/import, ErrorBoundary, useEscapeKey, semantic glow tokens, CI workflows, primitive extractions, code-split panels, DRY persistence, dead-state removal, OSS hygiene docs, focus-visible ring, version-bump script.
- **AGENT-HANDOFF sanity-check section** updated with the stricter `z-NN` grep.

### Added — OSS hygiene round 2 + ops + a11y

- **`CONTRIBUTING.md`** — read-this-first list, what we will not accept (cloud sync, telemetry, social features), what we are happy to merge, the architectural rules CI enforces, dev setup, feature/bug intake guidance.
- **`SECURITY.md`** — vulnerability reporting flow (GitHub Security Advisories private channel), what counts as a vulnerability vs not, response timeline, supported versions.
- **`scripts/bump-version.mjs`** + `npm run version:bump` — single-command sync of `package.json` + `Cargo.toml` + `tauri.conf.json`. Tested idempotent. Replaces 3-step manual edit per RELEASE-CHECKLIST.
- **Universal `:focus-visible` ring** in `base.css` — keyboard users get a 2px ember outline on every interactive element automatically; mouse users see no ring (uses `:focus-visible` not `:focus`). Buttons get a contrasting double ring (bg-0 inner halo + ember outer) so the focus state is always legible against any card surface.

### Added — OSS hygiene + tightened CI

- **`.github/PULL_REQUEST_TEMPLATE.md`** — checklist enforces architectural rules (no stray `setInterval`, no direct window imports, no hex literals, no `z-[N]` / `rounded-2xl`, persisted-state round-trip tested) at review time, not just at CI time.
- **`.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}`** — bug template asks for OS/version/in-progress-fast, and points users to export-data-first for corruption issues. Feature template surfaces Hollow's "what we will not build" stance up front so contributors don't waste time on out-of-scope ideas.
- **CI z-grep tightened** — was only catching arbitrary `z-[N]` literals; now also catches Tailwind preset `z-10/20/30/.../100/auto` classes that bypass the `--z-*` token ladder. Caught 4 stragglers (PillMode, MoodPrompt, ProtocolPicker backdrop+dropdown, ToastContainer) — all migrated to `.z-{pillmode,overlay,popover,toast}` utilities.

### Added — Performance + release infrastructure (autonomous final pass)

- **Code-split panels** via `React.lazy()`: `StatsPanel`, `AchievementsPanel`, `SettingsPanel` are now separate JS chunks that load only when the user navigates to them. Wrapped in a `<Suspense>` boundary with a small `<PanelLoader>` spinner. Initial main bundle: 452 KB → 430 KB (137 KB → 132 KB gzipped).
- **`docs/PRIVACY.md`** — explicit, written promise that Hollow stores nothing remotely, sends nothing, and ships zero third-party SDKs. Required for app-store submissions; written as the spec, not boilerplate.
- **`.github/workflows/release.yml`** — triggered on `v*` tag push, builds Windows NSIS / macOS .dmg (Apple Silicon + Intel) / Linux AppImage via `tauri-action`, attaches binaries to the GitHub Release as a draft for review before publish.

### Removed — More dead state

- `isDragging` / `setIsDragging` from the UI slice — never read or written; window drag is handled at the OS level via `WebkitAppRegion: "drag"` in `TitleBar`.

### Added — More extractions / shared primitives

- **`<PanelHeader icon title onBack trailing>`** — single back-arrow + title bar used by Settings, Stats, Achievements. Replaced 3 nearly-identical inline JSX blocks. Added to `src/components/ui/`.
- **`<PersonalBestOverlay visible elapsedSeconds longestFastSeconds>`** — extracted from FastingWidget (was ~50 lines of inline JSX). Now a pure dumb-render component, drives entirely off `usePersonalBest`. FastingWidget down 338 → 294 lines.
- **`src/lib/data.ts` DRY'd** — single `PERSISTED_KEYS` constant with `as const satisfies (keyof PersistedState)[]` ensures the persistence schema stays in sync with the type at compile time. Adding a new persisted field is now ONE addition to the interface + ONE to the keys list (was 4 places).

### Changed — Architecture (Phase 2.7)

- **`lib/store.ts` (598 lines) split into 7 focused files** in `src/stores/`:
  - `types.ts` — shared interfaces, `defaultSettings`, helpers (`getDateString`, `checkStreak`)
  - `fastingSlice.ts` — active fast, start/end, undo snapshot, `setFastStartTimestamp`
  - `gamificationSlice.ts` — XP / streak / achievements / pending notification queue / `getAchievementStats`
  - `hydrationSlice.ts` — daily glass count + auto-reset
  - `uiSlice.ts` — settings, panel, pill mode, drag, window position, cross-cutting actions (`loadState`, `resetData`, `exportData`, `importData`)
  - `persistence.ts` — HMR snapshot guard, lifted out of the store-creation file
  - `index.ts` — composes slices via zustand's slices pattern, exports `useStore` + `AppState`
- **`lib/store.ts`** is now a 24-line re-export shim so every existing `import { useStore } from "../lib/store"` keeps working. New code should import from `src/stores` directly.
- All slice creators receive `(set, get)` where `get()` returns the full combined `AppState`, so cross-slice actions like `endFast` (writes fasting + gamification + hydration in one transaction) compose cleanly.

### Added — Documentation polish

- **`docs/RELEASE-CHECKLIST.md`** — single source of truth for the "code complete → v1.x.x published" hand-off. Pre-flight checks, version bumps, smoke tests on Windows / macOS / Linux / Android, signing keystore, GitHub Release, store-submission outline, rollback plan.
- **`docs/ROADMAP.md`** synced with reality — every shipped phase marked done, Phase 5.6 (release essentials) added with concrete scope, Phase 2.7 (store split) explicitly named as the next architectural lift, "user profile" added to backlog with rationale for deferring.

### Added — Code organization (autonomous-pass continued)

- **`src/components/ui/`** shared primitive library: `Section`, `Row`, `Toggle`, `Stepper`, `SegmentedToggle`. Settings panel down 536 → 476 lines and any future panel can compose from the same primitives.
- **`useEscapeKey(enabled, onEscape)`** hook in `src/hooks/`. Wired into `ContextMenu`, `TimestampsRow` popover, and `ProtocolPicker` dropdown so keyboard users can dismiss without a mouse.
- **Semantic alpha tokens** for water / success / gold / danger glow + soft fills in both themes. Replaces 6+ `rgba(...)` literals across HydrationCard, FastingWidget, ToastContainer, RingDisplay, HeaderBar.

### Fixed — Subtle bugs found in autonomous audit

- **Onboarding completion race**: `onboardingComplete` lived in a React ref that lagged behind zustand updates, creating a window where the save subscriber wrote `false` for one tick after the user finished onboarding. Moved into `AppState` so persistence reads it consistently.
- Removed dead `tick` action from store (commented out, called from nowhere).
- Removed dead `globalHotkey` and `showPillMode` settings (declared but never read or written through any UI).
- `StatsPanel` now uses the same back-arrow + label header pattern as `Settings` and `Achievements` (was a right-aligned X close button — inconsistent).
- `StatsPanel` token cleanup: `text-orange-400` → `var(--ember)`, `text-sky-400` → `var(--water)`, hex literals replaced.
- `ControlBar` "End Fast" hover/focus uses theme-aware `--danger` via new `.hover-danger-soft` / `.focus-ring-danger` utilities (was `bg-red-500/10` / `ring-red-300/40` Tailwind literals).

### Added — Architecture

- **Feature-folder layout** under `src/features/<feature>/` with barrel exports. Each feature owns its components, hooks, and a `README.md` (where applicable).
- **Single platform seam** at `src/platform/`. The only place in the app that imports from `@tauri-apps/api/window` is `platform/desktop/`. Mobile gets safe no-ops.
- **`useFastingClock`** is now the only `setInterval` in the app. Every component subscribes through it.
- **Per-platform Tauri capabilities**: split `default.json` into `desktop.json` (windows / macOS / linux) and `mobile.json` (iOS / android).
- **CSS token system**: surfaces, ink, ember, water, gold, geometry, z-index ladder — all in `src/styles/tokens.css`. Replaced 50+ inline color literals across components.
- **Theme switching** via `[data-theme]` attribute on document root: Architectural Cream (light) and Warm Graphite (dark). Dark is default.
- **HMR snapshot guard + suspicious-save guard + focus-based recovery** documented and isolated, so an in-progress fast cannot be wiped by HMR or zustand re-init.
- **Card hierarchy convention**: primary cards (`bg-2` + shadow) for attention sinks, secondary cards (`bg-1` + hairline) for informational. Documented in `AGENT-HANDOFF.md`.
- **Error boundary** at the panel router so a render error in one panel falls back to a recovery surface instead of blanking the widget.

### Added — Gamification

- **Live XP ticker** in the discipline strip during active fasts: `liveXpEarning(elapsed, STAGES)` recomputes per second, weighted by the current stage's XP multiplier.
- **Weekly streak band**: 7 dots colored by whether a fast happened that day, with a glowing ring on today.
- **Streak multiplier badge**: ×1.1 / ×1.25 / ×1.5 / ×2 thresholds based on current streak.
- **Achievement rarity** (common / rare / epic / legendary) with rarity-keyed colors. `AchievementsPanel` is grouped by rarity.
- **"Within Reach" preview card** on idle: 3 closest-to-unlock non-secret achievements with rarity-colored progress bars.
- **Personal-best detection** via `usePersonalBest` hook — fires once per fast when elapsed > previous longest.
- **Stage XP multiplier chip** in the active stage indicator so reward intensity is visible mid-fast.

### Added — Interaction

- **Inline `ProtocolPicker`** on the idle home screen (chip + dropdown). Custom hours input gated 1–168.
- **Undo snackbar** — 8s floating "Continue" button after End Fast or Complete, restoring the fast in full (XP, streak, achievements).
- **Single-toast notification queue** with priority resolver: `levelUp > achievement > stageUp > hydration`. Each gated by a per-type `notify*` setting. Replaces the previous overlapping-overlay approach.
- **Editable fast start** popover — drag the start time backward to log a fast you forgot to start.
- **Title-bar nav strip** with stats / achievements / settings / pill-toggle / close. Mobile-aware: pill and close are hidden on phones, touch targets enlarge from 5×5 to 9×9.

### Added — Mobile

- **Tauri Android bootstrap** under `src-tauri/gen/android/`. Debug APK builds with `npm run android:build` to `app-universal-debug.apk`.
- **iOS / Android bundle config** in `tauri.conf.json` with min SDK 24 / iOS 13.
- **`useFormFactor()`** hook returning `'compact' | 'regular'` for layout branching.
- **`isMobile()`** runtime detection in `platform/detect.ts`.
- **Safe-area inset support** on the title strip and main content for iOS notches.

### Added — Documentation

- **`docs/PRD.md`** — vision, personas, jobs-to-be-done, non-goals, success metrics, premium definition.
- **`docs/ARCHITECTURE.md`** — runtime topology, folder map, state model, persistence pipeline, platform adapter contract.
- **`docs/DESIGN-SYSTEM.md`** — token reference, type/spacing scales, component primitives, accepted artifacts (the Windows DWM 1px transparent-window edge), don't-do list.
- **`docs/ROADMAP.md`** — Now / Next / Later with all phases scoped.
- **`docs/AGENT-HANDOFF.md`** — single entry point for any future session: operating principles, forbidden patterns, where-to-look table, common-tasks playbook, glossary, lessons learned.
- **Project root**: `README.md`, `LICENSE` (MIT), `CHANGELOG.md`.
- **Per-feature `README.md`** for hydration, fasting, gamification, stages.

### Changed

- **Default widget size** bumped from 360×500 to 400×720 (proportions of an app, not a sticker).
- **Pill mode**: window resize works on Windows after capability-permission fix (`set-min-size` and `set-max-size` were missing).
- **Stage marks**: redesigned as short radial tick-segments crossing the ring track instead of floating icon plates. Active stage gets a pulsing dot anchored outside the ring.
- **Settings panel**: full rewrite with `Section` / `Row` / `Toggle` / `Stepper` / `SegmentedToggle` primitives. 7 sections covering fasting, hydration, appearance, window, sound, notifications, data.
- **`package.json`** renamed from `tauri-app` → `hollow` with proper description, license, author, and helper scripts (`typecheck`, `android:dev`, `android:build`).
- **`.gitignore`** expanded to exclude `src-tauri/target/`, `src-tauri/gen/`, `screenshots/`, `.claude/`, and tsbuildinfo files (previously would have committed 400 MB+ of build artifacts).
- **Tauri bundle metadata** filled in: publisher, copyright, category, short/long descriptions.

### Removed

- Legacy doc set (`HOLLOW.md`, `HOLLOW-CODEBASE.md`, `HOLLOW-DESIGN.md`, `HOLLOW-STYLE-GUIDE.md`, numbered `01-07-*.md`) — moved to `docs/archive/_legacy-2026-04/`.
- Top-level component files in `src/components/` (Onboarding, AchievementsPanel, SettingsPanel, StatsPanel, StreakIndicator, Toast, XpBar) — relocated into `src/features/`.
- Full-screen LEVEL UP flash that obscured the timer — replaced by a top-banner toast in the queue.
- `default.json` capability file — split per-platform.

### Fixed

- Pill mode no longer silently no-ops on Windows (missing `core:window:allow-set-min-size` / `allow-set-max-size` capabilities).
- Stage indicator XP rate is now visible mid-fast.
- `EditStartPopover` no longer overlaps the cards below it (z-index + drop-shadow + hairline border).
- Hydration count clamps to 0 when the stored value is from a previous day.
- Personal-best overlay uses a 60s window so it doesn't retro-fire when resuming a paused fast.

---

## Conventions for future entries

- Group changes under: **Added**, **Changed**, **Removed**, **Fixed**, **Security**.
- Prefix architectural / docs / mobile changes with a sub-header (`### Added — <area>`) when an entry list grows past ~6 items.
- Date format: ISO 8601 (`YYYY-MM-DD`).
- Link releases at the bottom once a remote / tag exists.
