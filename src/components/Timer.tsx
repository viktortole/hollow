import { useEffect, useState } from "react";
import { formatElapsed } from "../lib/stages";

interface TimerProps {
  startTimestamp: number | null;
  targetHours: number;
}

export function Timer({ startTimestamp, targetHours }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTimestamp) {
      setElapsed(0);
      return;
    }

    const update = () => {
      const now = Date.now();
      setElapsed(Math.max(0, Math.floor((now - startTimestamp) / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTimestamp]);

  const remaining = Math.max(0, targetHours * 3600 - elapsed);
  const progress = Math.min(100, (elapsed / (targetHours * 3600)) * 100);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="font-mono text-3xl font-bold tracking-widest text-white/90">
        {formatElapsed(elapsed)}
      </div>
      <div className="text-[10px] text-white/40 font-mono">
        {remaining > 0
          ? `-${formatElapsed(remaining)} remaining`
          : "+" + formatElapsed(elapsed - targetHours * 3600) + " over"
        }
      </div>
    </div>
  );
}
