import type { StateCreator } from "zustand";
import { ACHIEVEMENTS } from "../lib/achievements";
import { levelFromXp, xpPerHour } from "../lib/gamification";
import { getStageIndex, PROTOCOLS } from "../lib/stages";
import type { AppState } from "./index";
import type { CompletedFast, UndoSnapshot, UnlockedAchievement } from "./types";
import { checkStreak, getDateString } from "./types";

/**
 * Fasting slice — the active fast state, start/end actions, and the undo
 * snapshot pipeline. `endFast` is intentionally housed here (not in
 * gamification) because the action TRIGGERS gamification updates rather than
 * being driven by them.
 */
export interface FastingSlice {
  isFasting: boolean;
  fastStartTimestamp: number | null;
  targetHours: number;
  protocol: string;
  completedFasts: CompletedFast[];
  undoSnapshot: UndoSnapshot | null;

  startFast: () => void;
  endFast: (completed: boolean) => void;
  setFastStartTimestamp: (ts: number) => void;
  undoLastCompletion: () => void;
  clearUndoSnapshot: () => void;
}

export const createFastingSlice: StateCreator<AppState, [], [], FastingSlice> = (set, get) => ({
  isFasting: false,
  fastStartTimestamp: null,
  targetHours: 16,
  protocol: "16_8",
  completedFasts: [],
  undoSnapshot: null,

  startFast: () => {
    const { protocol, settings } = get();
    let targetHours = settings.customHours || 16;
    const protoMap: Record<string, number> = {
      "16_8": 16, "18_6": 18, "20_4": 20, "omad": 23, "24h": 24, "36h": 36, "48h": 48,
    };
    if (protocol !== "custom" && protoMap[protocol]) {
      targetHours = protoMap[protocol];
    }
    set({ isFasting: true, fastStartTimestamp: Date.now(), targetHours });
  },

  setFastStartTimestamp: (ts) => {
    // Adjust the start anchor for accuracy (user forgot to start, etc).
    // Clamped to no-future (max = now) and no >7-day-old (sanity).
    const state = get();
    if (!state.isFasting) return;
    const now = Date.now();
    const clamped = Math.min(now, Math.max(ts, now - 7 * 24 * 3600 * 1000));
    set({ fastStartTimestamp: clamped });
  },

  endFast: (completed) => {
    const state = get();
    if (!state.fastStartTimestamp) return;

    const endTime = Date.now();
    const elapsedSeconds = Math.floor((endTime - state.fastStartTimestamp) / 1000);
    const elapsedHours = elapsedSeconds / 3600;
    const stageIndex = getStageIndex(elapsedHours);

    const stageHistory = [...state.stageEntryHistory];
    stageHistory[stageIndex] = (stageHistory[stageIndex] ?? 0) + 1;

    let xpEarned = Math.floor(elapsedHours * xpPerHour(stageIndex));
    if (completed && elapsedHours >= state.targetHours) {
      xpEarned = Math.floor(xpEarned * 1.25); // 25% bonus for hitting target
    }
    xpEarned = Math.max(xpEarned, 10); // minimum 10 XP

    const newTotalXp = state.totalXp + xpEarned;
    const newLevel = levelFromXp(newTotalXp);
    const prevLevel = state.maxLevelReached;
    const maxLevel = Math.max(newLevel, prevLevel);

    const completedFast: CompletedFast = {
      id: `fast_${endTime}`,
      startTime: state.fastStartTimestamp,
      endTime,
      targetHours: state.targetHours,
      elapsedSeconds,
      protocol: state.protocol,
      xpEarned,
      stageReached: stageIndex,
      completed,
    };

    const today = getDateString(endTime);
    const streakResult = checkStreak(state.lastFastDate, today);
    let newStreak = state.currentStreak;
    let newLongest = state.longestStreak;
    let brokeStreak = state.brokeStreak;

    if (completed && elapsedHours >= state.targetHours) {
      if (streakResult === 1) {
        newStreak = state.currentStreak + 1;
      } else if (streakResult === -1) {
        if (state.currentStreak > 0) brokeStreak = true;
        newStreak = 1;
      } else if (streakResult === 0 && state.lastFastDate === null) {
        newStreak = 1;
      }
      newLongest = Math.max(newLongest, newStreak);
    }

    // nightOwlFasts must update before achievement evaluation reads it.
    const hour = new Date(endTime).getHours();
    const newNightOwlFasts =
      completed && elapsedHours >= state.targetHours && hour >= 2 && hour < 4
        ? state.nightOwlFasts + 1
        : state.nightOwlFasts;

    const achievementStats = get().getAchievementStats();
    const newUnlocks: UnlockedAchievement[] = [];
    const existingIds = new Set(state.unlockedAchievements.map((a) => a.id));
    for (const achievement of ACHIEVEMENTS) {
      if (!existingIds.has(achievement.id) && achievement.condition(achievementStats)) {
        newUnlocks.push({ id: achievement.id, unlockedAt: endTime });
      }
    }

    const undoSnapshot: UndoSnapshot = {
      fastStartTimestamp: state.fastStartTimestamp,
      targetHours: state.targetHours,
      protocol: state.protocol,
      completedFastId: completedFast.id,
      xpDelta: xpEarned,
      streakBefore: state.currentStreak,
      longestStreakBefore: state.longestStreak,
      lastFastDateBefore: state.lastFastDate,
      maxLevelBefore: state.maxLevelReached,
      achievementsBefore: state.unlockedAchievements,
      nightOwlFastsBefore: state.nightOwlFasts,
      stageEntryHistoryBefore: state.stageEntryHistory,
      expiresAt: Date.now() + 8000,
    };

    set({
      isFasting: false,
      fastStartTimestamp: null,
      totalXp: newTotalXp,
      completedFasts: [completedFast, ...state.completedFasts].slice(0, 100),
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastFastDate: today,
      unlockedAchievements: [...state.unlockedAchievements, ...newUnlocks],
      stageEntryHistory: stageHistory,
      maxLevelReached: maxLevel,
      brokeStreak,
      nightOwlFasts: newNightOwlFasts,
      pendingAchievements: newUnlocks,
      pendingLevelUp: newLevel > prevLevel ? newLevel : null,
      pendingStageUp: null,
      // Mood prompt fires whether the fast was completed or ended-early — both data points.
      pendingMoodForFastId: completedFast.id,
      undoSnapshot,
    });
  },

  undoLastCompletion: () => {
    const snap = get().undoSnapshot;
    if (!snap) return;
    set((state) => ({
      isFasting: true,
      fastStartTimestamp: snap.fastStartTimestamp,
      targetHours: snap.targetHours,
      protocol: snap.protocol,
      totalXp: Math.max(0, state.totalXp - snap.xpDelta),
      completedFasts: state.completedFasts.filter((f) => f.id !== snap.completedFastId),
      currentStreak: snap.streakBefore,
      longestStreak: snap.longestStreakBefore,
      lastFastDate: snap.lastFastDateBefore,
      unlockedAchievements: snap.achievementsBefore,
      stageEntryHistory: snap.stageEntryHistoryBefore,
      maxLevelReached: snap.maxLevelBefore,
      nightOwlFasts: snap.nightOwlFastsBefore,
      pendingAchievements: [],
      pendingLevelUp: null,
      pendingMoodForFastId: null,
      undoSnapshot: null,
    }));
  },

  clearUndoSnapshot: () => set({ undoSnapshot: null }),
});

// PROTOCOLS used for type narrowing only — keeps tree-shake stable.
export type { CompletedFast };
void PROTOCOLS;
