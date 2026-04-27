/**
 * PlatformAdapter — the single interface every platform implements.
 *
 * Desktop and mobile both export a `platform` object matching this shape.
 * The frontend code consumes ONLY through this interface; nothing else may
 * import from `@tauri-apps/api/window`. See docs/AGENT-HANDOFF.md "Forbidden
 * patterns".
 *
 * Mobile implementations of operations that have no equivalent (`setPillSize`,
 * `toggleAlwaysOnTop`, drag region, tray) are safe no-ops — they resolve
 * successfully without doing anything. This lets app code call them
 * unconditionally without platform branching everywhere.
 */
export interface PlatformAdapter {
  window: PlatformWindow;
  tray: PlatformTray;
  drag: PlatformDrag;
  alwaysOnTop: PlatformAlwaysOnTop;
}

export interface PlatformWindow {
  /** Shrink the window to compact pill dimensions. Records previous size for restore. */
  setPillSize(): Promise<void>;
  /** Restore the previous (non-pill) window size. */
  restorePreviousSize(): Promise<void>;
  /** Move the window. */
  setPosition(x: number, y: number): Promise<void>;
  /** Subscribe to window-moved events. Returns an unlisten fn. */
  onMoved(cb: (pos: { x: number; y: number }) => void): Promise<() => void>;
  /** Subscribe to window-focus events. Returns an unlisten fn. */
  onFocusChanged(cb: (focused: boolean) => void): Promise<() => void>;
  /** Hide the window (keeps process alive — re-show via tray on desktop). */
  hide(): Promise<void>;
}

export interface PlatformTray {
  /** Subscribe to tray-emitted "pill-mode-toggle" events. Returns an unlisten fn. */
  onPillModeToggle(cb: () => void): Promise<() => void>;
}

export interface PlatformDrag {
  /** Whether this platform supports CSS-based drag regions in the chrome. */
  readonly supportsDragRegion: boolean;
}

export interface PlatformAlwaysOnTop {
  /** Set always-on-top to a specific value. No-op on mobile. Always called from `App.tsx` when `settings.alwaysOnTop` changes — single source of truth is the store. */
  set(value: boolean): Promise<void>;
}
