import { motion } from "framer-motion";
import { xpProgressInLevel, getRankTitle } from "../lib/gamification";

interface XpBarProps {
  level: number;
  totalXp: number;
}

export function XpBar({ level, totalXp }: XpBarProps) {
  const { current, required, percentage } = xpProgressInLevel(totalXp);
  const rankTitle = getRankTitle(level);

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(168, 85, 247, 0.24)",
              color: "#d8b4fe",
              letterSpacing: "0.1em",
            }}
          >
            LV {level}
          </span>
          <span className="text-[10px] font-medium text-white/72 tracking-wide">{rankTitle}</span>
        </div>
        <span className="text-[9px] text-white/50 font-mono">
          {current} / {required}
        </span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #a855f7, #ec4899)",
            boxShadow: "0 0 10px #a855f780",
          }}
        />
      </div>
    </div>
  );
}
