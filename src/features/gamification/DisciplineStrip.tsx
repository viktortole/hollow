import { motion } from "framer-motion";
import { Flame, Trophy, Sparkles } from "lucide-react";
import { useStore } from "../../lib/store";
import {
  levelFromXp,
  xpProgressInLevel,
  getRankTitle,
  liveXpEarning,
  xpPerHour,
} from "../../lib/gamification";
import { STAGES, getStageIndex } from "../../lib/stages";
import { getRecentStreakDays } from "../../lib/streak";
import { useFastingClock } from "../../hooks/useFastingClock";

/**
 * Discipline profile — rank, level, live XP, streak dots, stage multiplier.
 *
 * During an active fast, XP ticks up in real time using `liveXpEarning` so the
 * dopamine payoff is constant, not deferred to fast-end. The seven-day streak
 * dots make the streak visible/legible at a glance — a row of filled circles
 * is far more rewarding than "5d" alone.
 *
 * Layout (top → bottom):
 *   row 1 — Trophy · Rank · LV chip   |   live XP · streak counter · multiplier
 *   row 2 — XP progress bar (gradient + shimmer) + percentage + next-rank teaser
 *   row 3 — 7-day streak dots
 */
export function DisciplineStrip() {
  const totalXp = useStore((s) => s.totalXp);
  const currentStreak = useStore((s) => s.currentStreak);
  const longestStreak = useStore((s) => s.longestStreak);
  const completedFasts = useStore((s) => s.completedFasts);
  const isFasting = useStore((s) => s.isFasting);
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);

  const clock = useFastingClock();
  const liveElapsed = isFasting && fastStartTimestamp ? clock.elapsed : 0;
  const liveXp = isFasting ? liveXpEarning(liveElapsed, STAGES) : 0;
  const stageIdx = isFasting ? getStageIndex(liveElapsed / 3600) : -1;
  const stage = stageIdx >= 0 ? STAGES[stageIdx] : null;
  const xpRate = stage ? xpPerHour(stageIdx) : 0;

  const projectedTotalXp = totalXp + liveXp;
  const level = levelFromXp(projectedTotalXp);
  const rank = getRankTitle(level);
  const nextRank = getRankTitle(level + 1);
  const xp = xpProgressInLevel(projectedTotalXp);

  const streakMultiplier =
    currentStreak >= 30 ? 2.0 :
    currentStreak >= 14 ? 1.5 :
    currentStreak >= 7  ? 1.25 :
    currentStreak >= 3  ? 1.1 : 1;

  const flameIntensity = Math.min(1, currentStreak / 14);
  const isPersonalBest = currentStreak > 0 && currentStreak >= longestStreak;
  const weekDays = getRecentStreakDays(completedFasts, 7);

  return (
    <div
      className="relative flex flex-col gap-2 overflow-hidden"
      style={{
        background: "var(--bg-2)",
        borderRadius: "var(--card-radius)",
        paddingInline: "var(--card-pad-x)",
        paddingBlock: "11px",
        boxShadow: "var(--shadow-card)",
      }}
      aria-label="Discipline profile"
    >
      <div
        className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(270deg, var(--ember-soft) 0%, transparent 100%)",
          opacity: 0.6,
        }}
        aria-hidden
      />

      {/* TOP ROW — rank + level + XP + streak + multiplier */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy
            size={11}
            style={{ color: "var(--ember)", flexShrink: 0 }}
            fill="var(--ember)"
            fillOpacity={0.18}
          />
          <span
            className="label-cap text-[8.5px]"
            style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
          >
            Rank
          </span>
          <span
            className="text-[14px] truncate"
            style={{
              color: "var(--ink)",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            {rank}
          </span>
          <span
            className="font-mono text-[9.5px] px-1.5 py-0.5 r-chip flex-shrink-0"
            style={{
              color: "var(--bg-0)",
              background: "var(--ember)",
              letterSpacing: "0.04em",
              fontWeight: 700,
            }}
          >
            LV {level}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {streakMultiplier > 1 && (
            <span
              className="font-mono text-[9.5px] px-1.5 py-0.5 r-chip"
              style={{
                background: "var(--ember-soft)",
                color: "var(--ember)",
                letterSpacing: "0.04em",
                fontWeight: 700,
              }}
              title={`${streakMultiplier}x XP from streak`}
            >
              ×{streakMultiplier}
            </span>
          )}
          <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--ink)" }}>
            {xp.current}
            <span style={{ color: "var(--ink-3)" }}>/{xp.required}</span>
            <span className="ml-1 label-cap text-[8px]" style={{ color: "var(--ink-3)" }}>XP</span>
          </span>
          <div className="flex items-center gap-1">
            <Flame
              size={12}
              style={{
                color: currentStreak > 0 ? "var(--ember)" : "var(--ink-3)",
                filter:
                  currentStreak > 0
                    ? `drop-shadow(0 0 ${4 + flameIntensity * 6}px var(--ember-glow))`
                    : undefined,
              }}
              fill={currentStreak > 0 ? "var(--ember)" : "none"}
              fillOpacity={currentStreak > 0 ? 0.2 + flameIntensity * 0.4 : 0}
            />
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{
                color: currentStreak > 0 ? "var(--ink)" : "var(--ink-2)",
                fontWeight: isPersonalBest ? 700 : 400,
              }}
            >
              {currentStreak}
              <span className="label-cap text-[8px] ml-0.5" style={{ color: "var(--ink-3)" }}>d</span>
            </span>
          </div>
        </div>
      </div>

      {/* XP BAR — bigger, tracks the live projected total */}
      <div className="relative flex flex-col gap-1">
        <div
          className="w-full overflow-hidden relative"
          style={{
            background: "var(--ink-4)",
            borderRadius: "999px",
            height: "5px",
          }}
          aria-label={`XP progress ${xp.current} of ${xp.required}`}
        >
          <motion.div
            className="h-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(xp.percentage, xp.current > 0 ? 4 : 0)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: "linear-gradient(90deg, var(--ember) 0%, var(--gold) 100%)",
              boxShadow: "0 0 8px var(--ember-glow), 0 0 14px rgba(201,169,97,0.22)",
              borderRadius: "999px",
            }}
          >
            <motion.div
              className="absolute inset-y-0 w-8"
              animate={{ x: ["-32px", "240px"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.36) 50%, transparent 100%)",
                mixBlendMode: "overlay",
              }}
            />
          </motion.div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="label-cap text-[8px]"
            style={{ color: "var(--ink-3)", letterSpacing: "0.16em" }}
          >
            {projectedTotalXp === 0
              ? "Earn your first XP"
              : `${Math.round(xp.percentage)}% to next`}
          </span>
          {isFasting && stage ? (
            // "+183 this fast · 12 xp/h" — explicit dot separator + spacing so the
            // two facts (earned-this-fast and current rate) read as distinct chunks
            // (audit #17). Tabular-nums on both numbers for stable widths.
            <span className="flex items-center gap-1.5 text-[9px] font-mono">
              <Sparkles size={9} style={{ color: "var(--ember)" }} />
              <span className="tabular-nums" style={{ color: "var(--ember)", fontWeight: 600 }}>
                +{liveXp}
              </span>
              <span className="label-cap text-[7.5px]" style={{ color: "var(--ink-3)", letterSpacing: "0.16em" }}>
                this fast
              </span>
              <span style={{ color: "var(--ink-4)" }}>·</span>
              <span className="tabular-nums" style={{ color: "var(--ink-2)", fontWeight: 600 }}>
                {xpRate.toFixed(0)}
              </span>
              <span className="label-cap text-[7.5px]" style={{ color: "var(--ink-3)", letterSpacing: "0.16em" }}>
                xp/h
              </span>
            </span>
          ) : (
            <span
              className="text-[9.5px] truncate"
              style={{ color: "var(--ink-3)", fontStyle: "italic", letterSpacing: "0.01em" }}
            >
              next: {nextRank}
            </span>
          )}
        </div>
      </div>

      {/* WEEKLY STREAK BAND — last 7 days, glyphs that read at a glance */}
      <div
        className="relative flex items-center justify-between gap-2 pt-1.5"
        style={{ borderTop: "1px solid var(--hairline)" }}
        aria-label="Last 7 days streak"
      >
        <span
          className="label-cap text-[7.5px] flex-shrink-0"
          style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
        >
          Last 7
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          {weekDays.map((d, i) => (
            <div key={`${d.date}-${i}`} className="flex flex-col items-center gap-0.5">
              <span
                className="text-[8px] font-mono"
                style={{
                  color: d.isToday ? "var(--ember)" : "var(--ink-4)",
                  fontWeight: d.isToday ? 700 : 400,
                  letterSpacing: "0.04em",
                }}
              >
                {d.weekdayLabel}
              </span>
              {/* Bumped from 14 to 18 px and dot diameter from 9 to 11 px. The
                  weekly band was previously cramped (audit #14); larger marks
                  make today legible at a glance. */}
              <div className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
                {d.isToday && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1.5px solid var(--ember)",
                      boxShadow: "0 0 6px var(--ember-glow)",
                    }}
                    aria-hidden
                  />
                )}
                <div
                  className="rounded-full"
                  style={{
                    width: d.hadFast ? 11 : 5,
                    height: d.hadFast ? 11 : 5,
                    background: d.hadFast ? "var(--ember)" : "var(--ink-4)",
                    boxShadow: d.hadFast
                      ? "0 0 6px var(--ember-glow), 0 0 1px rgba(0,0,0,0.4)"
                      : undefined,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <span
          className="font-mono text-[8.5px] tabular-nums flex-shrink-0"
          style={{ color: longestStreak > 0 ? "var(--ink-2)" : "var(--ink-3)" }}
          title={`Longest streak ${longestStreak} days`}
        >
          {longestStreak > 0 ? `best ${longestStreak}d` : "—"}
        </span>
      </div>
    </div>
  );
}
