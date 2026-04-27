import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./lib/store";
import { loadState, saveState } from "./lib/data";
import { FastingWidget } from "./components/FastingWidget";
import { Onboarding } from "./features/onboarding";
import { ContextMenu } from "./components/ContextMenu";
import { PillMode } from "./components/PillMode";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Spinner } from "./components/Spinner";
import { TitleBar } from "./app/TitleBar";
import { PROTOCOLS } from "./lib/stages";
import { platform, isTauri, isMobile } from "./platform";
import type { AppState } from "./lib/store";

// Panel routes are lazy — they only render when the user navigates to them,
// so there's no reason to ship their JS in the initial bundle. Each panel
// becomes its own chunk; first navigation pays the (cached afterwards) load.
const StatsPanel = lazy(() =>
  import("./features/stats").then((m) => ({ default: m.StatsPanel }))
);
const AchievementsPanel = lazy(() =>
  import("./features/gamification/AchievementsPanel").then((m) => ({
    default: m.AchievementsPanel,
  }))
);
const SettingsPanel = lazy(() =>
  import("./features/settings").then((m) => ({ default: m.SettingsPanel }))
);

/** Wraps the canonical Spinner in the panel-fill layout used by `<Suspense>`. */
function PanelLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner size={24} ariaLabel="Loading panel" />
    </div>
  );
}

interface ContextMenuPos { x: number; y: number }

export default function App() {
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuPos | null>(null);
  const activePanel = useStore((s) => s.activePanel);
  const isPillMode = useStore((s) => s.isPillMode);
  const togglePillMode = useStore((s) => s.togglePillMode);
  const loadStore = useStore((s) => s.loadState);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const setWindowPosition = useStore((s) => s.setWindowPosition);
  const theme = useStore((s) => s.settings.theme);
  const onboardingDone = useStore((s) => s.onboardingComplete);

  // Apply theme via data attribute on document root.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Sync `settings.alwaysOnTop` to the OS window. Tauri starts the window with
  // the value from tauri.conf.json; flipping the setting in the UI without this
  // effect would be record-only — the OS window wouldn't change. Mobile: no-op.
  const alwaysOnTopSetting = useStore((s) => s.settings.alwaysOnTop);
  useEffect(() => {
    if (!isTauri()) return;
    platform.alwaysOnTop.set(alwaysOnTopSetting).catch((e) => {
      console.error("alwaysOnTop sync failed:", e);
    });
  }, [alwaysOnTopSetting]);

  // Save state on changes
  useEffect(() => {
    // SAFETY: track previous in-memory state. If a save tick would erase a fast that
    // didn't legitimately end (no completedFasts growth, no explicit endFast call),
    // the transition is almost certainly an HMR/zustand re-init wipe — skip the save.
    let prev = useStore.getState();
    const unsubscribe = useStore.subscribe((state) => {
      if (loading) {
        prev = state;
        return;
      }

      const wasFastingRecord =
        prev.isFasting && prev.fastStartTimestamp !== null;
      const wouldClearFast =
        wasFastingRecord && (!state.isFasting || state.fastStartTimestamp === null);
      const completedFastsGrew =
        state.completedFasts.length > prev.completedFasts.length;

      // Suspicious transition: fast disappeared without a new completed-fast record being added.
      // Real endFast adds to completedFasts atomically. HMR resets just nuke fields.
      if (wouldClearFast && !completedFastsGrew) {
        prev = state;
        // eslint-disable-next-line no-console
        console.warn(
          "[Hollow] Suppressed suspicious fast-clearing save (likely HMR reset). " +
            "Persisted fast preserved on disk."
        );
        return;
      }

      prev = state;
      saveState({
        isFasting: state.isFasting,
        fastStartTimestamp: state.fastStartTimestamp,
        targetHours: state.targetHours,
        protocol: state.protocol,
        totalXp: state.totalXp,
        completedFasts: state.completedFasts,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastFastDate: state.lastFastDate,
        unlockedAchievements: state.unlockedAchievements,
        stageEntryHistory: state.stageEntryHistory,
        brokeStreak: state.brokeStreak,
        maxLevelReached: state.maxLevelReached,
        settings: state.settings,
        onboardingComplete: state.onboardingComplete,
        nightOwlFasts: state.nightOwlFasts,
        windowX: state.windowX,
        windowY: state.windowY,
        hydrationToday: state.hydrationToday,
        hydrationGoalGlasses: state.hydrationGoalGlasses,
        hydrationLastResetDate: state.hydrationLastResetDate,
        hydrationGoalCelebratedDate: state.hydrationGoalCelebratedDate,
      });
    });
    return unsubscribe;
  }, [loading]);

  // Load state on mount and restore window position
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await loadState();
        const hasSavedState = Object.keys(saved).length > 0;
        if (hasSavedState) {
          const savedOnboardingDone = saved.onboardingComplete === true;

          // Restore protocol → targetHours
          if (saved.protocol) {
            const proto = PROTOCOLS.find((p) => p.id === saved.protocol);
            if (proto) {
              saved.targetHours = proto.hours;
            }
          }
          loadStore({
            ...saved,
            onboardingComplete: savedOnboardingDone,
            activePanel: savedOnboardingDone ? "main" : "onboarding",
          } as Partial<AppState>);

          // Restore window position if saved (no-op on mobile via platform adapter)
          if (isTauri() && typeof saved.windowX === "number" && typeof saved.windowY === "number") {
            try {
              await platform.window.setPosition(saved.windowX as number, saved.windowY as number);
            } catch {
              // Position off-screen or other error — let it default to centered
            }
          }
        } else {
          setOnboardingComplete(false);
          setActivePanel("onboarding");
        }
      } catch (e) {
        console.error("Load error:", e);
      }
      setLoading(false);
    };
    init();
  }, []);

  // PILL MODE — resize the OS window via the platform adapter.
  // Desktop shrinks to a 220×56 pill and restores on exit; mobile is a safe no-op.
  useEffect(() => {
    if (!isTauri()) return;
    let cancelled = false;
    (async () => {
      try {
        if (isPillMode) {
          if (!cancelled) await platform.window.setPillSize();
        } else {
          await platform.window.restorePreviousSize();
        }
      } catch (e) {
        console.error("Pill mode resize failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPillMode]);

  // Handle window events — tray pill-mode toggle, position persistence, focus-based recovery.
  // All routed through the platform adapter; mobile gets safe no-ops.
  useEffect(() => {
    if (!isTauri()) return;

    let unlistenPillMode: (() => void) | null = null;
    let unlistenMoved: (() => void) | null = null;
    let unlistenFocus: (() => void) | null = null;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    platform.tray.onPillModeToggle(() => togglePillMode()).then((fn) => {
      unlistenPillMode = fn;
    });

    platform.window
      .onMoved(({ x, y }) => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => setWindowPosition(x, y), 500);
      })
      .then((fn) => {
        unlistenMoved = fn;
      });

    // AUTO-RECOVERY: on focus, if disk has an active fast that memory doesn't, hydrate from disk.
    platform.window
      .onFocusChanged(async (focused) => {
        if (!focused) return;
        try {
          const saved = await loadState();
          if (Object.keys(saved).length === 0) return;
          const mem = useStore.getState();
          const diskHasActiveFast =
            saved.isFasting === true && typeof saved.fastStartTimestamp === "number";
          const memMissingFast = !mem.isFasting || mem.fastStartTimestamp == null;
          if (diskHasActiveFast && memMissingFast) {
            // eslint-disable-next-line no-console
            console.warn("[Hollow] Recovering active fast from disk on focus.");
            loadStore({
              isFasting: saved.isFasting,
              fastStartTimestamp: saved.fastStartTimestamp,
              targetHours: saved.targetHours,
              protocol: saved.protocol,
            } as Partial<AppState>);
          }
        } catch (e) {
          console.error("Focus-based recovery failed:", e);
        }
      })
      .then((fn) => {
        unlistenFocus = fn;
      });

    return () => {
      if (unlistenPillMode) unlistenPillMode();
      if (unlistenMoved) unlistenMoved();
      if (unlistenFocus) unlistenFocus();
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, []);

  // Right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    const timeout = setTimeout(() => {
      document.addEventListener("click", handler, { once: true });
    }, 10);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handler);
    };
  }, [contextMenu]);

  const handleCloseWidget = useCallback(async () => {
    if (!isTauri()) return;
    await platform.window.hide();
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, [setOnboardingComplete]);

  const visiblePanel = onboardingDone && activePanel === "onboarding" ? "main" : activePanel;

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center r-card"
        style={{ background: "var(--bg-1)" }}
      >
        <Spinner size={28} ariaLabel="Loading Hollow" />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-hidden relative r-card"
      style={{
        background:
          "radial-gradient(ellipse at top, var(--bg-1) 0%, var(--bg-0) 90%)",
        boxShadow:
          "0 28px 60px rgba(0, 0, 0, 0.55), " +
          "0 1px 0 rgba(255, 255, 255, 0.04) inset, " +
          "0 0 0 1px var(--hairline) inset",
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Paper-grain overlay — subtle texture so the surface reads as material, not flat fill.
          Pointer events disabled so it never intercepts clicks. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "var(--grain)",
          backgroundSize: "180px 180px",
          mixBlendMode: "soft-light",
          opacity: 0.6,
        }}
        aria-hidden
      />
      <TitleBar
        isPillMode={isPillMode}
        togglePillMode={togglePillMode}
        onCloseWidget={handleCloseWidget}
      />

      {/* Main content — hidden when pill mode is active so the floating pill is the only visible UI.
          Mobile: pad for the taller title strip + top safe-area inset. */}
      <div
        className="h-full"
        style={{
          visibility: isPillMode ? "hidden" : "visible",
          paddingTop: isMobile()
            ? "calc(40px + env(safe-area-inset-top, 0px))"
            : "32px",
          paddingBottom: isMobile() ? "env(safe-area-inset-bottom, 0px)" : 0,
        }}
      >
        <ErrorBoundary
          label={visiblePanel === "main" ? "Hollow" : visiblePanel.charAt(0).toUpperCase() + visiblePanel.slice(1)}
          onReset={() => setActivePanel("main")}
        >
        <Suspense fallback={<PanelLoader />}>
        <AnimatePresence mode="wait">
          {!onboardingDone && visiblePanel === "onboarding" ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          ) : visiblePanel === "main" ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              <FastingWidget />
            </motion.div>
          ) : visiblePanel === "stats" ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              <StatsPanel />
            </motion.div>
          ) : visiblePanel === "achievements" ? (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              <AchievementsPanel />
            </motion.div>
          ) : visiblePanel === "settings" ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              <SettingsPanel />
            </motion.div>
          ) : null}
        </AnimatePresence>
        </Suspense>
        </ErrorBoundary>
      </div>

      {/* Pill mode */}
      <AnimatePresence>
        {isPillMode && <PillMode key="pill" />}
      </AnimatePresence>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onCloseWidget={handleCloseWidget}
        />
      )}
    </div>
  );
}
