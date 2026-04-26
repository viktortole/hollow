import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { getStageForHours, formatElapsed } from "../lib/stages";

export function PillMode() {
  const isPillMode = useStore((s) => s.isPillMode);
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);
  const togglePillMode = useStore((s) => s.togglePillMode);
  const [elapsed, setElapsed] = useState(0);
  const [stageColor, setStageColor] = useState("#22c55e");

  useEffect(() => {
    if (!fastStartTimestamp) {
      setElapsed(0);
      setStageColor("#22c55e");
      return;
    }
    const update = () => {
      const now = Date.now();
      const secs = Math.floor((now - fastStartTimestamp) / 1000);
      setElapsed(secs);
      const hours = secs / 3600;
      const stage = getStageForHours(hours);
      setStageColor(stage.color);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [fastStartTimestamp]);

  if (!isPillMode) return null;

  return (
    /*
      FIX: removed `position: fixed` + `left: 50%; top: 50%; transform: translate(-50%, -50%)`
      which anchored the pill to the viewport center (screen center).
      PillMode is rendered inside the app window (which is the widget), so it now uses
      `absolute` positioning relative to its nearest positioned ancestor (the outer div
      in App.tsx). This keeps the pill centered inside the widget window itself.
    */
    <motion.div
      className="absolute cursor-pointer z-50"
      layoutId="pill"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={togglePillMode}
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: "rgba(15,15,25,0.98)",
          border: `1px solid ${stageColor}40`,
          boxShadow: `0 0 20px ${stageColor}30, 0 8px 32px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: stageColor,
            boxShadow: `0 0 8px ${stageColor}`,
          }}
        />
        <span
          className="font-mono text-sm font-bold tracking-widest text-white/90"
          style={{ color: stageColor }}
        >
          {fastStartTimestamp ? formatElapsed(elapsed) : "--:--:--"}
        </span>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
      </div>
    </motion.div>
  );
}
