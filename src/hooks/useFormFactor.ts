import { useEffect, useState } from "react";
import { isMobile } from "../platform/detect";

/**
 * Form factor detection — `'compact'` on mobile or any window where min(w,h) < 480.
 * `'regular'` otherwise (default desktop layout).
 *
 * Reads window dimensions on mount + resize. Components branch their layout
 * via `data-form-factor` attribute or by reading the value directly.
 *
 * Phase 5 introduces this hook but does NOT implement a separate compact
 * layout — that's deferred to the mobile-UI phase. For now, every form
 * factor renders the regular layout.
 *
 * @example
 * const ff = useFormFactor();
 * <div data-form-factor={ff} className={ff === 'compact' ? 'p-2' : 'p-4'}>
 */
export function useFormFactor(): "compact" | "regular" {
  const [ff, setFf] = useState<"compact" | "regular">(() => compute());

  useEffect(() => {
    const onResize = () => setFf(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return ff;
}

function compute(): "compact" | "regular" {
  if (isMobile()) return "compact";
  if (typeof window === "undefined") return "regular";
  const min = Math.min(window.innerWidth, window.innerHeight);
  return min < 480 ? "compact" : "regular";
}
