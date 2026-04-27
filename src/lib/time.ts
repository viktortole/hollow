/**
 * Hollow time formatters — pure, deterministic, no React, no I/O.
 *
 * Consolidates formatters that previously lived in `lib/stages.ts` and inline
 * inside `components/FastingWidget.tsx`. Single source of truth for any human-
 * readable time string the UI shows.
 */

/**
 * Format a duration in seconds as `HH:MM:SS`. Used for the timer hero readout.
 *
 * @example formatElapsed(3725) // → "01:02:05"
 */
export function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Format a duration in seconds as `Xh Ym` (or just `Ym` when h is zero).
 * Used for "Last fast" cards and stat strips.
 *
 * @example formatHoursMinutes(3725) // → "1h 2m"
 * @example formatHoursMinutes(540)  // → "9m"
 */
export function formatHoursMinutes(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Format a Unix-ms timestamp as wall-clock time, e.g. "2:30 PM", in the user's locale.
 * Used for "Started X · Ends Y" headers.
 *
 * @example formatTimeOfDay(Date.now()) // → "2:30 PM"
 */
export function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a Unix-ms timestamp as a relative-day phrase: Today, Yesterday, Nd ago, or a date.
 * Used for "Last fast" cards.
 *
 * @example formatRelativeDay(Date.now()) // → "Today"
 * @example formatRelativeDay(Date.now() - 86_400_000) // → "Yesterday"
 * @example formatRelativeDay(Date.now() - 5 * 86_400_000) // → "5d ago"
 */
export function formatRelativeDay(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);
  const sameDay = now.toDateString() === then.toDateString();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === then.toDateString()) return "Yesterday";
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Stable yyyy-MM-dd in UTC, used as the "fasting day" key for streaks and hydration daily-reset.
 *
 * @example getDateString(Date.now()) // → "2026-04-26"
 */
export function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
