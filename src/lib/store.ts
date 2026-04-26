import { create } from "zustand";
import { ACHIEVEMENTS, AchievementStats } from "./achievements";
import { levelFromXp, xpPerHour } from "./gamification";
import { getStageIndex, PROTOCOLS } from "./stages";

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
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export interface AppSettings {
  protocol: string;
  customHours: number;
  soundEnabled: boolean;
  alwaysOnTop: boolean;
  showPillMode: boolean;
  globalHotkey: string;
}

export interface AppState {
  // Fasting state
  isFasting: boolean;
  fastStartTimestamp: number | null;
  targetHours: number;
  protocol: string;

  // Stats
  totalXp: number;
  completedFasts: CompletedFast[];
  currentStreak: number;
  longestStreak: number;
  lastFastDate: string | null;
  unlockedAchievements: UnlockedAchievement[];
  stageEntryHistory: number[];
  brokeStreak: boolean;
  maxLevelReached: number;
  nightOwlFasts: number;

  // Window position persistence
  windowX: number | null;
  windowY: number | null;

  // Settings
  settings: AppSettings;

  // UI state
  activePanel: "main" | "settings" | "stats" | "achievements" | "onboarding";
  isPillMode: boolean;
  isDragging: boolean;

  // Pending notifications
  pendingAchievements: UnlockedAchievement[];
  pendingLevelUp: number | null;
  pendingStageUp: number | null;

  // Actions
  startFast: () => void;
  endFast: (completed: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setActivePanel: (panel: AppState["activePanel"]) => void;
  togglePillMode: () => void;
  toggleAlwaysOnTop: () => void;
  setIsDragging: (v: boolean) => void;
  dismissAchievement: () => void;
  dismissLevelUp: () => void;
  dismissStageUp: () => void;
  setPendingStageUp: (stage: number | null) => void;
  setWindowPosition: (x: number, y: number) => void;
  resetData: () => void;
  loadState: (state: Partial<AppState>) => void;
  getAchievementStats: () => AchievementStats;
  tick: () => void;
}

const defaultSettings: AppSettings = {
  protocol: "16_8",
  customHours: 16,
  soundEnabled: true,
  alwaysOnTop: true,
  showPillMode: false,
  globalHotkey: "Ctrl+Shift+F",
};

const defaultState = {
  isFasting: false,
  fastStartTimestamp: null,
  targetHours: 16,
  protocol: "16_8",
  totalXp: 0,
  completedFasts: [],
  currentStreak: 0,
  longestStreak: 0,
  lastFastDate: null,
  unlockedAchievements: [],
  stageEntryHistory: [],
  brokeStreak: false,
  maxLevelReached: 1,
  nightOwlFasts: 0,
  windowX: null,
  windowY: null,
  settings: defaultSettings,
  activePanel: "onboarding" as const,
  isPillMode: false,
  isDragging: false,
  pendingAchievements: [],
  pendingLevelUp: null,
  pendingStageUp: null,
};

function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function checkStreak(lastDate: string | null, today: string): number {
  if (!lastDate) return 1;
  const last = new Date(lastDate);
  const curr = new Date(today);
  const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 0; // same day
  if (diffDays === 1) return 1; // consecutive
  return -1; // broke
}

export const useStore = create<AppState>((set, get) => ({
  ...defaultState,

  loadState: (state) => {
    set(state);
  },

  startFast: () => {
    const { protocol, settings } = get();
    let targetHours = settings.customHours || 16;
    const protoMap: Record<string, number> = {
      "16_8": 16, "18_6": 18, "20_4": 20, "omad": 23, "24h": 24, "36h": 36, "48h": 48,
    };
    if (protocol !== "custom" && protoMap[protocol]) {
      targetHours = protoMap[protocol];
    }

    set({
      isFasting: true,
      fastStartTimestamp: Date.now(),
      targetHours,
    });
  },

  endFast: (completed) => {
    const state = get();
    if (!state.fastStartTimestamp) return;

    const endTime = Date.now();
    const elapsedSeconds = Math.floor((endTime - state.fastStartTimestamp) / 1000);
    const elapsedHours = elapsedSeconds / 3600;
    const stageIndex = getStageIndex(elapsedHours);
    const stageHistory = [...state.stageEntryHistory];

    // Track stage entries
    if (stageHistory[stageIndex] !== undefined) {
      stageHistory[stageIndex]++;
    } else {
      stageHistory[stageIndex] = 1;
    }

    // Calculate XP
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

    // Streak calculation
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

    // Check achievements (nightOwlFasts stat must be updated before calling getAchievementStats)
    const hour = new Date(endTime).getHours();
    const newNightOwlFasts = (completed && elapsedHours >= state.targetHours && hour >= 2 && hour < 4)
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
    });
  },

  tick: () => {
    // Called every second to check for stage transitions
    const state = get();
    if (!state.isFasting || !state.fastStartTimestamp) return;

    const elapsedHours = (Date.now() - state.fastStartTimestamp) / (1000 * 3600);
    const currentStage = getStageIndex(elapsedHours);

    // Check if we just entered a new stage (from previous stage history)
    // The actual stage-up notification is handled by watching stage changes
    // We track this by comparing elapsed hours threshold
  },

  getAchievementStats: () => {
    const state = get();
    return {
      totalFasts: state.completedFasts.length,
      totalHours: state.completedFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0),
      longestFast: state.completedFasts.reduce((max, f) => Math.max(max, f.elapsedSeconds / 3600), 0),
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

  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      const nextProtocol = newSettings.protocol ?? state.protocol;
      const protocolConfig = PROTOCOLS.find((protocol) => protocol.id === nextProtocol);
      const targetHours = nextProtocol === "custom"
        ? settings.customHours
        : protocolConfig?.hours ?? state.targetHours;

      return {
        settings,
        protocol: nextProtocol,
        targetHours,
      };
    });
  },

  setActivePanel: (panel) => set({ activePanel: panel }),

  togglePillMode: () => set((state) => ({ isPillMode: !state.isPillMode })),

  toggleAlwaysOnTop: () => {
    set((state) => {
      const newSettings = { ...state.settings, alwaysOnTop: !state.settings.alwaysOnTop };
      return { settings: newSettings };
    });
  },

  setIsDragging: (v) => set({ isDragging: v }),

  dismissAchievement: () => set((state) => ({
    pendingAchievements: state.pendingAchievements.slice(1),
  })),

  dismissLevelUp: () => set({ pendingLevelUp: null }),

  dismissStageUp: () => set({ pendingStageUp: null }),

  setPendingStageUp: (stage) => set({ pendingStageUp: stage }),

  setWindowPosition: (x, y) => set({ windowX: x, windowY: y }),

  resetData: () => set({
    ...defaultState,
    settings: get().settings,
    activePanel: "main",
    nightOwlFasts: 0,
    windowX: null,
    windowY: null,
    // FIX: also clear pending notifications so no ghost toasts appear after reset
    pendingAchievements: [],
    pendingLevelUp: null,
    pendingStageUp: null,
  }),
}));
