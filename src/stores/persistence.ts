import type { StoreApi } from "zustand";
import type { AppState } from "./index";

/**
 * HMR snapshot guard.
 *
 * Vite's HMR re-imports the store module on save. zustand's `create()` returns
 * a new store seeded with defaults. The save subscriber in `App.tsx` would
 * then fire and overwrite disk with those defaults — wiping any in-progress
 * fast.
 *
 * This guard snapshots the state to `sessionStorage` immediately before the
 * module disposes, then re-hydrates the new store on the next import. The
 * suspicious-save guard in `App.tsx` is a second line of defense.
 *
 * **Never remove either without an explicit replacement strategy.**
 */
export function installHmrSnapshotGuard(useStore: StoreApi<AppState>): void {
  if (!import.meta.hot) return;

  const SNAPSHOT_KEY = "__hollow_hmr_store_snapshot__";

  // Restore on every HMR re-import (runs once on initial load too — harmless if no snapshot).
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    if (raw) {
      const snap = JSON.parse(raw);
      // Use queueMicrotask so any subscribers attached this tick see the restore.
      queueMicrotask(() => {
        useStore.setState(snap, false);
        sessionStorage.removeItem(SNAPSHOT_KEY);
      });
    }
  } catch {
    // Ignore parse failures; defaults stand.
  }

  import.meta.hot.dispose(() => {
    try {
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(useStore.getState()));
    } catch {
      // Storage full / disabled — accept the loss rather than crash.
    }
  });
}
