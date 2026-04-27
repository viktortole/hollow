import { motion } from "framer-motion";
import { CircularProgress, type RingMark } from "../../components/CircularProgress";
import { Timer } from "../../components/Timer";
import { STAGES, type Protocol } from "../../lib/stages";
import { predictedXpForFast } from "../../lib/gamification";

interface RingDisplayProps {
  isFasting: boolean;
  goalReached: boolean;
  progress: number;
  /** Seconds past goal (0 if not yet at goal). Drives the gold overtime arc. */
  overSeconds: number;
  elapsed: number;
  targetSeconds: number;
  targetHours: number;
  eatingHours: number;
  protocol: Protocol;
  stageColor: string;
  marks: RingMark[];
  projectedStartLabel: string;
  projectedEndLabel: string;
}

/**
 * The hero timer section — circular ring + center readout + ambient glow + goal-aura.
 *
 * Two render modes inside the ring center:
 *   - **Active**: hero mono timer + "% complete" support label
 *   - **Idle**: status pill + protocol headline. Projected window + XP preview
 *     live OUTSIDE the ring (in a small row below) so the center can breathe.
 *
 * The gold goal-reached aura overlays the ring when `goalReached` is true,
 * earning attention with a slow 6.4s pulse rather than binary on/off.
 *
 * Pure presentation — no store reads. All state comes from props.
 */
export function RingDisplay({
  isFasting,
  goalReached,
  progress,
  overSeconds,
  elapsed,
  targetSeconds,
  targetHours,
  protocol,
  stageColor,
  marks,
  projectedStartLabel,
  projectedEndLabel,
}: RingDisplayProps) {
  // Drop unused prop noise — we no longer render the eatingHours line inside the
  // ring (it duplicated the protocol picker chip below). Kept in the interface
  // for back-compat with parent's prop drilling.
  void targetHours;

  // Overtime ring — once past goal, draw a second arc on top in gold whose
  // progress = (overSeconds / targetSeconds) % 1. Each lap of overtime equals
  // one full goal duration. The user reported the ring being "stuck at 100%"
  // post-goal — this fixes it visually without misrepresenting completion.
  const overtimeFraction = targetSeconds > 0 ? (overSeconds / targetSeconds) : 0;
  const overtimeProgress = (overtimeFraction % 1) * 100;

  return (
    <div className="relative flex flex-col items-center justify-center py-1">
      {/* Stage-color ambient glow behind the ring. Dropped opacity so the cream
          surface in light mode doesn't read as a watercolor smear (audit #5). */}
      <div
        className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ background: stageColor, opacity: 0.14 }}
      />
      {/* Goal-reached gold aura — slow swelling pulse, only when past goal */}
      {goalReached && (
        <motion.div
          key="goal-aura"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-44 rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0, 0.55, 0.32, 0.55, 0.32],
            scale: [0.92, 1.08, 1, 1.04, 1],
          }}
          transition={{
            duration: 6.4,
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          style={{
            background: "radial-gradient(circle at center, var(--gold-glow), transparent 60%)",
            filter: "blur(12px)",
          }}
          aria-hidden
        />
      )}
      <div className="relative">
        <CircularProgress
          progress={progress}
          overtimeProgress={overSeconds > 0 ? overtimeProgress : 0}
          overtimeColor="var(--gold)"
          size={172}
          strokeWidth={10}
          color={stageColor}
          glowColor={`${stageColor}80`}
          marks={marks}
        >
          {isFasting ? (
            <div className="flex flex-col items-center gap-0.5">
              <Timer elapsed={elapsed} targetSeconds={targetSeconds} />
              <div
                className="font-mono mt-0.5 tabular-nums"
                style={{
                  fontSize: "9.5px",
                  color: goalReached ? "var(--gold)" : "var(--ink-3)",
                  fontWeight: goalReached ? 600 : 400,
                }}
              >
                {goalReached ? "Goal reached" : `${Math.round(progress)}% complete`}
              </div>
            </div>
          ) : (
            // IDLE — only status pill + protocol headline live inside the ring.
            // Projected window + XP preview moved to the row BELOW the ring so
            // the center reads as one anchored statement (audit #10).
            <div className="flex flex-col items-center gap-0.5 px-3">
              <div
                className="label-cap text-[8px]"
                style={{ color: "var(--ember)", letterSpacing: "0.28em", fontWeight: 700 }}
              >
                Ready
              </div>
              {(() => {
                // Split protocol.name on parenthetical so "20:4 (Warrior)" stacks
                // (ratio big · nickname small) instead of wrapping at 172px ring.
                const match = protocol.name.match(/^([^(]+?)\s*\((.+)\)\s*$/);
                const headline = match ? match[1] : protocol.name;
                const sub = match ? match[2] : null;
                return (
                  <>
                    <div
                      className="font-mono leading-none tabular-nums mt-1 truncate max-w-full"
                      style={{
                        fontSize: "36px",
                        fontWeight: 700,
                        color: "var(--ink)",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {headline}
                    </div>
                    {sub && (
                      <div
                        className="label-cap text-[8px] truncate max-w-full"
                        style={{ color: "var(--ink-3)", letterSpacing: "0.20em", marginTop: "2px" }}
                      >
                        {sub}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </CircularProgress>
      </div>

      {/* Below-ring info row — only visible in idle. Projected start/end window
          + XP reward preview, separated from the ring center for legibility. */}
      {!isFasting && (
        <div className="mt-3 flex items-baseline gap-3 text-[10px] font-mono tabular-nums">
          <span style={{ color: "var(--ink-2)" }}>
            {projectedStartLabel}
            <span className="mx-1.5" style={{ color: "var(--ember)" }}>→</span>
            {projectedEndLabel}
          </span>
          <span style={{ color: "var(--ink-4)" }}>·</span>
          <span
            className="flex items-baseline gap-1"
            aria-label={`Estimated reward ${predictedXpForFast(targetHours, STAGES)} XP`}
          >
            <span style={{ color: "var(--ink-3)" }}>up to</span>
            <span style={{ color: "var(--gold)", fontWeight: 700 }}>
              {predictedXpForFast(targetHours, STAGES)}
            </span>
            <span
              className="label-cap text-[7.5px]"
              style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
            >
              XP
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
