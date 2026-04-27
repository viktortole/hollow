import { motion } from "framer-motion";
import { Play, Square, Flame } from "lucide-react";

interface ControlBarProps {
  isFasting: boolean;
  goalReached: boolean;
  /** True after user pressed "Keep Going" — UI calms, single end button. */
  extendedMode: boolean;
  /** Seconds past goal — used to label the extended-mode End button. */
  overSeconds: number;
  targetHours: number;
  onStart: () => void;
  onEnd: (completed: boolean) => void;
  /** Dismiss the goal-reached celebration; switch to extended-mode UI. */
  onKeepGoing?: () => void;
}

/**
 * Phase-aware action bar — Start / End / Complete / Extended-end.
 *
 * Four rendered states:
 *   1. **Idle** (`!isFasting`): "Start {N}h Fast" hero ember button.
 *   2. **Active** (`isFasting && !goalReached`): "End Fast" + disabled "Complete at Goal".
 *   3. **Goal reached** (`isFasting && goalReached && !extendedMode`):
 *      "End" quiet text + "Keep Going" outlined + "Complete" gold success.
 *   4. **Extended** (`isFasting && goalReached && extendedMode`):
 *      Single "End Extended Fast (+Xh)" with flame icon — celebrates the choice.
 */
export function ControlBar({
  isFasting,
  goalReached,
  extendedMode,
  overSeconds,
  targetHours,
  onStart,
  onEnd,
  onKeepGoing,
}: ControlBarProps) {
  if (!isFasting) {
    return (
      <motion.button
        onClick={onStart}
        className="group relative w-full cursor-pointer py-3 flex items-center justify-center gap-3 transition-all active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-orange-300/40 overflow-hidden"
        style={{
          background: "var(--ember)",
          color: "var(--bg-0)",
          boxShadow:
            "0 16px 36px rgba(184,90,59,0.26), 0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(0,0,0,0.18) inset",
          borderRadius: "3px",
        }}
        whileTap={{ scale: 0.99 }}
        whileHover={{ filter: "brightness(1.06)" }}
        aria-label={`Start a ${targetHours} hour fast`}
      >
        <span
          className="absolute top-0 inset-x-4 h-px pointer-events-none"
          style={{ background: "rgba(255,255,255,0.25)" }}
        />
        <Play size={13} fill="currentColor" style={{ marginTop: "1px" }} />
        <span
          className="label-cap text-[12px]"
          style={{ letterSpacing: "0.16em", fontWeight: 700 }}
        >
          Start {targetHours}h Fast
        </span>
      </motion.button>
    );
  }

  // EXTENDED MODE — past goal AND user chose to keep going.
  if (goalReached && extendedMode) {
    const overHours = (overSeconds / 3600).toFixed(1);
    return (
      <motion.button
        onClick={() => onEnd(true)}
        className="relative w-full cursor-pointer py-3 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-amber-300/40 overflow-hidden"
        style={{
          background: "var(--gold)",
          color: "var(--bg-0)",
          boxShadow:
            "0 14px 32px rgba(201,169,97,0.28), 0 1px 0 rgba(255,255,255,0.2) inset",
          borderRadius: "3px",
        }}
        whileTap={{ scale: 0.99 }}
        whileHover={{ filter: "brightness(1.06)" }}
        aria-label={`End extended fast, ${overHours} hours past goal`}
      >
        <Flame size={13} fill="currentColor" />
        <span
          className="label-cap text-[12px]"
          style={{ letterSpacing: "0.16em", fontWeight: 700 }}
        >
          End Extended Fast
        </span>
        <span
          className="font-mono text-[11px] tabular-nums px-1.5 py-0.5"
          style={{
            background: "rgba(0,0,0,0.18)",
            borderRadius: "2px",
            letterSpacing: "0",
          }}
        >
          +{overHours}h
        </span>
      </motion.button>
    );
  }

  // GOAL REACHED, celebration moment — three options.
  if (goalReached) {
    return (
      <div className="flex gap-2 items-center">
        <motion.button
          onClick={() => onEnd(false)}
          className="flex-shrink-0 cursor-pointer px-3 py-2.5 r-pill label-cap text-[10px] transition-colors hover:bg-soft active:scale-[0.98] focus:outline-none focus:ring-1 focus-ring-ink"
          style={{ color: "var(--ink-2)" }}
          whileTap={{ scale: 0.98 }}
          aria-label="End fast without marking complete"
        >
          End
        </motion.button>
        {onKeepGoing && (
          <motion.button
            onClick={onKeepGoing}
            className="flex-1 cursor-pointer py-2.5 r-pill label-cap text-[11px] transition-colors active:scale-[0.98] focus:outline-none focus:ring-1 focus-ring-ink"
            style={{
              background: "transparent",
              color: "var(--ink)",
              border: "1px solid var(--ink-2)",
              letterSpacing: "0.14em",
            }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ background: "var(--bg-3)" }}
            aria-label="Keep fasting past the goal"
          >
            Keep Going
          </motion.button>
        )}
        <motion.button
          onClick={() => onEnd(true)}
          className="flex-1 cursor-pointer py-3 r-pill flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-emerald-300/60"
          style={{
            background: "var(--success)",
            color: "var(--bg-0)",
            boxShadow:
              "0 12px 28px rgba(94,125,82,0.30), 0 1px 0 rgba(255,255,255,0.18) inset",
          }}
          whileTap={{ scale: 0.98 }}
          aria-label="Complete the fast"
        >
          <Square size={11} fill="currentColor" />
          <span
            className="label-cap text-[12px]"
            style={{ letterSpacing: "0.16em", fontWeight: 700 }}
          >
            Complete
          </span>
        </motion.button>
      </div>
    );
  }

  // Active, not yet reached goal.
  return (
    <div className="flex gap-2">
      <motion.button
        onClick={() => onEnd(false)}
        className="flex-1 cursor-pointer py-2.5 r-pill label-cap text-[11px] transition-colors hover-danger-soft active:scale-[0.98] focus:outline-none focus:ring-1 focus-ring-danger"
        style={{
          background: "var(--bg-2)",
          color: "var(--danger)",
        }}
        whileTap={{ scale: 0.98 }}
        aria-label="End fast early"
      >
        End Fast
      </motion.button>
      <button
        disabled
        className="flex-1 py-2.5 r-pill label-cap text-[11px] cursor-not-allowed"
        style={{ background: "var(--ink-4)", color: "var(--ink-3)" }}
        aria-label="Complete becomes available at goal"
        title="Available at goal"
      >
        Complete at Goal
      </button>
    </div>
  );
}
