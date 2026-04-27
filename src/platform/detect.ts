/**
 * Runtime platform detection — cached at module load.
 *
 * Used by `src/platform/index.ts` to choose the desktop or mobile adapter.
 * Hoisted here so the choice is deterministic and there's exactly one detection
 * call per session.
 */

const isMobileResult = computeIsMobile();
const isTauriResult = computeIsTauri();

function computeIsTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function computeIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  // Tauri 2 mobile: __TAURI_INTERNALS__.metadata.windows is empty (no windows on mobile);
  // desktop has at least one window in the array.
  const internals = (window as unknown as { __TAURI_INTERNALS__?: { metadata?: { windows?: unknown[] } } })
    .__TAURI_INTERNALS__;
  if (internals?.metadata?.windows && internals.metadata.windows.length === 0) {
    return true;
  }
  // Browser-side fallback (dev mode in mobile browser preview)
  const ua = navigator.userAgent || "";
  return /android|iphone|ipad|ipod/i.test(ua);
}

/** True if this build is running on iOS or Android. */
export function isMobile(): boolean {
  return isMobileResult;
}

/** True if running inside a Tauri shell (any platform). False in the dev browser. */
export function isTauri(): boolean {
  return isTauriResult;
}
