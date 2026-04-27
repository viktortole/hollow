import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store";

/**
 * Detects when the user crosses their previous longest fast.
 *
 * Returns `{ isNew, justBroken, longestSeconds }`:
 *   - `longestSeconds`  the previous longest fast (used in copy: "+12m beyond record")
 *   - `justBroken`      true for ~`displayMs` after the moment is crossed; auto-clears
 *   - `isNew`           true at any time after the user has surpassed their record
 *
 * Resets when fast ends. Fires once per fast — no spam if elapsed jiggles.
 *
 * @example
 * const { justBroken, longestSeconds } = usePersonalBest({ elapsed, isFasting });
 * if (justBroken) showOverlay();
 */
export function usePersonalBest({
  elapsed,
  isFasting,
  displayMs = 5000,
}: {
  elapsed: number;
  isFasting: boolean;
  displayMs?: number;
}) {
  const completedFasts = useStore((s) => s.completedFasts);
  const longestSeconds = useMemo(
    () => completedFasts.reduce((max, f) => Math.max(max, f.elapsedSeconds), 0),
    [completedFasts]
  );

  const [justBroken, setJustBroken] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!isFasting) {
      firedRef.current = false;
      setJustBroken(false);
      return;
    }
    // Fire once when crossing — and only if we catch the moment within 60s
    // so we don't retroactively pop on resume.
    if (
      !firedRef.current &&
      longestSeconds > 0 &&
      elapsed > longestSeconds &&
      elapsed - longestSeconds < 60
    ) {
      firedRef.current = true;
      setJustBroken(true);
      const id = setTimeout(() => setJustBroken(false), displayMs);
      return () => clearTimeout(id);
    }
  }, [elapsed, isFasting, longestSeconds, displayMs]);

  const isNew = elapsed > longestSeconds && longestSeconds > 0;
  return { justBroken, longestSeconds, isNew };
}
