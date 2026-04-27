/**
 * Desktop platform adapter — Windows / macOS / Linux.
 *
 * The ONLY place in the frontend that imports from `@tauri-apps/api/window`.
 * All window/tray/drag operations go through this seam so mobile builds can
 * substitute no-op equivalents without touching consumer code.
 *
 * See docs/ARCHITECTURE.md "Platform adapter contract".
 */

import { getCurrentWindow, LogicalSize, LogicalPosition } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import type { PlatformAdapter } from "../types";

const PILL_W = 220;
const PILL_H = 56;
const PILL_MIN_W = 180;
const PILL_MIN_H = 48;
const NORMAL_MIN_W = 320;
const NORMAL_MIN_H = 480;

let previousSize: { width: number; height: number } | null = null;

// Lazy-resolve the Tauri window handle so this module can be imported in browser/dev
// contexts without immediately calling into Tauri internals (which would throw if
// `__TAURI_INTERNALS__` isn't initialized yet — e.g., during pre-mount HMR).
let _w: ReturnType<typeof getCurrentWindow> | null = null;
function w() {
  if (!_w) _w = getCurrentWindow();
  return _w;
}

export const platform: PlatformAdapter = {
  window: {
    async setPillSize() {
      const cur = await w().outerSize();
      const factor = await w().scaleFactor();
      previousSize = { width: cur.width / factor, height: cur.height / factor };
      // Drop min constraint first so we can shrink to pill dimensions.
      await w().setMinSize(new LogicalSize(PILL_MIN_W, PILL_MIN_H));
      await w().setSize(new LogicalSize(PILL_W, PILL_H));
    },

    async restorePreviousSize() {
      // Re-arm normal min before resizing back, so the OS doesn't clamp.
      await w().setMinSize(new LogicalSize(NORMAL_MIN_W, NORMAL_MIN_H));
      if (previousSize) {
        await w().setSize(new LogicalSize(previousSize.width, previousSize.height));
        previousSize = null;
      }
    },

    async setPosition(x: number, y: number) {
      await w().setPosition(new LogicalPosition(x, y));
    },

    async onMoved(cb) {
      const unlisten = await w().onMoved(({ payload }) => cb({ x: payload.x, y: payload.y }));
      return unlisten;
    },

    async onFocusChanged(cb) {
      const unlisten = await w().onFocusChanged(({ payload }) => cb(payload));
      return unlisten;
    },

    async hide() {
      await w().hide();
    },
  },

  tray: {
    async onPillModeToggle(cb) {
      const unlisten = await listen("pill-mode-toggle", () => cb());
      return unlisten;
    },
  },

  drag: {
    supportsDragRegion: true,
  },

  alwaysOnTop: {
    async set(value: boolean) {
      await w().setAlwaysOnTop(value);
    },
  },
};
