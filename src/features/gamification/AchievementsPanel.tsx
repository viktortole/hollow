import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { useStore } from "../../lib/store";
import { ACHIEVEMENTS, RARITY_COLORS, type AchievementRarity } from "../../lib/achievements";
import { PanelHeader } from "../../components/ui";

const RARITY_ORDER: AchievementRarity[] = ["legendary", "epic", "rare", "common"];
const RARITY_LABELS: Record<AchievementRarity, string> = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

/**
 * Achievements panel — grouped by rarity. Locked achievements show progress
 * bars (when computable) so the user can see what's within reach. Rarity is
 * colored: gold (legendary) · ember (epic) · water (rare) · neutral (common).
 */
export function AchievementsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const unlockedAchievements = useStore((s) => s.unlockedAchievements);
  const getAchievementStats = useStore((s) => s.getAchievementStats);

  const unlockedSet = new Set(unlockedAchievements.map((a) => a.id));
  const stats = getAchievementStats();

  const grouped = RARITY_ORDER.map((r) => ({
    rarity: r,
    items: ACHIEVEMENTS.filter((a) => a.rarity === r),
  }));

  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        paddingInline: "var(--widget-pad-x)",
        paddingBlock: "var(--widget-pad-y)",
        gap: "10px",
      }}
    >
      <PanelHeader
        icon={<Award size={13} style={{ color: "var(--gold)" }} />}
        title="Achievements"
        onBack={() => setActivePanel("main")}
        trailing={
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[14px] tabular-nums" style={{ color: "var(--ink)", fontWeight: 700 }}>
              {totalUnlocked}
            </span>
            <span className="font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>
              / {totalAchievements}
            </span>
          </div>
        }
      />

      {/* GLOBAL PROGRESS */}
      <div
        className="w-full overflow-hidden"
        style={{ background: "var(--ink-4)", height: "4px", borderRadius: "999px" }}
      >
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, var(--ember), var(--gold))",
            boxShadow: "0 0 6px var(--ember-glow)",
            borderRadius: "999px",
          }}
        />
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3">
        {grouped.map(({ rarity, items }) => {
          const unlockedInRarity = items.filter((i) => unlockedSet.has(i.id)).length;
          const colors = RARITY_COLORS[rarity];
          return (
            <div key={rarity} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between px-1">
                <span
                  className="label-cap text-[8.5px]"
                  style={{ color: colors.text, letterSpacing: "0.22em", fontWeight: 700 }}
                >
                  {RARITY_LABELS[rarity]}
                </span>
                <span
                  className="font-mono text-[8.5px] tabular-nums"
                  style={{ color: "var(--ink-3)" }}
                >
                  {unlockedInRarity}/{items.length}
                </span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {items.map((a) => {
                  const isUnlocked = unlockedSet.has(a.id);
                  const unlocked = unlockedAchievements.find((u) => u.id === a.id);
                  const pr = a.progress?.(stats);
                  const ratio = pr ? Math.min(1, pr.current / pr.target) : 0;
                  const isSecretLocked = a.secret && !isUnlocked;

                  return (
                    <motion.div
                      key={a.id}
                      className="relative flex flex-col gap-1 overflow-hidden"
                      style={{
                        background: isUnlocked ? colors.bg : "var(--bg-2)",
                        borderRadius: "var(--card-radius)",
                        paddingInline: "10px",
                        paddingBlock: "8px",
                        boxShadow: isUnlocked
                          ? `var(--shadow-card), 0 0 12px ${colors.glow}`
                          : "var(--shadow-card)",
                        border: isUnlocked ? `1px solid ${colors.text}55` : "1px solid transparent",
                        opacity: isUnlocked ? 1 : 0.7,
                      }}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: isUnlocked ? 1 : 0.7, scale: 1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isUnlocked ? colors.bg : "var(--bg-3)",
                            border: isUnlocked ? `1px solid ${colors.text}` : "none",
                          }}
                        >
                          {isUnlocked ? (
                            <Award size={13} style={{ color: colors.text }} />
                          ) : (
                            <Lock size={11} style={{ color: "var(--ink-4)" }} />
                          )}
                        </div>
                      </div>
                      <span
                        className="text-[10.5px] font-bold leading-tight"
                        style={{ color: isUnlocked ? "var(--ink)" : "var(--ink-2)" }}
                      >
                        {isSecretLocked ? "???" : a.name}
                      </span>
                      <span
                        className="text-[9px] leading-tight"
                        style={{ color: "var(--ink-3)" }}
                      >
                        {isSecretLocked ? "Secret achievement" : a.description}
                      </span>
                      {!isUnlocked && pr && !a.secret && (
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <div
                            className="w-full overflow-hidden"
                            style={{
                              background: "var(--ink-4)",
                              height: "3px",
                              borderRadius: "999px",
                            }}
                          >
                            <motion.div
                              className="h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${ratio * 100}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              style={{
                                background: colors.text,
                                borderRadius: "999px",
                              }}
                            />
                          </div>
                          <span
                            className="font-mono text-[8.5px] tabular-nums self-end"
                            style={{ color: colors.text }}
                          >
                            {pr.current}/{pr.target}
                          </span>
                        </div>
                      )}
                      {isUnlocked && unlocked && (
                        <span className="text-[8.5px] font-mono" style={{ color: "var(--ink-3)" }}>
                          {new Date(unlocked.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
