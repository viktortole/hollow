import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";
import { useStore } from "../../lib/store";

/**
 * Undo snackbar — appears for 8 seconds after a fast is ended/completed.
 *
 * Lets the user recover from accidental Complete or briefly peek at level-up
 * UI before returning to their fast. Implemented as a top-banner overlay so
 * it doesn't get buried behind other end-of-fast celebrations.
 *
 * Auto-dismisses when the snapshot's expiresAt passes.
 */
export function UndoSnackbar() {
  const undoSnapshot = useStore((s) => s.undoSnapshot);
  const undoLastCompletion = useStore((s) => s.undoLastCompletion);
  const clearUndoSnapshot = useStore((s) => s.clearUndoSnapshot);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!undoSnapshot) return;
    const tick = () => {
      const ms = undoSnapshot.expiresAt - Date.now();
      const s = Math.max(0, Math.ceil(ms / 1000));
      setSecondsLeft(s);
      if (ms <= 0) clearUndoSnapshot();
    };
    tick();
    // 250 ms cadence so the visible "Continue (Ns)" countdown drops smoothly.
    // This is a snackbar dismissal timer, NOT a fasting clock — the AGENT-HANDOFF
    // ban on extra setIntervals targets duplicate fasting timers, which this is not.
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [undoSnapshot, clearUndoSnapshot]);

  return (
    <AnimatePresence>
      {undoSnapshot && secondsLeft > 0 && (
        <motion.div
          key="undo-snackbar"
          className="absolute z-toast pointer-events-auto"
          style={{
            bottom: "76px",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "calc(100% - 24px)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-2"
            style={{
              background: "var(--bg-2)",
              borderRadius: "var(--card-radius)",
              boxShadow: "var(--shadow-popover)",
            }}
            role="status"
            aria-live="polite"
          >
            <span
              className="label-cap text-[8px] flex-shrink-0"
              style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
            >
              Fast Ended
            </span>
            <button
              type="button"
              onClick={undoLastCompletion}
              className="flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-all hover:brightness-110 active:scale-[0.97] focus:outline-none focus:ring-1 focus:ring-orange-300/40"
              style={{
                background: "var(--ember)",
                color: "var(--bg-0)",
                borderRadius: "2px",
                boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset",
              }}
              aria-label="Continue the fast - undo completion"
            >
              <Undo2 size={11} strokeWidth={2.5} />
              <span
                className="label-cap text-[10px]"
                style={{ letterSpacing: "0.14em", fontWeight: 700 }}
              >
                Continue
              </span>
            </button>
            <span
              className="font-mono text-[10px] tabular-nums flex-shrink-0"
              style={{ color: "var(--ink-3)" }}
              aria-hidden
            >
              {secondsLeft}s
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
