# Hollow — Known Issues

Stuff we know about and have decided not to ship a fix for in v1. Each entry has rationale + a pointer to where it lives. If an entry stops being acceptable, move it to a GitHub issue.

---

## 1. Three secret achievements can never unlock

**File:** `src/lib/achievements.ts`

Three achievements have stubbed conditions:

| ID | Description | Current `condition` |
|---|---|---|
| `early_bird` | Start a fast before 6am | `() => false` |
| `speed_faster` | Complete a fast in under 12 hours | `() => false` |
| `deep_diver` | Enter deep ketosis | `() => false` |

Why stubbed:
- `early_bird` and `speed_faster` need new stat counters in `AchievementStats` (`startedBeforeDawnFasts`, `subTwelveCompletedFasts`) that aren't tracked yet.
- `deep_diver` requires exposing `stageEntryHistory[5]` in `AchievementStats` (currently only `stageEntryHistory[3]` is exposed as `autophagyCount`).

Why we're shipping it: they're `secret: true`, so they don't appear in the AchievementsPanel as locked-with-progress — users see a locked card with "???" and "Secret achievement", which is the correct UX for secret achievements. The fact that the unlock condition is unreachable is invisible.

Fix when: Phase 6 alongside other gamification additions. Add the stat counters to `gamificationSlice`, expose them in `getAchievementStats()`, and wire the conditions.

**Do not "fix" by deleting the entries** — secret unreachable achievements are better than no secret achievements (one less surface to discover).

---

## 2. CircularProgress numeric position rounding

**File:** `src/components/CircularProgress.tsx`

Stage marks are positioned at integer pixels via `Math.round` to avoid Windows fractional-DPI sub-pixel anti-aliasing. The mark positions can therefore drift by ≤1 pixel when the ring is at certain sizes. Acceptable trade-off — the alternative (sub-pixel positioning) blurs the marks visibly on Windows.

---

## 3. Windows DWM 1px transparent-window edge artifact

**File:** OS-level (Windows DWM compositor)

With `decorations: false` + `transparent: true`, Windows draws a 1px subtle outline at the rounded corners. Cannot be eliminated from CSS. Documented in `DESIGN-SYSTEM.md` § "Accepted artifacts".

Don't chase by altering `--card-radius` — that creates worse seams.

---

## 4. `useEscapeKey` doesn't pair with a `useOutsideClick` hook yet

**File:** `src/hooks/useEscapeKey.ts` (TODO comment)

A complete popover-dismissal contract would be `useEscapeKey` + `useOutsideClick` together. We have inline outside-click handlers in 2 places (`ContextMenu`, `TimestampsRow`). Factoring into a shared hook is on the backlog. Until then, when you add a new popover, copy the outside-click pattern from `TimestampsRow`.

---

## 5. Cargo.toml uses unpinned `tauri = "2"`

**File:** `src-tauri/Cargo.toml`

`Cargo.lock` provides reproducibility for now. Before publishing v1.0.0 we should pin to an explicit version (e.g. `tauri = "=2.5.0"`) so a future `cargo update` doesn't silently move the build target.

Tracked in `RELEASE-CHECKLIST.md` step 5 + `ARCHITECTURE.md` deferred-decisions log.

---

## 6. Tauri auto-updater is not configured

**File:** `src-tauri/tauri.conf.json`

The `plugins.updater` section isn't set up. A future Hollow release won't notify already-installed users of the update; they have to manually download.

Why deferred: requires a public release endpoint (CDN URL), a signing key, and a `updater.json` published per release. Sensible to do once the GitHub release flow has been exercised end-to-end at least once.

Tracked in `PRIVACY.md` ("the single exception is the Tauri auto-updater") and the deferred decisions in `ARCHITECTURE.md`.

---

## 7. No automated tests

**File:** repo-wide

The architectural greps in `npm run health` catch many regressions (no stray fasting clock, no direct window imports, no z/rounded literals, no full-store re-renders). They do NOT catch behavioral regressions like "endFast no longer awards XP" or "undo no longer restores stage history". Adding Vitest is on the roadmap. Until then, the smoke tests in `RELEASE-CHECKLIST.md` are the verification baseline.

---

## How to add to this list

If you find something that's genuinely broken but the cost/risk to fix it now exceeds the cost of the bug:

1. Add an entry here with the file path, what's wrong, why we're shipping it.
2. Add a "fix when" line — be specific (a phase, a release, a triggering event).
3. Link from `ROADMAP.md` if the fix is a known phase work.

Don't use this file to record open philosophical debates — those go in `ROADMAP.md` "anti-roadmap" section.
