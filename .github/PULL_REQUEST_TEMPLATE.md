## What this changes

<!-- 1-3 sentences. What did you do, and why? -->

## How to verify

<!-- Specific things a reviewer should check. Manual steps, screenshots, etc. -->
- [ ]
- [ ]

## Architecture / token discipline

<!-- Tick what applies. If any are unticked, explain in the PR body. -->
- [ ] No new `setInterval` outside `src/hooks/useFastingClock.ts`
- [ ] No new direct `@tauri-apps/api/window` import outside `src/platform/desktop/`
- [ ] No new hex / rgba color literals where a token exists
- [ ] No new `z-[N]` or `rounded-2xl/xl/lg` (use `.z-*` and `.r-*` utilities)
- [ ] CI is green
- [ ] If you changed persisted state, you updated `PERSISTED_KEYS` AND `PersistedState` AND tested an export/import round-trip

## Docs

- [ ] If user-facing behavior changed, `CHANGELOG.md` has an entry under the right release section
- [ ] If a new public API or top-level component was added, `docs/AGENT-HANDOFF.md` references it
