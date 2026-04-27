import { motion } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import { useStore } from "../../lib/store";
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  getNextAchievements,
} from "../../lib/achievements";

/**
 * Within-reach achievements — only rendered in idle state.
 *
 * Shows the 3 non-secret achievements closest to unlocking with their
 * progress bars colored by rarity. The dopamine hook is *anticipation*:
 * "8/10 fasts to Veteran" makes the next unlock feel earnable.
 *
 * Tappable header opens the full achievements panel for the long view.
 */
export function AchievementsPreviewCard() {
  const isFasting = useStore((s) => s.isFasting);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const unlockedAchievements = useStore((s) => s.unlockedAchievements);
  const getAchievementStats = useStore((s) => s.getAchievementStats);

  if (isFasting) return null;

  const stats = getAchievementStats();
  const unlockedSet = new Set(unlockedAchievements.map((a) => a.id));
  const nextThree = getNextAchievements(stats, unlockedSet, 3);
  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <div
      className="flex flex-col gap-2"
      style={{
        background: "var(--bg-1)",
        borderRadius: "var(--card-radius)",
        paddingInline: "var(--card-pad-x)",
        paddingBlock: "9px",
        border: "1px solid var(--hairline)",
      }}
    >
      <button
        type="button"
        onClick={() => setActivePanel("achievements")}
        className="flex items-center justify-between cursor-pointer group focus:outline-none"
        aria-label="Open achievements panel"
      >
        <div className="flex items-center gap-2">
          <Award size={11} style={{ color: "var(--gold)" }} />
          <span
            className="label-cap text-[8.5px]"
            style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
          >
            Within Reach
          </span>
          <span
            className="font-mono text-[9px] tabular-nums"
            style={{ color: "var(--ink-3)" }}
          >
            {totalUnlocked}/{totalAchievements} unlocked
          </span>
        </div>
        <ChevronRight
          size={11}
          style={{ color: "var(--ink-3)" }}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>

      {nextThree.length === 0 ? (
        <div className="text-[10px] py-1 text-center" style={{ color: "var(--ink-3)" }}>
          You've unlocked everything within reach. Push deeper.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {nextThree.map((a) => {
            const pr = a.progress!(stats);
            const ratio = pr.target > 0 ? Math.min(1, pr.current / pr.target) : 0;
            const colors = RARITY_COLORS[a.rarity];
            return (
              <div key={a.id} className="flex items-center gap-2.5">
                {/* Bigger icon (was 5×5 with a 9px award — looked gray-uniform at
                    that size). Now 7×7 with 12px award + rarity-tinted border so
                    the rarity is unmissable at a glance (audit #7). */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.text}`,
                    boxShadow: ratio > 0.7 ? `0 0 8px ${colors.glow}` : undefined,
                  }}
                >
                  <Award size={12} style={{ color: colors.text }} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[10.5px] truncate"
                      style={{ color: colors.text, fontWeight: 700, letterSpacing: "-0.005em" }}
                    >
                      {a.name}
                    </span>
                    <span
                      className="font-mono text-[9px] tabular-nums flex-shrink-0"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {pr.current}/{pr.target}
                    </span>
                  </div>
                  <div
                    className="w-full overflow-hidden"
                    style={{ background: "var(--ink-4)", height: "3px", borderRadius: "999px" }}
                  >
                    <motion.div
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        background: colors.text,
                        boxShadow: `0 0 4px ${colors.glow}`,
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
