import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../lib/store";
import { CircularProgress, type RingMark } from "./CircularProgress";
import { StageIndicator } from "../features/stages/StageIndicator";
import { Timer } from "./Timer";
import { ToastContainer } from "../features/notifications";
import { PROTOCOLS, STAGES, getStageForHours, getStageIndex } from "../lib/stages";
import { STAGE_ICONS } from "../features/stages/stageIcons";
import { useFormFactor } from "../hooks/useFormFactor";
import { useFastingClock } from "../hooks/useFastingClock";
import { usePersonalBest } from "../hooks/usePersonalBest";
import { MoodPrompt, LastFastCard, FirstMilestoneCard, HeaderBar, ControlBar, TimestampsRow, RingDisplay, UndoSnackbar, ProtocolPicker, PersonalBestOverlay } from "../features/fasting";
import { HydrationCard } from "../features/hydration";
import { DisciplineStrip, AchievementsPreviewCard } from "../features/gamification";
import { formatTimeOfDay } from "../lib/time";
import { playCompleteFast, playStageUp } from "../lib/sounds";

const STAGE_SOUND_COOLDOWN_MS = 30_000;

export function FastingWidget() {
  const isFasting = useStore((s) => s.isFasting);
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);
  const targetHours = useStore((s) => s.targetHours);
  const startFast = useStore((s) => s.startFast);
  const endFast = useStore((s) => s.endFast);
  const setFastStartTimestamp = useStore((s) => s.setFastStartTimestamp);
  const pendingStageUp = useStore((s) => s.pendingStageUp);
  const setPendingStageUp = useStore((s) => s.setPendingStageUp);

  // Canonical clock — single source of truth lives in useFastingClock.
  const { elapsed } = useFastingClock();
  const prevStageRef = useRef(0);
  const stageSoundTimeRef = useRef<Record<number, number>>({});

  // Reset stage refs when a fast begins or ends.
  useEffect(() => {
    if (!fastStartTimestamp) {
      prevStageRef.current = 0;
      stageSoundTimeRef.current = {};
      return;
    }
    // Initialize prevStageRef to the user's CURRENT stage on mount.
    // Prevents a false stage-up toast from firing on every reload when the user is
    // already deep into a fast (e.g. they're at AUTOPHAGY=4 but ref starts at 0).
    const initialSecs = Math.max(0, Math.floor((Date.now() - fastStartTimestamp) / 1000));
    prevStageRef.current = getStageIndex(initialSecs / 3600);
  }, [fastStartTimestamp]);

  // Stage-transition detector. Watches elapsed (driven by useFastingClock) and
  // fires a stage-up toast + sound when the user crosses a threshold. Sound is
  // gated by a 30s per-stage cooldown so HMR/focus-recovery cannot replay it.
  useEffect(() => {
    if (!fastStartTimestamp) return;
    const stageIdx = getStageIndex(elapsed / 3600);
    if (stageIdx > prevStageRef.current) {
      setPendingStageUp(stageIdx);
      prevStageRef.current = stageIdx;

      if (useStore.getState().settings.soundEnabled) {
        const now = Date.now();
        const lastFired = stageSoundTimeRef.current[stageIdx] ?? 0;
        if (now - lastFired >= STAGE_SOUND_COOLDOWN_MS) {
          playStageUp();
          stageSoundTimeRef.current[stageIdx] = now;
        }
      }
    }
  }, [elapsed, fastStartTimestamp, setPendingStageUp]);

  // Canonical derived state — all UI labels read from here. No duplicate timer logic.
  const targetSeconds = targetHours * 3600;
  const hoursElapsed = elapsed / 3600;
  const remainingSeconds = Math.max(0, targetSeconds - elapsed);
  const overSeconds = Math.max(0, elapsed - targetSeconds);
  const progress = isFasting ? Math.min(100, (elapsed / targetSeconds) * 100) : 0;
  const goalReached = isFasting && elapsed >= targetSeconds;

  const { justBroken, longestSeconds: longestFastSeconds } =
    usePersonalBest({ elapsed, isFasting });

  // Manual dismissal supplements the auto-clear in usePersonalBest. The user
  // reported the overlay being un-dismissable, so we layer a local "user closed
  // it" state on top. Resets when fast ends (firedRef in the hook covers reuse).
  const [pbDismissed, setPbDismissed] = useState(false);
  useEffect(() => {
    if (!isFasting) setPbDismissed(false);
  }, [isFasting]);
  const showPersonalBest = justBroken && !pbDismissed;

  const currentStage = getStageForHours(hoursElapsed);
  const stageColor = isFasting ? currentStage.color : "#b85a3b"; // ember accent in idle
  const protocol = PROTOCOLS.find((item) => item.hours === targetHours) ?? PROTOCOLS[0];

  // Time-of-day awareness — Started/Ends timestamps for the active state header row.
  const startTimeLabel = useMemo(
    () => (fastStartTimestamp ? formatTimeOfDay(fastStartTimestamp) : null),
    [fastStartTimestamp]
  );
  const endTimeLabel = useMemo(
    () => (fastStartTimestamp ? formatTimeOfDay(fastStartTimestamp + targetSeconds * 1000) : null),
    [fastStartTimestamp, targetSeconds]
  );

  // Idle-state projected windows — what time the fast WOULD start now and end at goal.
  const projectedStartLabel = useMemo(() => formatTimeOfDay(Date.now()), [elapsed]);
  const projectedEndLabel = useMemo(
    () => formatTimeOfDay(Date.now() + targetSeconds * 1000),
    [elapsed, targetSeconds]
  );
  const eatingHours = Math.max(0, 24 - targetHours);

  // STAGE MARKS — orbital icons positioned at hour-thresholds around the ring perimeter.
  // Display range capped so 48h marks land just shy of 12 o'clock instead of wrapping onto 0h.
  const displayMaxHours = Math.max(targetHours, 50);
  const currentStageIdx = isFasting ? getStageIndex(hoursElapsed) : -1;
  const ringMarks: RingMark[] = useMemo(
    () =>
      STAGES.map((s, i) => {
        const Icon = STAGE_ICONS[s.id];
        return {
          atProgress: Math.min(0.97, s.hoursMin / displayMaxHours),
          reached: isFasting && hoursElapsed >= s.hoursMin,
          isActive: i === currentStageIdx,
          color: s.color,
          icon: Icon ? <Icon size={12} /> : null,
          label: `${s.name} at ${s.hoursMin}h`,
        };
      }),
    [hoursElapsed, isFasting, currentStageIdx, displayMaxHours]
  );

  // Goal-reached escalation tier — differentiates +5min vs +14h with intentional labeling.
  const overtimeHours = overSeconds / 3600;
  const goalTier = !goalReached ? null
    : overtimeHours >= 24 ? { label: "Profound Fast", glow: "#fbbf24" }
    : overtimeHours >= 12 ? { label: "Deep Fast",     glow: "#f59e0b" }
    : overtimeHours >= 2  ? { label: "Extended Fast", glow: "#fde047" }
    : { label: "Goal Reached", glow: "#eab308" };

  const [celebrating, setCelebrating] = useState(false);
  // EXTENDED MODE — user pressed "Keep Going" past goal. Suppresses celebration aura
  // AND switches ControlBar to single "End Extended Fast (+Xh)" button so the UI
  // reflects the conscious decision to push past goal.
  const [extendedMode, setExtendedMode] = useState(false);
  useEffect(() => {
    if (!isFasting) setExtendedMode(false);
  }, [isFasting]);

  const handleEndFast = useCallback((completed: boolean) => {
    if (completed && goalReached) {
      setCelebrating(true);
      if (useStore.getState().settings.soundEnabled) playCompleteFast();
      setTimeout(() => setCelebrating(false), 2000);
    }
    endFast(completed);
    prevStageRef.current = 0;
  }, [goalReached, endFast]);

  const handleKeepGoing = useCallback(() => {
    setExtendedMode(true);
  }, []);

  // Atmospheric glow color follows the active stage during a fast, rests on ember when idle.
  const ambientColor = isFasting ? stageColor : "#d97757";

  // Form factor for future responsive layout (Phase 5+ scaffolding).
  const formFactor = useFormFactor();

  return (
    <div
      data-form-factor={formFactor}
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
        style={{ background: `radial-gradient(circle at top, ${ambientColor}26, transparent 70%)` }}
      />

      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="absolute inset-0 r-card pointer-events-none z-overlay overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, times: [0, 0.2, 1] }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at center, var(--success-glow) 0%, transparent 70%)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSONAL BEST overlay — fires when current fast crosses your longest. */}
      <PersonalBestOverlay
        visible={showPersonalBest}
        elapsedSeconds={elapsed}
        longestFastSeconds={longestFastSeconds}
        onDismiss={() => setPbDismissed(true)}
      />

      {/* HEADER — status pill + protocol stamp. Both shrink-safe at min width. */}
      <HeaderBar
        isFasting={isFasting}
        goalReached={goalReached}
        goalTierLabel={goalTier?.label ?? null}
        remainingSeconds={remainingSeconds}
        overSeconds={overSeconds}
        protocol={protocol}
        stageColor={stageColor}
      />

      <RingDisplay
        isFasting={isFasting}
        goalReached={goalReached && !extendedMode}
        progress={progress}
        overSeconds={overSeconds}
        elapsed={elapsed}
        targetSeconds={targetSeconds}
        targetHours={targetHours}
        eatingHours={eatingHours}
        protocol={protocol}
        stageColor={stageColor}
        marks={ringMarks}
        projectedStartLabel={projectedStartLabel}
        projectedEndLabel={projectedEndLabel}
      />

      {/* TIMESTAMPS — table-stakes for fasting apps. Shows when fast started and projected end.
          Pencil affordance opens the start-time adjuster popover (for "I forgot to start" recovery). */}
      {isFasting && startTimeLabel && endTimeLabel && (
        <TimestampsRow
          startTimeLabel={startTimeLabel}
          endTimeLabel={endTimeLabel}
          goalReached={goalReached}
        />
      )}

      {/* STAGE — quiet, single line of context. */}
      {isFasting && (
        <div
          style={{
            background: "var(--bg-2)",
            borderRadius: "var(--card-radius)",
            paddingInline: "var(--card-pad-x)",
            paddingBlock: "var(--card-pad-y)",
          }}
        >
          <StageIndicator stage={currentStage} hoursElapsed={hoursElapsed} />
        </div>
      )}

      {!isFasting && <ProtocolPicker />}

      <HydrationCard />

      <DisciplineStrip />

      <FirstMilestoneCard />

      {!isFasting && <AchievementsPreviewCard />}

      <LastFastCard />

      <div className="mt-auto w-full">
        <ControlBar
          isFasting={isFasting}
          goalReached={goalReached}
          extendedMode={extendedMode}
          overSeconds={overSeconds}
          targetHours={targetHours}
          onStart={startFast}
          onEnd={handleEndFast}
          onKeepGoing={handleKeepGoing}
        />
      </div>

      <AnimatePresence>
        {pendingStageUp !== null && (
          <motion.div
            className="absolute inset-0 r-card pointer-events-none z-radial"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.8 }}
            style={{ background: `radial-gradient(circle at center, ${STAGES[pendingStageUp]?.color}40 0%, transparent 70%)` }}
            // Note: dismissal is owned by Toast.tsx (4s self-dismiss) so the labeled toast has time to render.
          />
        )}
      </AnimatePresence>

      <MoodPrompt />

      <UndoSnackbar />
    </div>
  );
}
