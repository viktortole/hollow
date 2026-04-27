import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { STAGES, FastingStage } from "../../lib/stages";
import { xpPerHour } from "../../lib/gamification";

interface StageIndicatorProps {
  stage: FastingStage;
  hoursElapsed: number;
}

/**
 * Active-stage row with progress to next stage AND a stage XP-rate badge.
 *
 * The XP-rate chip ("×2.5 · 25 xp/h") is the dopamine signal — deeper stages
 * earn faster, so the user *feels* the reward grow as the fast deepens.
 */
export function StageIndicator({ stage, hoursElapsed }: StageIndicatorProps) {
  const stageIndex = STAGES.indexOf(stage);
  const nextStage = STAGES[stageIndex + 1];

  const progressToNext = nextStage
    ? Math.min(100, ((hoursElapsed - stage.hoursMin) / (nextStage.hoursMin - stage.hoursMin)) * 100)
    : 100;

  const hoursToNext = nextStage ? Math.max(0, nextStage.hoursMin - hoursElapsed) : 0;
  const rate = xpPerHour(stageIndex);
  const multiplier = rate / 10;

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-0.5"
        >
          {/* Top row — dot · name · xp-chip · "Xh to NextStage". Drops the description
              to a second line so neither piece truncates mid-word at 416px width. */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}` }}
            />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase flex-shrink-0"
              style={{ color: stage.color }}
            >
              {stage.name}
            </span>
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 r-chip flex-shrink-0"
              style={{
                background: `${stage.color}1f`,
                border: `1px solid ${stage.color}55`,
              }}
              title={`${rate.toFixed(0)} XP per hour at this stage`}
            >
              <Sparkles size={8} style={{ color: stage.color }} />
              <span
                className="font-mono text-[8.5px] tabular-nums"
                style={{ color: stage.color, fontWeight: 700, letterSpacing: "0.02em" }}
              >
                ×{multiplier.toFixed(1)}
              </span>
            </span>
            <span className="flex-1" />
            {nextStage && (
              <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "var(--ink-3)" }}>
                {hoursToNext < 1 ? `${Math.ceil(hoursToNext * 60)}m` : `${hoursToNext.toFixed(1)}h`}
                <span style={{ color: "var(--ink-4)" }}> to {nextStage.name}</span>
              </span>
            )}
          </div>
          {/* Second-line description — full-width, never truncates. */}
          <span className="text-[10px] leading-tight" style={{ color: "var(--ink-3)" }}>
            {stage.description}
          </span>
        </motion.div>
      </AnimatePresence>

      {nextStage && (
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--ink-4)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.5 }}
            style={{
              background: `linear-gradient(90deg, ${stage.color}, ${nextStage.color})`,
              boxShadow: `0 0 6px ${nextStage.color}60`,
            }}
          />
        </div>
      )}
    </div>
  );
}
