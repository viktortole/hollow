# Contributing to Hollow

Thanks for considering. A few things will save us both time.

## Read these before you write code

1. **`docs/AGENT-HANDOFF.md`** — operating principles, forbidden patterns, where-to-look table.
2. **`docs/ARCHITECTURE.md`** — runtime topology + folder map.
3. **`docs/DESIGN-SYSTEM.md`** — token reference + don't-do list.
4. **`docs/ROADMAP.md`** — what we're building, what we're not.

A first PR that ignores these will be sent back with the read-this-first reply. Not unfriendly — just a one-time cost we'd rather pay once.

## What we will not accept

Hollow is intentionally narrow. Before opening a PR for any of the below, please open an issue first so we can discuss:

- **Cloud sync, accounts, or login.** Local-only is a feature, not an oversight.
- **Telemetry, analytics, crash reporters, or any third-party SDK that calls home.** See `docs/PRIVACY.md`.
- **Social features** — feeds, friends, leaderboards, sharing. Hollow is a solo discipline tool.
- **Calorie / macro / nutrition tracking.** Not in scope.
- **Coaching, AI chat, recommendations.** Not in scope.
- **New visual identities** that add gradients, neon, drop shadows on cards, or chat-bubble radii. The aesthetic is in `DESIGN-SYSTEM.md`; treat it as the spec.

## What we are happy to merge

- Bug fixes with a clear repro.
- Polish to existing features (better empty states, subtler animations, sharper copy).
- Accessibility improvements (focus management, aria, keyboard nav, screen reader announcements).
- Performance wins (smaller bundle, fewer re-renders) — measure before/after.
- New translations (when we have an i18n system; not yet).
- Docs improvements that survive their own staleness check (don't just describe the current state — describe the *invariant*).

## Code rules (enforced by CI)

| Forbidden | Use instead |
|---|---|
| `setInterval` for the fasting clock outside `useFastingClock.ts` | Subscribe to `useFastingClock()` |
| Direct `import { ... } from '@tauri-apps/api/window'` outside `src/platform/desktop/` | `import { platform } from '../platform'` |
| Hardcoded color literals (`#a855f7`, `rgba(...)`) where a token exists | `var(--token-name)` from `themes/{light,dark}.css` |
| Tailwind `rounded-2xl/xl/lg` | `.r-card` / `.r-pill` / `.r-chip` |
| Tailwind `z-NN` / `z-[N]` | `.z-{card,toast,popover,...}` token utilities |
| `JSON.stringify`-ing zustand state into localStorage | Persistence goes through `App.tsx` save subscriber + `lib/data.ts` only |

CI runs the architectural greps plus typecheck + Vite build on every PR. Use the pull request template.

## How to set up

```bash
git clone https://github.com/wolverinetole/hollow
cd hollow
npm install

# Run desktop dev shell:
npm run tauri dev

# Frontend only (no Tauri):
npm run dev

# Typecheck:
npm run typecheck

# Production build:
npm run build         # frontend only
npm run tauri build   # full installer
```

Mobile builds need the Android SDK or Xcode set up — see `docs/RELEASE-CHECKLIST.md`.

## How to propose a feature

Open a `[Feature]` issue using the template. Describe **the problem you're trying to solve** before describing your idea — many requests dissolve into existing solutions once the problem is clear.

If the feature touches the visual system, attach a sketch. If it touches persistence, propose the schema migration explicitly.

## How to file a bug

Use the `[Bug]` issue template. If you suspect data corruption, **export your data first** from Settings → Data and attach the JSON. That file is the source of truth for diagnosis.

## Releases

Maintainers only. The flow is in `docs/RELEASE-CHECKLIST.md`. Tag pushes trigger the `release.yml` workflow which builds installers for every supported desktop OS.

## Code of conduct

Be the kind of contributor you'd want to merge a PR from. Direct disagreement is fine; condescension is not. We're all here because we like the product.
