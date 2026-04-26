# Component Reference

## CircularProgress.tsx

SVG-based circular progress ring with glow effects.

**Props:**
```typescript
interface CircularProgressProps {
  progress: number;     // 0-100
  size?: number;        // default: 200
  strokeWidth?: number; // default: 8
  color?: string;       // default: "#a855f7"
  glowColor?: string;   // default: "#a855f780"
  children?: ReactNode; // centered content
}
```

**Implementation:**
- SVG with `transform: rotate(-90deg)` to start from top
- `stroke-dasharray = circumference` (full circle)
- `stroke-dashoffset` animated from full circumference to progress-scaled offset
- `feGaussianBlur` filter for glow effect on the progress arc
- A second wider, blurred circle at lower opacity creates a soft halo
- Framer Motion `animate` on `strokeDashoffset` for smooth progress animation

**Used in:** FastingWidget (center of the main screen)

---

## Timer.tsx

Real-time HH:MM:SS elapsed time display.

**Props:**
```typescript
interface TimerProps {
  startTimestamp: number | null;
  targetHours: number;
}
```

**Behavior:**
- Uses `setInterval(1000ms)` starting from mount
- `elapsed = floor((Date.now() - startTimestamp) / 1000)` each tick
- Shows elapsed time + remaining time OR over-target time
- `formatElapsed(totalSeconds)` returns `HH:MM:SS` zero-padded strings
- Interval is cleared when `startTimestamp` becomes null (fast ended)

**Used in:** FastingWidget (center of the circular progress)

---

## StageIndicator.tsx

Shows the current metabolic stage name with animated transitions and progress to next stage.

**Props:**
```typescript
interface StageIndicatorProps {
  stage: FastingStage;
  hoursElapsed: number;
}
```

**Behavior:**
- Uses `AnimatePresence` to animate stage name changes
- Shows current stage name in stage color + description
- If there's a next stage, shows a progress bar toward it
- Shows "Next: [StageName] in Xh" countdown

---

## XpBar.tsx

Displays current level, rank title, and XP progress bar.

**Props:**
```typescript
interface XpBarProps {
  level: number;
  totalXp: number;
}
```

**Design:**
- Level badge (purple pill, "LV X")
- Rank title text
- XP progress bar with purple-pink gradient
- XP counter "current / required"

---

## StreakIndicator.tsx

Animated flame icon with streak count.

**Props:**
```typescript
interface StreakIndicatorProps {
  streak: number;
  longest: number;
}
```

**States:**
- `streak === 0`: gray flame icon, "0 day streak" text
- `streak >= 1`: animated flame with color scaling based on streak length
- Uses Framer Motion `animate` with `scale` and `drop-shadow` filter pulsing

---

## Toast.tsx (ToastContainer)

Overlays for level-up and achievement popups.

**Behavior:**
- Listens to `pendingLevelUp` and `pendingAchievements` from Zustand
- **Level-up**: Full-screen purple/pink flash overlay, large level number, rank title, click to dismiss
- **Achievement**: Slides in from top, shows gold award icon + name + description, click to dismiss
- Uses `AnimatePresence` for enter/exit animations
- Both are `pointer-events-none` on the overlay but `onClick` handlers work

---

## FastingWidget.tsx

The main screen of the app.

**Structure:**
1. `<ToastContainer />` — overlays for achievements/level-ups
2. Completion celebration flash (`<AnimatePresence>` with gold radial)
3. Stage-up flash (`<AnimatePresence>` with stage-colored radial)
4. `<CircularProgress>` — large ring showing % to target
   - When fasting: shows `<Timer>` inside
   - When idle: shows target hours
5. `<StageIndicator>` — shown only while fasting
6. `<XpBar>` — always visible
7. `<StreakIndicator>` — always visible
8. **Start Fast button** OR **End Fast + Complete buttons**

**Key State:**
```typescript
const prevStageRef = useRef(0); // tracks last seen stage index
```

On each 1-second tick, compares `stageIdx` vs `prevStageRef.current` to detect stage transitions.

---

## Onboarding.tsx

2-step onboarding wizard.

**Step 0 — Welcome:**
- Animated hollow circle logo
- "HOLLOW" title, tagline, description
- "Begin" button → advances to step 1

**Step 1 — Protocol Selection:**
- Lists all protocols (except "custom") as selectable cards
- Selected card has purple highlight + border + dot indicator
- "Start Fasting" button → saves protocol to settings, switches to main panel

---

## StatsPanel.tsx

Lifetime statistics display.

**Stats Grid (2x2):**
- Total Fasts
- Total Hours (floored)
- Avg Duration (totalHours / totalFasts)
- Longest Fast

**Level & XP Section:**
- Large level badge
- Rank title
- XP progress bar
- Total XP display

**Streak Section:**
- Current streak (orange)
- Best streak
- Max level reached

**Bar Chart:**
- Last 30 fasts displayed as vertical bars
- Bar height = min(fastHours/24 * 40px, 40px)
- Bar color = stage color at that point
- Bar opacity fades from recent (1.0) to older (0.3)

---

## AchievementsPanel.tsx

Grid display of all 20 achievements.

**Layout:** 2-column grid, scrollable

**Per Achievement Card:**
- Unlocked: purple border, gold award icon, name/description visible, date unlocked
- Locked: dim border, gray lock icon, name hidden if secret

**Secret achievements:** Show "???" for both name and description until unlocked.

---

## SettingsPanel.tsx

Protocol selector, sound toggle, data reset.

**Protocol List:**
- All 8 protocols rendered as clickable cards
- Selected card has purple highlight
- "Custom" protocol shows an additional number input (1-168 hours)

**Sound Effects Toggle:**
- Animated pill-style toggle (purple when on, gray when off)
- Currently non-functional — there is no sound implementation

**Data Reset:**
- Two-step: first click shows confirmation dialog, second click executes
- Calls `resetData()` which resets all Zustand state except `settings`

---

## PillMode.tsx

Ultra-minimal floating overlay.

**Trigger:** `isPillMode` from Zustand

**Appearance:**
- Fixed position centered on screen
- Shows: colored dot + elapsed HH:MM:SS + small dot
- Border color matches current stage color
- `boxShadow` glow in stage color

**Interaction:**
- `layoutId="pill"` for shared layout animation with the widget
- Clicking it calls `togglePillMode()` to return to full widget

---

## ContextMenu.tsx

Right-click context menu.

**Trigger:** `position: { x, y } | null` from App.tsx state

**Items:**
| Label | Action |
|-------|--------|
| Stats | `setActivePanel("stats")` |
| Achievements | `setActivePanel("achievements")` |
| Settings | `setActivePanel("settings")` |
| Pin/Unpin | `toggleAlwaysOnTop()` |
| Pill Mode | `togglePillMode()` |
| Quit | `onCloseWidget()` (hides window, does not exit) |

**Note:** The Quit option in the context menu only calls `window.hide()`, not `app.exit()`. The full quit is only in the tray menu.
