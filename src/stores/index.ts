/**
 * Combined Hollow store. Single `useStore` API for every consumer; internal
 * state is split into per-domain slices for organization.
 *
 * Slices live in:
 *   - fastingSlice.ts       — active fast, start/end, undo snapshot
 *   - gamificationSlice.ts  — XP, streak, achievements, pending notifications
 *   - hydrationSlice.ts     — daily glass count + auto-reset
 *   - uiSlice.ts            — settings, panel, pill mode, window, cross-cutting actions
 *
 * Add a new field by editing the appropriate slice. Cross-slice actions go in
 * the slice that drives them (e.g. `endFast` lives in fasting because it
 * triggers gamification updates, not the other way around).
 */

import { create } from "zustand";
import { createFastingSlice, type FastingSlice } from "./fastingSlice";
import { createGamificationSlice, type GamificationSlice } from "./gamificationSlice";
import { createHydrationSlice, type HydrationSlice } from "./hydrationSlice";
import { createUISlice, type UISlice } from "./uiSlice";
import { installHmrSnapshotGuard } from "./persistence";

export type AppState = FastingSlice & GamificationSlice & HydrationSlice & UISlice;

export const useStore = create<AppState>()((...a) => ({
  ...createFastingSlice(...a),
  ...createGamificationSlice(...a),
  ...createHydrationSlice(...a),
  ...createUISlice(...a),
}));

installHmrSnapshotGuard(useStore);

// Re-export shared types so consumers don't need to deep-import from ./types.
export type {
  CompletedFast,
  UnlockedAchievement,
  Theme,
  AppSettings,
  UndoSnapshot,
  ActivePanel,
} from "./types";
