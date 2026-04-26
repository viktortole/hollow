import { motion, AnimatePresence } from "framer-motion";
import { STAGES, FastingStage } from "../lib/stages";

interface StageIndicatorProps {
  stage: FastingStage;
  hoursElapsed: number;
}

export function StageIndicator({ stage, hoursElapsed }: StageIndicatorProps) {
  const stageIndex = STAGES.indexOf(stage);
  const nextStage = STAGES[stageIndex + 1];

  const progressToNext = nextStage
    ? Math.min(100, ((hoursElapsed - stage.hoursMin) / (nextStage.hoursMin - stage.hoursMin)) * 100)
    : 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}` }}
          />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: stage.color, letterSpacing: "0.15em" }}
          >
            {stage.name}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="text-[10px] text-white/40 tracking-wide">{stage.description}</div>

      {nextStage && (
        <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: nextStage.color }}
          />
        </div>
      )}

      {nextStage && (
        <div className="text-[9px] text-white/30 mt-0.5">
          Next: {nextStage.name} in {Math.max(0, Math.ceil(nextStage.hoursMin - hoursElapsed)).toFixed(1)}h
        </div>
      )}
    </div>
  );
}
