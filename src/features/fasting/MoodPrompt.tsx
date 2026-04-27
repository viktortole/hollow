import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";

/**
 * Post-fast mood prompt — slides up from the bottom over the action bar after a fast ends.
 *
 * Shown automatically when the store's `pendingMoodForFastId` is set (which happens
 * inside `endFast` orchestration). Captures a 1-5 emoji rating onto the just-completed
 * `CompletedFast.mood` field, then auto-dismisses. User can also Skip without rating.
 *
 * Pure presentation — all state lives in the store.
 */
const MOOD_OPTIONS = [
  { mood: 1, emoji: "😫", label: "Brutal" },
  { mood: 2, emoji: "😐", label: "Tough" },
  { mood: 3, emoji: "🙂", label: "Okay" },
  { mood: 4, emoji: "😄", label: "Good" },
  { mood: 5, emoji: "🤩", label: "Great" },
] as const;

export function MoodPrompt() {
  const pendingMoodForFastId = useStore((s) => s.pendingMoodForFastId);
  const setMoodForFast = useStore((s) => s.setMoodForFast);
  const dismissMoodPrompt = useStore((s) => s.dismissMoodPrompt);
  const promptMood = useStore((s) => s.settings.promptMood);

  return (
    <AnimatePresence>
      {pendingMoodForFastId && promptMood && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="absolute inset-x-3 bottom-3 z-overlay flex flex-col gap-2 r-card"
          style={{
            background: "var(--bg-2)",
            paddingInline: "14px",
            paddingBlock: "12px",
            boxShadow: "var(--shadow-popover)",
          }}
          role="dialog"
          aria-label="Rate your fast"
        >
          <div className="flex items-center justify-between">
            <span className="label-cap text-[10px]" style={{ color: "var(--ink)" }}>
              How was it?
            </span>
            <button
              type="button"
              onClick={dismissMoodPrompt}
              className="label-cap text-[9px] cursor-pointer"
              style={{ color: "var(--ink-3)" }}
              aria-label="Skip mood prompt"
            >
              Skip
            </button>
          </div>
          <div className="flex items-center justify-between gap-1">
            {MOOD_OPTIONS.map(({ mood, emoji, label }) => (
              <button
                key={mood}
                type="button"
                onClick={() => setMoodForFast(pendingMoodForFastId, mood)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded hover:bg-soft active:scale-95 transition-all cursor-pointer"
                aria-label={`${label} (${mood} of 5)`}
                title={label}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="label-cap text-[8px]" style={{ color: "var(--ink-3)" }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
