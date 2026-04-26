import { load, Store } from "@tauri-apps/plugin-store";

let store: Store | null = null;

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load("hollow-data.json", { autoSave: 300, defaults: {} });
  }
  return store;
}

export interface PersistedState {
  isFasting: boolean;
  fastStartTimestamp: number | null;
  targetHours: number;
  protocol: string;
  totalXp: number;
  completedFasts: unknown[];
  currentStreak: number;
  longestStreak: number;
  lastFastDate: string | null;
  unlockedAchievements: unknown[];
  stageEntryHistory: number[];
  brokeStreak: boolean;
  maxLevelReached: number;
  settings: unknown;
  onboardingComplete: boolean;
  nightOwlFasts: number;
  windowX: number | null;
  windowY: number | null;
}

export async function loadState(): Promise<Partial<PersistedState>> {
  if (!isTauriRuntime()) return {};

  try {
    const s = await getStore();
    const keys = [
      "isFasting", "fastStartTimestamp", "targetHours", "protocol",
      "totalXp", "completedFasts", "currentStreak", "longestStreak",
      "lastFastDate", "unlockedAchievements", "stageEntryHistory",
      "brokeStreak", "maxLevelReached", "settings", "onboardingComplete",
      "nightOwlFasts", "windowX", "windowY",
    ];
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      const val = await s.get(key);
      if (val !== undefined) result[key] = val;
    }
    return result;
  } catch (e) {
    console.error("Failed to load state:", e);
    return {};
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  if (!isTauriRuntime()) return;

  try {
    const s = await getStore();
    await s.set("isFasting", state.isFasting);
    await s.set("fastStartTimestamp", state.fastStartTimestamp);
    await s.set("targetHours", state.targetHours);
    await s.set("protocol", state.protocol);
    await s.set("totalXp", state.totalXp);
    await s.set("completedFasts", state.completedFasts);
    await s.set("currentStreak", state.currentStreak);
    await s.set("longestStreak", state.longestStreak);
    await s.set("lastFastDate", state.lastFastDate);
    await s.set("unlockedAchievements", state.unlockedAchievements);
    await s.set("stageEntryHistory", state.stageEntryHistory);
    await s.set("brokeStreak", state.brokeStreak);
    await s.set("maxLevelReached", state.maxLevelReached);
    await s.set("settings", state.settings);
    await s.set("onboardingComplete", state.onboardingComplete);
    await s.set("nightOwlFasts", state.nightOwlFasts ?? 0);
    await s.set("windowX", state.windowX ?? null);
    await s.set("windowY", state.windowY ?? null);
    await s.save();
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export async function clearState(): Promise<void> {
  if (!isTauriRuntime()) return;

  try {
    const s = await getStore();
    await s.clear();
    await s.save();
  } catch (e) {
    console.error("Failed to clear state:", e);
  }
}
