import { motion } from "framer-motion";

/**
 * iOS-style on/off switch. Ember when on, ink-4 when off, animated thumb.
 * Always render with role="switch" so screen readers announce state.
 */
export function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-9 h-5 rounded-full relative cursor-pointer transition-colors focus:outline-none"
      style={{ background: value ? "var(--ember)" : "var(--ink-4)" }}
      role="switch"
      aria-checked={value}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 rounded-full"
        style={{
          background: "var(--bg-0)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
        animate={{ left: value ? "18px" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
