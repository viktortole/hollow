import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { Award, TrendingUp } from "lucide-react";
import { useStore } from "../lib/store";
import { getRankTitle } from "../lib/gamification";
import { ACHIEVEMENTS } from "../lib/achievements";
import { playLevelUp, playAchievementUnlock } from "../lib/sounds";

const ACHIEVEMENT_TOAST_GAP = 60; // px vertical gap between stacked achievement toasts

export function ToastContainer() {
  const pendingLevelUp = useStore((s) => s.pendingLevelUp);
  const pendingAchievements = useStore((s) => s.pendingAchievements);
  const dismissLevelUp = useStore((s) => s.dismissLevelUp);
  const dismissAchievement = useStore((s) => s.dismissAchievement);
  const settings = useStore((s) => s.settings);

  // Play level-up sound when pendingLevelUp first appears
  const prevLevelUp = useRef<number | null>(null);
  useEffect(() => {
    if (pendingLevelUp !== null && pendingLevelUp !== prevLevelUp.current) {
      if (useStore.getState().settings.soundEnabled) playLevelUp();
    }
    prevLevelUp.current = pendingLevelUp;
  }, [pendingLevelUp]);

  // Play achievement sound when a new pending achievement appears
  const prevAchLen = useRef(0);
  useEffect(() => {
    if (pendingAchievements.length > prevAchLen.current) {
      if (useStore.getState().settings.soundEnabled) playAchievementUnlock();
    }
    prevAchLen.current = pendingAchievements.length;
  }, [pendingAchievements]);

  return (
    <>
      {/*
        FIX: key prop added so React treats each level-up as a distinct
        element. Without a key, React re-uses the same DOM node on level
        change → the exit animation never fires (no unmount = no exit anim).
      */}
      <AnimatePresence>
        {pendingLevelUp !== null && (
          <motion.div
            key={`levelup-${pendingLevelUp}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Full-bleed flash */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.4))",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.1, 0.7, 1] }}
            />

            {/* Level up card */}
            <motion.div
              className="relative flex flex-col items-center gap-2 px-6 py-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={dismissLevelUp}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} style={{ color: "#a855f7" }} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/60">Level Up</span>
              </div>
              <div
                className="text-3xl font-bold tracking-wider"
                style={{
                  color: "#fff",
                  textShadow: "0 0 20px rgba(168,85,247,0.8)",
                }}
              >
                {pendingLevelUp}
              </div>
              <div
                className="text-sm font-bold tracking-widest uppercase"
                style={{ color: "#a855f7", letterSpacing: "0.2em" }}
              >
                {getRankTitle(pendingLevelUp)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        FIX: each achievement toast is positioned with a top offset so they
        cascade vertically instead of stacking at the same position.
        Each item is wrapped in its own AnimatePresence so exit animations work.
      */}
      {pendingAchievements.map((ach, index) => {
        const def = ACHIEVEMENTS.find((a) => a.id === ach.id);
        if (!def) return null;
        return (
          <AnimatePresence key={ach.id}>
            <motion.div
              className="absolute z-50 pointer-events-none"
              style={{
                top: `${16 + index * ACHIEVEMENT_TOAST_GAP}px`,
                left: "50%",
                transform: "translateX(-50%)",
              }}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => dismissAchievement()}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(15,15,25,0.95)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.3), 0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <Award size={18} style={{ color: "#eab308" }} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">
                    Achievement Unlocked
                  </span>
                  <span className="text-sm font-bold text-white">{def.name}</span>
                  <span className="text-[10px] text-white/50">{def.description}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </>
  );
}
