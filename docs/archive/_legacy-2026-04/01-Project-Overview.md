# Hollow - Project Overview

**What it is:** A gamified fasting tracker desktop widget for Windows.
**What it does:** Tracks intermittent and extended fasting sessions, with XP/leveling, achievements, metabolic stage progression, and streak tracking — all in a tiny always-on-top overlay window.
**Identifier:** `com.hollow.fasting-widget`
**Version:** 1.0.0
**Author:** Hollow

---

## Core Feature Summary

| Feature | Description |
|---------|-------------|
| Timer | Real-time HH:MM:SS elapsed counter, ticking every second |
| Circular Progress | SVG ring showing % toward target hours, with stage-colored glow |
| 6 Metabolic Stages | Fed → Early Fast → Fat Burning → Autophagy → Deep Ketosis → Stem Cell |
| XP System | Hourly XP with stage multipliers, completion bonuses, level-up animations |
| Rank System | 20 levels with unique titles from "Initiate" to "Omega" |
| Achievements | 20 achievements (13 visible, 7 secret), checked on each fast completion |
| Streak Tracking | Daily consecutive fast tracking, streak freeze detection |
| Fasting Protocols | 16:8, 18:6, 20:4, OMAD, 24h, 36h, 48h, Custom |
| System Tray | Minimize to tray, right-click menu, left-click to restore |
| Pill Mode | Ultra-minimal floating timer pill overlay |
| Persistence | Full state saved to `hollow-data.json` via Tauri plugin-store |
| Right-Click Menu | Navigate to Stats, Achievements, Settings; toggle AOT, Pill Mode |
| Onboarding | 2-step wizard: welcome + protocol selection |

---

## Build & Run

```bash
# Install deps
npm install

# Development (full Tauri + hot reload)
npm run tauri dev

# Production build (creates .exe installer)
npm run tauri build

# Frontend-only dev (no Rust backend)
npm run dev
```

---

## Technology Choices & Rationale

### Tauri 2 over Electron
- **Size:** Tauri executables are ~2-5MB vs Electron's ~100MB+
- **Performance:** Native Rust backend, no Node.js overhead
- **Security:** No V8 sandbox, tighter permission model
- **Bundle:** Single .exe installer via NSIS

### React 19 + Zustand over other state libraries
- Zustand provides a minimal, TypeScript-friendly store with subscription
- No Provider wrappers needed (singleton store)
- `subscribe()` in App.tsx is used to trigger persistence on every state change

### Framer Motion over CSS animations
- Used for panel transitions, stage flash effects, streak flame pulse, achievement popups
- `AnimatePresence` handles enter/exit transitions cleanly
- Motion values and spring physics give a premium feel

### Tailwind CSS v4 (via Vite plugin)
- Tailwind v4 uses a CSS-first configuration (no tailwind.config.js)
- `@import "tailwindcss"` in index.css pulls everything in
- `scrollbar-hide` utility is custom-defined in index.css

### tauri-plugin-store for persistence
- Writes to a JSON file in the OS app data directory
- `autoSave: 300` (ms) provides debounced auto-save without constant I/O
- Data survives app restarts and OS reboots

---

## Visual Design Language

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Background | `rgba(10,10,20,0.95)` | Main widget background |
| Surface | `rgba(255,255,255,0.05)` | Card backgrounds |
| Border | `rgba(255,255,255,0.08)` | Subtle card borders |
| Primary | `#a855f7` (purple) | Buttons, level badges, highlights |
| Secondary | `#ec4899` (pink) | Button gradients, progress bars |
| Success | `#22c55e` (green) | Complete button, Fed stage |
| Warning | `#eab308` (gold) | Achievement badges, Stem Cell stage |
| Danger | `#ef4444` (red) | End Fast button |
| Text Primary | `#fff` | Headings, values |
| Text Muted | `rgba(255,255,255,0.3-0.5)` | Labels, captions |

### Stage Colors
| Stage | Color | Hex |
|-------|-------|-----|
| Fed | Green | `#22c55e` |
| Early Fast | Blue | `#3b82f6` |
| Fat Burning | Orange | `#f97316` |
| Autophagy | Purple | `#a855f7` |
| Deep Ketosis | Pink | `#ec4899` |
| Stem Cell | Gold | `#eab308` |

### Typography
- **Body:** System font stack (`Inter`, system-ui, sans-serif)
- **Monospace:** `JetBrains Mono`, `Fira Code` (timers, XP values, stats)
- **Display:** Orbitron (mentioned in CSS but not actively used)
- **Tracking:** Heavy use of `tracking-widest` and `tracking-[0.3em]` for labels

### Layout
- Single window (320x420), no tabs
- Panel-based navigation via `AnimatePresence` + `activePanel` state
- Panels: `main`, `stats`, `achievements`, `settings`, `onboarding`
- All panels animate in/out with slide + fade
- No scroll on the main widget; stats/achievements/settings panels overflow scroll

---

## Window Behavior

```
Startup
  └─ App.tsx mounts
       ├─ loadState() from disk
       ├─ onboardingComplete === true? → show main panel
       └─ onboardingComplete === false? → show onboarding panel

Main Loop (per second)
  └─ setInterval in FastingWidget
       ├─ elapsed = floor((now - fastStartTimestamp) / 1000)
       ├─ stageIndex = getStageIndex(elapsed / 3600)
       └─ if stageIndex > prevStageRef → fire stage-up flash

Tray Icon Click
  └─ Left-click → show() + setFocus()
  └─ Right-click → native context menu (built by TrayIconBuilder)

Window Close Button (X)
  └─ window.hide() → app stays in tray (not .exit())

Quit (from tray or context menu)
  └─ app.exit(0) → full process termination
```
