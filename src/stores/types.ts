/**
 * Shared types used across slices. Pure data — no behavior, no zustand.
 *
 * Add a new field here only if it's actually shared between two or more slices.
 * Slice-local types stay inside their slice file.
 */

import type { AchievementStats } from "../lib/achievements";

export interface CompletedFast {
  id: string;
  startTime: number;
  endTime: number;
  targetHours: number;
  elapsedSeconds: number;
  protocol: string;
  xpEarned: number;
  stageReached: number;
  completed: boolean;
  /** 1-5 user-rated mood after the fast. Optional. */
  mood?: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export type Theme = "light" | "dark";

export interface AppSettings {
  protocol: string;
  customHours: number;
  soundEnabled: boolean;
  alwaysOnTop: boolean;
  theme: Theme;
  notifyLevelUp: boolean;
  notifyAchievement: boolean;
  notifyStageUp: boolean;
  notifyHydrationGoal: boolean;
  promptMood: boolean;
}

/** UndoSnapshot captures the pre-end state so the user can recover an accidentally-completed fast. */
export interface UndoSnapshot {
  fastStartTimestamp: number;
  targetHours: number;
  protocol: string;
  completedFastId: string;
  xpDelta: number;
  streakBefore: number;
  longestStreakBefore: number;
  lastFastDateBefore: string | null;
  maxLevelBefore: number;
  achievementsBefore: UnlockedAchievement[];
  nightOwlFastsBefore: number;
  stageEntryHistoryBefore: number[];
  expiresAt: number;
}

export type ActivePanel =
  | "main"
  | "settings"
  | "stats"
  | "achievements"
  | "onboarding";

/** Re-export so slices can reference without a deep import. */
export type { AchievementStats };

export const defaultSettings: AppSettings = {
  protocol: "16_8",
  customHours: 16,
  soundEnabled: true,
  alwaysOnTop: true,
  theme: "dark",
  notifyLevelUp: true,
  notifyAchievement: true,
  notifyStageUp: true,
  notifyHydrationGoal: true,
  promptMood: true,
};

/** Helpers used across slices. Tiny enough to inline; here for one source of truth. */
export function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

/**
 * Returns +1 if `today` is consecutive with `lastDate`, 0 if same day, -1 if a gap broke
 * the streak. `null` lastDate counts as a fresh start (returns 1).
 */
export function checkStreak(lastDate: string | null, today: string): number {
  if (!lastDate) return 1;
  const last = new Date(lastDate);
  const curr = new Date(today);
  const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 0;
  if (diffDays === 1) return 1;
  return -1;
}
