import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { levelFromXp, getRankTitle, xpProgressInLevel } from "../lib/gamification";
import { STAGES } from "../lib/stages";
import { X, BarChart2 } from "lucide-react";

export function StatsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const totalXp = useStore((s) => s.totalXp);
  const completedFasts = useStore((s) => s.completedFasts);
  const currentStreak = useStore((s) => s.currentStreak);
  const longestStreak = useStore((s) => s.longestStreak);
  const maxLevelReached = useStore((s) => s.maxLevelReached);
  const stageEntryHistory = useStore((s) => s.stageEntryHistory);

  const totalHours = completedFasts.reduce((sum, f) => sum + f.elapsedSeconds / 3600, 0);
  const avgDuration = completedFasts.length > 0
    ? totalHours / completedFasts.length
    : 0;
  const longestFast = completedFasts.reduce((max, f) => Math.max(max, f.elapsedSeconds / 3600), 0);
  const level = levelFromXp(totalXp);
  const xpProgress = xpProgressInLevel(totalXp);

  const last30 = completedFasts.slice(0, 30);
  const maxBarHeight = 40;

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-white/50" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/70">Stats</span>
        </div>
        <button
          onClick={() => setActivePanel("main")}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total Fasts", value: completedFasts.length.toString() },
          { label: "Total Hours", value: Math.floor(totalHours).toString() },
          { label: "Avg Duration", value: avgDuration.toFixed(1) + "h" },
          { label: "Longest Fast", value: longestFast.toFixed(1) + "h" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-3 flex flex-col gap-1"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</span>
            <span className="text-lg font-bold text-white font-mono">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Level & XP</span>
          <span className="text-[10px] text-white/30">{totalXp} total XP</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{
              background: "rgba(168,85,247,0.2)",
              border: "1px solid rgba(168,85,247,0.4)",
              color: "#a855f7",
            }}
          >
            {level}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-bold text-white">{getRankTitle(level)}</span>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${xpProgress.percentage}%`,
                  background: "linear-gradient(90deg, #a855f7, #ec4899)",
                }}
              />
            </div>
            <span className="text-[9px] text-white/30">
              {xpProgress.current} / {xpProgress.required} XP to level {level + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase">Streak</span>
            <span className="text-sm font-bold text-orange-400">{currentStreak} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase">Best</span>
            <span className="text-sm font-bold text-white/60">{longestStreak} days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase">Max Level</span>
            <span className="text-sm font-bold text-white/60">{maxLevelReached}</span>
          </div>
        </div>

        {/* Stage history bar chart */}
        {completedFasts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Last {last30.length} Fasts</span>
            <div className="flex items-end gap-0.5 h-10">
              {last30.map((fast, i) => {
                const height = Math.max(2, (fast.elapsedSeconds / 3600 / 24) * maxBarHeight);
                const stageIdx = Math.min(STAGES.length - 1, fast.stageReached);
                const color = STAGES[stageIdx]?.color || "#a855f7";
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
