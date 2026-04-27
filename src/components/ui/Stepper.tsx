import { Minus, Plus } from "lucide-react";

/**
 * Numeric stepper — minus / value / plus, clamped to [min, max].
 * Buttons disable at the bounds so users can't overshoot.
 */
export function Stepper({
  value,
  min,
  max,
  onDec,
  onInc,
}: {
  value: number;
  min: number;
  max: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= min}
        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
        aria-label="Decrease"
      >
        <Minus size={11} />
      </button>
      <span
        className="font-mono text-[12px] font-bold tabular-nums w-6 text-center"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= max}
        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
        aria-label="Increase"
      >
        <Plus size={11} />
      </button>
    </div>
  );
}
