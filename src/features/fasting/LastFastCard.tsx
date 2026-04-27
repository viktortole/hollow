import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useStore } from "../../lib/store";
import { formatHoursMinutes, formatRelativeDay } from "../../lib/time";

const MOOD_EMOJIS = ["😫", "😐", "🙂", "😄", "🤩"];
const MOOD_LABELS = ["Brutal", "Tough", "Okay", "Good", "Great"];

/**
 * Last fast summary card — only rendered in idle (non-fasting) state.
 *
 * Surfaces continuity info: how recent was the last fast, completed/early, duration,
 * XP earned, and the mood emoji if the user rated it.
 *
 * No-ops to null when there is no completed fast yet (first-run users).
 */
export function LastFastCard() {
  const isFasting = useStore((s) => s.isFasting);
  const completedFasts = useStore((s) => s.completedFasts);

  if (isFasting || completedFasts.length === 0) return null;
  const lastFast = completedFasts[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-3"
      style={{
        background: "var(--bg-1)",
        borderRadius: "var(--card-radius)",
        paddingInline: "var(--card-pad-x)",
        paddingBlock: "9px",
        border: "1px solid var(--hairline)",
      }}
      aria-label="Previous fast summary"
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "var(--bg-3)" }}
      >
        <History size={12} style={{ color: "var(--ink-3)" }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="label-cap text-[8px]" style={{ color: "var(--ink-3)" }}>
          Last Fast
        </span>
        <span className="text-[10px] truncate" style={{ color: "var(--ink-3)" }}>
          {formatRelativeDay(lastFast.endTime)} ·{" "}
          {lastFast.completed ? "Completed" : "Ended early"}
        </span>
      </div>
      {typeof lastFast.mood === "number" && (
        <span
          className="flex-shrink-0 text-base leading-none"
          title={MOOD_LABELS[lastFast.mood - 1]}
          aria-label={`Mood ${lastFast.mood} of 5`}
        >
          {MOOD_EMOJIS[lastFast.mood - 1]}
        </span>
      )}
      <div className="flex-shrink-0 flex flex-col items-end">
        <span
          className="font-mono leading-tight"
          style={{ color: "var(--ink)", fontSize: "12px", fontWeight: 600 }}
        >
          {formatHoursMinutes(lastFast.elapsedSeconds)}
        </span>
        <span className="text-[9px]" style={{ color: "var(--ink-3)" }}>
          +{lastFast.xpEarned} XP
        </span>
      </div>
    </motion.div>
  );
}
