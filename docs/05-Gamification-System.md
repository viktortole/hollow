# Gamification System

## Overview

Hollow uses a multi-layered gamification model combining:
- **XP-based leveling** (20 levels, exponential curve)
- **Metabolic stage progression** (6 stages, each with a unique color and XP multiplier)
- **Achievement system** (20 achievements, mix of visible and secret)
- **Streak tracking** (consecutive-day fast completion)

---

## XP System (`src/lib/gamification.ts`)

### XP Per Level Formula

```typescript
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}
```

| Level | XP Required | Cumulative |
|-------|-------------|------------|
| 1 | 100 | 0 |
| 2 | 283 | 100 |
| 3 | 520 | 383 |
| 4 | 800 | 903 |
| 5 | 1,118 | 1,703 |
| 10 | 3,162 | ~12,800 |
| 15 | 5,809 | ~29,500 |
| 20 | 8,949 | ~59,400 |

### Total XP From Level

```typescript
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}
```

### Level From Total XP

```typescript
export function levelFromXp(totalXp: number): number {
  let level = 1, xp = totalXp;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    if (level >= 20) break;
  }
  return level;
}
```

### XP Per Hour (Stage Multipliers)

```typescript
export function xpPerHour(stageIndex: number): number {
  const multipliers = [1, 1.2, 1.5, 2, 2.5, 3];
  return 10 * (multipliers[stageIndex] ?? 1);
}
```

| Stage Index | Stage Name | Multiplier | XP/Hour |
|-------------|-----------|-----------|---------|
| 0 | Fed | 1.0x | 10 XP/h |
| 1 | Early Fast | 1.2x | 12 XP/h |
| 2 | Fat Burning | 1.5x | 15 XP/h |
| 3 | Autophagy | 2.0x | 20 XP/h |
| 4 | Deep Ketosis | 2.5x | 25 XP/h |
| 5 | Stem Cell | 3.0x | 30 XP/h |

### XP Calculation Per Fast

```typescript
// In endFast() - store.ts
let xpEarned = Math.floor(elapsedHours * xpPerHour(stageIndex));

// Completion bonus (+25%)
if (completed && elapsedHours >= targetHours) {
  xpEarned = Math.floor(xpEarned * 1.25);
}

xpEarned = Math.max(xpEarned, 10);  // minimum 10 XP
```

### XP Progress Within Level

```typescript
export function xpProgressInLevel(totalXp: number): {
  current: number;
  required: number;
  percentage: number;
} {
  let level = 1, xp = totalXp;
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
```

---

## Rank System (`src/lib/gamification.ts`)

```typescript
export const RANKS: { level: number; title: string }[] = [
  { level: 1,  title: "Initiate"    },
  { level: 2,  title: "Disciple"   },
  { level: 3,  title: "Devoted"     },
  { level: 4,  title: "Disciplined"},
  { level: 5,  title: "Hollow"      },
  { level: 6,  title: "Iron Will"   },
  { level: 7,  title: "Ascetic"     },
  { level: 8,  title: "Autophage"   },
  { level: 9,  title: "Ketogenist"  },
  { level: 10, title: "Metabolic"   },
  { level: 11, title: "Fasted Mind" },
  { level: 12, title: "Deep Faster" },
  { level: 13, title: " autophagy"  },
  { level: 14, title: "Cellular"    },
  { level: 15, title: "Renewed"    },
  { level: 16, title: "Reborn"     },
  { level: 17, title: "Eternal"    },
  { level: 18, title: "Void Walker"},
  { level: 19, title: "Ascended"   },
  { level: 20, title: "Omega"      },
];
```

Level 13 title has a leading space bug: `" autophagy"` - likely a typo.

---

## Metabolic Stages (`src/lib/stages.ts`)

```typescript
export const STAGES: FastingStage[] = [
  { id: "fed",          name: "Fed",          hoursMin: 0,   hoursMax: 4,    color: "#22c55e", glowColor: "#22c55e80", xpMultiplier: 1   },
  { id: "early",        name: "Early Fast",    hoursMin: 4,   hoursMax: 12,   color: "#3b82f6", glowColor: "#3b82f680", xpMultiplier: 1.2 },
  { id: "fat_burning",  name: "Fat Burning",   hoursMin: 12,  hoursMax: 16,   color: "#f97316", glowColor: "#f9731680", xpMultiplier: 1.5 },
  { id: "autophagy",    name: "Autophagy",     hoursMin: 16,  hoursMax: 24,   color: "#a855f7", glowColor: "#a855f780", xpMultiplier: 2   },
  { id: "deep_ketosis", name: "Deep Ketosis",  hoursMin: 24,  hoursMax: 48,   color: "#ec4899", glowColor: "#ec489980", xpMultiplier: 2.5 },
  { id: "stem_cell",    name: "Stem Cell",      hoursMin: 48,  hoursMax: Infinity, color: "#eab308", glowColor: "#eab30880", xpMultiplier: 3 },
];
```

### Stage Detection

```typescript
export function getStageIndex(hours: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (hours >= STAGES[i].hoursMin) return i;
  }
  return 0;
}

export function getStageForHours(hours: number): FastingStage {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (hours >= STAGES[i].hoursMin) return STAGES[i];
  }
  return STAGES[0];
}
```

### Stage-Up Animation

In FastingWidget.tsx, a useRef tracks the previous stage index. On each tick:
```typescript
if (stageIdx > prevStageRef.current) {
  setPendingStageUp(stageIdx);   // triggers radial color flash
  prevStageRef.current = stageIdx;
}
```

The flash is rendered as an AnimatePresence overlay with opacity: [0, 0.4, 0] radial gradient in the stage color, 0.8s duration.

---

## Achievement System (src/lib/achievements.ts)

### Data Model

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;           // lucide-react icon name
  secret: boolean;        // if true, name/description hidden until unlocked
  condition: (stats: AchievementStats) => boolean;
}

interface AchievementStats {
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
```

### All 20 Achievements

| ID | Name | Description | Secret | Condition |
|----|------|-------------|--------|-----------|
| first_blood | First Blood | Complete your first fast | No | totalFasts >= 1 |
| the_16 | The 16 | Complete a 16-hour fast | No | totalHours >= 16 |
| the_24 | The 24 | Complete a 24-hour fast | No | totalHours >= 24 |
| the_48 | The 48 | Complete a 48-hour fast | No | longestFast >= 48 |
| iron_week | Iron Week | 7-day fasting streak | No | longestStreak >= 7 |
| iron_month | Iron Month | 30-day fasting streak | No | longestStreak >= 30 |
| autophagy_achiever | Autophagy Achiever | Enter autophagy 10 times | No | autophagyCount >= 10 |
| hundred_club | Hundred Club | 100 total fasting hours | No | totalHours >= 100 |
| thousand_yard_stare | Thousand Yard Stare | 1000 total fasting hours | No | totalHours >= 1000 |
| comeback | Comeback | Broke a streak, then started again | No | brokeStreakThenRestarted |
| night_owl | Night Owl | Finish a fast between 2-4am | No | nightOwlFasts >= 1 |
| five_fasters | Five Fasters | Complete 5 fasts | No | totalFasts >= 5 |
| level_5 | Disciplined | Reach level 5 | No | maxLevel >= 5 |
| level_10 | Metabolic | Reach level 10 | No | maxLevel >= 10 |
| level_15 | Renewed | Reach level 15 | No | maxLevel >= 15 |
| veteran | Veteran | 50 completed fasts | No | totalFasts >= 50 |
| early_bird | ??? | ??? | Yes | condition: () => false |
| speed_faster | ??? | ??? | Yes | condition: () => false |
| marathon | ??? | 72+ hour fast | Yes | longestFast >= 72 |
| deep_diver | ??? | Enter deep ketosis | Yes | condition: () => false |

### Achievement Checking

```typescript
// In endFast() - store.ts
const existingIds = new Set(state.unlockedAchievements.map(a => a.id));
const achievementStats = get().getAchievementStats();

for (const achievement of ACHIEVEMENTS) {
  if (!existingIds.has(achievement.id) && achievement.condition(achievementStats)) {
    newUnlocks.push({ id: achievement.id, unlockedAt: endTime });
  }
}
```

### Night Owl Special Case

```typescript
// Outside the main loop, checked by end time hour
const hour = new Date(endTime).getHours();
if (completed && hour >= 2 && hour < 4) {
  const nightOwlStat = { ...achievementStats, nightOwlFasts: 1 };
  const nightOwl = ACHIEVEMENTS.find(a => a.id === "night_owl");
  if (nightOwl && !existingIds.has("night_owl") && nightOwl.condition(nightOwlStat)) {
    newUnlocks.push({ id: "night_owl", unlockedAt: endTime });
  }
}
```

---

## Streak System (`src/lib/store.ts`)

### Date Format
```typescript
function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
  // Returns: "2026-04-26"
}
```

### Streak Check

```typescript
function checkStreak(lastDate: string | null, today: string): number {
  if (!lastDate) return 1;      // first fast ever -> start streak
  const diffDays = floor((curr - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 0;  // same day -> no change
  if (diffDays === 1) return 1;  // consecutive -> increment
  return -1;                       // gap -> broke streak
}
```

### Streak Update (in endFast())

Only increments/brokeStreak when completed AND elapsedHours >= targetHours:
- streakResult === 1: consecutive -> currentStreak + 1
- streakResult === -1: gap -> brokeStreak = true, currentStreak = 1
- longestStreak = Math.max(longestStreak, newStreak)

---

## Fasting Protocols (`src/lib/stages.ts`)

| ID | Name | Hours | Description |
|----|------|-------|-------------|
| 16_8 | 16:8 | 16 | 16h fast, 8h eating window |
| 18_6 | 18:6 | 18 | 18h fast, 6h eating window |
| 20_4 | 20:4 (Warrior) | 20 | 20h fast, 4h eating window |
| omad | OMAD (23:1) | 23 | One meal a day |
| 24h | 24h | 24 | Full day fast |
| 36h | 36h | 36 | Extended fast |
| 48h | 48h | 48 | Two day fast |
| custom | Custom | 0 | Set your own duration |

Protocol -> hours mapping in startFast():
```typescript
const protoMap = {
  "16_8": 16, "18_6": 18, "20_4": 20,
  "omad": 23, "24h": 24, "36h": 36, "48h": 48,
};
```

---

## Animation & Visual Feedback

### Stage-Up Flash
When a new metabolic stage is entered (e.g., entering Fat Burning at 12 hours):
- pendingStageUp is set to the new stage index
- FastingWidget renders a full-screen radial gradient overlay
- Color matches the new stage at 40% opacity
- Duration: 0.8s, fades in and out

### Level-Up Overlay
When XP causes a level-up:
- Full widget overlay flashes with purple gradient
- Large level number animates in with spring physics
- Rank title appears below in purple
- Click anywhere to dismiss
- Duration: spring animation in, then stays until dismissed

### Achievement Toast
- Appears at top center of widget
- Slides down from top with spring animation
- Shows gold award icon, achievement name, and description
- Click to dismiss

### Completion Celebration
When Complete is clicked and target was reached:
- Full-screen gold radial flash animation
- Duration: 1.5s, opacity: [0, 0.3, 0]

### Streak Flame Animation
- StreakIndicator uses motion.div with infinite scale and filter animation
- Flame size and color change based on streak length
- Animation: scale: [1, 1.15, 1] + drop-shadow pulsing, 1.5s loop
