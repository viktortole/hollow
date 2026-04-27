# features/gamification

XP, levels, ranks, streaks, achievements. The "discipline progression" layer that lives alongside (not coupled to) the fasting clock.

## Public API (via `index.ts` barrel)

| Export | Purpose |
|---|---|
| `<DisciplineStrip />` | Top-of-widget rank · level · live XP ticker · weekly 7-dot streak band · streak multiplier badge. Always visible. |
| `<AchievementsPreviewCard />` | Idle-state "Within Reach" card showing the 3 closest-to-unlock non-secret achievements with rarity-colored progress bars. |
| `<AchievementsPanel />` | Full-window panel grouped by rarity (legendary / epic / rare / common). Locked achievements show progress bars when computable. |

## Pure logic (in `src/lib/`)

- `gamification.ts` — `levelFromXp()`, `xpProgressInLevel()`, `getRankTitle()`, `xpPerHour()`, `liveXpEarning()`, `predictedXpForFast()`, `xpPerMinute()`. All pure functions, no React. Touch these to change the XP curve or rank ladder.
- `achievements.ts` — `ACHIEVEMENTS[]` array of conditions, `RARITY_COLORS` map, `getNextAchievements(stats, unlocked, limit)`. To add an achievement: push to the array. The toast, AchievementsPanel, and AchievementsPreviewCard pick it up automatically.
- `streak.ts` — `getRecentStreakDays(fasts, days, now)` returns the row for the weekly streak band.

## Store slice

State and actions for this feature live in `src/stores/gamificationSlice.ts`:

- **State:** `totalXp`, `currentStreak`, `longestStreak`, `lastFastDate`, `unlockedAchievements`, `stageEntryHistory`, `brokeStreak`, `maxLevelReached`, `nightOwlFasts`, `pendingAchievements`, `pendingLevelUp`, `pendingStageUp`, `pendingMoodForFastId`.
- **Actions:** `getAchievementStats`, `dismissAchievement`, `dismissLevelUp`, `dismissStageUp`, `setPendingStageUp`, `setMoodForFast`, `dismissMoodPrompt`.

XP is awarded as part of `endFast` in `src/stores/fastingSlice.ts` — the cross-slice action lives there because *ending a fast* triggers XP, not the other way around.

## Read-this-first conventions

- Achievement rarity colors are data — never hardcode them in components, always read from `RARITY_COLORS[rarity]`.
- The live-XP ticker (`liveXpEarning`) recomputes per second during active fasts. Don't introduce a separate timer for it; subscribe to `useFastingClock`.
- The three components above are the entire public surface. Don't deep-import internals.
