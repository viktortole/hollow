import { motion, AnimatePresence } from "framer-motion";

interface PersonalBestOverlayProps {
  /** Whether the celebration is currently visible. Driven by `usePersonalBest`. */
  visible: boolean;
  /** Current elapsed seconds — used to compute "+Xm beyond your previous record". */
  elapsedSeconds: number;
  /** The previous longest-fast duration in seconds. */
  longestFastSeconds: number;
}

/**
 * Personal-best celebration. Floats over the ring for ~5s when the current
 * fast crosses the user's previous longest. Read-only / non-interactive — the
 * pointer-events-none on the wrapper guarantees it can't intercept clicks on
 * the timer or controls below.
 *
 * Driven entirely by `usePersonalBest` upstream; this component is dumb-render.
 */
export function PersonalBestOverlay({
  visible,
  elapsedSeconds,
  longestFastSeconds,
}: PersonalBestOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pb-overlay"
          className="absolute inset-x-3 pointer-events-none z-pb"
          style={{ top: "44px" }}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-2"
            style={{
              background: "var(--bg-2)",
              borderRadius: "var(--card-radius)",
              boxShadow: "var(--shadow-popover), 0 0 22px var(--ember-glow)",
              border: "1px solid var(--gold)",
            }}
            role="status"
            aria-live="polite"
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700 }}>★</span>
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span
                className="label-cap text-[8px]"
                style={{ color: "var(--gold)", letterSpacing: "0.20em", fontWeight: 700 }}
              >
                New Personal Best
              </span>
              <span className="text-[12px] font-bold" style={{ color: "var(--ink)" }}>
                Longest fast you've ever done
              </span>
              <span className="text-[9.5px]" style={{ color: "var(--ink-3)" }}>
                Past +{((elapsedSeconds - longestFastSeconds) / 60).toFixed(0)}m beyond your previous record
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
