import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Pencil } from "lucide-react";
import { useStore } from "../../lib/store";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface TimestampsRowProps {
  startTimeLabel: string;
  endTimeLabel: string;
  goalReached: boolean;
}

const ADJUST_DELTAS: { label: string; delta: number }[] = [
  { label: "−1h", delta: -60 * 60 * 1000 },
  { label: "−15m", delta: -15 * 60 * 1000 },
  { label: "−5m", delta: -5 * 60 * 1000 },
  { label: "+5m", delta: 5 * 60 * 1000 },
  { label: "+15m", delta: 15 * 60 * 1000 },
  { label: "+1h", delta: 60 * 60 * 1000 },
];

/**
 * Started X · Ends Y row with an inline pencil affordance that opens the start-time
 * adjuster popover (for "I forgot to start" recovery).
 *
 * The popover floats absolutely above the layout (no reflow) and dismisses on
 * outside-click. The label switches to "Past goal" when the user is past their goal.
 *
 * State is local: only the popover open/closed lives in this component. The actual
 * timestamp adjustment goes through `setFastStartTimestamp` action in the store.
 */
export function TimestampsRow({ startTimeLabel, endTimeLabel, goalReached }: TimestampsRowProps) {
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);
  const setFastStartTimestamp = useStore((s) => s.setFastStartTimestamp);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEscapeKey(open, () => setOpen(false));

  // Outside-click dismissal — defer one tick so the click that opened doesn't immediately close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const node = containerRef.current;
      if (node && !node.contains(e.target as Node)) setOpen(false);
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  if (!fastStartTimestamp) return null;

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center gap-2.5 text-[10px] font-mono"
        style={{ color: "var(--ink-3)" }}
        aria-label="Fast schedule"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 r-chip px-1.5 py-0.5 hover:bg-soft focus:outline-none focus:ring-1 focus-ring-ink transition-colors cursor-pointer"
          aria-label="Adjust fast start time"
          aria-expanded={open}
        >
          <Clock size={10} style={{ color: "var(--ink-3)" }} />
          <span>
            Started{" "}
            <span style={{ color: "var(--ink)" }}>{startTimeLabel}</span>
          </span>
          <Pencil size={9} style={{ color: open ? "var(--ink)" : "var(--ink-4)" }} />
        </button>
        <span style={{ color: "var(--ink-4)" }}>→</span>
        {/* "Goal" not "Past goal" — when the user is past their goal it's the
            timestamp of WHEN they hit it. "Past goal 12:24 PM" reads like the
            user missed it (past tense). "Goal 12:24 PM" is just the milestone. */}
        <span>
          Goal{" "}
          <span style={{ color: "var(--ink)" }}>{endTimeLabel}</span>
        </span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-popover flex flex-col gap-1.5 r-card"
            style={{
              background: "var(--bg-2)",
              paddingInline: "10px",
              paddingBlock: "8px",
              boxShadow: "var(--shadow-popover), 0 24px 40px rgba(0,0,0,0.45)",
              border: "1px solid var(--hairline)",
              minWidth: 260,
            }}
            role="group"
            aria-label="Adjust start time"
          >
            <div
              className="flex items-center justify-between label-cap text-[9px]"
              style={{ color: "var(--ink-3)" }}
            >
              <span>Adjust Start Time</span>
              <span className="font-mono" style={{ color: "var(--ink)" }}>
                {startTimeLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {ADJUST_DELTAS.map(({ label, delta }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFastStartTimestamp(fastStartTimestamp + delta)}
                  className="flex-1 py-1 r-chip text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                  style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--ink)";
                    e.currentTarget.style.color = "var(--bg-0)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-3)";
                    e.currentTarget.style.color = "var(--ink-2)";
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="label-cap text-[9px] self-end cursor-pointer"
              style={{ color: "var(--ink-3)" }}
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
