# Hollow — Agent Handoff

**You are a future AI session opening this codebase.** Read this file FIRST. It is the only doc you must read end-to-end before touching code.

---

## Read-this-first checklist

1. This file (you're here).
2. `docs/PRD.md` — what we're building and for whom.
3. `docs/ARCHITECTURE.md` — runtime topology, folder map, state model.
4. `docs/DESIGN-SYSTEM.md` — tokens, type scale, don't-do list.
5. `docs/ROADMAP.md` — what phase we're in.
6. `docs/KNOWN-ISSUES.md` — stuff we know is broken / suboptimal that we've decided not to fix yet, with rationale. **Read this so you don't "discover" them and sink time on a re-litigated decision.**
7. The feature `README.md` for whatever feature you're touching.

If you skip step 6 and rediscover the feature's API by reading siblings, you've made future maintenance harder. Don't.

---

## Operating principles (non-negotiable)

These bind every code change. If a request asks you to violate them, raise the conflict before complying.

1. **One source of truth per concern.** No duplicate timers, no parallel state machines, no inline color literals when a token exists.
2. **Feature-folder, barrel-exported.** Each `src/features/<feature>/` has `index.ts` (public API), `README.md` (1-page rationale), JSDoc on every exported hook/function.
3. **Platform branches at one seam.** `src/platform/index.ts` re-exports from `desktop/` or `mobile/`. Nothing else may import from `@tauri-apps/api/window`.
4. **CSS tokens, not literals.** If a value appears twice, it becomes a token. Tailwind `rounded-2xl/xl/lg` is banned in favor of `var(--card-radius)`.
5. **Surgical-overhaul rule.** Renames must touch barrel re-exports only. A future palette swap is one file (`tokens.css`). A future mobile-layout swap is one folder (`platform/mobile/`).

---

## Forbidden patterns

The codebase actively prevents these. If you find yourself reaching for one, stop and use the alternative.

| Forbidden | Use instead |
|---|---|
| `setInterval(...)` for any **fasting clock** outside `useFastingClock.ts` | Subscribe to `useFastingClock()`. (Short-lived UI timers like snackbar countdowns are fine — the rule is about duplicate fasting clocks, not banning intervals entirely.) |
| Direct `import { ... } from '@tauri-apps/api/window'` outside `src/platform/desktop/` | `import { platform } from '../platform'` |
| `WebkitAppRegion: 'drag'` outside `App.tsx` title bar / `PillMode` | Will become `<DragRegion>` component in Phase 2.7 |
| Hardcoded color literal (`#a855f7`, `rgba(...)`, `text-black/X`, `text-white/X`, `bg-black/X`) | Use theme-aware utility (`text-ink`, `text-ink-2`, `text-ink-3`, `text-ink-4`, `bg-soft`, `hover-soft`) OR `var(--token-name)`. If no token, add to `themes/{light,dark}.css` first. |
| Tailwind `rounded-2xl`, `rounded-xl`, `rounded-lg` | `.r-card`, `.r-pill`, `.r-chip` utility classes |
| Newsreader italic font | `.label-cap` (uppercase tracked mono) |
| Drop shadows on cards | Cards are flat. Spacing separates. Popovers use `var(--shadow-popover)`. |
| Gradients on buttons | Solid `--ink` or solid `--ember`. No 2-stops. |
| Emoji in product copy | Use a labeled SVG icon |
| Avatar-circle top-left + bottom-tab-nav | Hollow is editorial, not SaaS-app. |
| Calling `useStore` from store internals | Use `get()` inside store actions. `useStore` is for components only. |
| Importing from `lib/store` in NEW code | `lib/store.ts` is a back-compat shim. New imports should target `src/stores` directly. |
| Editing `lib/store.ts` to add state or actions | Edit the appropriate slice in `src/stores/`. The shim is read-only re-exports. |
| `JSON.stringify`-ing zustand state into localStorage | Persistence goes through the App.tsx subscribe + `lib/data.ts` only |
| `setAttribute("data-theme", ...)` outside App.tsx | The theme effect is centralized; just write to `settings.theme`. |

---

## Where to look — task → file table

| Want to | Edit |
|---|---|
| Add a new fasting stage | `src/lib/stages.ts` (push to `STAGES` array). Phase 4 marks pick it up automatically. |
| Change a stage color | `src/lib/stages.ts` — change the `color` field. The ring + marks + stage indicator all read from this. |
| Change the brand accent | `src/styles/themes/{light,dark}.css` — `--ember*` block per theme. |
| Add a new setting | `src/stores/types.ts` (`AppSettings` interface + `defaultSettings` value), `src/features/settings/SettingsPanel.tsx` (UI Row + Toggle/Stepper), persistence picks it up automatically via `App.tsx` save subscriber. |
| Add a fasting-domain action | `src/stores/fastingSlice.ts`. Cross-slice writes are fine — `get()` returns the full `AppState`. |
| Add a gamification field or action | `src/stores/gamificationSlice.ts`. |
| Add a hydration field or action | `src/stores/hydrationSlice.ts`. |
| Add a UI / panel / window action | `src/stores/uiSlice.ts`. |
| Touch persistence / HMR guard | `src/stores/persistence.ts`. |
| Add a title-bar nav button | `src/app/TitleBar.tsx` — drop another `<NavButton>` into the action group. Don't inline a `<button>` with hover handlers. |
| Add a setting row UI primitive | Use `src/components/ui/{Section,Row,Toggle,Stepper,SegmentedToggle}` — never inline a `<button role="switch">`. New primitives go here too. |
| Make a popover dismissible by Esc | `useEscapeKey(open, () => setOpen(false))` from `src/hooks/useEscapeKey.ts`. Already wired into ContextMenu, TimestampsRow, ProtocolPicker. |
| Add a semantic glow color | Tokens `--{water,success,gold,danger}-{soft,glow}` exist in both `themes/light.css` and `themes/dark.css`. Use those — never embed `rgba(...)` for theme colors. |
| Replace the app icon | Edit `assets/hollow-icon.svg`, then `npx tauri icon assets/hollow-icon.png`. Regenerates every platform variant in `src-tauri/icons/` + `src-tauri/gen/android/.../mipmap-*/`. |
| Add a new achievement | `src/lib/achievements.ts` — push to `ACHIEVEMENTS` array with `rarity` + optional `progress(stats)`. Toast, AchievementsPanel, AchievementsPreviewCard all pick it up. |
| Add a new XP rule | `src/lib/gamification.ts` (pure math) and call from `endFast()` in `src/lib/store.ts`. Live XP ticker uses `liveXpEarning(elapsed, STAGES)`. |
| Modify the timer's tick | `src/hooks/useFastingClock.ts` — the ONLY `setInterval` in the app. |
| Add a new toast type | `src/features/notifications/ToastContainer.tsx` — extend the `Active` discriminated union, add a case in the AnimatePresence body, route through the priority resolver. |
| Switch a protocol from idle screen | Already inline — `src/features/fasting/ProtocolPicker.tsx`. The chip + dropdown live there. |
| Recover an accidentally-completed fast | Already wired — `undoSnapshot` in `src/lib/store.ts` + `src/features/fasting/UndoSnackbar.tsx` (8s window). `undoLastCompletion()` reverses XP, streak, achievements. |
| Detect a personal best mid-fast | `src/hooks/usePersonalBest.ts` — fires once per fast when `elapsed > longestFastSeconds`. |
| Compute weekly streak dots | `src/lib/streak.ts` — `getRecentStreakDays(fasts, 7)` returns the row for `DisciplineStrip`. |
| Stack notifications without overlap | The single-toast queue lives in `ToastContainer.tsx`. Priority: `levelUp > achievement > stageUp > hydration`. Each gated by `settings.notify*`. |
| Change z-index of any overlay | Use the `--z-*` tokens in `src/styles/tokens.css` via the `.z-*` utility classes in `utilities.css`. **Never** write a literal `z-[N]` in a component. |
| Change pill mode size | `src/platform/desktop/index.ts` — `setPillSize()` constants. |
| Add a panel | `src/features/<panel>/<Panel>.tsx`, register the route in `src/App.tsx` panel router. |
| Swap to a mobile layout | Read `useFormFactor()` from `src/hooks/useFormFactor.ts` and branch JSX in `src/components/FastingWidget.tsx` or per-feature panels. |
| Build for Android | `npx tauri android build --debug --apk`. APK lands at `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`. AVD name `hollow_test` exists. |

---

## Common tasks playbook

### Add a new fasting stage (e.g., "Ultra Ketosis" at 60h)

1. Edit `src/lib/stages.ts`. Add to `STAGES` array:
   ```ts
   { id: 'ultra_ketosis', name: 'Ultra Ketosis', description: '...',
     hoursMin: 60, hoursMax: 96, color: '#...', glowColor: '#...80',
     xpMultiplier: 3.5 }
   ```
2. Add an SVG icon component in `src/features/stages/stageIcons.tsx` (14×14, 1.5 stroke).
3. Wire the icon into the `STAGE_ICONS` map in `stageIcons.tsx`.
4. Done. Ring marks, stage indicator, achievement triggers all read from `STAGES` and pick it up.

### Add a new theme (paid feature)

1. Create `src/styles/themes/<theme-name>.css` overriding the `:root` tokens.
2. Register in `src/features/settings/SettingsPanel.tsx` theme picker.
3. `src/stores/uiStore.ts` `settings.theme` field gets the new option.
4. Theme is applied by toggling a `data-theme="<name>"` attribute on the document root and writing matching `[data-theme="<name>"] :root { ... }` rules.

### Investigate a "fast disappeared" bug

1. Check `~/AppData/Roaming/com.hollow.fasting-widget/hollow-data.json` — is `fastStartTimestamp` null or set?
2. If set on disk but missing in UI: HMR or focus-recovery glitch — `src/stores/persistence.ts` `restoreFromDisk()` should pull it back on next focus event.
3. If null on disk: a real bug. Check git log for the last commit touching `src/stores/persistence.ts` or any store action — the suspicious-save guard should have prevented this.

### Bump min window size

`src-tauri/tauri.conf.json` → `app.windows[0].minWidth` / `minHeight`. Then verify pill mode still fits — `src/platform/desktop/window.ts` `setPillSize()` calls `setMinSize` to a smaller value first.

---

## Component map (what's where)

These were added since the last doc sync. Skim before searching for them by name.

- `src/app/TitleBar.tsx` — top strip (HOLLOW wordmark + nav icons + window controls). Internal `NavButton` is the canonical icon-button primitive — when you want a new title-bar icon, add a NavButton, don't inline a `<button>` with the hover handlers.
- `src/components/ErrorBoundary.tsx` — class component wrapping the panel router in `App.tsx`. Render errors fall back to a recovery surface with a "Reset View" button (which routes back to the main panel) instead of blanking the widget. Required for any new top-level surface.
- `src/lib/store.ts` `exportData()` / `importData(json)` — JSON backup pipeline. Versioned schema (`version: 1`); `importData` returns `{ ok: true } | { ok: false, error }` rather than throwing. Wired into Settings → Data.
- `src/features/fasting/UndoSnackbar.tsx` — 8-second floating "Continue" button that restores a just-ended fast. Driven by `undoSnapshot` in store.
- `src/features/fasting/ProtocolPicker.tsx` — inline chip + dropdown for switching protocol from the idle home screen. Custom hours input gated to 1–168.
- `src/features/gamification/AchievementsPreviewCard.tsx` — idle-only "Within Reach" card listing the 3 closest-to-unlock achievements with rarity-colored progress bars. Uses `getNextAchievements()` from `src/lib/achievements.ts`.
- `src/features/gamification/DisciplineStrip.tsx` — top-level rank/level/XP/streak card. Live XP ticker (`liveXpEarning`) during active fasts. Streak multiplier badge (×1.1/1.25/1.5/2). Weekly 7-dot streak band.
- `src/hooks/usePersonalBest.ts` — fires once per fast when elapsed > previous longest. Returns `{ justBroken, isNew, longestSeconds }`.
- `src/lib/streak.ts` — `getRecentStreakDays(fasts, days, now)` returns last N days with weekday label + hadFast flag for the streak band.

## Token discipline

| Class of token | File |
|---|---|
| Color (theme-specific) | `src/styles/themes/light.css` + `dark.css` |
| Geometry, spacing | `src/styles/tokens.css` |
| Z-index ladder | `src/styles/tokens.css` `--z-*` block, exposed as `.z-*` utilities in `utilities.css` |
| Animation timing | (deferred — currently inline) |

If you write any `z-[N]`, `rounded-2xl/xl`, hex literal, or duplicate magic number, that's a token violation. Add the token first.

## Card hierarchy convention

Two visual tiers — never mix on the same surface:

- **Primary** (attention sinks): `background: var(--bg-2)` + `box-shadow: var(--shadow-card)`. RingDisplay, DisciplineStrip, ControlBar context, ProtocolPicker, StageIndicator.
- **Secondary** (informational): `background: var(--bg-1)` + `border: 1px solid var(--hairline)` (NO shadow). HydrationCard, FirstMilestoneCard, LastFastCard, AchievementsPreviewCard.

## Glossary

- **Fast** — a continuous period where `isFasting === true`, anchored at `fastStartTimestamp`.
- **Stage** — one of the 6 metabolic phases the user passes through during a fast (Fed → Stem Cell). Defined in `src/lib/stages.ts`.
- **Protocol** — a named goal duration (16:8, 18:6, OMAD, etc). Defined in `src/lib/stages.ts` `PROTOCOLS`.
- **Pill mode** — compact 220×56 floating timer that replaces the full widget when the user clicks minimize. Desktop only.
- **Form factor** — `'compact'` (mobile or tiny desktop) vs `'regular'` (normal desktop). Determined by `useFormFactor()`.
- **Ring** — the circular progress indicator at the visual center. `CircularProgress.tsx`.
- **Stage marks** — small SVG icons positioned around the ring perimeter at hour-thresholds. Phase 4. `StageMark.tsx`.
- **Tier** — within goal-reached state, the subdivision (`Goal Reached` 0–2h, `Extended Fast` 2–12h, `Deep Fast` 12–24h, `Profound Fast` 24h+).
- **Discipline strip** — the small horizontal card showing rank + level + XP + streak.
- **Ember** — the single brand accent color (burnt amber `#b85a3b`).
- **Ink** — the primary text color (deep charcoal `#1f1c18`).
- **Cream** — the primary surface color (warm paper `#f3efe7`).

---

## Critical lessons learned (from earlier sessions)

These bit us; don't re-litigate.

### HMR can wipe persistent state
Vite's HMR re-imports `src/lib/store.ts` on save. zustand's `create()` returns a new store with default values. The save subscriber then fires and overwrites disk with defaults — **wiping any in-progress fast.** Two safeguards exist:
1. **HMR snapshot** in `src/stores/persistence.ts` — snapshots state to `sessionStorage` before module dispose, restores on import.
2. **Suspicious-save guard** in the persistence subscriber — blocks any state transition that clears a running fast without growing `completedFasts`.

Never remove either without an explicit replacement strategy.

### Tauri 2 capabilities are explicit
`setSize`, `setMinSize`, `setMaxSize`, `setPosition` each need their own permission in `capabilities/desktop.json`. A missing permission causes the call to silently no-op. If a window operation isn't working, check capabilities first.

### Tailwind v4 utilities live in @layer
A non-layered global rule like `* { padding: 0 }` overrides `py-3` because layered utilities lose to non-layered rules regardless of specificity. **Don't add global CSS resets that touch padding/margin.** Tailwind preflight already handles browser defaults.

### Focus-based recovery is the disaster recovery hook
If memory and disk disagree about whether a fast is running, focus event triggers `restoreFromDisk()`. This is a load-bearing safety net — don't disable it.

---

## Last-known-good build

| | |
|---|---|
| Date | 2026-04-27 |
| Phase | Phases 0, 1, 2, 2.5, 2.6, 2.7, 3, 4, 5, 5.5, 5.6 all done. See `ROADMAP.md`. |
| Phase 2.7 result | `lib/store.ts` (598 lines) split into `src/stores/{types,fastingSlice,gamificationSlice,hydrationSlice,uiSlice,persistence,index}.ts`. Composed via zustand's slices pattern. `lib/store.ts` is now a 24-line back-compat shim — every consumer untouched. **New code should import from `src/stores` directly.** |
| Phase 5.6 highlights | LICENSE, real README, CHANGELOG, expanded .gitignore (excludes `src-tauri/target/` + `gen/` + 400 MB+ of build artifacts), `package.json` rebranded to `hollow` with proper metadata, Hollow brand icons regenerated across every platform (Win .ico, macOS .icns, Linux PNGs, iOS AppIcon set, Android mipmap densities) from `assets/hollow-icon.svg`, JSON data export/import in Settings, `<ErrorBoundary>` at panel router, `useEscapeKey` hook for popover dismissal, semantic glow tokens (`--{water,success,gold,danger}-{soft,glow}`), CI workflow with arch-rule greps, `release.yml` workflow building installers on `v*` tag push, `<TitleBar>` + `<NavButton>` + `<PanelHeader>` + `<PersonalBestOverlay>` extractions, `src/components/ui/` shared primitives (Section/Row/Toggle/Stepper/SegmentedToggle/PanelHeader), code-split panels (Settings/Stats/Achievements lazy-loaded), DRY `lib/data.ts` with single PERSISTED_KEYS constant, dead state removed (`tick`, `globalHotkey`, `showPillMode`, `isDragging`), CONTRIBUTING + SECURITY + PRIVACY + RELEASE-CHECKLIST docs, PR + issue templates, `scripts/bump-version.mjs` syncing version across 3 files, universal `:focus-visible` ring. |
| Pill mode | OS-window resize works. PillMode component fills the shrunken window. |
| Tauri version | `2` (unpinned in `Cargo.toml`; `Cargo.lock` provides reproducibility). Pin explicitly before v1.0.0 publish. |
| Capability files | `src-tauri/capabilities/desktop.json` + `mobile.json`. Legacy `default.json` removed. |
| Cargo features | `default = ["desktop"]`, `desktop = ["tauri/tray-icon"]`, `mobile = []`. Build mobile via `cargo build --no-default-features --features mobile` or `npm run android:build`. |
| Platform adapter | `src/platform/{desktop,mobile}/index.ts` exports `platform`. **The ONLY place that imports `@tauri-apps/api/window` is `platform/desktop/index.ts`.** Verified by CI grep. |
| Hooks | `useFastingClock` is the canonical fasting timer. `useFormFactor()` returns `'compact' \| 'regular'`. `usePlatform()` returns the adapter. `useEscapeKey(enabled, onEscape)` for popover dismissal. `usePersonalBest({ elapsed, isFasting })` fires once-per-fast at new record. |
| Visual direction | Two themes — Light (Architectural Cream, default `:root`) and Dark (warm-graphite, `[data-theme="dark"]`). Dark is the configured default. |
| Bundle | 132 KB gzipped main + 4 lazy panel chunks (~1.5 KB each gzipped). 6.8 KB gzipped CSS. |
| Mobile | Tauri Android builds APK to `gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`. Verified install + onboarding render on Pixel 7 AVD (1080×2400) with branded icons. iOS deferred to Phase 7. |
| Versioning | Single command: `npm run version:bump <ver>` syncs `package.json` + `tauri.conf.json` + `Cargo.toml` (Cargo bump scoped to `[package]` so it can't bump deps). |

When you take over: re-read this file, then run:
```
npm run health                               # typecheck + build + 4 arch scans, single command
git log --oneline -20                        # what's recent
git status                                   # what's uncommitted
```

If `npm run health` is green you are starting from a known-clean baseline. If it's red the failures point you at exactly which rule was broken last.

## Quick sanity checks

```bash
# TypeScript clean
npx tsc --noEmit

# Architectural rule: only platform/desktop should import from @tauri-apps/api/window
grep -rn "@tauri-apps/api/window\|getCurrentWindow\|LogicalSize\|LogicalPosition" src/ \
  | grep -v "src/platform"

# Architectural rule: only useFastingClock should setInterval for the fasting clock
# (UndoSnackbar's snackbar-countdown setInterval is allowed; CI grep excludes it explicitly)
grep -rn "setInterval" src/components src/features src/hooks 2>/dev/null \
  | grep -v "useFastingClock\|UndoSnackbar\|README"

# Architectural rule: no z-[N] AND no Tailwind preset z-NN
grep -rn 'z-\[[0-9]\+\]\|\bz-\(0\|10\|20\|30\|40\|50\|60\|70\|80\|90\|100\|auto\)\b\|rounded-\(2xl\|xl\|lg\)\b' src/ \
  | grep -v 'utilities\.css\|tokens\.css\|stages\.ts'

# All five anchored docs exist
ls docs/*.md
```
