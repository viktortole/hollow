# Hollow - Gamified Fasting Tracker Widget

> A desktop widget that transforms intermittent and extended fasting into a game. Track fasts, earn XP, unlock achievements, and climb the ranks from Initiate to Omega.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [01 - Project Overview](./01-Project-Overview.md) | What Hollow is, features, design language, window behavior |
| [02 - Tech Stack](./02-Tech-Stack.md) | Full dependency list, Rust crates, frontend packages, Tauri 2 permission model |
| [03 - Frontend Architecture](./03-Frontend-Architecture.md) | React structure, App.tsx routing, Zustand store, persistence layer |
| [04 - Rust Backend](./04-Rust-Backend.md) | Tauri setup, system tray, menu events, IPC, window config |
| [05 - Gamification System](./05-Gamification-System.md) | XP formula, level math, metabolic stages, achievements, streaks, protocols |
| [06 - Component Details](./06-Component-Details.md) | Every UI component props, behavior, and implementation notes |
| [07 - Build and Run](./07-Build-and-Run.md) | Dev setup, production build, debugging, common issues |

---

## Project at a Glance

| | |
|---|---|
| **Location** | `/mnt/c/Users/ToleV/Desktop/Hollow/` |
| **Type** | Tauri 2 desktop widget (Windows) |
| **Identifier** | `com.hollow.fasting-widget` |
| **Version** | 1.0.0 |
| **Frontend** | React 19 + TypeScript + Zustand + Framer Motion + Tailwind v4 |
| **Backend** | Rust + Tauri 2 |
| **Persistence** | JSON via tauri-plugin-store |
| **Output** | Standalone .exe + NSIS installer |

---

## Commands

```bash
npm install       # install dependencies
npm run tauri dev # development (full Tauri + hot reload)
npm run tauri build # production build (.exe + installer)
npm run dev        # frontend-only dev (no Rust)
```

---

## Features Summary

- Real-time fasting timer with animated circular progress ring
- 6 metabolic stages: Fed, Early Fast, Fat Burning, Autophagy, Deep Ketosis, Stem Cell
- XP and leveling system with 20 ranks from Initiate to Omega
- 20 achievements (13 visible, 7 secret)
- Streak tracking with animated flame indicator
- 8 fasting protocols: 16:8 through 48h + custom
- System tray with Show/Hide, Toggle Always-on-Top, Pill Mode, Quit
- Pill Mode: ultra-minimal floating timer overlay
- Right-click context menu navigation
- Fully frameless, draggable, transparent, always-on-top window
- Persistent state across restarts

---

## Known Bugs / Notes

- Level 13 rank title has a leading space: `" autophagy"` — likely a typo in `gamification.ts`
- Sound toggle exists in Settings but has no implementation (no audio files or playback code)
- "Quit" in the right-click context menu only calls `window.hide()`, not `app.exit()`. The app fully exits only from the system tray menu.
- `night_owl` achievement is checked with `nightOwlFasts: 1` in the condition call but `getAchievementStats()` always returns `nightOwlFasts: 0` — the check is therefore only triggered correctly on the very first Night Owl fast
