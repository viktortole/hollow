# Hollow — Product Requirements

## Vision

Hollow is a **premium desktop fasting widget** that lives at the edge of your workspace — always visible, never intrusive — and turns intermittent fasting into a quiet daily discipline rather than a logging chore. The typographic restraint of the interface itself models the calm focus the practice cultivates. A future companion mobile app extends the same identity to phone and watch, but the desktop widget is the home base and the paid offering.

## Target users (3 personas)

### 1. The Discipline-Seeker (primary, paying)
Late-20s to 40s knowledge worker, runs intermittent fasting as part of a broader self-mastery practice (lifting, journaling, sleep hygiene). Wants a tool that *feels* serious, not gamified-for-children. Will pay $5–10 once for software that respects them.

### 2. The Biohacker (secondary, paying)
Quantified-self person tracking metabolic windows precisely. Cares about stage transitions (autophagy, deep ketosis), wants timestamps and historical data, may export to other tools. Curious about deep fasts (24h+).

### 3. The Casual Faster (tertiary, free tier)
Trying 16:8 because their friend recommended it. Will use the free version to try a few weeks. May convert to paid if the experience feels worth $5. Not the design target — but designs must not actively repel them.

## Core jobs-to-be-done

In rough priority order. Hollow exists to make these effortless:

1. **Start a fast and forget about it.** One click, no second-guessing. The widget keeps the time.
2. **See current stage at a glance.** Without opening any panel, the always-visible ring tells me whether I'm in fed/early/fat-burning/autophagy/etc.
3. **Know exactly when the fast ends.** Wall-clock end time, not just "16h remaining" math I have to do.
4. **Adjust start time** if I forgot to start it on time.
5. **Log hydration** to build a daily discipline alongside fasting.
6. **Review the last fast** quickly when starting the next one.
7. **See progression** (level, rank, streak) as quiet motivation.
8. **End or complete** the fast cleanly with a sense of accomplishment for completion.

## Non-goals (explicitly NOT building)

- **No social features.** No friends, no shares, no leaderboards, no group fasts. Hollow is a solo discipline tool.
- **No nutrition / calorie tracking.** That's a different product category and a much larger surface.
- **No coaching / AI advice.** No prompts telling the user how to feel or what to eat. The user is the expert in their body.
- **No telemetry / analytics back to a server.** Privacy-first. Everything local.
- **No account / login.** No backend at all in the v1. Sync is a future opt-in.
- **No notifications spam.** Stage transitions and goal completion only. No "you should drink water" pestering.
- **No web version of the desktop widget.** A web app cannot be always-on-top. Browser tab is the wrong form factor.

## Success metrics (post-launch)

- **D7 retention** ≥ 35% (industry baseline for paid productivity apps is ~20–30%)
- **Fast-completion rate** ≥ 60% per started fast (signal that the UI doesn't get in the way)
- **NPS** ≥ 40 from paying users
- **Refund rate** < 4% within 14 days (signal the value prop matched expectations)
- **Hours-fasted-per-active-user** trending up week over week (signal users are forming the habit)

## Premium tier definition

### Free tier
- Full fasting timer with stage detection
- Hydration tracking
- Full gamification (XP, level, streak, achievements with rarity tiers, personal-best detection)
- Both Light (Architectural Cream) and Dark (warm-graphite) themes
- Undo snackbar after End / Complete
- Local JSON export and import (own your data)
- Local-only data, zero telemetry

### Paid (one-time $7.99 or subscription $1.99/mo) — planned, not yet shipped
- **Cross-device sync** (opt-in iCloud / Google Drive)
- **Custom protocols** (define your own stages and hour thresholds)
- **Theme marketplace** (Mission Control, Nordic, Old-Money Luxury packs)
- **Pro analytics** (trend charts, mood-fast correlation, time-of-day heatmap)
- **Native exports** to Apple Health / Google Fit (CSV is in the free tier)
- **Watch companion** (watchOS / Wear OS)
- **Streak insurance** (one free missed-day per month)

The premium pitch is "this respects you" — not "you can finally see your data."

## Differentiation from free competitors

The market is crowded with free mobile apps (Zero free tier, Window, Fastient). Hollow's unique offer:

| Differentiator | Why it justifies paying |
|---|---|
| **Always-on desktop widget** | Mobile apps cannot offer this. Hollow lives in your peripheral vision while you work — every glance reinforces the practice. |
| **Privacy-first, fully local** | No account, no cloud-by-default, no telemetry. Every other major tracker monetizes via ads or data. |
| **Editorial design quality** | Looks like Things 3 / Linear, not like a generic SaaS dashboard. The aesthetic itself is the unlock. |
| **Pill mode + tray** | Desktop-only superpower. Shrink to a 220×56 floating timer that lives at the corner of your monitor; right-click anywhere for instant stats / settings. (Global hotkeys are roadmapped, not v1.) |
| **One-time purchase option** | Most competitors are subscription-only. Hollow respects users who don't want recurring billing. |

## Open questions (deferred to ROADMAP)

- Native macOS / Linux ports timing
- iOS / Android UI form factor
- Apple Health / Google Fit integration depth
- Whether to ship a web preview at hollow.app for marketing
- Pricing experiments (one-time vs subscription mix)
