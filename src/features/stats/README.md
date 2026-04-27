# features/stats

Owns the **stats panel** — long-form historical view of completed fasts.

## Public API

| Export | Purpose |
|---|---|
| `<StatsPanel />` | Full-window panel. Mounted by `App.tsx` when `activePanel === "stats"`. Aggregates `completedFasts` into the visible tiles + recent-fasts list. |

## What it shows

- **Header tiles**: total fasts, total hours fasted, total XP, longest fast.
- **Recent fasts list**: scrollable, newest-first. Each row shows duration, mood emoji, XP earned, and the relative completion date (`Today`, `Yesterday`, `3d ago`, …).

## Where the math lives

- Aggregations are derived in-component from `useStore((s) => s.completedFasts)`. Pure computation, no caching beyond `useMemo`.
- Date formatting goes through `src/lib/time.ts` (`formatRelativeDay`, `formatHoursMinutes`).
- Streak math is in `src/lib/streak.ts` if needed (`getRecentStreakDays`).

## What this folder does NOT do

- Per-fast detail editing — completed fasts are immutable in the current scope.
- Chart rendering. Trend visualizations are deferred to a future "Pro analytics" phase (see `docs/ROADMAP.md`).
- Export. CSV / Apple Health / Google Fit exports are roadmapped, not implemented.

## Read-this-first conventions

- All numbers use `font-mono` + `tabular-nums` so columns line up.
- Empty state ("No fasts yet") should encourage a first fast, not apologize for being empty.
- Don't add filters / pagination without revisiting the panel size — Hollow is a 400×720 widget; a thousand-row table doesn't fit.
