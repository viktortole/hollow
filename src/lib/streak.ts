import type { CompletedFast } from "./store";

/**
 * Returns the last `days` calendar dates (oldest first) and whether each had
 * a completed fast. Used by the StreakRow to render filled/empty dots.
 *
 * "Completed" here means the fast was marked completed AND hit goal — partial
 * fasts shouldn't satisfy a streak day. Matches the streak rule in store.ts:endFast.
 */
export interface StreakDay {
  date: string;            // YYYY-MM-DD
  weekdayLabel: string;    // "M", "T", "W", "T", "F", "S", "S"
  hadFast: boolean;
  isToday: boolean;
}

export function getRecentStreakDays(
  fasts: CompletedFast[],
  days = 7,
  now = Date.now()
): StreakDay[] {
  const completedDates = new Set<string>();
  for (const f of fasts) {
    if (!f.completed) continue;
    const elapsedHours = f.elapsedSeconds / 3600;
    if (elapsedHours < f.targetHours) continue;
    completedDates.add(toDateString(f.endTime));
  }

  const today = toDateString(now);
  const result: StreakDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ts = now - i * 86_400_000;
    const date = toDateString(ts);
    const weekdayLabel = ["S", "M", "T", "W", "T", "F", "S"][new Date(ts).getDay()];
    result.push({
      date,
      weekdayLabel,
      hadFast: completedDates.has(date),
      isToday: date === today,
    });
  }
  return result;
}

function toDateString(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}
