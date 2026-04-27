import { motion } from "framer-motion";
import type { Protocol } from "../../lib/stages";

interface HeaderBarProps {
  isFasting: boolean;
  goalReached: boolean;
  goalTierLabel: string | null;
  remainingSeconds: number;
  overSeconds: number;
  protocol: Protocol;
  stageColor: string;
}

/**
 * Top status bar — pulsing stage-color dot · status label · subline · protocol stamp.
 *
 * The status label adapts to phase: "Ready" (idle) / "Fasting" (active) / tier label
 * (Goal Reached / Extended Fast / Deep Fast / Profound Fast) when past goal.
 *
 * The subline shows protocol description in idle, hours-remaining or hours-beyond-goal
 * during a fast. Protocol stamp is a confident mono+caps chip on the right.
 *
 * Pure presentation — all derived values come from props (computed in FastingWidget
 * from canonical clock state).
 */
export function HeaderBar({
  isFasting,
  goalReached,
  goalTierLabel,
  remainingSeconds,
  overSeconds,
  protocol,
  stageColor,
}: HeaderBarProps) {
  // Use plain text (no bullet) so the separator doesn't get eaten on light cream.
  const subline = isFasting
    ? goalReached
      ? `${(overSeconds / 3600).toFixed(1)}h past your goal`
      : `${(remainingSeconds / 3600).toFixed(1)}h remaining`
    : protocol.description;
  const headerColor = goalReached ? "var(--gold)" : "var(--ink)";

  return (
    <div className="relative flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <motion.span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ background: stageColor }}
          animate={
            isFasting
              ? {
                  boxShadow: [
                    `0 0 3px ${stageColor}, 0 0 0px ${stageColor}40`,
                    `0 0 10px ${stageColor}, 0 0 16px ${stageColor}50`,
                    `0 0 3px ${stageColor}, 0 0 0px ${stageColor}40`,
                  ],
                }
              : { boxShadow: `0 0 6px ${stageColor}60` }
          }
          transition={
            isFasting ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined
          }
          aria-hidden
        />
        <div className="flex flex-col min-w-0 leading-tight">
          <span
            className="label-cap text-[10px] truncate"
            style={{
              color: headerColor,
              letterSpacing: "0.22em",
              fontWeight: 600,
              textShadow: goalReached ? "0 0 12px var(--gold-glow)" : undefined,
            }}
          >
            {isFasting ? goalTierLabel ?? "Fasting" : "Ready"}
          </span>
          <span className="text-[10px] truncate mt-0.5" style={{ color: "var(--ink-2)" }}>
            {subline}
          </span>
        </div>
      </div>

      {/* Protocol chip — clear stamp on the right. Stage-color side bar
          gives an at-a-glance metabolic phase signal. */}
      <div
        className="flex-shrink-0 flex items-stretch gap-0"
        aria-label={`Fasting protocol ${protocol.name}`}
      >
        <span
          className="w-[3px] flex-shrink-0"
          style={{
            background: stageColor,
            borderRadius: "2px 0 0 2px",
            boxShadow: isFasting ? `0 0 6px ${stageColor}80` : undefined,
          }}
          aria-hidden
        />
        <span
          className="font-mono text-[12px] font-bold tracking-tight px-2 py-0.5 flex items-center"
          style={{
            color: "var(--ink)",
            background: "var(--bg-3)",
            borderRadius: "0 2px 2px 0",
            letterSpacing: "0.02em",
          }}
        >
          {protocol.name}
        </span>
      </div>
    </div>
  );
}
