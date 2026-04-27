import { motion } from "framer-motion";
import { CircularProgress, type RingMark } from "../../components/CircularProgress";
import { Timer } from "../../components/Timer";
import { STAGES, type Protocol } from "../../lib/stages";
import { predictedXpForFast } from "../../lib/gamification";

interface RingDisplayProps {
  isFasting: boolean;
  goalReached: boolean;
  progress: number;
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
 *   - **Idle**: protocol name + "{targetHours}h fast · {eatingHours}h eat" sublabel
 *     + projected start/end timestamps
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
  elapsed,
  targetSeconds,
  targetHours,
  eatingHours,
  protocol,
  stageColor,
  marks,
  projectedStartLabel,
  projectedEndLabel,
}: RingDisplayProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-1">
      {/* Stage-color ambient glow behind the ring */}
      <div
        className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-28 rounded-full blur-2xl opacity-25 pointer-events-none"
        style={{ background: stageColor }}
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
                className="font-mono mt-0.5"
                style={{ fontSize: "9.5px", color: "var(--ink-3)" }}
              >
                {Math.round(progress)}% complete
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 px-3">
              <div
                className="label-cap text-[8px]"
                style={{ color: "var(--ember)", letterSpacing: "0.28em", fontWeight: 700 }}
              >
                Ready
              </div>
              {/* Split protocol.name on the parenthetical so a name like "20:4 (Warrior)"
                  doesn't wrap and overflow the 172px ring. The ratio is the headline
                  (big mono); the nickname is supporting label below. */}
              {(() => {
                const match = protocol.name.match(/^([^(]+?)\s*\((.+)\)\s*$/);
                const headline = match ? match[1] : protocol.name;
                const sub = match ? match[2] : null;
                return (
                  <>
                    <div
                      className="font-mono leading-none tabular-nums mt-1 truncate max-w-full"
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "var(--ink)",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {headline}
                    </div>
                    {sub && (
                      <div
                        className="label-cap text-[7.5px] truncate max-w-full"
                        style={{ color: "var(--ink-3)", letterSpacing: "0.16em", marginTop: "1px" }}
                      >
                        {sub}
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex items-baseline gap-1 mt-1.5 font-mono text-[10px] tabular-nums">
                <span style={{ color: "var(--ember)", fontWeight: 600 }}>
                  {targetHours}h
                </span>
                <span className="label-cap text-[7.5px]" style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}>fast</span>
                <span style={{ color: "var(--ink-4)" }}>·</span>
                <span style={{ color: "var(--ink-2)", fontWeight: 600 }}>
                  {eatingHours}h
                </span>
                <span className="label-cap text-[7.5px]" style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}>eat</span>
              </div>
              <div
                className="mt-2 pt-1.5 flex items-center gap-1.5 text-[9px] font-mono tabular-nums"
                style={{ borderTop: "1px solid var(--hairline)" }}
                aria-label={`Projected window ${projectedStartLabel} to ${projectedEndLabel}`}
              >
                <span style={{ color: "var(--ink)" }}>{projectedStartLabel}</span>
                <span style={{ color: "var(--ember)" }}>→</span>
                <span style={{ color: "var(--ink)" }}>{projectedEndLabel}</span>
              </div>
              {/* XP preview — anticipation of the reward */}
              <div
                className="mt-1 flex items-center gap-1 text-[9px] font-mono tabular-nums"
                aria-label={`Estimated reward ${predictedXpForFast(targetHours, STAGES)} XP`}
              >
                <span style={{ color: "var(--ink-3)" }}>≈</span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                  {predictedXpForFast(targetHours, STAGES)}
                </span>
                <span className="label-cap text-[7px]" style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}>
                  XP reward
                </span>
              </div>
            </div>
          )}
        </CircularProgress>
      </div>
    </div>
  );
}
