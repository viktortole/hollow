import { platform } from "../platform";
import type { PlatformAdapter } from "../platform/types";

/**
 * Returns the runtime platform adapter (desktop or mobile). Stable reference —
 * the adapter is chosen once at module load and never changes mid-session.
 *
 * Use this in components that need to call window/tray/drag/alwaysOnTop
 * operations. The adapter abstracts away whether we're on Windows or Android.
 *
 * @example
 * const p = usePlatform();
 * await p.window.setPillSize();
 */
export function usePlatform(): PlatformAdapter {
  return platform;
}
