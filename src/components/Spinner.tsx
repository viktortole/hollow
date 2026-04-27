import { motion } from "framer-motion";

interface SpinnerProps {
  /** Diameter in pixels — defaults to 24 (matches PanelLoader sizing). */
  size?: number;
  /** Optional accessible label. Defaults to "Loading". */
  ariaLabel?: string;
}

/**
 * The single rotating ring used for any "loading" state in the app.
 *
 * Uses ember on an ink-4 track so it reads as Hollow's accent, not a generic
 * spinner. Theme-aware via tokens — works correctly in both light and dark.
 */
export function Spinner({ size = 24, ariaLabel = "Loading" }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="rounded-full border-2"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor: "var(--ink-4)",
        borderTopColor: "var(--ember)",
      }}
      aria-label={ariaLabel}
      role="status"
    />
  );
}
