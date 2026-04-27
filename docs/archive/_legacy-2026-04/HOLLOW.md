# Hollow — Gamified Fasting Widget

**Type:** Tauri 2 desktop widget (Windows-first, frameless, transparent, always-on-top)
**Git:** `main` branch, commit `33b9522` — local repo, no remote

---

## What It Is

Hollow is a lightweight fasting tracker disguised as a game. You start a fast, watch the clock, earn XP, level up, and unlock achievements. It lives as a small always-on-top window on the desktop — unobtrusive until you need it.

The target user: someone who wants behavioral accountability through game mechanics (levels, streaks, achievements) rather than a clinical health log.

---

## The Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Runtime | Tauri 2 | Native Windows window, tray, IPC |
| UI | React 19 + Vite | Component tree, hot reload |
| Styling | Tailwind CSS v4 + inline `style={{}}` | Utility classes + CSS custom properties |
| Animation | framer-motion v12 | Transitions, presence, toast pop-ins |
| State | Zustand v5 | In-memory store, subscription-based |
| Persistence | localStorage (via `src/lib/data.ts`) | Serialised AppState survives reloads |
| Icons | lucide-react | Consistent 1.5px-stroke icon set |
| Audio | Web Audio API (programmatic tones) | No audio files — synthesised bleeps |
| Backend | Rust (src-tauri/) | Window management, tray, app lifecycle |

### Tauri Window Defaults
- **Size:** 360×500 px
- **Min size:** 280×420 px
- **Resizable:** yes
- **Decorations:** none (frameless)
- **Transparent:** yes
- **Always on top:** configurable (pin/unpin)

---

## Fasting Model

### Protocols

| ID | Name | Hours | Description |
|----|------|-------|-------------|
| `16_8` | 16:8 | 16 | Lean gains, beginner-friendly |
| `18_6` | 18:6 | 18 | Accelerated fat burning |
| `20_4` | 20:4 | 20 | Warrior diet, athletic performance |
| `omad` | OMAD | 23 | One meal a day |
| `extended` | Extended | 48 | Autophagy, deep reset |
| `custom` | Custom | user-defined | 1–168h |

### Metabolic Stages

Each completed fast passes through up to 5 metabolic stages. Stage color drives the timer ring glow and ambient background gradient.

| Index | Name | Hours Min | Color |
|-------|------|-----------|-------|
| 0 | Fed | 0h | `#a855f7` purple |
| 1 | Burning | 12h | `#f97316` orange |
| 2 | Ketosis | 18h | `#eab308` gold |
| 3 | Autophagy | 24h | `#22c55e` green |
| 4 | Deep Ketosis | 36h+ | `#06b6d4` cyan |

Stage transitions trigger a radial background flash animation and (if sounds enabled) a tone.

---

## Progression System

### XP & Levels

XP is awarded on fast completion. The amount scales with protocol difficulty and whether the target was hit.

| Event | XP |
|-------|-----|
| Fast completed (partial) | `floor(elapsed_hours × 10)` |
| Fast completed (target met) | `floor(elapsed_hours × 20)` |
| Achievement unlock | Fixed per-achievement value |
| Night owl fast (2–4 AM end, completed) | +50 bonus |

Levels are unbounded. XP required per level = `level × 100`. Rank titles are assigned at milestones (level 1 = Novice, level 13 = Catabolic, level 20 = Phoenix).

### Streaks

- A streak increments when a completed fast is logged on a calendar day with no gap.
- Breaking a fast intentionally without completing it does NOT break the streak.
- Streak data: `currentStreak`, `longestStreak` both persisted.

### Night Owl Tracking

A `nightOwlFasts` counter tracks how many completed fasts ended between 02:00–04:00 local time. This is a hidden stat — visible only in the StatsPanel derived data.

---

## Gamification — Achievements

Achievements are defined in `src/lib/achievements.ts` as a static array. Unlock condition is evaluated against `completedFasts[]`, `currentStreak`, `totalXp`, `level`, and `nightOwlFasts`. Unlocked achievements show the unlock date.

Some achievements are `secret: true` — name and description are hidden until unlocked.

Pending achievement toasts appear in FIFO order (max 1 visible at a time; queue is cleared on reset).

---

## UI Surfaces

| Surface | File | Notes |
|---------|------|-------|
| Outer shell (chrome) | `src/App.tsx` | Owns the only border in the app |
| Drag bar / title bar | `src/App.tsx` | 32px, "HOLLOW" text + window controls |
| FastingWidget | `src/components/FastingWidget.tsx` | Main panel — idle and active states |
| Onboarding | `src/components/Onboarding.tsx` | 2-step: welcome + protocol selection |
| StatsPanel | `src/components/StatsPanel.tsx` | Fasting stats, XP bar, streak, fast history chart |
| AchievementsPanel | `src/components/AchievementsPanel.tsx` | Grid of locked/unlocked achievements |
| SettingsPanel | `src/components/SettingsPanel.tsx` | Protocol picker, sound toggle, reset |
| ContextMenu | `src/components/ContextMenu.tsx` | Right-click: Stats/Achievements/Settings/Pin/Pill/Quit |
| Toast | `src/components/Toast.tsx` | Level-up and achievement toasts |
| PillMode | `src/components/PillMode.tsx` | Minimised ultra-compact view |
| CircularProgress | `src/components/CircularProgress.tsx` | Timer ring with glow |
| StageIndicator | `src/components/StageIndicator.tsx` | Metabolic stage label |
| XpBar | `src/components/XpBar.tsx` | XP progress bar |
| Timer | `src/components/Timer.tsx` | HH:MM:SS display |

### Floating Overlays

`ContextMenu`, `Toast`, and `PillMode` float **outside** the outer shell visually. They keep their own borders. Everything else is rendered inside the shell.

---

## State Management

See `src/lib/store.ts` and `src/lib/data.ts`.

**AppState** lives in Zustand. Changes are subscribed and debounce-saved to localStorage via `saveState()`. On mount, `loadState()` restores protocol, XP, achievements, streaks, window position, night owl count.

**Ghost pending notifications** (e.g. a toast queued before a reset) are cleared by `resetData()`.

---

## Sound System

`src/lib/sounds.ts` uses the Web Audio API to synthesise tones at runtime — no audio files required.

| Function | Trigger |
|----------|---------|
| `playLevelUp()` | Level increases |
| `playAchievementUnlock()` | Achievement unlocked |
| `playStageUp()` | Metabolic stage advances |
| `playCompleteFast()` | Fast completed (target met) |

Sounds are gated by `settings.soundEnabled`. In FastingWidget, `useStore.getState().settings.soundEnabled` is read **live** inside the 1-second interval — NOT captured in closure — to ensure toggling sounds mid-fast works immediately.

---

## Window Position Persistence

Window position is saved on every `onMoved` event, debounced 500ms. Saved as `windowX`/`windowY` in localStorage. Restored on app init via Tauri's `setPosition(LogicalPosition(...))`.

`onMoved` returns `Promise<() => void>`. The cleanup function is captured via `.then(fn => { unlisten = fn; })` pattern inside a `useEffect` with a `useRef` — so unsubscribe is called correctly on unmount.

---

## Tauri IPC

`src-tauri/src/lib.rs` exposes two commands:
- `hide_app()` — hides the window to tray (called by "Hide to Tray" in ContextMenu)
- `quit_app()` — fully exits the process (called by "Quit" in ContextMenu)

Both use `match` patterns instead of `.unwrap()` on the webview window handle — graceful no-ops if the window is not found.

The Rust tray menu emits a `pill-mode-toggle` event on click, listened to by `App.tsx`.

---

## Running & Building

```powershell
# Development (PowerShell, Windows)
npm run tauri dev

# Production build
npm run tauri build

# Browser-only dev (no Tauri)
npm run dev

# TypeScript check
npx tsc --noEmit
```

WSL2 cannot run `npm run tauri dev` (needs Windows Node + Rust toolchain). WSL2 is used only for editing source files.

---

## Project Conventions

- **Branch:** `main` only — no feature branches
- **Commits:** conventional format, signed-off, no GPG
- **No `TODO`/`FIXME`/`console.log` leftovers** in committed code
- **TypeScript strict** — zero type errors required
- **Design tokens** are the single source of truth for interior spacing — never hard-code `p-4` or `px-3` on card-like surfaces
- **Outer shell** is the only frame in the app — cards inside use fill-only styling
