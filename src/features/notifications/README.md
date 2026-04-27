# features/notifications

Owns **all post-action celebrations** — level-ups, achievement unlocks, stage transitions, hydration goals.

## Public API (via `index.ts` barrel — TODO: add a barrel here)

| Export | Purpose |
|---|---|
| `<ToastContainer />` | Single-toast queue with priority resolver. Mount once near the app root; reads `pendingX` flags from the store and renders one toast at a time. |

## The single-toast queue

Only one celebration is shown at any moment. The priority resolver in `ToastContainer.tsx` picks from the queue in this order:

1. **levelUp** — gated by `settings.notifyLevelUp`
2. **achievement** — gated by `settings.notifyAchievement`
3. **stageUp** — gated by `settings.notifyStageUp`
4. **hydration** — gated by `settings.notifyHydrationGoal`

Each auto-dismisses after ~4.5s. Lower-priority pending notifications wait their turn.

## Adding a new toast type

1. Extend the `Active` discriminated union in `ToastContainer.tsx`.
2. Add a `pendingX` field + `setPendingX` action to the store.
3. Insert it into the priority resolver at the appropriate level.
4. Render a case in the AnimatePresence body.
5. Gate it with a `settings.notifyX` toggle (add the setting in `lib/store.ts` and a row in `SettingsPanel.tsx`).

## Read-this-first conventions

- **No** full-screen flashes. The previous LEVEL UP modal obscured the timer and was removed.
- **No** parallel toasts — never bypass the queue with an ad-hoc `<motion.div>` overlay elsewhere.
- Toast styling reads from tokens (`--bg-2`, `--ember`, `--gold`, etc.). Don't add hex literals.
- The `pendingX` store fields are the source of truth. Components fire celebrations by setting them, not by directly mounting toasts.
