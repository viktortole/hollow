/**
 * Platform adapter entry point — the single seam where desktop vs mobile is chosen.
 *
 * Consumers import `platform` (or use `usePlatform()` hook) and never branch
 * by themselves. See docs/AGENT-HANDOFF.md "Forbidden patterns": nothing in
 * `src/` outside this folder may import from `@tauri-apps/api/window`.
 */

import { isMobile } from "./detect";
import { platform as desktopPlatform } from "./desktop";
import { platform as mobilePlatform } from "./mobile";
import type { PlatformAdapter } from "./types";

export const platform: PlatformAdapter = isMobile() ? mobilePlatform : desktopPlatform;

export type { PlatformAdapter, PlatformWindow, PlatformTray, PlatformDrag, PlatformAlwaysOnTop } from "./types";
export { isMobile, isTauri } from "./detect";
