import { formatElapsed } from "../lib/stages";

interface TimerProps {
  elapsed: number;          // seconds since fast start
  targetSeconds: number;    // goal duration in seconds
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
          ? `+${formatElapsed(-remaining)} over goal`
          : `${formatElapsed(remaining)} remaining`}
      </div>
    </div>
  );
}
