import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A single mark on the ring perimeter — a stage threshold tick.
 *
 * Marks are rendered as short radial line-segments crossing the ring track.
 * Reached marks fill in their stage color. The active stage's mark gets a
 * glowing dot anchored on the outside.
 *
 * Icons are deliberately NOT on the ring — they live in the StageIndicator
 * card below the ring so the ring stays a precise instrument.
 */
export interface RingMark {
  atProgress: number;
  reached: boolean;
  isActive: boolean;
  color: string;
  /** Kept for API compatibility; not rendered on the ring itself. */
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
  /** Kept for API compatibility; the new mark design is fixed-width ticks. */
  markSize?: number;
  children?: ReactNode;
}

/**
 * Circular progress ring with optional perimeter tick-marks + optional
 * second-pass "overtime" arc.
 *
 * Stack order from back to front:
 *   1. Track (full circle, ink-4)
 *   2. Soft tip wash (blur halo at the leading edge of the primary arc)
 *   3. Primary arc (stage color, blur-filtered glow)
 *   4. Overtime arc (gold by default — visible only when goal exceeded)
 *   5. Stage tick-marks crossing the track (drawn LAST so the arc + glow
 *      can't mask them when at 100%)
 *   6. Active stage's outside dot
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
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const primaryArc = Math.min(progress, 100);
  const offset = circumference - (primaryArc / 100) * circumference;
  const overtime = Math.min(overtimeProgress, 100);
  const overtimeOffset = circumference - (overtime / 100) * circumference;
  const center = size / 2;
  const tickInner = radius - strokeWidth / 2 - 2;
  const tickOuter = radius + strokeWidth / 2 + 2;
  const dotRadius = radius + strokeWidth / 2 + 5;

  const filterId = `glow-${color.replace("#", "")}`;
  const tipId = `tip-${color.replace("#", "")}`;

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
          <filter id={tipId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
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

          {/* Overtime arc — drawn ON TOP in gold, only when goal exceeded.
              Slightly thinner so the underlying primary arc still reads as the
              full ring underneath, while the gold makes it clear we're in
              "past your goal" territory. */}
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

        {/* Stage marks — short radial ticks crossing the track. Drawn AFTER
            the rotated group so the 10px arc + glow filter can't bury them
            when progress is at 100% (which the screenshot bug surfaced). */}
        {marks?.map((mark, i) => {
          const theta = mark.atProgress * Math.PI * 2 - Math.PI / 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          const x1 = center + tickInner * cosT;
          const y1 = center + tickInner * sinT;
          const x2 = center + tickOuter * cosT;
          const y2 = center + tickOuter * sinT;
          const dotX = center + dotRadius * cosT;
          const dotY = center + dotRadius * sinT;

          // Reached marks: stage color at full strength + thicker stroke so
          // they read on top of the arc. Unreached: dim ink-3 against the track.
          const tickColor = mark.reached ? mark.color : "var(--ink-3)";
          const tickOpacity = mark.reached ? 1 : 0.7;
          const tickWidth = mark.reached ? 3 : 2;

          return (
            <g key={`mark-${i}`} aria-label={mark.label}>
              {/* Tiny background "punch" in track color so the tick reads as
                  a clean notch even when sitting on top of the arc. */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--bg-1)"
                strokeWidth={tickWidth + 2.5}
                strokeLinecap="butt"
                opacity={0.92}
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tickColor}
                strokeWidth={tickWidth}
                strokeLinecap="round"
                opacity={tickOpacity}
              />
              {mark.isActive && (
                <>
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={5}
                    fill={mark.color}
                    opacity={0.4}
                    style={{ filter: "blur(3px)" }}
                  />
                  <motion.circle
                    cx={dotX}
                    cy={dotY}
                    r={2.8}
                    fill={mark.color}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: `${dotX}px ${dotY}px` }}
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
