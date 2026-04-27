# features/fasting

Owns the user's primary loop: **starting, running, ending** a fast. The composition root for the active-fast UI.

## Public API (via `index.ts` barrel)

| Export | Purpose |
|---|---|
| `<MoodPrompt />` | Post-fast mood capture overlay. Auto-shown when `pendingMoodForFastId` is set. Gated by `settings.promptMood`. |
| `<LastFastCard />` | Idle-state card showing the most recent completed fast (duration, mood emoji, XP). No-ops when no completed fasts. |
| `<FirstMilestoneCard />` | Idle-state card teasing the next metabolic transition the user will hit (`STAGES[1]`). |
| `<HeaderBar />` | Status pill + protocol stamp at the top of the fasting widget. |
| `<ControlBar />` | 4-state action bar: idle (Start) · active (End + Complete-disabled) · goal-reached (End + Keep Going + Complete) · extended (single End Extended Fast +Xh). |
| `<TimestampsRow />` | "Started X · Ends Y" with inline pencil affordance opening the start-time adjuster popover (Esc-dismissable). |
| `<RingDisplay />` | The ring + center timer + projected timestamps. |
| `<UndoSnackbar />` | 8-second floating "Continue" button after End/Complete that restores the fast in full. |
| `<ProtocolPicker />` | Idle-only chip + dropdown for switching protocol from the home screen. Custom-hours input gated 1–168. |
| `<PersonalBestOverlay />` | Floating gold-bordered card that appears when the current fast crosses your previous longest. Driven by `usePersonalBest`. |

## Internal-only (do NOT deep-import)

Files not in `index.ts` are implementation details and may move/rename at any time.

## Where the orchestration lives

The composition root is **`src/components/FastingWidget.tsx`** (~294 lines) — it composes the extracted pieces with the ring, header, timestamps, action bar, undo snackbar, mood prompt, and the ambient celebration overlays.

The fasting clock subscription comes from `src/hooks/useFastingClock.ts`. The stage-transition detector + sound cooldown live as a `useEffect([elapsed])` inside FastingWidget itself.

## Read-this-first conventions

- The **only** `setInterval` for the fasting clock lives in `src/hooks/useFastingClock.ts`. Never start another. (UndoSnackbar's snackbar-countdown setInterval is allowed — it's a UI countdown, not a fasting clock.)
- All Tauri-platform calls go through `src/platform/`. Never import from `@tauri-apps/api/window` here.
- Stage definitions are in `src/lib/stages.ts`. To add a stage: edit there + `src/features/stages/stageIcons.tsx`.
- All fasting-state actions live in `src/stores/fastingSlice.ts`. `endFast` is the cross-slice orchestrator that also writes to gamification.
- See `docs/AGENT-HANDOFF.md` for the global Where-to-look table.
