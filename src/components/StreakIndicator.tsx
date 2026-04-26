import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakIndicatorProps {
  streak: number;
  longest: number;
}

export function StreakIndicator({ streak, longest }: StreakIndicatorProps) {
  const getFlameSize = (s: number) => {
    if (s >= 30) return 24;
    if (s >= 7) return 20;
    if (s >= 3) return 16;
    return 14;
  };

  const getFlameColor = (s: number) => {
    if (s >= 30) return "#eab308";
    if (s >= 7) return "#f97316";
    if (s >= 3) return "#fb923c";
    return "#fbbf24";
  };

  if (streak === 0) {
    return (
      <div className="flex items-center gap-1.5 text-white/30">
        <Flame size={12} />
        <span className="text-[10px]">0 day streak</span>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-1.5"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          filter: [
            `drop-shadow(0 0 4px ${getFlameColor(streak)})`,
            `drop-shadow(0 0 10px ${getFlameColor(streak)})`,
            `drop-shadow(0 0 4px ${getFlameColor(streak)})`,
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Flame
          size={getFlameSize(streak)}
          style={{ color: getFlameColor(streak), fill: getFlameColor(streak) }}
        />
      </motion.div>
      <div className="flex flex-col">
        <span
          className="text-[11px] font-bold leading-none"
          style={{ color: getFlameColor(streak) }}
        >
          {streak}
        </span>
        <span className="text-[8px] text-white/40">day streak</span>
      </div>
    </motion.div>
  );
}
