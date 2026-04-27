import type { StateCreator } from "zustand";
import { getDateString } from "./types";
import type { AppState } from "./index";

/**
 * Hydration slice — daily glass count with auto-reset on date rollover.
 *
 * The reset is lazy: the count is interpreted as "today's count" only when
 * `hydrationLastResetDate` matches today's local date. Components reading the
 * count must mirror this check (already factored into HydrationCard).
 */
export interface HydrationSlice {
  hydrationToday: number;
  hydrationGoalGlasses: number;
  hydrationLastResetDate: string | null;
  hydrationGoalCelebratedDate: string | null;
  pendingHydrationGoal: boolean;

  incrementHydration: () => void;
  decrementHydration: () => void;
  setHydrationGoal: (n: number) => void;
  dismissHydrationGoal: () => void;
}

export const createHydrationSlice: StateCreator<AppState, [], [], HydrationSlice> = (
  set,
  get
) => ({
  hydrationToday: 0,
  hydrationGoalGlasses: 8,
  hydrationLastResetDate: null,
  hydrationGoalCelebratedDate: null,
  pendingHydrationGoal: false,

  incrementHydration: () => {
    const state = get();
    const today = getDateString(Date.now());
    if (state.hydrationLastResetDate !== today) {
      // Date rolled over since the last touch — reset to 1 (this glass) for today.
      set({ hydrationToday: 1, hydrationLastResetDate: today });
      return;
    }
    const goal = state.hydrationGoalGlasses || 8;
    const cap = goal * 2;
    const next = Math.min(state.hydrationToday + 1, cap);
    const justReachedGoal =
      state.hydrationToday < goal &&
      next >= goal &&
      state.hydrationGoalCelebratedDate !== today;
    set({
      hydrationToday: next,
      ...(justReachedGoal && {
        pendingHydrationGoal: true,
        hydrationGoalCelebratedDate: today,
      }),
    });
  },

  decrementHydration: () => {
    const state = get();
    const today = getDateString(Date.now());
    if (state.hydrationLastResetDate !== today) {
      set({ hydrationToday: 0, hydrationLastResetDate: today });
      return;
    }
    set({ hydrationToday: Math.max(0, state.hydrationToday - 1) });
  },

  setHydrationGoal: (n) => {
    set({ hydrationGoalGlasses: Math.max(1, Math.min(20, Math.round(n))) });
  },

  dismissHydrationGoal: () => set({ pendingHydrationGoal: false }),
});
