import { useMemo } from "react";
import { Droplet, Plus, Minus } from "lucide-react";
import { useStore } from "../../lib/store";

/**
 * Daily hydration tracker — single continuous progress bar.
 *
 * Replaces the previous 8-segment "broken pipe" rendering with one cohesive
 * water-color progress bar overlaid by a count. Plus / minus buttons adjust.
 *
 * Auto-resets at midnight via the store's date-rollover logic in the
 * `incrementHydration` / `decrementHydration` actions. The display value
 * clamps to 0 when the stored count is from a previous day.
 */
export function HydrationCard() {
  const hydrationToday = useStore((s) => s.hydrationToday);
  const hydrationGoalGlasses = useStore((s) => s.hydrationGoalGlasses);
  const hydrationLastResetDate = useStore((s) => s.hydrationLastResetDate);
  const incrementHydration = useStore((s) => s.incrementHydration);
  const decrementHydration = useStore((s) => s.decrementHydration);

  const todayDateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const displayedHydration =
    hydrationLastResetDate === todayDateStr ? hydrationToday : 0;
  const cappedCount = Math.min(displayedHydration, hydrationGoalGlasses);
  const pct = (cappedCount / Math.max(1, hydrationGoalGlasses)) * 100;
  const reachedGoal = displayedHydration >= hydrationGoalGlasses;

  return (
    <div
      className="flex items-center gap-3"
      style={{
        background: "var(--bg-1)",
        borderRadius: "var(--card-radius)",
        paddingInline: "var(--card-pad-x)",
        paddingBlock: "9px",
        border: "1px solid var(--hairline)",
      }}
      aria-label={`Daily hydration ${displayedHydration} of ${hydrationGoalGlasses}`}
    >
      <Droplet
        size={12}
        style={{ color: "var(--water)", flexShrink: 0 }}
        fill={cappedCount > 0 ? "var(--water)" : "none"}
        fillOpacity={cappedCount > 0 ? 0.18 : 0}
      />

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="label-cap text-[8.5px]" style={{ color: "var(--ink-2)" }}>
            Hydration · Today
          </span>
          <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--ink)" }}>
            {displayedHydration}
            <span style={{ color: "var(--ink-3)" }}> / {hydrationGoalGlasses}</span>
            <span className="ml-1" style={{ color: "var(--ink-3)" }}>glasses</span>
          </span>
        </div>
        {/* Single continuous bar — fills with water color, glows softly when goal reached. */}
        <div
          className="w-full overflow-hidden"
          style={{
            background: "var(--ink-4)",
            height: "6px",
            borderRadius: "999px",
          }}
        >
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${pct}%`,
              background: "var(--water)",
              borderRadius: "999px",
              boxShadow: reachedGoal
                ? "0 0 8px var(--water-glow)"
                : "0 0 4px var(--water-soft)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={decrementHydration}
          disabled={displayedHydration === 0}
          className="w-5 h-5 flex items-center justify-center r-chip cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
          aria-label="Remove a glass"
        >
          <Minus size={10} />
        </button>
        <button
          type="button"
          onClick={incrementHydration}
          className="w-5 h-5 flex items-center justify-center r-chip cursor-pointer transition-colors"
          style={{ background: "var(--water)", color: "var(--bg-0)" }}
          aria-label="Add a glass of water"
          title="Add a glass"
        >
          <Plus size={10} />
        </button>
      </div>
    </div>
  );
}
