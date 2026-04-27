import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { getStageForHours } from "../lib/stages";
import { formatElapsed } from "../lib/time";
import { useFastingClock } from "../hooks/useFastingClock";

/**
 * Pill mode — the compact always-visible timer that REPLACES the full widget when toggled.
 *
 * Renders as a full-window component (not a small floating element) — the Tauri window
 * has been resized to ~220×56 by the platform adapter, so this component fills the whole
 * shrunken window. The title bar is hidden in pill mode (App.tsx), so PillMode IS the
 * entire visible UI.
 *
 * The whole pill is a drag region (move by dragging anywhere on the cream surface).
 * The clickable area in the middle exits pill mode to restore the full widget.
 */
export function PillMode() {
  const isPillMode = useStore((s) => s.isPillMode);
  const togglePillMode = useStore((s) => s.togglePillMode);
  const { elapsed, hoursElapsed, startedAt } = useFastingClock();

  if (!isPillMode) return null;

  const stage = getStageForHours(hoursElapsed);
  const stageColor = startedAt ? stage.color : "var(--ink-3)";

  return (
    <motion.div
      key="pill"
      className="absolute inset-0 z-pillmode flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      // Whole pill draggable — user moves it by clicking and dragging anywhere on the cream.
      style={{
        background: "var(--bg-1)",
        WebkitAppRegion: "drag",
      } as React.CSSProperties}
    >
      {/* Pulsing stage-color dot on the left edge */}
      <motion.div
        className="flex-shrink-0 ml-3 w-1.5 h-1.5 rounded-full"
        style={{ background: stageColor }}
        animate={
          startedAt
            ? {
                boxShadow: [
                  `0 0 3px ${stage.color}, 0 0 0 ${stage.color}33`,
                  `0 0 8px ${stage.color}, 0 0 12px ${stage.color}55`,
                  `0 0 3px ${stage.color}, 0 0 0 ${stage.color}33`,
                ],
              }
            : undefined
        }
        transition={
          startedAt ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined
        }
      />

      {/* Timer — center, mono, takes click for expand. The button breaks the drag region so the click registers. */}
      <button
        type="button"
        onClick={togglePillMode}
        className="flex-1 h-full flex items-center justify-center cursor-pointer transition-colors hover:bg-soft"
        style={{
          background: "transparent",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
        aria-label="Expand widget"
        title="Click to expand"
      >
        <span
          className="font-mono text-[15px] tabular-nums"
          style={{
            color: "var(--ink)",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {startedAt ? formatElapsed(elapsed) : "—— : —— : ——"}
        </span>
      </button>

      {/* Right edge: tiny expand glyph, also clickable */}
      <button
        type="button"
        onClick={togglePillMode}
        className="flex-shrink-0 mr-3 w-5 h-5 flex items-center justify-center cursor-pointer rounded transition-colors hover:bg-soft"
        style={{
          color: "var(--ink-3)",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
        aria-label="Expand widget"
        title="Expand"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5h6M5 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
