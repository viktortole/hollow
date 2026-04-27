/**
 * Mobile platform adapter — iOS / Android.
 *
 * All operations are safe no-ops. The frontend can call `setPillSize`,
 * `toggleAlwaysOnTop`, etc unconditionally without platform branching.
 *
 * See docs/ARCHITECTURE.md "Platform adapter contract".
 */

import type { PlatformAdapter } from "../types";

const noopUnlisten = () => {};

export const platform: PlatformAdapter = {
  window: {
    async setPillSize() {},
    async restorePreviousSize() {},
    async setPosition() {},
    async onMoved() {
      return noopUnlisten;
    },
    async onFocusChanged(cb) {
      // Bridge the document `visibilitychange` event so focus-recovery still works on mobile.
      if (typeof document === "undefined") return noopUnlisten;
      const handler = () => cb(document.visibilityState === "visible");
      document.addEventListener("visibilitychange", handler);
      return () => document.removeEventListener("visibilitychange", handler);
    },
    async hide() {
      // No "hide to tray" on mobile — closing minimizes via OS gesture.
    },
  },

  tray: {
    async onPillModeToggle() {
      return noopUnlisten;
    },
  },

  drag: {
    supportsDragRegion: false,
  },

  alwaysOnTop: {
    async set() {
      // No "always on top" concept on mobile.
    },
  },
};
