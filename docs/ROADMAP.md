# Hollow — Roadmap

## Now / Next / Later

| Status | Phase | Scope | Complexity |
|---|---|---|---|
| ✅ Done | Phase 0 | Documentation foundation (5 docs + per-feature READMEs) | S |
| ✅ Done | Phase 1 | Pill-mode capability fix | XS |
| ✅ Done | Phase 2 | Code reorganization (features/ folders, hooks, platform/, styles split) | L |
| ✅ Done | Phase 2.5 | Extract FastingWidget — 800 → 338 lines, 9+ components extracted | M |
| ✅ Done | Phase 2.6 | UI primitives: `src/components/ui/` (Section/Row/Toggle/Stepper/SegmentedToggle), `<TitleBar>` + `<NavButton>`, `<ErrorBoundary>` | S |
| ✅ Done | Phase 3 | Visual overhaul (Architectural Cream + Warm-Graphite dark) | M |
| ✅ Done | Phase 4 | Stage icons around the ring (then redesigned as radial tick segments) | S |
| ✅ Done | Phase 5 | Cross-platform foundation (Tauri mobile rails + Android APK) | M |
| ✅ Done | Phase 5.5 | Gamification overhaul (live XP ticker, weekly streak band, achievement rarity, personal-best detection, streak multipliers) | M |
| ✅ Done | Phase 5.6 | Release essentials (LICENSE, README, CHANGELOG, .gitignore, tauri bundle metadata, Hollow brand icons across platforms, data export/import, CI workflow with arch-rule greps, ErrorBoundary, useEscapeKey, semantic glow tokens) | M |
| ✅ Done | Phase 2.7 | Split `lib/store.ts` (598 lines) into per-domain slices: `src/stores/{fasting,gamification,hydration,ui}Slice.ts` + `persistence.ts`. `lib/store.ts` is now a 24-line re-export shim — every consumer untouched. | M |
| **Next** | Phase 6 | Premium-justifying features (see backlog below) | L+ |
| **Later** | Phase 7 | Mobile UI implementation (compact-form-factor layout) | L |
| **Later** | Phase 8 | Beta launch + first paying customers | M |

## Phase details

### Phase 0 — Documentation foundation
**Scope.** Replace 12 stale docs (Hermes-era HOLLOW.md set + numbered 01–07 set) with 5 anchored docs. Move legacy to `docs/archive/_legacy-2026-04/`.
**Exit criteria.** A fresh AI session given only `AGENT-HANDOFF.md` can answer "where do I add a new fasting stage?" without searching code.
**Dependencies.** None.

### Phase 1 — Pill-mode capability fix
**Scope.** Add `core:window:allow-set-min-size` and `core:window:allow-set-max-size` to `src-tauri/capabilities/default.json`. Verify pill-mode resize works.
**Exit criteria.** Toggling pill mode shrinks the OS window to 220×56 and restores prior size on exit.
**Dependencies.** None.

### Phase 2 — Code reorganization
**Scope.** Split `lib/store.ts` into `stores/{fasting,gamification,hydration,ui}.ts` + `persistence.ts`. Build `src/features/{fasting,hydration,gamification,stages,settings,stats,onboarding,notifications}/` folder tree with barrel exports + `README.md` per feature. Extract hooks (`useFastingClock`, `useStageDetection`, `useStatsAggregate`, `useHydrationDaily`, `useFormFactor`, `usePlatform`, `useOutsideClick`). Decompose `FastingWidget.tsx` (800 lines) into 5–6 components < 250 lines each. Split `App.tsx` into 4 files. Split `Toast.tsx` into 4 files. Split `index.css` into `tokens.css` + `base.css` + `utilities.css` + `keyframes.css`. Build `src/platform/{desktop,mobile}/` adapter.
**Exit criteria.** `npx tsc --noEmit` clean. App boots and behaves identically. No component > 250 lines. No direct `@tauri-apps/api/window` imports outside `src/platform/desktop/`.
**Dependencies.** Phase 0 docs to anchor naming conventions.

### Phase 3 — Visual overhaul (Architectural Cream)
**Scope.** Replace token palette with cream / charcoal / single brass-amber accent. Drop Newsreader italic. Switch buttons to bordered-transparent-default + ink-filled-primary. Cards lose shadows, separated by spacing only. Ring stroke 6px, no glow on arc body.
**Exit criteria.** Side-by-side screenshot before/after; user sign-off.
**Dependencies.** Phase 2 (so token replacement is one file, not 50).

### Phase 4 — Stage icons around the ring
**Scope.** Add 6 inline-SVG stage icons. Build `StageMark` component. Extend `CircularProgress` with `marks?` prop. Wire `RingDisplay` to compute marks from `STAGES` + `currentStageIndex`. Add `mark-glow-in` keyframe.
**Exit criteria.** Marks visible at 0/4/12/16/24/48h positions. Reached marks glow in stage color. Active stage pulses. Stage transitions trigger glow-in animation.
**Dependencies.** Phase 2 (RingDisplay needs to exist), Phase 3 (palette tokens for unreached state).

### Phase 5 — Cross-platform foundation (rails only)
**Scope.** Split `capabilities/default.json` into `desktop.json` + `mobile.json`. Add Cargo `mobile` feature + per-target features. Add `app.bundle.iOS` + `app.bundle.android` to `tauri.conf.json`. Wrap `src-tauri/src/lib.rs` tray init in `#[cfg(desktop)]`. Build `src/platform/{desktop,mobile}/` adapter implementations. Add `useFormFactor()` hook + `data-form-factor` attribute on `FastingPanel` root.
**Exit criteria.** Desktop dev build identical. `cargo build --target aarch64-linux-android --features mobile` compiles. Zero direct `getCurrentWindow()` calls outside `platform/desktop/`.
**Dependencies.** Phase 2 platform adapter scaffolding.
**Explicit non-goal:** mobile UI implementation. Just rails.

### Phase 6 — Premium-justifying features (backlog)

Each is a roughly card-sized initiative:

1. **Cloud sync (iCloud + Google Drive)** — opt-in. Requires conflict resolution strategy.
2. **Custom protocols** — user-defined stage hour thresholds + colors + names. Settings UI + storage migration.
3. **Theme marketplace** — palette packs as drop-in `tokens.css` overlays. Free has Cream; paid has Mission Control / Nordic / Luxury.
4. **Pro analytics panel** — trend charts (last 30 / 90 / 365 days), mood-fast correlation, time-of-day heatmap.
5. **Export** — CSV, Apple Health, Google Fit, JSON dump.
6. **Notifications** — pre-stage warnings, break-fast reminder, missed-fast nudge. Tauri 2 notification plugin.
7. **Watch companion** — watchOS via Tauri sidecar; Wear OS later.
8. **Streak insurance** — once per month, a missed day doesn't break the streak.
9. **Discipline-seeker mode** — alternate UI variant with monk/military aesthetic. Locked theme + reduced gamification.
10. **Multi-fast comparison** — overlay last N fasts on one ring for visual comparison.
11. **User profile** — display name + avatar + sync identity. Lands meaningfully only when paired with cloud sync (#1); a local-only name field is UI noise without payoff. Defer until #1 ships.

### Phase 7 — Mobile UI implementation
**Scope.** Compact-form-factor layout (`FastingPanel` reads `useFormFactor()` and chooses a different grid). Touch-friendly tap targets. Safe-area handling. Push notification opt-in on iOS/Android. Replace pill-mode with pull-down or always-on-display equivalent.
**Exit criteria.** Builds + runs on iOS Simulator and Android Emulator. App Store + Play Store metadata draft ready.
**Dependencies.** Phase 5 rails.

### Phase 8 — Beta launch
**Scope.** Marketing site (`hollow.app`), Stripe integration, beta opt-in form, TestFlight / Internal Testing track, telemetry-free crash reporting (Sentry self-hosted or Tauri-native panic logs only).
**Exit criteria.** First 10 paying customers. Refund rate < 5%. NPS measurable.
**Dependencies.** Phases 6 & 7.

### Phase 5.6 — Release essentials (autonomous polish, 2026-04-26)
**Scope.** Everything that bridges "feature complete" → "could publish today": real LICENSE / README / CHANGELOG, expanded `.gitignore` (was about to commit 400 MB+ of build artifacts), `package.json` rename + scripts, Tauri bundle metadata, Hollow-branded app icons across every platform variant, JSON data export/import, ErrorBoundary, useEscapeKey, semantic glow tokens, CI workflow with architectural-rule greps, dead-code removal (`tick`, `globalHotkey`, `showPillMode`).
**Exit criteria.** Production build clean. CI greps pass. Branded APK installed on Pixel 7. No release-blocking bugs known.
**Dependencies.** None — pure polish layer.

## Backlog (unprioritized, may never ship)

- Audio guided fasting walks
- Calendar integration (block fasting hours from meeting scheduling)
- Voice command via OS-native speech ("Hollow, start a fast")
- Haptic feedback on stage transitions (mobile only)
- AR ring overlay for Apple Vision Pro

## Anti-roadmap (we will not build, even if requested)

- Social feed / friends / leaderboards (Hollow is a solo discipline tool — see PRD non-goals)
- AI chatbot coach / nutrition advice
- Calorie or macro tracking
- Anything that requires a recurring server-side cost we can't justify against the one-time price
- Anything that monetizes user data
