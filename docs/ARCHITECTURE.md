# Hollow — Architecture

Snapshot of the codebase as it actually exists. If a section here describes something that isn't in the code, this file is the bug — the code is the spec.

---

## Runtime topology

```
┌──────────────────────────────────────────────────────┐
│  OS Window (Tauri 2 host, Rust)                      │
│  ─ src-tauri/src/lib.rs   tray, lifecycle, plugins   │
│  ─ Capabilities split per platform                   │
│  ─ Plugins: store, fs, opener                        │
│   ┌────────────────────────────────────────────┐     │
│   │  WebView (System WebView2 / WKWebView)     │     │
│   │  ┌──────────────────────────────────────┐  │     │
│   │  │  React 19 + Vite                     │  │     │
│   │  │   ─ src/app/         shell           │  │     │
│   │  │   ─ src/components/  shared / cross  │  │     │
│   │  │   ─ src/features/    domain UIs      │  │     │
│   │  │   ─ src/stores/      4-slice store   │  │     │
│   │  │   ─ src/platform/    OS adapter      │  │     │
│   │  │   ─ src/hooks/       cross-cutting   │  │     │
│   │  │   ─ src/lib/         pure data/math  │  │     │
│   │  └──────────────────────────────────────┘  │     │
│   └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
   %APPDATA%\com.hollow.fasting-widget\hollow-data.json
   (Tauri plugin-store, JSON on disk)
```

The frontend talks to the OS only through the Tauri IPC bridge. Every such call is funneled through `src/platform/index.ts` so the rest of the codebase has no `@tauri-apps/api/...` imports.

---

## Folder map (as-is)

```
src/
  app/
    TitleBar.tsx              # Wordmark + nav icons + window controls; internal NavButton primitive
  components/
    ErrorBoundary.tsx         # Wraps the panel router; recovery surface on render error
    CircularProgress.tsx      # Ring + arc + radial-tick stage marks
    FastingWidget.tsx         # Active/idle/extended composition root (294 LOC)
    PillMode.tsx              # Compact 220x56 timer
    ContextMenu.tsx           # Right-click menu (desktop only)
    Timer.tsx                 # Big mono elapsed-time numeral
    ui/                       # Shared primitives — see "UI primitives" below
      Section.tsx  Row.tsx  Toggle.tsx  Stepper.tsx  SegmentedToggle.tsx  PanelHeader.tsx
      index.ts                # Barrel
  features/                   # Each is feature-folder + barrel + README
    fasting/
      ControlBar.tsx  HeaderBar.tsx  RingDisplay.tsx  TimestampsRow.tsx
      MoodPrompt.tsx  LastFastCard.tsx  FirstMilestoneCard.tsx
      ProtocolPicker.tsx  UndoSnackbar.tsx  PersonalBestOverlay.tsx
      index.ts  README.md
    gamification/
      DisciplineStrip.tsx  AchievementsPanel.tsx  AchievementsPreviewCard.tsx
      StreakIndicator.tsx
      index.ts  README.md
    hydration/
      HydrationCard.tsx
      index.ts  README.md
    notifications/
      ToastContainer.tsx      # Single-toast queue with priority resolver
      index.ts  README.md
    onboarding/
      Onboarding.tsx
      index.ts  README.md
    settings/
      SettingsPanel.tsx
      index.ts  README.md
    stages/
      StageIndicator.tsx  stageIcons.tsx
      index.ts  README.md
    stats/
      StatsPanel.tsx
      index.ts  README.md
  stores/                     # ONE zustand store, FOUR slices — see "State model"
    types.ts                  # Shared interfaces, defaultSettings, helpers
    fastingSlice.ts           # active fast, start/end, undo snapshot
    gamificationSlice.ts      # XP, streak, achievements, pending notifications
    hydrationSlice.ts         # daily glass count + auto-reset
    uiSlice.ts                # settings, panel, pill mode, window, cross-cutting actions
    persistence.ts            # HMR snapshot guard
    index.ts                  # composes slices via zustand slices pattern; exports useStore + AppState
  platform/                   # the only place that imports @tauri-apps/api/*
    detect.ts  types.ts  index.ts
    desktop/index.ts          # window/tray/drag/alwaysOnTop implementations
    mobile/index.ts           # safe no-ops for the same surface
  hooks/
    useFastingClock.ts        # The ONE setInterval for the fasting clock
    useFormFactor.ts          # 'compact' | 'regular'
    usePersonalBest.ts        # Fires once-per-fast at elapsed > previous longest
    usePlatform.ts            # Returns platform adapter
    useEscapeKey.ts           # Document-level keydown handler for popover dismissal
  lib/
    achievements.ts  gamification.ts  stages.ts  sounds.ts
    time.ts  streak.ts  data.ts        # Tauri-store persistence layer
    store.ts                            # Back-compat re-export shim — NEW CODE imports from stores/
  styles/
    tokens.css                # Geometry + z-index ladder (theme-agnostic)
    base.css                  # Resets, font, focus-visible ring
    utilities.css             # .label-cap, .font-mono, .z-*, .r-*, .text-ink, hover utilities
    keyframes.css             # @keyframes
    themes/{light,dark}.css   # All color tokens; swapped via [data-theme] on <html>
    index.css                 # @imports the above + tailwind
src-tauri/
  src/lib.rs                  # Tray, lifecycle (cfg(desktop) gated)
  Cargo.toml                  # default = ["desktop"], mobile feature for android/ios
  tauri.conf.json             # Window config + bundle metadata
  capabilities/{desktop,mobile}.json   # Per-platform permissions
  icons/                      # Hollow brand icons across every platform variant
  gen/android/                # Generated Android project (gitignored)
.github/
  workflows/{ci,release}.yml
  PULL_REQUEST_TEMPLATE.md
  ISSUE_TEMPLATE/
assets/
  hollow-icon.svg             # Brand mark source — `npx tauri icon` regenerates icons/
docs/
  AGENT-HANDOFF.md  PRD.md  ARCHITECTURE.md  DESIGN-SYSTEM.md
  ROADMAP.md  RELEASE-CHECKLIST.md  PRIVACY.md
scripts/
  bump-version.mjs            # Sync version across package.json + Cargo.toml + tauri.conf.json
```

---

## State model

**One** zustand store, composed of **four** slices. Earlier docs proposed four separate `create()` calls; we landed on the slices pattern instead because cross-slice actions like `endFast` are common and clean to express when `(set, get)` returns the full combined state.

| Slice | Owns | Lives in |
|---|---|---|
| **fasting** | `isFasting`, `fastStartTimestamp`, `targetHours`, `protocol`, `completedFasts`, `undoSnapshot`. Actions: `startFast`, `endFast`, `setFastStartTimestamp`, `undoLastCompletion`, `clearUndoSnapshot`. | `src/stores/fastingSlice.ts` |
| **gamification** | `totalXp`, `currentStreak`, `longestStreak`, `lastFastDate`, `unlockedAchievements`, `stageEntryHistory`, `brokeStreak`, `maxLevelReached`, `nightOwlFasts`, `pendingAchievements`, `pendingLevelUp`, `pendingStageUp`, `pendingMoodForFastId`. Actions: `getAchievementStats`, `dismissAchievement`, `dismissLevelUp`, `dismissStageUp`, `setPendingStageUp`, `setMoodForFast`, `dismissMoodPrompt`. | `src/stores/gamificationSlice.ts` |
| **hydration** | `hydrationToday`, `hydrationGoalGlasses`, `hydrationLastResetDate`, `hydrationGoalCelebratedDate`, `pendingHydrationGoal`. Actions: `incrementHydration`, `decrementHydration`, `setHydrationGoal`, `dismissHydrationGoal`. | `src/stores/hydrationSlice.ts` |
| **ui** | `settings`, `onboardingComplete`, `activePanel`, `isPillMode`, `windowX/Y`. Actions: `updateSettings`, `setActivePanel`, `setOnboardingComplete`, `togglePillMode`, `toggleAlwaysOnTop`, `setWindowPosition`, plus cross-cutting `loadState`, `resetData`, `exportData`, `importData`. | `src/stores/uiSlice.ts` |

Cross-slice actions: `endFast` (fasting slice) writes to gamification (XP, streak, achievements) and triggers `pendingMoodForFastId`. This works because each slice creator receives `(set, get)` where `get()` returns the full `AppState`, not just its own slice.

`src/lib/store.ts` is a 24-line back-compat shim re-exporting `useStore` and the public types. **New code should import from `src/stores` directly.**

---

## Persistence pipeline

```
React component dispatches action
     │
     ▼
zustand slice updates (in-memory)
     │
     ▼
App.tsx subscribe()  ←── suspicious-save guard lives here
     │
     ▼
saveState()  →  src/lib/data.ts  →  @tauri-apps/plugin-store  →  disk
                       ↑
              PERSISTED_KEYS is the single source of truth
              for what gets persisted (typed as keyof PersistedState)
```

### What gets persisted

`src/lib/data.ts` exports `PERSISTED_KEYS` — a `readonly` const tuple of the field names that round-trip to disk. The `PersistedState` interface is the type of those values. Adding a new persisted field is **2 edits**: one type entry, one key string.

Ephemeral state (`activePanel`, `isPillMode`, every `pendingX`, `undoSnapshot`) is intentionally NOT persisted.

### HMR snapshot guard

`src/stores/persistence.ts` installs an `import.meta.hot.dispose` handler that snapshots zustand state to `sessionStorage` before module re-import. On re-import, snapshot is restored before any subscriber sees the wiped defaults. Without this, every code edit during a fast would persist defaults and erase the fast.

### Suspicious-save guard

In `App.tsx` save subscriber: if a state transition would clear a running fast (`isFasting: true → false`, `fastStartTimestamp → null`) AND `completedFasts.length` did NOT grow, the save is suppressed and a warning logged. Real `endFast()` always grows `completedFasts` atomically — anything else clearing the fast is an HMR/zustand re-init wipe.

### Focus-based recovery

`App.tsx` listens to `platform.window.onFocusChanged`. When focused: if memory has no fast but disk has an active one, hydrate from disk. Never reverse — memory is authoritative for new actions.

---

## UI primitives (`src/components/ui/`)

| Primitive | Purpose |
|---|---|
| `<Section title>` | Labelled vertical group used by Settings |
| `<Row icon title sub>` | Setting row — icon + title/sub left, control right |
| `<Toggle value onToggle>` | iOS-style switch with `role="switch"` + `aria-checked` |
| `<Stepper value min max onDec onInc>` | Numeric −/value/+ trio |
| `<SegmentedToggle options value onChange>` | Two-or-three-way segmented control |
| `<PanelHeader icon title onBack trailing>` | `← icon TITLE [trailing]` — used by Settings, Stats, Achievements |

Add new primitives to `src/components/ui/` and re-export through its barrel. **Never inline a `<button role="switch">`** — use `<Toggle>`.

---

## Platform adapter contract

```ts
// src/platform/types.ts
export interface PlatformAdapter {
  window: {
    setPillSize(): Promise<void>;
    restorePreviousSize(): Promise<void>;
    onMoved(cb: (pos: { x: number; y: number }) => void): Promise<() => void>;
    onFocusChanged(cb: (focused: boolean) => void): Promise<() => void>;
    setPosition(x: number, y: number): Promise<void>;
    hide(): Promise<void>;
  };
  tray: {
    onPillModeToggle(cb: () => void): Promise<() => void>;
  };
  alwaysOnTop: {
    toggle(): Promise<void>;
  };
}
```

`src/platform/index.ts` re-exports `platform`, `isMobile`, `isTauri` from either `desktop/` or `mobile/` based on `isMobile()`. `isMobile()` is cached at module load.

Mobile implementations are safe no-ops or safe-area equivalents — calling `platform.window.setPillSize()` on Android does nothing rather than throwing.

---

## Cross-cutting concerns

### Logging
Console only. No remote sink. No telemetry — see `docs/PRIVACY.md`.

### Error boundary
Single `<ErrorBoundary>` in `App.tsx` wrapping the panel router. Renders a recovery surface ("X crashed, your fasting data is safe on disk") with a "Reset View" button that routes back to the main panel.

### Focus recovery
See "Persistence pipeline" above.

### Accessibility
- All interactive elements have `aria-label`.
- Color is never the only signal (every stage has a label).
- Universal `:focus-visible` ring in `base.css` — keyboard users see ember outline; mouse users see nothing.
- Popovers (ContextMenu, TimestampsRow, ProtocolPicker) dismiss on Escape via `useEscapeKey`.

### Code splitting
Settings, Stats, Achievements panels are loaded via `React.lazy` — main bundle 132 KB gzipped, panel chunks ~1.5 KB gzipped each, cached after first navigation. `<Suspense fallback={<PanelLoader />}>` wraps the panel router.

---

## Architectural rules (CI-enforced)

`.github/workflows/ci.yml` greps for these on every push:

1. No `setInterval` for the fasting clock outside `useFastingClock.ts`.
2. No direct `@tauri-apps/api/window` import outside `src/platform/desktop/`.
3. No `z-[N]`, no Tailwind preset `z-NN`, no `rounded-2xl/xl/lg`.

The PR template adds a checklist for things greps can't catch (token discipline, persisted-state round-trip).

---

## Deferred decisions log

| Topic | Decision | When to revisit |
|---|---|---|
| Cloud sync provider | Deferred to Phase 6. Likely iCloud + Google Drive over WebDAV/Dropbox to avoid a server. | Before Phase 6 work begins. |
| Notification system | Deferred to Phase 6. Tauri 2 plugin-notification covers desktop. iOS/Android need APNs/FCM eventually. | Phase 6. |
| Mobile UI form factor | Compact-layout grid is stubbed in Phase 5 with `useFormFactor()` but not implemented. | Phase 7. |
| Test framework | Vitest planned but not introduced this round. The slice-split makes future tests cheap. | Before Phase 6 to gate regressions. |
| State machine library (XState etc) | Rejected. Four small slices are simpler than a state machine and match the team's React idiom. | If state complexity outgrows current model. |
| Pinned Tauri 2 version | Currently floats on `2` (Cargo.toml). `Cargo.lock` provides reproducibility. Pin explicitly before public release. | Before v1.0.0 publish. |
| User profile | Deferred to Phase 6 alongside cloud sync. A local-only display name was considered and rejected (UI noise without payoff). | Phase 6. |

---

## Non-functional requirements

- **Cold-start to UI** under 1.5s on a 2020-era laptop.
- **Tick precision** 1s, never drifts more than 1s/hour.
- **Bundle** 132 KB gzipped initial JS + ~10 KB lazy panel chunks; CSS 6.8 KB gzipped.
- **Idle CPU** < 0.1% (one setInterval, no animations on idle).
- **Memory** under 80 MB resident.
