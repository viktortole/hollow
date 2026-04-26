import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { ACHIEVEMENTS } from "../lib/achievements";
import { Award, Lock, X } from "lucide-react";

export function AchievementsPanel() {
  const setActivePanel = useStore((s) => s.setActivePanel);
  const unlockedAchievements = useStore((s) => s.unlockedAchievements);

  const unlockedSet = new Set(unlockedAchievements.map((a) => a.id));

  return (
    <div className="w-full h-full flex flex-col p-4 gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-white/50" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/70">
            Achievements
          </span>
          <span className="text-[10px] text-white/30">
            {unlockedAchievements.length} / {ACHIEVEMENTS.length}
          </span>
        </div>
        <button
          onClick={() => setActivePanel("main")}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignContent: "start" }}
      >
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedAchievements.find((a) => a.id === ach.id);
          const isUnlocked = unlockedSet.has(ach.id);

          return (
            <motion.div
              key={ach.id}
              className="relative rounded-xl p-3 flex flex-col gap-1.5 transition-all"
              style={{
                background: isUnlocked ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.03)",
                border: isUnlocked
                  ? "1px solid rgba(168,85,247,0.3)"
                  : "1px solid rgba(255,255,255,0.05)",
                opacity: isUnlocked ? 1 : 0.5,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isUnlocked ? 1 : 0.5, scale: 1 }}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: isUnlocked ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  {isUnlocked ? (
                    <Award size={16} style={{ color: "#eab308" }} />
                  ) : (
                    <Lock size={14} className="text-white/20" />
                  )}
                </div>
                {ach.secret && !isUnlocked && (
                  <span className="text-[8px] text-white/20 uppercase tracking-wider">???</span>
                )}
              </div>

              <div className="flex flex-col">
                <span
                  className="text-[11px] font-bold"
                  style={{ color: isUnlocked ? "#fff" : "rgba(255,255,255,0.5)" }}
                >
                  {ach.secret && !isUnlocked ? "???" : ach.name}
                </span>
                <span className="text-[9px] text-white/30 leading-tight">
                  {ach.secret && !isUnlocked ? "Secret achievement" : ach.description}
                </span>
                {isUnlocked && unlocked && (
                  <span className="text-[8px] text-white/20 mt-0.5">
                    {new Date(unlocked.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
