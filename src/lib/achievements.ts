export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret: boolean;
  condition: (stats: AchievementStats) => boolean;
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

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Complete your first fast",
    icon: "flame",
    secret: false,
    condition: (s) => s.totalFasts >= 1,
  },
  {
    id: "the_16",
    name: "The 16",
    description: "Complete a 16-hour fast",
    icon: "zap",
    secret: false,
    condition: (s) => s.totalHours >= 16,
  },
  {
    id: "the_24",
    name: "The 24",
    description: "Complete a 24-hour fast",
    icon: "clock",
    secret: false,
    condition: (s) => s.totalHours >= 24,
  },
  {
    id: "the_48",
    name: "The 48",
    description: "Complete a 48-hour fast",
    icon: "award",
    secret: false,
    condition: (s) => s.longestFast >= 48,
  },
  {
    id: "iron_week",
    name: "Iron Week",
    description: "7-day fasting streak",
    icon: "flame",
    secret: false,
    condition: (s) => s.longestStreak >= 7,
  },
  {
    id: "iron_month",
    name: "Iron Month",
    description: "30-day fasting streak",
    icon: "shield",
    secret: false,
    condition: (s) => s.longestStreak >= 30,
  },
  {
    id: "autophagy_achiever",
    name: "Autophagy Achiever",
    description: "Enter autophagy 10 times",
    icon: "recycle",
    secret: false,
    condition: (s) => s.autophagyCount >= 10,
  },
  {
    id: "hundred_club",
    name: "Hundred Club",
    description: "100 total fasting hours",
    icon: "star",
    secret: false,
    condition: (s) => s.totalHours >= 100,
  },
  {
    id: "thousand_yard_stare",
    name: "Thousand Yard Stare",
    description: "1000 total fasting hours",
    icon: "eye",
    secret: false,
    condition: (s) => s.totalHours >= 1000,
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Broke a streak, then started again",
    icon: "refresh",
    secret: false,
    condition: (s) => s.brokeStreakThenRestarted,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Finish a fast between 2-4am",
    icon: "moon",
    secret: false,
    condition: (s) => s.nightOwlFasts >= 1,
  },
  {
    id: "five_fasters",
    name: "Five Fasters",
    description: "Complete 5 fasts",
    icon: "hash",
    secret: false,
    condition: (s) => s.totalFasts >= 5,
  },
  {
    id: "level_5",
    name: "Disciplined",
    description: "Reach level 5",
    icon: "trending-up",
    secret: false,
    condition: (s) => s.maxLevel >= 5,
  },
  {
    id: "level_10",
    name: "Metabolic",
    description: "Reach level 10",
    icon: "trending-up",
    secret: false,
    condition: (s) => s.maxLevel >= 10,
  },
  {
    id: "level_15",
    name: "Renewed",
    description: "Reach level 15",
    icon: "trending-up",
    secret: false,
    condition: (s) => s.maxLevel >= 15,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Start a fast before 6am",
    icon: "sunrise",
    secret: true,
    condition: () => false,
  },
  {
    id: "speed_faster",
    name: "Speed Faster",
    description: "Complete a fast in under 12 hours",
    icon: "zap",
    secret: true,
    condition: () => false,
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "72+ hour fast",
    icon: "target",
    secret: true,
    condition: (s) => s.longestFast >= 72,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "50 completed fasts",
    icon: "award",
    secret: false,
    condition: (s) => s.totalFasts >= 50,
  },
  {
    id: "deep_diver",
    name: "Deep Diver",
    description: "Enter deep ketosis",
    icon: "anchor",
    secret: true,
    condition: () => false,
  },
];
