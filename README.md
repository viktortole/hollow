# Hollow

> An editorial-minimalist intermittent fasting widget. Track fasts, earn XP, unlock achievements. Desktop and mobile.

Hollow lives in a small always-on-top window on your desktop (or as a native app on your phone). It anchors your fast, shows the metabolic stages you're moving through, and turns discipline into a quiet game.

Built with **Tauri 2 + React 19 + Vite + zustand**. Single binary on Windows / macOS / Linux. Native APK / IPA on Android / iOS.

---

## Features

- **Fasting timer** with circular progress ring and per-stage marks (Fed → Stem Cell)
- **Six metabolic stages** with descriptive copy and stage-specific XP multipliers
- **Multiple protocols** (16:8, 18:6, 20:4, OMAD, 36h, 48h, custom 1–168h)
- **XP, levels, ranks** earned by hours fasted, weighted by stage depth
- **Achievement system** with rarity tiers (common → legendary) and "within reach" anticipation
- **Streak tracking** with weekly band, multipliers (×1.1 → ×2), and personal-best detection
- **Hydration tracker** with daily auto-reset
- **Pill mode** — shrink to a 220×56 floating timer for unobtrusive desktop monitoring
- **Light + dark themes** (Architectural Cream / Warm Graphite)
- **Editable fast start** — drag-time-back to log a fast you forgot to start
- **Undo snackbar** — 8s window to restore an accidentally-ended fast
- **No accounts, no cloud, no telemetry.** All data lives in a single JSON file on your machine.

---

## Quick start

```bash
# Install
npm install

# Run desktop dev
npm run dev          # Vite only
npm run tauri dev    # Tauri shell + Vite

# Typecheck
npm run typecheck

# Build desktop
npm run tauri build

# Android
npm run android:dev      # AVD (requires `tauri android init` first)
npm run android:build    # Debug APK
```

Desktop data path: `%APPDATA%/com.hollow.fasting-widget/hollow-data.json` (Windows) · `~/Library/Application Support/com.hollow.fasting-widget/` (macOS) · `~/.local/share/com.hollow.fasting-widget/` (Linux).

---

## Architecture at a glance

```
src/
  features/        # Feature-folders, barrel-exported. One concern each.
  stores/ + lib/   # State (zustand), pure data, pure math
  hooks/           # Cross-feature hooks (useFastingClock = the ONE setInterval)
  platform/        # Single seam between desktop and mobile
  styles/          # Tokens → utilities → keyframes → themes (light/dark)
src-tauri/         # Rust shell, capabilities (split per-platform)
docs/              # PRD, ROADMAP, ARCHITECTURE, DESIGN-SYSTEM, AGENT-HANDOFF
```

**Read `docs/AGENT-HANDOFF.md` first** if you (or an AI agent) are about to touch this codebase. It contains the operating principles, the forbidden-patterns table, and the where-to-look map.

---

## Design philosophy

Editorial typography over chrome. Cream paper + charcoal ink + a single brass-amber accent. No gradients on buttons, no drop shadows on cards, no neon. Spacing separates; tokens carry the meaning. Geist Sans + Geist Mono.

See `docs/DESIGN-SYSTEM.md` for the full token reference and don't-do list.

---

## License

MIT — see [`LICENSE`](./LICENSE).
