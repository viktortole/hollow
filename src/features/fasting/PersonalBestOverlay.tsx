import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PersonalBestOverlayProps {
  /** Whether the celebration is currently visible. Driven by `usePersonalBest`. */
  visible: boolean;
  /** Current elapsed seconds — used to compute "+Xm beyond your previous record". */
  elapsedSeconds: number;
  /** The previous longest-fast duration in seconds. */
  longestFastSeconds: number;
  /** Optional manual dismissal — when provided, a close button is rendered.
      Supplements the auto-dismiss timer in usePersonalBest. */
  onDismiss?: () => void;
}

/**
 * Personal-best celebration. Floats over the ring for ~5s when the current
 * fast crosses the user's previous longest, OR until the user dismisses it
 * via the close button. The wrapper is `pointer-events-none` so clicks pass
 * through to the timer below; the inner card re-enables pointer events so
 * the close button is tappable.
 *
 * Driven entirely by `usePersonalBest` upstream; this component is dumb-render.
 */
export function PersonalBestOverlay({
  visible,
  elapsedSeconds,
  longestFastSeconds,
  onDismiss,
}: PersonalBestOverlayProps) {
  const overByMinutes = Math.max(0, Math.floor((elapsedSeconds - longestFastSeconds) / 60));
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
            className="flex items-center gap-2.5 px-3 py-2 pointer-events-auto"
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
            <div className="flex flex-col min-w-0 leading-tight flex-1">
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
                {overByMinutes > 0
                  ? `${overByMinutes}m past your previous record`
                  : "Past your previous record"}
              </span>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                style={{ color: "var(--ink-3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
                aria-label="Dismiss"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
