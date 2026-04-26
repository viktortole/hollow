import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Flame, Play, Square, Target, Trophy } from "lucide-react";
import { useStore } from "../lib/store";
import { CircularProgress } from "./CircularProgress";
import { StageIndicator } from "./StageIndicator";
import { XpBar } from "./XpBar";
import { Timer } from "./Timer";
import { ToastContainer } from "./Toast";
import { PROTOCOLS, STAGES, getStageForHours, getStageIndex } from "../lib/stages";
import { levelFromXp, xpProgressInLevel } from "../lib/gamification";
import { playCompleteFast, playStageUp } from "../lib/sounds";

const STAGE_SOUND_COOLDOWN_MS = 30_000;

export function FastingWidget() {
  const isFasting = useStore((s) => s.isFasting);
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);
  const targetHours = useStore((s) => s.targetHours);
  const totalXp = useStore((s) => s.totalXp);
  const currentStreak = useStore((s) => s.currentStreak);
  const startFast = useStore((s) => s.startFast);
  const endFast = useStore((s) => s.endFast);
  const pendingStageUp = useStore((s) => s.pendingStageUp);
  const setPendingStageUp = useStore((s) => s.setPendingStageUp);

  const [elapsed, setElapsed] = useState(0);
  const [stageColor, setStageColor] = useState("#a855f7");
  const [celebrating, setCelebrating] = useState(false);
  const prevStageRef = useRef(0);
  const stageSoundTimeRef = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!fastStartTimestamp) {
      setElapsed(0);
      setStageColor("#a855f7");
      prevStageRef.current = 0;
      stageSoundTimeRef.current = {};
      return;
    }

    const update = () => {
      const now = Date.now();
      const secs = Math.max(0, Math.floor((now - fastStartTimestamp) / 1000));
      const hours = secs / 3600;
      const stage = getStageForHours(hours);
      const stageIdx = getStageIndex(hours);

      setElapsed(secs);
      setStageColor(stage.color);

      if (stageIdx > prevStageRef.current) {
        setPendingStageUp(stageIdx);
        prevStageRef.current = stageIdx;

        if (useStore.getState().settings.soundEnabled) {
          const lastFired = stageSoundTimeRef.current[stageIdx] ?? 0;
          if (now - lastFired >= STAGE_SOUND_COOLDOWN_MS) {
            playStageUp();
            stageSoundTimeRef.current[stageIdx] = now;
          }
        }
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [fastStartTimestamp, setPendingStageUp]);

  const progress = fastStartTimestamp
    ? Math.min(100, (elapsed / (targetHours * 3600)) * 100)
    : 0;
  const hoursElapsed = elapsed / 3600;
  const currentStage = getStageForHours(hoursElapsed);
  const level = levelFromXp(totalXp);
  const xp = xpProgressInLevel(totalXp);
  const protocol = PROTOCOLS.find((item) => item.hours === targetHours) ?? PROTOCOLS[0];
  const nextStage = STAGES.find((stage) => stage.hoursMin > hoursElapsed);
  const remainingHours = Math.max(0, targetHours - hoursElapsed);

  const handleEndFast = useCallback((completed: boolean) => {
    if (completed && hoursElapsed >= targetHours) {
      setCelebrating(true);
      if (useStore.getState().settings.soundEnabled) playCompleteFast();
      setTimeout(() => setCelebrating(false), 2000);
    }
    endFast(completed);
    prevStageRef.current = 0;
  }, [hoursElapsed, targetHours, endFast]);

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{
        paddingInline: "var(--widget-pad-x)",
        paddingBlock: "var(--widget-pad-y)",
        gap: "var(--card-gap)",
      }}
    >
      <ToastContainer />

      <div
        className="absolute inset-x-0 top-0 h-28 pointer-events-none"
        style={{ background: "radial-gradient(circle at top, rgba(168,85,247,0.24), transparent 70%)" }}
      />

      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-40 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, times: [0, 0.2, 1] }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at center, rgba(234,179,8,0.6) 0%, transparent 70%)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: isFasting ? stageColor : "#a855f7",
                boxShadow: `0 0 12px ${isFasting ? stageColor : "#a855f7"}`,
              }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/72">
              {isFasting ? "Fasting Active" : "Ready"}
            </span>
          </div>
          <span className="text-[9px] text-white/45">
            {isFasting ? `${remainingHours.toFixed(1)}h to goal` : "Begin a focused fast"}
          </span>
        </div>

        <div
          className="rounded-full px-3 py-1 text-[10px] font-bold text-white/82"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          {protocol.name}
        </div>
      </div>

      <div
        className="relative flex flex-col items-center"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
          borderRadius: "var(--card-radius)",
          paddingInline: "var(--card-pad-x)",
          paddingBlock: "var(--card-pad-y)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.24)",
        }}
      >
        <div className="absolute inset-4 rounded-full blur-2xl opacity-25" style={{ background: stageColor }} />
        <div className="relative">
          <CircularProgress
            progress={progress}
            size={164}
            strokeWidth={8}
            color={stageColor}
            glowColor={`${stageColor}80`}
          >
            {isFasting ? (
              <div className="flex flex-col items-center gap-1">
                <Timer startTimestamp={fastStartTimestamp} targetHours={targetHours} />
                <div className="text-[10px] font-semibold text-white/55">{Math.round(progress)}% complete</div>
                {progress >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
                    style={{ background: "rgba(234,179,8,0.2)", color: "#facc15" }}
                  >
                    Target Reached
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-white/55 uppercase tracking-[0.2em]">Target</div>
                <div className="text-4xl font-black leading-none text-white">{targetHours}h</div>
                <div className="text-[10px] text-white/48 text-center max-w-[110px]">{protocol.description}</div>
              </div>
            )}
          </CircularProgress>
        </div>
      </div>

      {isFasting ? (
        <div
          style={{
            background: "var(--card-bg-neutral)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <StageIndicator stage={currentStage} hoursElapsed={hoursElapsed} />
        </div>
      ) : (
        <div
          className="grid grid-cols-[1fr_auto] items-center gap-3"
          style={{
            background: "var(--card-bg-neutral)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/62">First Milestone</span>
            <span className="text-xs text-white/84">
              {nextStage ? `${nextStage.name} starts at ${nextStage.hoursMin}h` : "Every hour counts"}
            </span>
          </div>
          <Clock3 size={16} className="text-white/48" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2" aria-label="Fasting stats">
        <div
          style={{
            background: "rgba(168,85,247,0.16)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <Trophy size={13} className="mb-1 text-purple-300" />
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">Level</div>
          <div className="text-sm font-bold text-white">{level}</div>
        </div>
        <div
          style={{
            background: "rgba(236,72,153,0.14)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <Target size={13} className="mb-1 text-pink-300" />
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">Next XP</div>
          <div className="text-sm font-bold text-white">{xp.required - xp.current}</div>
        </div>
        <div
          style={{
            background: "rgba(249,115,22,0.14)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <Flame size={13} className="mb-1 text-orange-300" />
          <div className="text-[9px] uppercase tracking-[0.14em] text-white/45">Streak</div>
          <div className="text-sm font-bold text-white">{currentStreak}d</div>
        </div>
      </div>

      <XpBar level={level} totalXp={totalXp} />

      <div className="mt-auto w-full">
        {!isFasting ? (
          <motion.button
            onClick={startFast}
            className="w-full cursor-pointer py-3 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "#fff",
              boxShadow: "0 12px 28px rgba(168,85,247,0.35)",
              letterSpacing: "0.15em",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={14} fill="#fff" />
            Start Fast
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              onClick={() => handleEndFast(false)}
              className="flex-1 cursor-pointer py-3 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-300/50"
              style={{
                background: "rgba(239,68,68,0.28)",
                color: "#f87171",
                letterSpacing: "0.1em",
              }}
              whileTap={{ scale: 0.98 }}
            >
              End Fast
            </motion.button>
            <motion.button
              onClick={() => handleEndFast(true)}
              className="flex-1 cursor-pointer py-3 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
                letterSpacing: "0.1em",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Square size={10} fill="#fff" />
              Complete
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {pendingStageUp !== null && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.8 }}
            style={{ background: `radial-gradient(circle at center, ${STAGES[pendingStageUp]?.color}40 0%, transparent 70%)` }}
            onAnimationComplete={() => setPendingStageUp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
