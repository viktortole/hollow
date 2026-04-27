# Frontend Architecture (React + TypeScript)

## Entry Point

```
index.html
  └─ <div id="root">
       └─ src/main.tsx
            └─ ReactDOM.createRoot().render(<App />)
                 └─ src/App.tsx
```

The `index.html` sets `background: transparent` on both `html` and `body`, which is required for Tauri to display the transparent window correctly. The root `<div>` fills 100% of the window height.

---

## App.tsx — Root Component

**File:** `src/App.tsx` (263 lines)

`App.tsx` is the orchestrator. It handles:

### 1. State Loading (on mount)
```typescript
useEffect(() => {
  const init = async () => {
    const saved = await loadState();         // from tauri-plugin-store
    if (saved.onboardingComplete) {
      loadStore(saved);                       // restore into Zustand
      setOnboardingDone(true);
    } else {
      setOnboardingDone(false);
    }
    setLoading(false);
  };
  init();
}, []);
```

### 2. Auto-Save (subscription)
```typescript
useEffect(() => {
  const unsubscribe = useStore.subscribe((state) => {
    if (!loading) {
      saveState({ /* full state snapshot */ });
    }
  });
  return unsubscribe;
}, [loading]);
```
Every Zustand state mutation triggers a `saveState()` call. The 300ms `autoSave` debounce in `tauri-plugin-store` prevents excessive I/O.

### 3. Tray Event Listener
```typescript
useEffect(() => {
  const unlisten = listen("pill-mode-toggle", () => {
    togglePillMode();
  });
  return () => { unlisten.then(fn => fn()); };
}, []);
```
The Rust backend emits `pill-mode-toggle` when the tray "Pill Mode" menu item is clicked.

### 4. Panel Routing
```typescript
activePanel: "onboarding" | "main" | "stats" | "achievements" | "settings"
```
`AnimatePresence` wraps the active panel with slide-in/fade-out transitions. Panel changes are triggered by:
- Onboarding completion → switches to `main`
- Settings/Stats/Achievements buttons → switch to respective panels
- Back buttons in sub-panels → return to `main`

### 5. Window Drag
```typescript
const handleDragStart = async () => {
  const appWindow = getCurrentWindow();
  await appWindow.startDragging();
};
```
Called on `onMouseDown` of the main content area (below the title bar). The title bar zone uses `-webkit-app-region: drag` CSS for native drag feel.

### 6. Custom Title Bar
- Left: "HOLLOW" branding text
- Right: Pill mode button + Close button
- Both use `-webkit-app-region: no-drag` so clicks pass through to JS handlers

### 7. Context Menu
Right-click anywhere on the widget triggers `handleContextMenu`, which:
1. `e.preventDefault()` to block OS context menu
2. Sets `contextMenu` state with `{ x, y }` position
3. Renders `<ContextMenu>` component

---

## Component Tree

```
App
├── Loading Spinner (while initial state loads)
└── [AnimatePresence]
    ├── Onboarding          (step 0: Welcome, step 1: Protocol picker)
    ├── FastingWidget       (main screen)
    │   ├── ToastContainer  (level-up + achievement popups, absolute positioned)
    │   ├── CircularProgress
    │   │   └── [Timer | Ready state]
    │   ├── StageIndicator  (shown only when fasting)
    │   ├── XpBar
    │   ├── StreakIndicator
    │   └── [Start Button | End+Complete buttons]
    ├── StatsPanel          (lifetime stats + bar chart)
    ├── AchievementsPanel   (2-column grid)
    ├── SettingsPanel       (protocol + sound + reset)
    └── [null]              (during loading)
├── PillMode                (AnimatePresence overlay, fixed position)
└── ContextMenu             (fixed position, z-100)
```

---

## State Management (Zustand)

### Store Structure (`src/lib/store.ts`)

**State Shape:**
```typescript
interface AppState {
  // Fasting
  isFasting: boolean;
  fastStartTimestamp: number | null;
  targetHours: number;
  protocol: string;

  // Gamification
  totalXp: number;
  completedFasts: CompletedFast[];    // max 100 entries
  currentStreak: number;
  longestStreak: number;
  lastFastDate: string | null;       // ISO date "YYYY-MM-DD"
  unlockedAchievements: UnlockedAchievement[];
  stageEntryHistory: number[];        // index = stage, value = count
  brokeStreak: boolean;
  maxLevelReached: number;

  // UI
  settings: AppSettings;
  activePanel: "main" | "settings" | "stats" | "achievements" | "onboarding";
  isPillMode: boolean;
  isDragging: boolean;

  // Notifications (transient, cleared after shown)
  pendingAchievements: UnlockedAchievement[];
  pendingLevelUp: number | null;
  pendingStageUp: number | null;

  // Actions
  startFast: () => void;
  endFast: (completed: boolean) => void;
  tick: () => void;
  getAchievementStats: () => AchievementStats;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setActivePanel: (panel) => void;
  togglePillMode: () => void;
  toggleAlwaysOnTop: () => void;
  setIsDragging: (v: boolean) => void;
  dismissAchievement: () => void;
  dismissLevelUp: () => void;
  dismissStageUp: () => void;
  setPendingStageUp: (stage: number | null) => void;
  resetData: () => void;
  loadState: (state: Partial<AppState>) => void;
}
```

### `startFast()` Logic
1. Resolve `targetHours` from `protocol` map (e.g. `"16_8"` → 16) or use `settings.customHours`
2. Set `isFasting: true` and `fastStartTimestamp: Date.now()`

### `endFast(completed)` Logic
1. Calculate `elapsedSeconds`, `elapsedHours`
2. Determine `stageIndex` via `getStageIndex(elapsedHours)`
3. Track `stageEntryHistory[stageIndex]++`
4. Calculate XP:
   - `base = elapsedHours * xpPerHour(stageIndex)`
   - `xpEarned = completed && elapsedHours >= targetHours ? floor(base * 1.25) : base`
   - Minimum: `max(xpEarned, 10)`
5. Calculate streak via `checkStreak(lastDate, today)`:
   - Same day → 0 (no change)
   - Consecutive day → increment
   - Gap → reset to 1 (mark `brokeStreak = true`)
6. Check all 20 achievements via `achievement.condition(achievementStats)`
7. Special case: "Night Owl" — checked by `endTime.getHours()` in [2, 4)
8. Append to `completedFasts` (prepend, slice to 100 max)
9. Set `pendingAchievements`, `pendingLevelUp` if leveled up

### `getAchievementStats()` — aggregates state for condition evaluation
```typescript
{
  totalFasts: completedFasts.length,
  totalHours: completedFasts.reduce(sum(elapsedSeconds/3600)),
  longestFast: completedFasts.reduce(max(elapsedSeconds/3600)),
  currentStreak,
  longestStreak,
  levelsReached: maxLevelReached,
  autophagyCount: stageEntryHistory[3] || 0,
  brokeStreakThenRestarted: brokeStreak && currentStreak > 0,
  nightOwlFasts: 0,  // tracked separately
  maxLevel: maxLevelReached,
  customHours: settings.customHours,
}
```

---

## Persistence Layer (`src/lib/data.ts`)

### `loadState()`
- Calls `store.get(key)` for each of 15 keys
- Returns partial object — missing keys are undefined (handled in App.tsx)
- Errors are caught and return `{}`

### `saveState(state)`
- Calls `store.set(key, value)` for each field
- Calls `store.save()` to flush (debounced by `autoSave: 300`)

### Store File
- Path: handled by Tauri plugin (OS-specific app data dir)
- Format: JSON
- Auto-save interval: 300ms

---

## Styling Architecture (`src/styles/index.css`)

```css
@import "tailwindcss";    /* v4: pulls in all Tailwind utilities */

:root {
  font-family: "Inter", system-ui, sans-serif;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: transparent;    /* critical for frameless transparent window */
  user-select: none;
  cursor: default;
}

/* Custom scrollbar hide utility */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }

/* Keyframes */
@keyframes pulse-glow { }
@keyframes ring-fill { }
@keyframes stage-flash { }
@keyframes toast-in { }
@keyframes level-up-flash { }
@keyframes particle-burst { }
```

### Tailwind v4 Notes
- **No `tailwind.config.js`** — configuration is in CSS
- Uses `@tailwindcss/vite` plugin
- All custom classes (like `scrollbar-hide`) are defined in index.css
- Custom colors and values can be defined via CSS custom properties

---

## Routing / Panel Navigation

No React Router — just a single Zustand state variable `activePanel`. Panel switching is done via:

```typescript
setActivePanel("settings");    // any component can call this
```

The `AnimatePresence` in App.tsx watches `activePanel` and animates between panels. Panel components are never unmounted between switches (mode="wait"), preventing state loss.

---

## Event Flow

```
User clicks "Start Fast"
  └─ startFast() in Zustand store
       └─ set({ isFasting: true, fastStartTimestamp: now })
            └─ Zustand subscription in App.tsx
                 └─ saveState() → tauri-plugin-store.save()

setInterval (every 1 second, in FastingWidget)
  └─ elapsed = floor((Date.now() - fastStartTimestamp) / 1000)
       └─ setElapsed(elapsed) → re-renders Timer + CircularProgress
       └─ stageIndex = getStageIndex(elapsed / 3600)
            └─ if stageIndex > prevStageRef
                 └─ setPendingStageUp(stageIndex) → stage flash animation

User clicks "Complete"
  └─ handleEndFast(true) → endFast(true)
       └─ all endFast calculations (XP, streak, achievements)
            └─ set(...) on Zustand → subscription → saveState()
```
