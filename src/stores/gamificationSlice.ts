import type { StateCreator } from "zustand";
import type { AchievementStats, UnlockedAchievement } from "./types";
import type { AppState } from "./index";

/**
 * Gamification slice — XP, streak, achievements, plus the pending-notification
 * queue that the toast system reads from.
 *
 * Most updates here happen as a side-effect of `endFast` (in the fasting
 * slice). The slice itself owns: the data, the read-only stats getter, and the
 * pending-notification dismissal actions.
 */
export interface GamificationSlice {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastFastDate: string | null;
  unlockedAchievements: UnlockedAchievement[];
  stageEntryHistory: number[];
  brokeStreak: boolean;
  maxLevelReached: number;
  nightOwlFasts: number;

  pendingAchievements: UnlockedAchievement[];
  pendingLevelUp: number | null;
  pendingStageUp: number | null;
  pendingMoodForFastId: string | null;

  getAchievementStats: () => AchievementStats;
  dismissAchievement: () => void;
  dismissLevelUp: () => void;
  dismissStageUp: () => void;
  setPendingStageUp: (stage: number | null) => void;
  setMoodForFast: (fastId: string, mood: number) => void;
  dismissMoodPrompt: () => void;
}

export const createGamificationSlice: StateCreator<AppState, [], [], GamificationSlice> = (
  set,
  get
) => ({
  totalXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastFastDate: null,
  unlockedAchievements: [],
  stageEntryHistory: [],
  brokeStreak: false,
  maxLevelReached: 1,
  nightOwlFasts: 0,

  pendingAchievements: [],
  pendingLevelUp: null,
  pendingStageUp: null,
  pendingMoodForFastId: null,

  getAchievementStats: () => {
    const state = get();
    return {
      totalFasts: state.completedFasts.length,
      totalHours: state.completedFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0),
      longestFast: state.completedFasts.reduce(
        (max, f) => Math.max(max, f.elapsedSeconds / 3600),
        0
      ),
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      levelsReached: state.maxLevelReached,
      autophagyCount: state.stageEntryHistory[3] || 0,
      brokeStreakThenRestarted: state.brokeStreak && state.currentStreak > 0,
      nightOwlFasts: state.nightOwlFasts,
      maxLevel: state.maxLevelReached,
      customHours: state.settings.customHours,
    };
  },

  dismissAchievement: () =>
    set((state) => ({ pendingAchievements: state.pendingAchievements.slice(1) })),
  dismissLevelUp: () => set({ pendingLevelUp: null }),
  dismissStageUp: () => set({ pendingStageUp: null }),
  setPendingStageUp: (stage) => set({ pendingStageUp: stage }),

  setMoodForFast: (fastId, mood) => {
    const clamped = Math.max(1, Math.min(5, Math.round(mood)));
    set((state) => ({
      completedFasts: state.completedFasts.map((f) =>
        f.id === fastId ? { ...f, mood: clamped } : f
      ),
      pendingMoodForFastId:
        state.pendingMoodForFastId === fastId ? null : state.pendingMoodForFastId,
    }));
  },
  dismissMoodPrompt: () => set({ pendingMoodForFastId: null }),
});
