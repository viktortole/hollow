/**
 * Backwards-compat re-export shim.
 *
 * The canonical store now lives in `src/stores/` split into per-domain slices.
 * This file exists so existing `import { useStore } from '../lib/store'` calls
 * across the codebase keep working without a sweep.
 *
 * NEW CODE should import from `src/stores` directly:
 *   import { useStore, type AppState } from '../stores';
 */

export {
  useStore,
  type AppState,
} from "../stores";

export type {
  CompletedFast,
  UnlockedAchievement,
  Theme,
  AppSettings,
  UndoSnapshot,
  ActivePanel,
} from "../stores/types";
