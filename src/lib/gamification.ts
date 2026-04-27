// XP and Level system

export const RANKS: { level: number; title: string }[] = [
  { level: 1, title: "Initiate" },
  { level: 2, title: "Disciple" },
  { level: 3, title: "Devoted" },
  { level: 4, title: "Disciplined" },
  { level: 5, title: "Hollow" },
  { level: 6, title: "Iron Will" },
  { level: 7, title: "Ascetic" },
  { level: 8, title: "Autophage" },
  { level: 9, title: "Ketogenist" },
  { level: 10, title: "Metabolic" },
  { level: 11, title: "Fasted Mind" },
  { level: 12, title: "Deep Faster" },
  { level: 13, title: "Catabolic" },
  { level: 14, title: "Cellular" },
  { level: 15, title: "Renewed" },
  { level: 16, title: "Reborn" },
  { level: 17, title: "Eternal" },
  { level: 18, title: "Void Walker" },
  { level: 19, title: "Ascended" },
  { level: 20, title: "Omega" },
];

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let xp = totalXp;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    if (level >= 20) break;
  }
  return level;
}

export function getRankTitle(level: number): string {
  const rank = RANKS.find((r) => r.level === level);
  return rank?.title ?? "Omega";
}

export function xpProgressInLevel(totalXp: number): { current: number; required: number; percentage: number } {
  let level = 1;
  let xp = totalXp;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    if (level >= 20) break;
  }
  const required = xpForLevel(level);
  return {
    current: Math.floor(xp),
    required,
    percentage: Math.min(100, (xp / required) * 100),
  };
}

// Base XP per hour of fasting, with stage multipliers
export function xpPerHour(stageIndex: number): number {
  const multipliers = [1, 1.2, 1.5, 2, 2.5, 3];
  return 10 * (multipliers[stageIndex] ?? 1);
}

/**
 * Live XP earned during an in-flight fast.
 *
 * Sums XP across every stage the user has passed through, weighted by hours-in-stage.
 * This lets the gamification UI tick XP up in real time during a fast — the dopamine
 * payoff of seeing the number grow while you're suffering.
 *
 * @param elapsedSeconds  total seconds since fast start
 * @param stageThresholds STAGES list (id + hoursMin in ascending order)
 */
export function liveXpEarning(
  elapsedSeconds: number,
  stageThresholds: { hoursMin: number }[]
): number {
  const elapsedHours = elapsedSeconds / 3600;
  let xp = 0;
  for (let i = 0; i < stageThresholds.length; i++) {
    const startH = stageThresholds[i].hoursMin;
    const endH =
      i + 1 < stageThresholds.length
        ? stageThresholds[i + 1].hoursMin
        : Infinity;
    if (elapsedHours <= startH) break;
    const hoursInStage = Math.min(elapsedHours, endH) - startH;
    xp += hoursInStage * xpPerHour(i);
  }
  return Math.floor(xp);
}

/**
 * Predict total XP for a target fast duration. Used in idle state to preview
 * "this fast will earn ~X XP". Includes the 25%-on-completion bonus.
 */
export function predictedXpForFast(
  targetHours: number,
  stageThresholds: { hoursMin: number }[]
): number {
  const base = liveXpEarning(targetHours * 3600, stageThresholds);
  return Math.max(10, Math.floor(base * 1.25));
}

/**
 * Per-second XP rate at the user's current stage. Used as the "earning rate"
 * badge — gives an immediate sense of how much faster XP grows in deeper stages.
 */
export function xpPerMinute(stageIndex: number): number {
  return xpPerHour(stageIndex) / 60;
}
