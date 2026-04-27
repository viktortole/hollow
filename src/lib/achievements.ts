export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret: boolean;
  rarity: AchievementRarity;
  condition: (stats: AchievementStats) => boolean;
  /**
   * Return a 0..1 value of how close the user is to unlocking this achievement.
   * Used in the AchievementsPreviewCard to show "8/10 fasts to Veteran" with
   * a real progress bar — the dopamine hook is *anticipation*, not just unlock.
   */
  progress?: (stats: AchievementStats) => { current: number; target: number };
}

export interface AchievementStats {
  totalFasts: number;
  totalHours: number;
  longestFast: number;
  currentStreak: number;
  longestStreak: number;
  levelsReached: number;
  autophagyCount: number;
  brokeStreakThenRestarted: boolean;
  nightOwlFasts: number;
  maxLevel: number;
  customHours: number;
}

const p = (current: number, target: number) => ({
  current: Math.min(current, target),
  target,
});

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Complete your first fast",
    icon: "flame",
    secret: false,
    rarity: "common",
    condition: (s) => s.totalFasts >= 1,
    progress: (s) => p(s.totalFasts, 1),
  },
  {
    id: "the_16",
    name: "The 16",
    description: "Complete a 16-hour fast",
    icon: "zap",
    secret: false,
    rarity: "common",
    condition: (s) => s.longestFast >= 16,
    progress: (s) => p(Math.round(s.longestFast), 16),
  },
  {
    id: "the_24",
    name: "The 24",
    description: "Complete a 24-hour fast",
    icon: "clock",
    secret: false,
    rarity: "rare",
    condition: (s) => s.longestFast >= 24,
    progress: (s) => p(Math.round(s.longestFast), 24),
  },
  {
    id: "the_48",
    name: "The 48",
    description: "Complete a 48-hour fast",
    icon: "award",
    secret: false,
    rarity: "epic",
    condition: (s) => s.longestFast >= 48,
    progress: (s) => p(Math.round(s.longestFast), 48),
  },
  {
    id: "iron_week",
    name: "Iron Week",
    description: "7-day fasting streak",
    icon: "flame",
    secret: false,
    rarity: "rare",
    condition: (s) => s.longestStreak >= 7,
    progress: (s) => p(s.longestStreak, 7),
  },
  {
    id: "iron_month",
    name: "Iron Month",
    description: "30-day fasting streak",
    icon: "shield",
    secret: false,
    rarity: "legendary",
    condition: (s) => s.longestStreak >= 30,
    progress: (s) => p(s.longestStreak, 30),
  },
  {
    id: "autophagy_achiever",
    name: "Autophagy Achiever",
    description: "Enter autophagy 10 times",
    icon: "recycle",
    secret: false,
    rarity: "epic",
    condition: (s) => s.autophagyCount >= 10,
    progress: (s) => p(s.autophagyCount, 10),
  },
  {
    id: "hundred_club",
    name: "Hundred Club",
    description: "100 total fasting hours",
    icon: "star",
    secret: false,
    rarity: "rare",
    condition: (s) => s.totalHours >= 100,
    progress: (s) => p(Math.round(s.totalHours), 100),
  },
  {
    id: "thousand_yard_stare",
    name: "Thousand Yard Stare",
    description: "1000 total fasting hours",
    icon: "eye",
    secret: false,
    rarity: "legendary",
    condition: (s) => s.totalHours >= 1000,
    progress: (s) => p(Math.round(s.totalHours), 1000),
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Broke a streak, then started again",
    icon: "refresh",
    secret: false,
    rarity: "common",
    condition: (s) => s.brokeStreakThenRestarted,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Finish a fast between 2-4am",
    icon: "moon",
    secret: false,
    rarity: "rare",
    condition: (s) => s.nightOwlFasts >= 1,
    progress: (s) => p(s.nightOwlFasts, 1),
  },
  {
    id: "five_fasters",
    name: "Five Fasters",
    description: "Complete 5 fasts",
    icon: "hash",
    secret: false,
    rarity: "common",
    condition: (s) => s.totalFasts >= 5,
    progress: (s) => p(s.totalFasts, 5),
  },
  // Level milestone achievements — names are intentionally NOT the same as the
  // rank titles in `gamification.ts` RANKS to avoid the "Disciplined the rank
  // vs Disciplined the achievement" confusion the user spotted.
  {
    id: "level_5",
    name: "First Five",
    description: "Reach level 5",
    icon: "trending-up",
    secret: false,
    rarity: "rare",
    condition: (s) => s.maxLevel >= 5,
    progress: (s) => p(s.maxLevel, 5),
  },
  {
    id: "level_10",
    name: "Decade Deep",
    description: "Reach level 10",
    icon: "trending-up",
    secret: false,
    rarity: "epic",
    condition: (s) => s.maxLevel >= 10,
    progress: (s) => p(s.maxLevel, 10),
  },
  {
    id: "level_15",
    name: "Eternal Practice",
    description: "Reach level 15",
    icon: "trending-up",
    secret: false,
    rarity: "legendary",
    condition: (s) => s.maxLevel >= 15,
    progress: (s) => p(s.maxLevel, 15),
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Start a fast before 6am",
    icon: "sunrise",
    secret: true,
    rarity: "rare",
    condition: () => false,
  },
  {
    id: "speed_faster",
    name: "Speed Faster",
    description: "Complete a fast in under 12 hours",
    icon: "zap",
    secret: true,
    rarity: "common",
    condition: () => false,
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "72+ hour fast",
    icon: "target",
    secret: true,
    rarity: "legendary",
    condition: (s) => s.longestFast >= 72,
    progress: (s) => p(Math.round(s.longestFast), 72),
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "50 completed fasts",
    icon: "award",
    secret: false,
    rarity: "epic",
    condition: (s) => s.totalFasts >= 50,
    progress: (s) => p(s.totalFasts, 50),
  },
  {
    id: "deep_diver",
    name: "Deep Diver",
    description: "Enter deep ketosis",
    icon: "anchor",
    secret: true,
    rarity: "epic",
    condition: () => false,
  },
];

export const RARITY_COLORS: Record<AchievementRarity, { bg: string; text: string; glow: string }> = {
  common:    { bg: "rgba(120,140,130,0.16)", text: "var(--ink-2)", glow: "rgba(120,140,130,0.30)" },
  rare:      { bg: "rgba(106,159,191,0.18)", text: "var(--water)", glow: "rgba(106,159,191,0.36)" },
  epic:      { bg: "rgba(217,119,87,0.18)",  text: "var(--ember)", glow: "rgba(217,119,87,0.40)" },
  legendary: { bg: "rgba(212,174,94,0.20)",  text: "var(--gold)",  glow: "rgba(212,174,94,0.50)" },
};

/**
 * Returns up to N achievements that are CLOSEST to unlocking but not yet unlocked.
 * Used by AchievementsPreviewCard on the idle screen — shows the user what's
 * within reach so they have something to chase.
 *
 * Sorted by ABSOLUTE steps remaining (target - current), ascending. Earlier we
 * sorted by RATIO (current / target) which gave bad results for new users:
 * any user at level 1 has progress 1/5 = 0.2 toward "Disciplined", which beats
 * progress 0/1 = 0.0 toward "First Blood" — even though First Blood needs 1
 * fast and Disciplined needs ~4 levels' worth of fasts. Steps-remaining gives
 * the more useful "what should I chase next" answer.
 */
export function getNextAchievements(
  stats: AchievementStats,
  unlockedIds: Set<string>,
  limit = 3
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id) && !a.secret && a.progress)
    .map((a) => {
      const pr = a.progress!(stats);
      return { a, stepsLeft: pr.target - pr.current, ratio: pr.target > 0 ? pr.current / pr.target : 0 };
    })
    .filter(({ ratio }) => ratio < 1) // only "in flight" ones
    .sort((x, y) => x.stepsLeft - y.stepsLeft) // fewest steps first
    .slice(0, limit)
    .map(({ a }) => a);
}
