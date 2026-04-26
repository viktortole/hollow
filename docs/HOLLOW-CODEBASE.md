# Hollow — Codebase Inventory

---

## File Tree

```
Hollow/
├── src/                          # React frontend (TypeScript)
│   ├── App.tsx                    # Root component — outer shell, drag bar, panel routing
│   ├── main.tsx                   # Vite entry point
│   ├── styles/
│   │   └── index.css              # Tailwind v4 import + :root CSS tokens
│   ├── components/
│   │   ├── FastingWidget.tsx       # Main fasting panel (idle + active states)
│   │   ├── CircularProgress.tsx    # SVG timer ring with glow
│   │   ├── StageIndicator.tsx      # Metabolic stage label + progress
│   │   ├── XpBar.tsx              # XP progress bar
│   │   ├── Timer.tsx              # HH:MM:SS display
│   │   ├── Toast.tsx              # Level-up + achievement toast system
│   │   ├── ContextMenu.tsx         # Right-click menu
│   │   ├── PillMode.tsx           # Minimised compact view
│   │   ├── Onboarding.tsx          # 2-step welcome + protocol selection
│   │   ├── StatsPanel.tsx         # Stats, XP bar, streak, fast history
│   │   ├── AchievementsPanel.tsx  # Achievement grid
│   │   └── SettingsPanel.tsx      # Protocol picker, sound toggle, reset
│   └── lib/
│       ├── store.ts               # Zustand AppState store + all actions
│       ├── data.ts                # localStorage load/save (PersistedState)
│       ├── stages.ts              # Protocols + metabolic stages + helpers
│       ├── gamification.ts        # XP, levels, rank titles
│       ├── achievements.ts        # Achievement definitions
│       ├── sounds.ts               # Web Audio API programmatic tones
│       └── rown.xml                # (generated?) — ignore
├── src-tauri/                     # Rust Tauri backend
│   ├── src/
│   │   └── lib.rs                 # Commands: hide_app, quit_app; tray setup
│   ├── tauri.conf.json            # Window size (360×500), decorations:false, etc.
│   ├── Cargo.toml                 # Rust dependencies
│   └── capabilities/              # Tauri v2 capability permissions
├── package.json                    # npm dependencies, scripts
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
├── tailwind.config.js             # Tailwind config (v4, minimal — mostly defaults)
├── index.html                     # Vite HTML entry
└── .gitignore
```

---

## Key Module Responsibilities

### `src/App.tsx`
- Renders the outer shell (root div with gradient, border, shadow)
- Contains the 32px drag bar ("HOLLOW" text + minimise/close buttons)
- Manages `activePanel` state to route between Onboarding/Main/Stats/Achievements/Settings
- Sets up Tauri `onMoved` listener with 500ms debounce for window position persistence
- Sets up Tauri `pill-mode-toggle` event listener
- Handles right-click context menu
- Restores window position from localStorage on mount

### `src/components/FastingWidget.tsx`
- Main fasting interaction panel
- States: idle (shows target hours), active (shows timer, stage, progress)
- 1-second interval reads `fastStartTimestamp` from store
- Uses `useStore.getState().settings.soundEnabled` (NOT closure-captured) for live sound gating
- `prevStageRef` tracks previous stage index; resets to 0 on `startFast`
- `stageSoundTimeRef` prevents stage-up sound from firing more than once per 30s per stage

### `src/lib/store.ts`
**AppState interface** — all persistent and ephemeral state:

```ts
interface AppState {
  // Fasting
  isFasting: boolean
  fastStartTimestamp: number | null
  targetHours: number
  protocol: string
  // Progress
  totalXp: number
  completedFasts: CompletedFast[]    // { id, elapsedSeconds, stageReached, timestamp }
  currentStreak: number
  longestStreak: number
  lastFastDate: string | null
  brokeStreak: boolean
  maxLevelReached: number
  // Achievements
  unlockedAchievements: UnlockedAchievement[]  // { id, unlockedAt }
  pendingAchievements: string[]    // queue of achievement IDs to toast
  // Notifications
  pendingLevelUp: number | null
  pendingStageUp: number | null
  // UI
  activePanel: PanelType
  isPillMode: boolean
  nightOwlFasts: number
  windowX: number | null
  windowY: number | null
  // Settings
  settings: {
    soundEnabled: boolean
    alwaysOnTop: boolean
    customHours: number
    protocol: string
  }
}
```

**Actions:** `startFast`, `endFast(completed)`, `loadState`, `updateSettings`, `resetData`, `toggleAlwaysOnTop`, `togglePillMode`, `setActivePanel`, `setPendingStageUp`, `dismissAchievement`, `setWindowPosition`

**Computed:** `getAchievementStats()`

### `src/lib/data.ts`
- `PersistedState` — subset of AppState that survives localStorage
- `loadState()` — reads from localStorage key `hollow_state`
- `saveState()` — serialises to localStorage
- Handles protocol ID → `targetHours` remapping on load

### `src/lib/stages.ts`
- `PROTOCOLS` — static array of protocol definitions
- `STAGES` — static array of 5 metabolic stage definitions
- `getStageForHours(hours)` — returns current stage object
- `getStageIndex(hours)` — returns stage index (0–4)
- `isNightOwlEnd(endTimestamp)` — returns true if fast ended 02:00–04:00

### `src/lib/gamification.ts`
- `levelFromXp(totalXp)` — level integer
- `xpProgressInLevel(totalXp)` — `{ current, required, percentage }`
- `getRankTitle(level)` — rank string for level number (maps level → title)
- `XP_PER_LEVEL = 100`
- Rank titles: Novice (1) → ... → Catabolic (13) → ... → Phoenix (20)

### `src/lib/achievements.ts`
- `ACHIEVEMENTS` — static array of achievement objects: `{ id, name, description, secret, xpReward, condition(state): boolean }`

### `src/lib/sounds.ts`
- `playLevelUp()` — ascending major third chord (440Hz + 554Hz + 659Hz)
- `playAchievementUnlock()` — ascending arpeggio (523 → 659 → 784 Hz)
- `playStageUp()` — rising two-tone (330Hz → 440Hz)
- `playCompleteFast()` — triumphant chord (523 + 659 + 784 Hz sustained)

All use Web Audio API `OscillatorNode` + `GainNode` with exponential ramp-out. No audio files.

### `src-tauri/src/lib.rs`
- `#[tauri::command] hide_app(app: AppHandle)` — calls `window.hide()`
- `#[tauri::command] quit_app(app: AppHandle)` — calls `app.exit(0)`
- Tray setup — single tray icon, emits `pill-mode-toggle` on click
- Both commands use `match` on `get_webview_window("main")` — graceful no-op if not found

---

## Component Data Flow

```
App.tsx (shell + routing)
    └── Onboarding / FastingWidget / StatsPanel / AchievementsPanel / SettingsPanel
            │
            └── useStore (Zustand)
                    │
                    ├── subscribed reads (re-render on change)
                    └── getState() for live reads inside intervals/callbacks
                            │
                            └── data.ts (localStorage)
```

Panels never pass props down more than 1 level. All state is in Zustand.

---

## Dependencies (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | `^19` | UI framework |
| `react-dom` | `^19` | React DOM renderer |
| `zustand` | `^5.0.12` | State management |
| `framer-motion` | `^12` | Animations |
| `lucide-react` | `latest` | Icons |
| `@tauri-apps/api` | `^2` | Tauri IPC, window, events |
| `tailwindcss` | `^4` | Utility CSS |
| `@tailwindcss/vite` | `^4` | Vite integration for Tailwind v4 |
| `typescript` | `^5` | Type safety |

---

## State Persistence Schema

**localStorage key:** `hollow_state`

```ts
interface PersistedState {
  isFasting: boolean
  fastStartTimestamp: number | null
  targetHours: number
  protocol: string
  totalXp: number
  completedFasts: CompletedFast[]
  currentStreak: number
  longestStreak: number
  lastFastDate: string | null
  brokeStreak: boolean
  maxLevelReached: number
  unlockedAchievements: UnlockedAchievement[]
  stageEntryHistory: number[]
  brokeStreak: boolean  // note: duplicate key in current schema
  maxLevelReached: number
  settings: Settings
  onboardingComplete: boolean
  nightOwlFasts: number
  windowX: number | null
  windowY: number | null
}
```

On mount, if `protocol` is saved but `targetHours` is stale, `loadState()` re-derives `targetHours` from the protocol list.

---

## Tauri Window Config (tauri.conf.json)

```json
{
  "window": {
    "width": 360,
    "height": 500,
    "minWidth": 280,
    "minHeight": 420,
    "resizable": true,
    "decorations": false,
    "transparent": true,
    "alwaysOnTop": false
  }
}
```

Window is positioned by the OS on first launch. Position is then saved/restored manually via `setPosition` + `onMoved`.
