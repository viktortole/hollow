import { useEffect, useState } from "react";
import { useStore } from "../lib/store";

/**
 * The ONE setInterval in the entire app.
 *
 * Subscribes to `fastStartTimestamp` from the zustand store and emits a 1-second
 * tick of derived clock values. Both `FastingWidget` and `PillMode` (and any
 * future surface) consume this hook — there is no second timer anywhere.
 *
 * Returns canonical clock state. All other derivations (remaining, over goal,
 * progress %, stage detection) compose against `elapsed` from here.
 *
 * @example
 * const { elapsed, hoursElapsed, startedAt } = useFastingClock();
 * const remaining = Math.max(0, targetSeconds - elapsed);
 *
 * @returns
 *   - `elapsed`        seconds since the fast started (0 when no fast)
 *   - `hoursElapsed`   `elapsed / 3600` (precomputed for stage lookups)
 *   - `startedAt`      ms timestamp when the current fast started, or null
 */
export function useFastingClock(): {
  elapsed: number;
  hoursElapsed: number;
  startedAt: number | null;
} {
  const fastStartTimestamp = useStore((s) => s.fastStartTimestamp);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!fastStartTimestamp) {
      setElapsed(0);
      return;
    }

    const update = () => {
      const now = Date.now();
      const secs = Math.max(0, Math.floor((now - fastStartTimestamp) / 1000));
      setElapsed(secs);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [fastStartTimestamp]);

  return {
    elapsed,
    hoursElapsed: elapsed / 3600,
    startedAt: fastStartTimestamp,
  };
}
