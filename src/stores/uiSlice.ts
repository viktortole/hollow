import type { StateCreator } from "zustand";
import { PROTOCOLS } from "../lib/stages";
import type { AppSettings, ActivePanel } from "./types";
import { defaultSettings } from "./types";
import type { AppState } from "./index";

/**
 * UI slice — settings, active panel, pill mode, drag state, window position,
 * and the cross-cutting onboarding flag. Also owns the cross-cutting actions
 * (loadState, resetData, exportData, importData) because they touch every
 * other slice and have no natural home elsewhere.
 */
export interface UISlice {
  settings: AppSettings;
  onboardingComplete: boolean;

  activePanel: ActivePanel;
  isPillMode: boolean;

  windowX: number | null;
  windowY: number | null;

  updateSettings: (settings: Partial<AppSettings>) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setOnboardingComplete: (v: boolean) => void;
  togglePillMode: () => void;
  toggleAlwaysOnTop: () => void;
  setWindowPosition: (x: number, y: number) => void;

  loadState: (state: Partial<AppState>) => void;
  resetData: () => void;
  exportData: () => string;
  importData: (json: string) => { ok: true } | { ok: false; error: string };
}

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
  settings: defaultSettings,
  onboardingComplete: false,

  activePanel: "onboarding",
  isPillMode: false,

  windowX: null,
  windowY: null,

  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      const nextProtocol = newSettings.protocol ?? state.protocol;
      const protocolConfig = PROTOCOLS.find((p) => p.id === nextProtocol);
      const targetHours =
        nextProtocol === "custom"
          ? settings.customHours
          : protocolConfig?.hours ?? state.targetHours;
      return { settings, protocol: nextProtocol, targetHours };
    });
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  togglePillMode: () => set((state) => ({ isPillMode: !state.isPillMode })),

  toggleAlwaysOnTop: () => {
    set((state) => ({ settings: { ...state.settings, alwaysOnTop: !state.settings.alwaysOnTop } }));
  },

  setWindowPosition: (x, y) => set({ windowX: x, windowY: y }),

  loadState: (state) => set(state),

  resetData: () => {
    // Preserve current settings (theme, notifications, etc) — only blow away progress.
    const settings = get().settings;
    set({
      isFasting: false,
      fastStartTimestamp: null,
      targetHours: 16,
      protocol: "16_8",
      completedFasts: [],
      undoSnapshot: null,
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
      hydrationToday: 0,
      hydrationGoalGlasses: 8,
      hydrationLastResetDate: null,
      hydrationGoalCelebratedDate: null,
      pendingHydrationGoal: false,
      settings,
      onboardingComplete: true,
      activePanel: "main",
      isPillMode: false,
      windowX: null,
      windowY: null,
    });
  },

  exportData: () => {
    const s = get();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        isFasting: s.isFasting,
        fastStartTimestamp: s.fastStartTimestamp,
        targetHours: s.targetHours,
        protocol: s.protocol,
        totalXp: s.totalXp,
        completedFasts: s.completedFasts,
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        lastFastDate: s.lastFastDate,
        unlockedAchievements: s.unlockedAchievements,
        stageEntryHistory: s.stageEntryHistory,
        brokeStreak: s.brokeStreak,
        maxLevelReached: s.maxLevelReached,
        nightOwlFasts: s.nightOwlFasts,
        settings: s.settings,
        onboardingComplete: s.onboardingComplete,
        hydrationToday: s.hydrationToday,
        hydrationGoalGlasses: s.hydrationGoalGlasses,
        hydrationLastResetDate: s.hydrationLastResetDate,
        hydrationGoalCelebratedDate: s.hydrationGoalCelebratedDate,
      },
    };
    return JSON.stringify(payload, null, 2);
  },

  importData: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || !parsed.data) {
        return { ok: false, error: "Not a Hollow backup file." };
      }
      if (parsed.version !== 1) {
        return { ok: false, error: `Unsupported backup version: ${parsed.version}` };
      }
      const d = parsed.data as Partial<AppState>;
      set({
        ...d,
        // Ephemeral / pending state always reset from imports — the import is a snapshot, not a session continuation.
        activePanel: "main",
        isPillMode: false,
        pendingAchievements: [],
        pendingLevelUp: null,
        pendingStageUp: null,
        pendingMoodForFastId: null,
        pendingHydrationGoal: false,
        undoSnapshot: null,
        settings: { ...defaultSettings, ...(d.settings as AppSettings | undefined) },
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON." };
    }
  },
});
