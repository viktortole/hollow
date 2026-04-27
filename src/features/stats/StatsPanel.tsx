import { useStore } from "../../lib/store";
import { levelFromXp, getRankTitle, xpProgressInLevel } from "../../lib/gamification";
import { STAGES } from "../../lib/stages";
import { Droplet, BarChart2 } from "lucide-react";
import { PanelHeader } from "../../components/ui";

/**
 * Fasts shorter than 1 minute are almost always accidental "tap-Start-then-End"
 * mistakes — they pollute averages and bar charts. Stats hide them; they still
 * exist on disk so the user owns the data.
 */
const MIN_REAL_FAST_SECONDS = 60;

/** Pluralize "day" / "days" — small thing, looks careless when wrong. */
function days(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

export function StatsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const totalXp = useStore((s) => s.totalXp);
  const completedFasts = useStore((s) => s.completedFasts);
  const currentStreak = useStore((s) => s.currentStreak);
  const longestStreak = useStore((s) => s.longestStreak);
  const maxLevelReached = useStore((s) => s.maxLevelReached);
  const hydrationToday = useStore((s) => s.hydrationToday);
  const hydrationGoalGlasses = useStore((s) => s.hydrationGoalGlasses);
  const hydrationLastResetDate = useStore((s) => s.hydrationLastResetDate);

  // Filter for "real" fasts — anything ≥ 60s. Drops accidental immediate-end mistakes
  // from averages and the chart so a single 17h fast next to three 7-second fasts
  // doesn't show "Avg 4.3h". The full completedFasts list is still preserved on disk.
  const realFasts = completedFasts.filter((f) => f.elapsedSeconds >= MIN_REAL_FAST_SECONDS);
  const skippedCount = completedFasts.length - realFasts.length;

  const totalHours = realFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0);
  const avgDuration = realFasts.length > 0 ? totalHours / realFasts.length : 0;
  const longestFast = realFasts.reduce((max, f) => Math.max(max, f.elapsedSeconds / 3600), 0);
  const level = levelFromXp(totalXp);
  const xpProgress = xpProgressInLevel(totalXp);

  // This-week aggregates (last 7 days from real fasts).
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const weekFasts = realFasts.filter((f) => f.endTime >= sevenDaysAgo);
  const weekHours = weekFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0);

  // Mood average across recorded moods (only on real fasts).
  const moodFasts = realFasts.filter((f) => typeof f.mood === "number");
  const avgMood = moodFasts.length > 0
    ? moodFasts.reduce((sum, f) => sum + (f.mood ?? 0), 0) / moodFasts.length
    : 0;

  const todayDateStr = new Date().toISOString().split("T")[0];
  const displayedHydration = hydrationLastResetDate === todayDateStr ? hydrationToday : 0;

  // Bar chart: most recent 14 real fasts, newest on the right (reversed for left-to-right time).
  const chartFasts = realFasts.slice(0, 14).reverse();
  const chartMaxHours = Math.max(24, ...chartFasts.map((f) => f.elapsedSeconds / 3600));
  const maxBarHeight = 40;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden"
      style={{ paddingInline: "var(--widget-pad-x)", paddingBlock: "var(--widget-pad-y)", gap: "var(--card-gap)" }}>
      <PanelHeader
        icon={<BarChart2 size={13} style={{ color: "var(--ink-3)" }} />}
        title="Stats"
        onBack={() => setActivePanel("main")}
      />

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total Fasts", value: realFasts.length.toString() },
          { label: "Total Hours", value: totalHours.toFixed(1) + "h" },
          { label: "Avg Duration", value: realFasts.length > 0 ? avgDuration.toFixed(1) + "h" : "—" },
          { label: "Longest Fast", value: realFasts.length > 0 ? longestFast.toFixed(1) + "h" : "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1"
            style={{
              background: "var(--bg-2)",
              borderRadius: "var(--card-radius)",
              paddingInline: "var(--card-pad-x)",
              paddingBlock: "var(--card-pad-y)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <span className="text-[9px] text-ink-3 uppercase tracking-wider">{stat.label}</span>
            <span className="text-lg font-bold text-ink font-mono tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      {skippedCount > 0 && (
        <div className="text-[9px] -mt-1" style={{ color: "var(--ink-3)" }}>
          {skippedCount} short {skippedCount === 1 ? "fast" : "fasts"} (under 1 min) excluded from these stats.
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-ink-3 uppercase tracking-wider">Level &amp; XP</span>
          <span className="text-[10px] text-ink-4 tabular-nums">{totalXp} total XP</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center font-bold text-lg tabular-nums"
            style={{
              background: "var(--ember-soft)",
              borderRadius: "var(--card-radius)",
              color: "var(--ember)",
            }}
          >
            {level}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold text-ink">{getRankTitle(level)}</span>
            <div className="w-full h-1.5 bg-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${xpProgress.percentage}%`, background: "var(--ember)" }}
              />
            </div>
            <span className="text-[9px] text-ink-4 tabular-nums">
              {xpProgress.current} / {xpProgress.required} XP to level {level + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Streak</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--ember)" }}>
              {days(currentStreak)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Best</span>
            <span className="text-sm font-bold text-ink-2 tabular-nums">{days(longestStreak)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Max Level</span>
            <span className="text-sm font-bold text-ink-2 tabular-nums">{maxLevelReached}</span>
          </div>
        </div>

        {/* THIS WEEK + HYDRATION + MOOD strip — premium-grade at-a-glance summary. */}
        <div
          className="flex items-center gap-3"
          style={{
            background: "var(--bg-2)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "8px",
          }}
        >
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] text-ink-3 uppercase tracking-wider">This Week</span>
            <span className="text-sm font-bold text-ink tabular-nums">
              {weekFasts.length}
              <span className="text-ink-3 text-[11px]">
                {weekFasts.length === 1 ? " fast · " : " fasts · "}
              </span>
              {weekHours.toFixed(1)}h
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 pl-3"
            style={{ borderLeft: "1px solid var(--hairline)" }}
          >
            <Droplet
              size={11}
              style={{ color: "var(--water)" }}
              fill={displayedHydration > 0 ? "var(--water)" : "none"}
              fillOpacity={displayedHydration > 0 ? 0.5 : 0}
            />
            <span className="text-sm font-bold text-ink tabular-nums">
              {displayedHydration}
              <span className="text-ink-3 text-[11px]">/{hydrationGoalGlasses}</span>
            </span>
          </div>
          {moodFasts.length > 0 && (
            <div
              className="flex items-center gap-1 pl-3"
              style={{ borderLeft: "1px solid var(--hairline)" }}
              title={`Average mood across ${moodFasts.length} fast${moodFasts.length === 1 ? "" : "s"}`}
            >
              <span className="text-base leading-none">
                {["😫", "😐", "🙂", "😄", "🤩"][Math.round(avgMood) - 1]}
              </span>
              <span className="text-[11px] font-mono font-bold text-ink-2 tabular-nums">
                {avgMood.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Recent-fasts bar chart — fixed-width bars (not flex-1) so the chart anchors
            left and reads as a real chart even when there are few entries. Empty state
            when no real fasts yet. */}
        {chartFasts.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] text-ink-3 uppercase tracking-wider">
                Recent Fasts
              </span>
              <span className="text-[9px] text-ink-4 font-mono tabular-nums">
                {chartFasts.length} most recent
              </span>
            </div>
            <div
              className="flex items-end gap-1 h-10"
              style={{ borderBottom: "1px solid var(--hairline)" }}
            >
              {chartFasts.map((fast, i) => {
                const hours = fast.elapsedSeconds / 3600;
                const height = Math.max(3, (hours / chartMaxHours) * maxBarHeight);
                const stageIdx = Math.min(STAGES.length - 1, fast.stageReached);
                const color = STAGES[stageIdx]?.color || "var(--ember)";
                return (
                  <div
                    key={fast.id}
                    className="rounded-sm transition-all"
                    style={{
                      width: "16px",
                      height: `${height}px`,
                      background: color,
                      opacity: 0.4 + (i / Math.max(1, chartFasts.length - 1)) * 0.6,
                    }}
                    title={`${hours.toFixed(1)}h — ${fast.completed ? "completed" : "ended early"}`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="text-[10px] text-center py-3"
            style={{ color: "var(--ink-3)" }}
          >
            Complete a fast to start tracking history.
          </div>
        )}
      </div>
    </div>
  );
}
