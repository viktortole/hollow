import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A single mark on the ring perimeter — a stage threshold milestone.
 *
 * Marks render as **filled circle stage-icon plates** anchored at hour-position
 * angles around the ring (BodyFast / Window / Zero pattern). Reached marks
 * fill in their stage color with a white icon; unreached marks read as a
 * subtle ink-outlined hollow circle that previews "what's coming".
 *
 * The ring stays a precision instrument — these are punctuation, not chrome.
 */
export interface RingMark {
  atProgress: number;
  reached: boolean;
  isActive: boolean;
  color: string;
  /** Optional icon — rendered inside the filled circle when reached. */
  icon?: ReactNode;
  label?: string;
}

interface CircularProgressProps {
  /** 0..100 — primary arc from 12 o'clock clockwise. Values >100 are clamped
      to 100 for the primary arc; pass `overtimeProgress` for the >100% case. */
  progress: number;
  /** 0..100 — second arc drawn on top in `overtimeColor` once the primary
      arc has filled. Use this for "past goal" visualization. */
  overtimeProgress?: number;
  /** Color of the secondary overtime arc. Defaults to gold. */
  overtimeColor?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  marks?: RingMark[];
  /** Diameter of each mark plate in pixels. Default 22. */
  markSize?: number;
  children?: ReactNode;
}

/**
 * Circular progress ring with optional perimeter stage-mark plates +
 * optional second-pass "overtime" arc.
 *
 * Stack order from back to front:
 *   1. Track (full circle, ink-4)
 *   2. Soft tip wash (blur halo at the leading edge of the primary arc)
 *   3. Primary arc (stage color, blur-filtered glow)
 *   4. Overtime arc (gold by default — visible only when goal exceeded)
 *   5. Stage mark plates (filled circles with icons, drawn LAST so they're
 *      always legible — the arc + glow can't bury them)
 */
export function CircularProgress({
  progress,
  overtimeProgress = 0,
  overtimeColor = "var(--gold)",
  size = 200,
  strokeWidth = 8,
  color = "#b85a3b",
  glowColor = "#b85a3b80",
  marks,
  markSize = 22,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const primaryArc = Math.min(progress, 100);
  const offset = circumference - (primaryArc / 100) * circumference;
  const overtime = Math.min(overtimeProgress, 100);
  const overtimeOffset = circumference - (overtime / 100) * circumference;
  const center = size / 2;
  const filterId = `glow-${color.replace("#", "")}`;
  void glowColor; // kept for back-compat with consumers passing it

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ring group — rotated -90° so progress starts at 12 o'clock. */}
        <g transform={`rotate(-90 ${center} ${center})`}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--ink-4)"
            strokeWidth={strokeWidth}
            opacity={0.55}
          />

          {/* Soft tip wash beneath the arc — gives the leading edge a halo */}
          {primaryArc > 0 && primaryArc < 100 && (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              opacity={0.22}
              style={{ filter: "blur(7px)" }}
            />
          )}

          {/* Primary progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            filter={`url(#${filterId})`}
          />

          {/* Overtime arc — drawn ON TOP in gold once the primary fills. */}
          {overtime > 0 && (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={overtimeColor}
              strokeWidth={strokeWidth - 2}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: overtimeOffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              opacity={0.95}
            />
          )}
        </g>
      </svg>

      {/* Stage mark plates — rendered as HTML overlays so the icons can be
          React components, not embedded SVG paths. Positioned via absolute +
          transform so they sit directly on the ring perimeter. */}
      {marks?.map((mark, i) => {
        // Math.round to integer pixels — fractional positions blur on Windows
        // fractional DPI. Documented in DESIGN-SYSTEM.md "accepted artifacts".
        const theta = mark.atProgress * Math.PI * 2 - Math.PI / 2;
        const cx = Math.round(center + radius * Math.cos(theta));
        const cy = Math.round(center + radius * Math.sin(theta));

        const reached = mark.reached;
        return (
          <div
            key={`mark-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: cx - markSize / 2,
              top: cy - markSize / 2,
              width: markSize,
              height: markSize,
            }}
            aria-label={mark.label}
          >
            {/* Active-stage halo — soft glow ring behind the plate */}
            {mark.isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: mark.color,
                  filter: "blur(6px)",
                  opacity: 0.7,
                }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.85, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
            )}
            {/* The mark plate itself — filled circle with the stage icon
                inside. Reached: full stage color + bg-0 icon. Unreached:
                bg-1 fill + ink-3 hairline outline + ink-4 icon (preview). */}
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: markSize,
                height: markSize,
                background: reached ? mark.color : "var(--bg-1)",
                border: reached
                  ? `1.5px solid ${mark.color}`
                  : "1.5px solid var(--ink-4)",
                color: reached ? "var(--bg-0)" : "var(--ink-3)",
                boxShadow: reached
                  ? `0 2px 6px ${mark.color}40, 0 0 0 2px var(--bg-1)`
                  : "0 0 0 2px var(--bg-1)",
                transition: "background 0.3s, border 0.3s, color 0.3s",
              }}
            >
              {mark.icon}
            </div>
          </div>
        );
      })}

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
