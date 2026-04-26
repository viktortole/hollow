import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "./lib/store";
import { loadState, saveState } from "./lib/data";
import { FastingWidget } from "./components/FastingWidget";
import { Onboarding } from "./components/Onboarding";
import { StatsPanel } from "./components/StatsPanel";
import { AchievementsPanel } from "./components/AchievementsPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ContextMenu } from "./components/ContextMenu";
import { PillMode } from "./components/PillMode";
import { PROTOCOLS } from "./lib/stages";
import type { AppState } from "./lib/store";

interface ContextMenuPos { x: number; y: number }

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuPos | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const activePanel = useStore((s) => s.activePanel);
  const isPillMode = useStore((s) => s.isPillMode);
  const togglePillMode = useStore((s) => s.togglePillMode);
  const loadStore = useStore((s) => s.loadState);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const setWindowPosition = useStore((s) => s.setWindowPosition);
  const onboardingDoneRef = useRef(false);

  // Keep onboardingDoneRef in sync
  useEffect(() => {
    onboardingDoneRef.current = onboardingDone;
  }, [onboardingDone]);

  // Save state on changes
  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      if (!loading) {
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
          onboardingComplete: onboardingDoneRef.current,
          nightOwlFasts: state.nightOwlFasts,
          windowX: state.windowX,
          windowY: state.windowY,
        });
      }
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
            activePanel: savedOnboardingDone ? "main" : "onboarding",
          } as Partial<AppState>);
          onboardingDoneRef.current = savedOnboardingDone;
          setOnboardingDone(savedOnboardingDone);

          // Restore window position if saved
          if (isTauriRuntime() && typeof saved.windowX === "number" && typeof saved.windowY === "number") {
            try {
              const appWindow = getCurrentWindow();
              await appWindow.setPosition(new LogicalPosition(saved.windowX as number, saved.windowY as number));
            } catch {
              // Position off-screen or other error — let it default to centered
            }
          }
        } else {
          onboardingDoneRef.current = false;
          setOnboardingDone(false);
          setActivePanel("onboarding");
        }
      } catch (e) {
        console.error("Load error:", e);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Handle window events from tray
  useEffect(() => {
    if (!isTauriRuntime()) return;

    const appWindow = getCurrentWindow();

    let unlistenPillMode: (() => void) | null = null;
    let unlistenMoved: (() => void) | null = null;
    listen("pill-mode-toggle", () => {
      togglePillMode();
    }).then((fn) => {
      unlistenPillMode = fn;
    });

    // Debounced position saver for window move
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedSave = (x: number, y: number) => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        setWindowPosition(x, y);
      }, 500);
    };

    appWindow.onMoved(({ payload }) => {
      debouncedSave(payload.x, payload.y);
    }).then((fn) => {
      unlistenMoved = fn;
    });

    return () => {
      if (unlistenPillMode) unlistenPillMode();
      if (unlistenMoved) unlistenMoved();
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
    if (!isTauriRuntime()) return;
    const appWindow = getCurrentWindow();
    await appWindow.hide();
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    onboardingDoneRef.current = true;
    setOnboardingDone(true);
  }, []);

  const visiblePanel = onboardingDone && activePanel === "onboarding" ? "main" : activePanel;

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-2xl"
        style={{ background: "rgba(10,10,20,0.95)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, rgba(13,12,24,0.98), rgba(8,8,16,0.98))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 54px rgba(0,0,0,0.68)",
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Drag region - title bar area */}
      <div
        className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-10"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="text-[9px] font-bold tracking-[0.3em] text-white/32 uppercase">Hollow</div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            onClick={togglePillMode}
            className="w-5 h-5 cursor-pointer rounded flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30"
            aria-label="Toggle pill mode"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="4" width="8" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
            </svg>
          </button>
          <button
            onClick={handleCloseWidget}
            className="w-5 h-5 cursor-pointer rounded flex items-center justify-center hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-1 focus:ring-red-300/40"
            aria-label="Hide widget"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2L8 8M8 2L2 8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-8 h-full">
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
