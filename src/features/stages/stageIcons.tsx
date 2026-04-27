/**
 * Hollow stage icons — one geometric SVG per metabolic stage.
 *
 * Used as stage marks orbiting the CircularProgress ring (Phase 4).
 * All icons are 14×14, stroke-based (1.5px), `currentColor` so the parent
 * decides the ink color via CSS. They render INSIDE 22×22 background plates
 * positioned at hour-thresholds around the ring perimeter.
 *
 * Aesthetic: geometric, Bauhaus-flavored. Not hand-drawn, not skeuomorphic.
 * Match the Architectural Cream direction (see docs/DESIGN-SYSTEM.md).
 */

import type { ReactNode } from "react";

interface IconProps {
  size?: number;
}

const SHARED = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** FED — small apple silhouette. Stem and leaf. */
export function FedIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <path d="M7 5c-1.6-1.4-4 -.6 -4 2 0 2.5 1.8 4.5 4 4.5s4-2 4-4.5c0-2.6-2.4-3.4-4-2z" />
      <path d="M7 5V3.2" />
      <path d="M8.4 3c-.7-.4-1.4 0-1.4.8" strokeWidth="1.2" />
    </svg>
  );
}

/** EARLY FAST — hourglass. Time begins to bite. */
export function EarlyFastIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <path d="M3.5 2h7" />
      <path d="M3.5 12h7" />
      <path d="M4 2c0 2.5 1.5 3.8 3 5 1.5-1.2 3-2.5 3-5" />
      <path d="M4 12c0-2.5 1.5-3.8 3-5 1.5 1.2 3 2.5 3 5" />
    </svg>
  );
}

/** FAT BURNING — single flame. Sustained ketosis. */
export function FatBurningIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <path d="M7 12.5c2.4 0 4-1.7 4-4 0-2-1.5-3-2.5-4.5C8 5 7.5 5 7 4.5c-.5-1-1.5-2-1.5-3 0 .8-.5 1.5-1 2.2C3.8 5 3 6.2 3 8.5c0 2.3 1.6 4 4 4z" />
      <path d="M7 12.5c1 0 2-.7 2-2 0-.8-.6-1.4-1.2-2.2-.5.8-1 1-1.4 1.5-.4-.5-.8-.5-1-1-.5.8-.4 1.2-.4 1.7 0 1.3 1 2 2 2z" strokeWidth="1.2" />
    </svg>
  );
}

/** AUTOPHAGY — cell with directional arrow (cellular cleanup). */
export function AutophagyIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <circle cx="7" cy="7" r="4.5" />
      <circle cx="7" cy="7" r="1.5" strokeWidth="1.2" />
      <path d="M7 2.5L9 4.5" strokeWidth="1.2" />
      <path d="M7 2.5L7 5" strokeWidth="1.2" />
    </svg>
  );
}

/** DEEP KETOSIS — lightning bolt. Hormone surge, sharp energy. */
export function DeepKetosisIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <path d="M8 1.5L3 8h3l-1 4.5L10 6H7l1-4.5z" />
    </svg>
  );
}

/** STEM CELL — six-petal cluster. Mythic territory. */
export function StemCellIcon({ size = 14 }: IconProps) {
  const r = 1.6;
  const cx = 7;
  const cy = 7;
  const dist = 3;
  const petals = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    petals.push(<circle key={i} cx={x} cy={y} r={r} strokeWidth="1.2" />);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...SHARED}>
      <circle cx={cx} cy={cy} r="1.4" strokeWidth="1.2" />
      {petals}
    </svg>
  );
}

/**
 * Stage-id → icon map. Keep in sync with `STAGES` in `src/lib/stages.ts`.
 * If you add a new stage, add an icon here too.
 */
export const STAGE_ICONS: Record<string, (props: IconProps) => ReactNode> = {
  fed:           FedIcon,
  early:         EarlyFastIcon,
  fat_burning:   FatBurningIcon,
  autophagy:     AutophagyIcon,
  deep_ketosis:  DeepKetosisIcon,
  stem_cell:     StemCellIcon,
};
