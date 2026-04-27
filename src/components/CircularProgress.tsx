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
  progress: number; // 0-100
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
 * Circular progress ring with optional perimeter tick-marks.
 *
 * Tick marks are short radial segments crossing the track, giving the ring
 * a metabolic-journey scale. The leading edge (active stage) carries a small
 * pulsing dot — the only "icon" on the ring itself.
 */
export function CircularProgress({
  progress,
  size = 200,
  strokeWidth = 8,
  color = "#b85a3b",
  glowColor = "#b85a3b80",
  marks,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
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
          {progress > 0 && progress < 100 && (
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

          {/* Progress arc */}
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
        </g>

        {/* Stage marks — short radial ticks crossing the track. Reached marks
            inherit their stage color; the active one anchors a pulsing dot. */}
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

          // Bumped tick width and unreached opacity so the marks actually read
          // around the ring (audit #6 — they were nearly invisible). Reached
          // marks now use the stage color at full strength; unreached use ink
          // at 60% alpha — strong enough to read against the track.
          const tickColor = mark.reached ? mark.color : "var(--ink-3)";
          const tickOpacity = mark.reached ? 1 : 0.6;
          const tickWidth = mark.reached ? 2.5 : 1.75;

          return (
            <g key={`mark-${i}`} aria-label={mark.label}>
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
                    r={2.5}
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
