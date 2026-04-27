import { useStore } from "../../lib/store";
import { levelFromXp, getRankTitle, xpProgressInLevel } from "../../lib/gamification";
import { STAGES } from "../../lib/stages";
import { Droplet, BarChart2 } from "lucide-react";
import { PanelHeader } from "../../components/ui";

export function StatsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const totalXp = useStore((s) => s.totalXp);
  const completedFasts = useStore((s) => s.completedFasts);
  const currentStreak = useStore((s) => s.currentStreak);
  const longestStreak = useStore((s) => s.longestStreak);
  const maxLevelReached = useStore((s) => s.maxLevelReached);
  const stageEntryHistory = useStore((s) => s.stageEntryHistory);
  const hydrationToday = useStore((s) => s.hydrationToday);
  const hydrationGoalGlasses = useStore((s) => s.hydrationGoalGlasses);
  const hydrationLastResetDate = useStore((s) => s.hydrationLastResetDate);

  const totalHours = completedFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0);
  const avgDuration = completedFasts.length > 0
    ? totalHours / completedFasts.length
    : 0;
  const longestFast = completedFasts.reduce((max, f) => Math.max(max, f.elapsedSeconds / 3600), 0);
  const level = levelFromXp(totalXp);
  const xpProgress = xpProgressInLevel(totalXp);

  // This-week aggregates (last 7 days from completed fasts).
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const weekFasts = completedFasts.filter((f) => f.endTime >= sevenDaysAgo);
  const weekHours = weekFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0);

  // Mood average across recorded moods.
  const moodFasts = completedFasts.filter((f) => typeof f.mood === "number");
  const avgMood = moodFasts.length > 0
    ? moodFasts.reduce((sum, f) => sum + (f.mood ?? 0), 0) / moodFasts.length
    : 0;

  // Today's hydration display (auto-resets if date stale)
  const todayDateStr = new Date().toISOString().split("T")[0];
  const displayedHydration = hydrationLastResetDate === todayDateStr ? hydrationToday : 0;

  const last30 = completedFasts.slice(0, 30);
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
          { label: "Total Fasts", value: completedFasts.length.toString() },
          { label: "Total Hours", value: Math.floor(totalHours).toString() },
          { label: "Avg Duration", value: avgDuration.toFixed(1) + "h" },
          { label: "Longest Fast", value: longestFast.toFixed(1) + "h" },
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
            <span className="text-lg font-bold text-ink font-mono">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-ink-3 uppercase tracking-wider">Level & XP</span>
          <span className="text-[10px] text-ink-4">{totalXp} total XP</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center font-bold text-lg"
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
                style={{
                  width: `${xpProgress.percentage}%`,
                  background: "var(--ember)",
                }}
              />
            </div>
            <span className="text-[9px] text-ink-4">
              {xpProgress.current} / {xpProgress.required} XP to level {level + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Streak</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--ember)" }}>{currentStreak} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Best</span>
            <span className="text-sm font-bold text-ink-2">{longestStreak} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-ink-3 uppercase">Max Level</span>
            <span className="text-sm font-bold text-ink-2">{maxLevelReached}</span>
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
            <span className="text-sm font-bold text-ink">
              {weekFasts.length}<span className="text-ink-3 text-[11px]"> fasts · </span>
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
              <span className="text-[11px] font-mono font-bold text-ink-2">
                {avgMood.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Stage history bar chart */}
        {completedFasts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-ink-3 uppercase tracking-wider">Last {last30.length} Fasts</span>
            <div className="flex items-end gap-0.5 h-10">
              {last30.map((fast, i) => {
                const height = Math.max(2, (fast.elapsedSeconds / 3600 / 24) * maxBarHeight);
                const stageIdx = Math.min(STAGES.length - 1, fast.stageReached);
                const color = STAGES[stageIdx]?.color || "var(--ember)";
                return (
                  <div
                    key={fast.id}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${height}px`,
                      background: color,
                      opacity: 0.3 + (i / last30.length) * 0.7,
                    }}
                    title={`${(fast.elapsedSeconds / 3600).toFixed(1)}h`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
