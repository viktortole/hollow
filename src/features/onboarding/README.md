# features/onboarding

Owns the **first-run experience** — welcome card and protocol selection.

## Public API

| Export | Purpose |
|---|---|
| `<Onboarding onComplete={() => void} />` | 2-step flow: welcome screen → protocol picker. Calls `onComplete` when the user taps "Start Fasting"; the parent (`App.tsx`) is responsible for persisting `onboardingComplete = true` and routing to the main panel. |

## The 2 steps

1. **Welcome** — Hollow wordmark + tagline + "Begin" button.
2. **Protocol selection** — list of `PROTOCOLS` (excluding `custom`) + a metabolic-stages preview band showing how many stages the chosen protocol will reach.

## What this folder does NOT do

- Persistence. `App.tsx` writes `onboardingComplete` via the save subscriber.
- Mood prompts, achievements, leveling — those live in `features/fasting`, `features/gamification`, `features/notifications`.

## Read-this-first conventions

- The "BEGIN" button has `min-height: 44px` for mobile touch-target compliance. Don't shrink it.
- Stage colors come from `src/lib/stages.ts` `STAGES`. Adding a new stage automatically expands the preview band.
- Don't add a 3rd onboarding step without revisiting the dot indicator (currently implicit — there's no dot row).
