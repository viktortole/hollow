import { formatElapsed } from "../lib/stages";

interface TimerProps {
  elapsed: number;          // seconds since fast start
  targetSeconds: number;    // goal duration in seconds
}

/**
 * Format a duration in seconds as a friendly "Xh Ym" / "Xm" string. Used for
 * "past your goal" labels where HH:MM:SS reads as clinical / timer-y instead
 * of celebratory. (Audit feedback: `+03:56:02 over goal` looked like an error
 * code more than a milestone.)
 */
function formatFriendlyDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function Timer({ elapsed, targetSeconds }: TimerProps) {
  const remaining = targetSeconds - elapsed;
  const reachedGoal = remaining <= 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="font-mono text-[28px] tabular-nums leading-none"
        style={{ color: "var(--ink)", fontWeight: 500, letterSpacing: "0.02em" }}
      >
        {formatElapsed(elapsed)}
      </div>
      <div className="label-cap text-[8.5px]" style={{ color: "var(--ink-3)" }}>
        {reachedGoal
          ? `${formatFriendlyDuration(-remaining)} past goal`
          : `${formatElapsed(remaining)} remaining`}
      </div>
    </div>
  );
}
