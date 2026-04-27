# features/hydration

Daily hydration tracking. Glasses-of-water count with **automatic midnight reset** and a once-per-day goal-reached celebration toast.

## Public API

| Export | Purpose |
|---|---|
| `<HydrationCard />` | The interactive tap-to-fill row. Self-contained — no props. Reads/writes `hydrationToday`, `hydrationGoalGlasses`, `hydrationLastResetDate` directly from the store. |

## Store fields owned by this feature

- `hydrationToday: number` — today's count
- `hydrationGoalGlasses: number` — daily goal (default 8, configurable in Settings)
- `hydrationLastResetDate: string | null` — yyyy-mm-dd of last interaction; drives auto-reset
- `hydrationGoalCelebratedDate: string | null` — yyyy-mm-dd of last celebration; ensures one toast per day
- `pendingHydrationGoal: boolean` — toast trigger

## Store actions

- `incrementHydration()` — adds one glass; auto-resets count if date rolled over; soft-caps at 2× goal; fires goal-reached toast on threshold cross
- `decrementHydration()` — removes one glass; bottoms out at 0
- `setHydrationGoal(n)` — clamps to [1, 20]
- `dismissHydrationGoal()` — clears the celebration toast

## Goal toast

When `hydrationToday` crosses from `< goal` to `>= goal` AND `hydrationGoalCelebratedDate !== today`, the increment action sets `pendingHydrationGoal: true` atomically. The toast is rendered by `<ToastContainer />` in `src/features/notifications/`, which routes through the single-toast priority queue and gates display on `settings.notifyHydrationGoal`.

## Daily reset semantics

The reset is **lazy**: triggered by the next interaction after the date rolls over. The display layer (`HydrationCard`) compares `hydrationLastResetDate` against today and shows `0` for stale dates so the visual is always correct, even before the user touches anything.
