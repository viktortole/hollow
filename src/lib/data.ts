import { load, Store } from "@tauri-apps/plugin-store";

/**
 * Tauri-store persistence layer.
 *
 * Single JSON file at the OS-conventional app-data dir. We persist a
 * field-by-field projection of `AppState` (not the full state) so ephemeral UI
 * state — `activePanel`, `isPillMode`, pending notifications,
 * undo snapshot — never round-trips to disk.
 *
 * Schema: keep `PERSISTED_KEYS` and `PersistedState` in sync. Everything in
 * the keys list gets read on load and written on save. Adding a field is one
 * edit + one type entry — no separate save/load case statements.
 */

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
  hydrationToday: number;
  hydrationGoalGlasses: number;
  hydrationLastResetDate: string | null;
  hydrationGoalCelebratedDate: string | null;
}

/**
 * Single source of truth for what gets persisted. Adding a field?
 *   1. Add it to `PersistedState` above.
 *   2. Add the key string here.
 *   3. Done — `loadState` reads it, `saveState` writes it.
 */
const PERSISTED_KEYS = [
  "isFasting",
  "fastStartTimestamp",
  "targetHours",
  "protocol",
  "totalXp",
  "completedFasts",
  "currentStreak",
  "longestStreak",
  "lastFastDate",
  "unlockedAchievements",
  "stageEntryHistory",
  "brokeStreak",
  "maxLevelReached",
  "settings",
  "onboardingComplete",
  "nightOwlFasts",
  "windowX",
  "windowY",
  "hydrationToday",
  "hydrationGoalGlasses",
  "hydrationLastResetDate",
  "hydrationGoalCelebratedDate",
] as const satisfies readonly (keyof PersistedState)[];

export async function loadState(): Promise<Partial<PersistedState>> {
  if (!isTauriRuntime()) return {};
  try {
    const s = await getStore();
    const result: Partial<PersistedState> = {};
    for (const key of PERSISTED_KEYS) {
      const val = await s.get(key);
      if (val !== undefined) (result as Record<string, unknown>)[key] = val;
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
    // Loop in declared order so disk writes are deterministic between releases.
    for (const key of PERSISTED_KEYS) {
      const value = state[key];
      // `nightOwlFasts ?? 0` was the only previous defaulting; same defaulting still happens
      // upstream in the slice's defaults so we don't repeat it here.
      await s.set(key, value ?? null);
    }
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
