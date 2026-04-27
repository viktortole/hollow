import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { Award, Droplet, TrendingUp, Sparkles } from "lucide-react";
import { useStore } from "../../lib/store";
import { getRankTitle } from "../../lib/gamification";
import { ACHIEVEMENTS } from "../../lib/achievements";
import { STAGES } from "../../lib/stages";
import { playLevelUp, playAchievementUnlock } from "../../lib/sounds";

const TOAST_TOP = 40; // px from container top — clears the 32px title bar
const AUTO_DISMISS_MS = 4500;

/**
 * Notification queue.
 *
 * Renders ONE celebration at a time. Priority order:
 *   1. Level Up      (rarest, biggest moment)
 *   2. Achievement   (specific milestone)
 *   3. Stage Up      (metabolic transition)
 *   4. Hydration     (daily routine)
 *
 * No more full-screen flashes that obscure the timer. All celebrations are
 * top-positioned banner toasts. Sounds play once on first appearance.
 */
export function ToastContainer() {
  const pendingLevelUp = useStore((s) => s.pendingLevelUp);
  const pendingAchievements = useStore((s) => s.pendingAchievements);
  const pendingStageUp = useStore((s) => s.pendingStageUp);
  const pendingHydrationGoal = useStore((s) => s.pendingHydrationGoal);
  const hydrationGoalGlasses = useStore((s) => s.hydrationGoalGlasses);
  const dismissLevelUp = useStore((s) => s.dismissLevelUp);
  const dismissAchievement = useStore((s) => s.dismissAchievement);
  const dismissHydrationGoal = useStore((s) => s.dismissHydrationGoal);
  const setPendingStageUp = useStore((s) => s.setPendingStageUp);
  const settings = useStore((s) => s.settings);

  const prevLevelUp = useRef<number | null>(null);
  useEffect(() => {
    if (pendingLevelUp !== null && pendingLevelUp !== prevLevelUp.current) {
      if (useStore.getState().settings.soundEnabled) playLevelUp();
    }
    prevLevelUp.current = pendingLevelUp;
  }, [pendingLevelUp]);

  const prevAchLen = useRef(0);
  useEffect(() => {
    if (pendingAchievements.length > prevAchLen.current) {
      if (useStore.getState().settings.soundEnabled) playAchievementUnlock();
    }
    prevAchLen.current = pendingAchievements.length;
  }, [pendingAchievements]);

  // Single-toast priority resolver. Only one celebration shows at a time.
  type Active =
    | { kind: "levelUp"; level: number }
    | { kind: "achievement"; id: string }
    | { kind: "stageUp"; stage: number }
    | { kind: "hydration" };

  // Each kind respects its per-type opt-in setting.
  const active: Active | null =
    pendingLevelUp !== null && settings.notifyLevelUp
      ? { kind: "levelUp", level: pendingLevelUp }
      : pendingAchievements.length > 0 && settings.notifyAchievement
      ? { kind: "achievement", id: pendingAchievements[0].id }
      : pendingStageUp !== null && settings.notifyStageUp
      ? { kind: "stageUp", stage: pendingStageUp }
      : pendingHydrationGoal && settings.notifyHydrationGoal
      ? { kind: "hydration" }
      : null;

  // Auto-dismiss after AUTO_DISMISS_MS once a toast becomes the active one.
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => {
      const s = useStore.getState();
      if (active.kind === "levelUp" && s.pendingLevelUp === active.level) {
        s.dismissLevelUp();
      } else if (
        active.kind === "achievement" &&
        s.pendingAchievements[0]?.id === active.id
      ) {
        s.dismissAchievement();
      } else if (
        active.kind === "stageUp" &&
        s.pendingStageUp === active.stage
      ) {
        s.setPendingStageUp(null);
      } else if (active.kind === "hydration" && s.pendingHydrationGoal) {
        s.dismissHydrationGoal();
      }
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [
    active?.kind,
    active && "level" in active ? active.level : null,
    active && "id" in active ? active.id : null,
    active && "stage" in active ? active.stage : null,
  ]);

  return (
    <div
      className="absolute z-toast"
      style={{
        top: `${TOAST_TOP}px`,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "calc(100% - 24px)",
        width: "max-content",
      }}
    >
      <AnimatePresence mode="wait">
        {active?.kind === "levelUp" && (
          <ToastShell
            key={`levelup-${active.level}`}
            onClick={dismissLevelUp}
            accentColor="var(--gold)"
          >
            <ToastIcon bg="var(--ember-soft)" color="var(--gold)">
              <TrendingUp size={14} />
            </ToastIcon>
            <ToastBody
              kicker="Level Up"
              title={`LV ${active.level} · ${getRankTitle(active.level)}`}
              titleColor="var(--ink)"
              detail="A new rank earned."
            />
          </ToastShell>
        )}

        {active?.kind === "achievement" &&
          (() => {
            const def = ACHIEVEMENTS.find((a) => a.id === active.id);
            if (!def) return null;
            return (
              <ToastShell
                key={`ach-${active.id}`}
                onClick={dismissAchievement}
                accentColor="var(--ember)"
              >
                <ToastIcon bg="var(--ember-soft)" color="var(--gold)">
                  <Award size={14} />
                </ToastIcon>
                <ToastBody
                  kicker="Achievement"
                  title={def.name}
                  titleColor="var(--ink)"
                  detail={def.description}
                />
              </ToastShell>
            );
          })()}

        {active?.kind === "stageUp" &&
          STAGES[active.stage] &&
          (() => {
            const stage = STAGES[active.stage];
            return (
              <ToastShell
                key={`stage-${active.stage}`}
                onClick={() => setPendingStageUp(null)}
                accentColor={stage.color}
              >
                <ToastIcon bg={`${stage.color}26`} color={stage.color}>
                  <Sparkles size={14} />
                </ToastIcon>
                <ToastBody
                  kicker="Stage Unlocked"
                  title={stage.name}
                  titleColor={stage.color}
                  detail={stage.description}
                />
              </ToastShell>
            );
          })()}

        {active?.kind === "hydration" && (
          <ToastShell
            key="hydration-goal"
            onClick={dismissHydrationGoal}
            accentColor="var(--water)"
          >
            <ToastIcon bg="var(--water-soft)" color="var(--water)">
              <Droplet size={14} fill="currentColor" fillOpacity={0.5} />
            </ToastIcon>
            <ToastBody
              kicker="Hydration Goal"
              title={`${hydrationGoalGlasses} / ${hydrationGoalGlasses} Today`}
              titleColor="var(--water)"
              detail="Stay disciplined."
            />
          </ToastShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToastShell({
  children,
  onClick,
  accentColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accentColor: string;
}) {
  return (
    <motion.div
      className="pointer-events-auto cursor-pointer"
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-2.5 px-3 py-2"
        style={{
          background: "var(--bg-2)",
          borderRadius: "var(--card-radius)",
          boxShadow: `var(--shadow-popover), 0 0 14px ${accentColor}33`,
          minWidth: "240px",
          maxWidth: "100%",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

function ToastIcon({
  children,
  bg,
  color,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
      style={{ background: bg, color }}
    >
      {children}
    </div>
  );
}

function ToastBody({
  kicker,
  title,
  titleColor,
  detail,
}: {
  kicker: string;
  title: string;
  titleColor: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col min-w-0 leading-tight">
      <span
        className="label-cap text-[8px]"
        style={{ color: "var(--ink-3)", letterSpacing: "0.18em" }}
      >
        {kicker}
      </span>
      <span
        className="text-[12px] font-bold truncate"
        style={{ color: titleColor, letterSpacing: "0.01em" }}
      >
        {title}
      </span>
      <span className="text-[9.5px] truncate" style={{ color: "var(--ink-3)" }}>
        {detail}
      </span>
    </div>
  );
}
