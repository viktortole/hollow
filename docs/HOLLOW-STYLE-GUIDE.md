# Hollow — Frontend Style Guide

> Rules for writing maintainable, consistent UI code in Hollow. These are enforceable — not suggestions.

---

## 1. CSS Token Discipline

**Every card-like surface MUST reference `var(--card-*)` tokens, never hard-coded Tailwind spacing or radius utilities.**

"Card-like surface" means any element that:
- Has a background fill
- Is contained within the outer shell
- Should align with other cards in the layout rhythm

```tsx
// CORRECT
<div style={{
  background: "var(--card-bg-neutral)",
  borderRadius: "var(--card-radius)",
  paddingInline: "var(--card-pad-x)",
  paddingBlock: "var(--card-pad-y)",
}}>

// WRONG — hard-coded values that break the rhythm system
<div className="rounded-xl p-3">
```

### When to use `--card-gap-sm` / `--card-pad-x-sm`

Use the `sm` variants for **dense grids only** — e.g. the 2-column achievement grid where items are smaller. If a card legitimately needs different padding, add a new token rather than an inline override.

```tsx
// Achievement cards — compact grid, use sm tokens
style={{
  gap: "var(--card-gap-sm)",
  paddingInline: "var(--card-pad-x-sm)",
  paddingBlock: "var(--card-pad-y-sm)",
}}

// Protocol selector rows — standard card padding
style={{
  gap: "var(--card-gap)",
  paddingInline: "var(--card-pad-x)",
  paddingBlock: "var(--card-pad-y)",
}}
```

### Panel Root Containers

All panel root containers (Onboarding, StatsPanel, AchievementsPanel, SettingsPanel) must use:

```tsx
style={{
  paddingInline: "var(--widget-pad-x)",
  paddingBlock: "var(--widget-pad-y)",
  gap: "var(--card-gap)",
}}
```

**Exception:** FastingWidget root already uses `var(--widget-pad-x/y)` and `var(--card-gap)` — this is correct and must not be changed to `p-4` or any other hard-coded value.

---

## 2. The Border Rule

**The outer shell (App.tsx) is the only frame. No card inside the shell may have a border.**

```tsx
// OUTER SHELL — App.tsx (the ONE place where border is allowed)
<div style={{
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 54px rgba(0,0,0,0.68)",
}}>

// ANYTHING INSIDE — NO BORDERS
<div style={{
  background: "var(--card-bg-neutral)",
  borderRadius: "var(--card-radius)",
  // No border property here!
}}>
```

**When to add a border back:**
- Floating overlays that live outside the shell (`ContextMenu`, `Toast`, `PillMode`) — keep their borders
- The "Reset All Data" button in SettingsPanel stays bordered — destructive actions need visual emphasis

---

## 3. Selection States — Fill + Dot, Never Border

Protocol picker buttons and any multi-option selector:

```tsx
// Unselected
style={{
  background: "rgba(255,255,255,0.04)",
  borderRadius: "var(--card-radius)",
  paddingInline: "var(--card-pad-x)",
  paddingBlock: "var(--card-pad-y)",
}}
// No border, no dot

// Selected — fill intensity change + right-side dot
style={{
  background: "var(--sel-bg)",          // rgba(168,85,247,0.20)
  borderRadius: "var(--card-radius)",
  paddingInline: "var(--card-pad-x)",
  paddingBlock: "var(--card-pad-y)",
}}
// Dot on right side:
{selected && (
  <div style={{
    background: "var(--sel-dot)",       // #a855f7
    boxShadow: "0 0 6px var(--sel-dot)",
    width: 6, height: 6, borderRadius: "50%",
  }} />
)}
```

**Never use a thicker or coloured border to indicate selection.** The fill change alone is sufficient when paired with the dot.

---

## 4. Opacity Compensation When Removing Borders

When a border is removed from a card, **slightly increase the background opacity** to compensate. The border was contributing visual separation — without it, the fill needs to work harder.

| Original border contribution | Bump fill opacity by |
|-----------------------------|---------------------|
| 1px white-alpha border at 0.08–0.10 | +0.01–0.02 |
| 1px coloured border at 0.2–0.3 opacity | +0.02–0.04 |

The exact value is a judgment call — the goal is that the card remains clearly visible against its neighbours. Bump conservatively and verify visually.

---

## 5. Inline Styles vs Tailwind Classes

**Tailwind is used for:**
- Layout (`w-full`, `h-full`, `flex`, `grid`, `items-center`, `gap-2`)
- Typography (`text-sm`, `font-bold`, `uppercase`, `tracking-widest`)
- Accessibility (`focus:outline-none`, `focus:ring-2`)
- Animation control (`whileTap={{ scale: 0.98 }}`)

**Inline `style={{}}` is used for:**
- All token-driven values (`var(--card-radius)`, `var(--sel-bg)`)
- Dynamic values from JS (`background: stageColor`, `width: ${progress}%`)
- CSS-only properties (`boxShadow`, `WebkitAppRegion`)
- Background gradients (always use inline for complex `linear-gradient`)

**Rule of thumb:** If it's a fixed design value, it should be a token in CSS. If it comes from JS state, it must be inline.

---

## 6. Sound Gate — Live Store Reads

In `FastingWidget.tsx`, the 1-second timer interval checks `settings.soundEnabled` every tick:

```tsx
// CORRECT — live read from store, not closure-captured
if (useStore.getState().settings.soundEnabled) {
  playStageUp();
}

// WRONG — stale closure capture (breaks mid-fast toggling)
// const soundEnabled = settings.soundEnabled;  // captured at render time
// if (soundEnabled) { ... }
```

Use `useStore.getState()` inside intervals, callbacks, and event handlers. Use `useStore(s => s.foo)` only in render-level reactive subscriptions.

---

## 7. Window Event Cleanup

Tauri event listeners (`onMoved`, `listen`) return `Promise<() => void>`. The returned function must be called on unmount.

```tsx
// CORRECT — capture cleanup function in useRef
const unlistenRef = useRef<(() => void) | null>(null);
appWindow.onMoved(({ payload }) => {
  // ...
}).then(fn => {
  unlistenRef.current = fn;
});
return () => {
  if (unlistenRef.current) unlistenRef.current();
};

// WRONG — Promise not awaited, cleanup never called
appWindow.onMoved(({ payload }) => {
  // ...
});
// unlisten function is lost
```

---

## 8. Avoid Stale State in useCallback / setInterval

```tsx
// Good: reference hoursElapsed via closure, but for store reads use getState()
const handleEndFast = useCallback((completed: boolean) => {
  if (completed && hoursElapsed >= targetHours) {
    playCompleteFast();
  }
  endFast(completed);
}, [hoursElapsed, targetHours, endFast]);
```

For the store state that changes mid-fast (like `soundEnabled`), always use `useStore.getState()` inside the callback body, not as a dependency — otherwise the callback captures the value from when the fast started.

---

## 9. No Debug Artifacts

- Zero `console.log`, `console.error`, `TODO`, `FIXME`, or `XXX` comments in committed code
- `grep -r "TODO\|FIXME\|XXX\|console.log" src/` must return nothing before pushing
- `npx tsc --noEmit` must pass with zero errors

---

## 10. Animation Rules

- Use framer-motion `motion.*` for enter/exit animations (`initial`, `animate`, `exit`)
- Use `whileTap={{ scale: 0.98 }}` for buttons (no JS handler needed)
- Stage-up flash and celebration overlay are overlay divs with `pointer-events-none` — they don't block interaction
- AnimatePresence requires a unique `key` prop on each animated element — reuse the same key suppresses exit animations
- For stacked toasts: each toast gets its own `AnimatePresence` with a vertical cascade offset

---

## 11. Accessibility

- All interactive elements have `focus:outline-none focus:ring-*` for keyboard nav
- Buttons have `aria-label` when icon-only (minimise, close)
- `aria-label` on the stat trio grid (`aria-label="Fasting stats"`)
- `role` and `aria-*` on custom toggle switches
- All color choices maintain sufficient contrast (checked against white text)

---

## 12. Naming Conventions

| Pattern | Example | Notes |
|---------|---------|-------|
| Component files | `PascalCase.tsx` | `FastingWidget.tsx`, `XpBar.tsx` |
| Non-component modules | `camelCase.ts` | `store.ts`, `sounds.ts`, `gamification.ts` |
| CSS tokens | `--kebab-case` | `--card-pad-x`, `--sel-dot` |
| Zustand state slices | `camelCase` | `isFasting`, `pendingLevelUp`, `nightOwlFasts` |
| Event handlers | `handle*` | `handleEndFast`, `handleProtocolChange` |
| Custom hooks | `use*` | (none yet, but reserve the pattern) |
| Ref variables | `*Ref` | `prevStageRef`, `stageSoundTimeRef`, `unlistenRef` |
