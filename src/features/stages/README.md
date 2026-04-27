# features/stages

Metabolic stage definitions, icons, and visualizations. The 6 stages the user passes through during a fast: **Fed · Early Fast · Fat Burning · Autophagy · Deep Ketosis · Stem Cell**.

## Public API

| Export | Purpose |
|---|---|
| `STAGE_ICONS` | `Record<stageId, IconComponent>`. Keep in sync with `STAGES` in `src/lib/stages.ts`. |
| `FedIcon`, `EarlyFastIcon`, `FatBurningIcon`, `AutophagyIcon`, `DeepKetosisIcon`, `StemCellIcon` | Individual SVG components, all 14×14, 1.5 stroke, `currentColor`. |

## Where stage data lives

`src/lib/stages.ts` holds the `STAGES[]` array — pure data. Each stage has:

- `id` — string used as key in `STAGE_ICONS`
- `name`, `description` — UI labels
- `hoursMin`, `hoursMax` — time range
- `color`, `glowColor` — semantic stage tint
- `xpMultiplier` — gamification weight

## Adding a new stage

1. Add an entry to `STAGES[]` in `src/lib/stages.ts`.
2. Create an icon component in `stageIcons.tsx` (14×14, 1.5 stroke, `currentColor`).
3. Add it to the `STAGE_ICONS` map.
4. Done — the ring marks (Phase 4), `<StageIndicator />`, and stage detection all read from `STAGES`.

## Where stage visuals render

- **Stage marks crossing the ring** — `src/components/CircularProgress.tsx` accepts a `marks?: RingMark[]` prop. `FastingWidget.tsx` computes them from `STAGES` and the live elapsed hours and passes them in. (Earlier design used floating icon plates orbiting the ring; the radial tick-segment design replaced them — see `docs/DESIGN-SYSTEM.md` "Stage marks".)
- **Stage indicator strip** (current stage name + xp-rate chip) — `src/features/stages/StageIndicator.tsx`.
- **Stage-up toast** — routed through `src/features/notifications/ToastContainer.tsx`'s priority queue, gated by `settings.notifyStageUp`.
