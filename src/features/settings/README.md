# features/settings

Owns the **settings panel** — every persisted preference the user can tweak.

## Public API

| Export | Purpose |
|---|---|
| `<SettingsPanel />` | Full-window panel. Mounted by `App.tsx` when `activePanel === "settings"`. Renders 7 sections built from the local `Section` / `Row` / `Toggle` / `Stepper` / `SegmentedToggle` primitives. |

## The 7 sections

1. **Fasting** — protocol selection + custom-hours input
2. **Hydration** — daily glass goal stepper
3. **Appearance** — theme (light / dark)
4. **Window** — always-on-top toggle (desktop only)
5. **Sound** — master sound toggle (gates stage-up + completion sounds)
6. **Notifications** — 5 per-type toggles (`notifyLevelUp`, `notifyAchievement`, `notifyStageUp`, `notifyHydrationGoal`, `promptMood`)
7. **Data** — reset-all-data button with confirm step

## Adding a new setting

1. Add the field + default value to `AppSettings` in `src/lib/store.ts`.
2. Add a `<Row>` in the appropriate `<Section>` here, wired via `updateSettings({...})`.
3. Persistence is automatic — the `App.tsx` save subscriber spreads `state.settings` to disk.
4. Read it from any component via `useStore((s) => s.settings.yourField)`.

## Read-this-first conventions

- All controls use the local primitives (`Toggle`, `Stepper`, etc.) — never inline a raw `<input>`. The primitives carry consistent spacing, focus rings, and theme-aware colors.
- Settings that depend on platform (window controls, tray) should branch via `usePlatform()` or `isMobile()` and gracefully no-op rather than render disabled controls.
- "Reset All Data" wipes everything via `resetAllData()` — keep the confirm step in place.
