# Hollow — Design System

> The outer shell is the only frame. Everything inside is a flat fill.

---

## The Single Design Rule

**The outer shell (App.tsx root div) owns the only border in the app. Every card, row, or tile rendered inside the shell is fill-only — no borders. Floating overlays outside the shell may keep borders.**

This rule resolves the four original symptoms simultaneously:
1. Removes duplicated-border noise (no more parallel 1px lines a few pixels apart)
2. Cards differentiate by tinted fill alone (background color + opacity)
3. Forces the spacing scale to carry the full structural load
4. Eliminates the busyness of individually framed cards composed inside a framed shell

---

## CSS Custom Property Tokens

All tokens are defined in `src/styles/index.css` inside `:root`. Every component references them with `var(--token-name)`.

### Spacing Scale

| Token | Value | Purpose |
|-------|-------|---------|
| `--widget-pad-x` | `12px` | Horizontal inset for panel root containers and the FastingWidget header row |
| `--widget-pad-y` | `12px` | Vertical inset for panel root containers |
| `--card-gap` | `10px` | Gap between stacked cards/rows inside a panel |
| `--card-gap-sm` | `8px` | Tighter gap for dense grids (e.g. achievement grid) |
| `--card-pad-x` | `12px` | Horizontal padding inside a card |
| `--card-pad-y` | `10px` | Vertical padding inside a card |
| `--card-pad-x-sm` | `10px` | Denser horizontal padding for compact grids |
| `--card-pad-y-sm` | `10px` | Denser vertical padding for compact grids |
| `--card-radius` | `12px` | Border radius shared by all cards and card-like surfaces |
| `--card-bg-neutral` | `rgba(255,255,255,0.045)` | Default neutral card fill |

### Selection States

| Token | Value | Purpose |
|-------|-------|---------|
| `--sel-bg` | `rgba(168,85,247,0.20)` | Selected card/row background fill |
| `--sel-dot` | `#a855f7` | Selected indicator dot color (with glow) |

---

## Root Container Padding Strategy

The outer shell (`App.tsx`) has **no padding** — it is a full-bleed dark gradient. All interior panels use `--widget-pad-x` and `--widget-pad-y` tokens for their inset.

This means every panel's content column shares the same left and right boundary. A vertical line dropped down the inside edge of the shell border touches every element's edge equally.

### Alignment Rule

The FastingWidget header row's left edge must align with the drag bar's "HOLLOW" text left edge. Both use `--widget-pad-x` (12px). The drag bar additionally uses `px-3` (12px) so the alignment is intentional and correct by default.

---

## Card Fill System

### Neutral Cards

```tsx
style={{
  background: "var(--card-bg-neutral)",  // rgba(255,255,255,0.045)
  borderRadius: "var(--card-radius)",     // 12px
  paddingInline: "var(--card-pad-x)",     // 12px
  paddingBlock: "var(--card-pad-y)",     // 10px
}}
```

### Tinted Stat Cards

Stat tiles use subtle color-tinted fills to indicate category. Opacity is raised slightly above what a border would have contributed, since the border is removed.

| Context | Color | Unselected | Note |
|---------|-------|-----------|------|
| FastingWidget — Level | purple | `rgba(168,85,247,0.16)` | Slightly elevated to compensate for removed border |
| FastingWidget — Next XP | pink | `rgba(236,72,153,0.14)` | |
| FastingWidget — Streak | orange | `rgba(249,115,22,0.14)` | |
| StatsPanel — stat tiles | white | `rgba(255,255,255,0.06)` | Higher opacity than FastingWidget because they appear against a darker panel bg |
| AchievementsPanel — unlocked | purple | `rgba(168,85,247,0.14)` | |
| AchievementsPanel — locked | white | `rgba(255,255,255,0.04)` | |

### Level Box (StatsPanel)

```tsx
style={{
  background: "rgba(168,85,247,0.18)",
  borderRadius: "var(--card-radius)",
}}
```
No border. The colored fill is enough.

---

## Selection State (No Border)

Protocol picker buttons, onboarding protocol selection, and any other list-of-options component uses **fill intensity + right-side dot** to indicate selected state.

```
Unselected:  background rgba(255,255,255,0.04)   ← no border, no dot
Selected:    background var(--sel-bg)            ← purple fill, dot on right
```

The `--sel-bg` fill is visually distinct from `--card-bg-neutral` (purple vs white tint) so selection reads clearly even without a border.

The dot always has a matching glow: `boxShadow: "0 0 6px var(--sel-dot)"`.

---

## Floating Overlays — Out of Scope

`ContextMenu`, `Toast`, and `PillMode` are **explicitly excluded** from the fill-only rule. They float visually outside the outer shell and correctly keep their borders. Their border is what separates them from the desktop/background.

Do not remove borders from floating overlays.

---

## Outer Chrome (App.tsx)

The outer shell has one border and one drop shadow:

```tsx
style={{
  background: "linear-gradient(180deg, rgba(13,12,24,0.98), rgba(8,8,16,0.98))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 54px rgba(0,0,0,0.68)",
}}
```

The inner inset shadow ring (`0 0 0 1px rgba(255,255,255,0.045) inset`) was removed — it created a second competing 1px edge near the corners, making the shell look double-bordered.

---

## Color Palette (Do Not Change)

The palette is intentionally narrow. Only opacity values are tuned during layout work.

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#a855f7` | Level box, selected states, XP gradient start |
| Accent pink | `#ec4899` | XP gradient end, button gradient |
| Stage 0 (Fed) | `#a855f7` | Timer ring, dot |
| Stage 1 (Burning) | `#f97316` | Orange tint |
| Stage 2 (Ketosis) | `#eab308` | Gold tint |
| Stage 3 (Autophagy) | `#22c55e` | Green tint |
| Stage 4 (Deep Ketosis) | `#06b6d4` | Cyan tint |
| Danger | `#ef4444` | End Fast button, reset confirm |
| Success | `#22c55e` | Complete Fast button |

---

## Typography

- **Font:** Inter (system-ui fallback) — defined in `:root` in `index.css`
- **Mono font:** JetBrains Mono — used for numeric stat values (`font-mono` utility)
- **Headings:** Bold, wide letter-spacing (`tracking-widest`, `tracking-[0.3em]`)
- **Labels:** All-caps with reduced opacity (`text-white/45`, `text-white/40`)

---

## Action Button Consistency

| Button | Style | Notes |
|--------|-------|-------|
| Start Fast | Borderless gradient `linear-gradient(135deg, #a855f7, #ec4899)` | Always visible |
| End Fast | Borderless tinted fill `rgba(239,68,68,0.28)` | Red tinted |
| Complete | Borderless gradient `linear-gradient(135deg, #22c55e, #16a34a)` | Green gradient |
| Reset All Data | Destructive: border + tinted fill `rgba(239,68,68,0.1)` with `border-red-500/20` | Stays bordered — destructive action needs emphasis |

All buttons share `py-3` vertical padding, `rounded-xl`, `tracking-widest uppercase` text, and `focus:ring` accessibility ring.

---

## Layout Verification Checklist

Before claiming layout work is complete, verify all of:

- [ ] No double border anywhere — drop a vertical line down the inside edge of the shell border; it should touch exactly one continuous frame
- [ ] Header bar, timer card, stage card, stat trio, XP bar, action buttons all share the same left and right inset
- [ ] End Fast and Complete buttons have equal visual weight (one tinted, one gradient, both borderless)
- [ ] "Fasting Active" header row's left edge aligns with drag bar "HOLLOW" left edge
- [ ] Stats/ Achievements/ Settings panels: no internal card borders, consistent padding via tokens, selection states read clearly
- [ ] Min-width 280 and max ~450 wide: no breaking, clipping, or awkward wrapping
- [ ] TypeScript clean: `npx tsc --noEmit` passes with zero errors
