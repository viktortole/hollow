# Hollow — Design System

## Direction

**Architectural Cream.** Inspired by Dieter Rams (Braun calculators), Bauhaus posters, Things 3, and Linear's typographic restraint. The product *is* the type system. Light cream surface, deep charcoal ink, single brass-amber accent. Hairlines, no shadows on cards, no gradients, no glow filters on body text.

Reading model: a fasting tracker that looks like a precision instrument, not a casino. Empty space is intentional, never apologetic.

## Themes

Hollow ships with **two themes** — Light (default, Architectural Cream) and Dark (warm-near-black with cream ink). Both share the same geometry and spacing scales; only color tokens swap.

| Layer | File | Owns |
|---|---|---|
| Light theme | `src/styles/themes/light.css` | All color tokens for `:root` AND `[data-theme="light"]` |
| Dark theme | `src/styles/themes/dark.css` | All color tokens for `[data-theme="dark"]` |
| Geometry / spacing | `src/styles/tokens.css` | Theme-agnostic tokens (`--card-radius`, `--widget-pad-x`, etc) |

The active theme is set via `<html data-theme="light|dark">` by `App.tsx` on mount, reading `settings.theme` from the store. Toggleable in the Settings panel.

**Adding a new theme** = create `themes/<name>.css` with all the same color tokens overridden, import it in `index.css`, add to the `Theme` type union in `lib/store.ts`, and add a button in `SettingsPanel`. No other code changes required — the entire app reads from CSS variables.

## Token reference

All COLOR tokens live in `src/styles/themes/{light,dark}.css`. Geometry/spacing tokens in `src/styles/tokens.css`. **Never hardcode a value that has a token.** If a value appears twice in code without a token, that's a missing token — add one.

### Surfaces
```css
--bg-0: #f3efe7;     /* paper — outermost widget body */
--bg-1: #ebe6db;     /* widget interior — slightly recessed */
--bg-2: #ffffff;     /* card — sits on bg-1 */
--bg-3: #e2dccf;     /* hover/selected card */
--hairline: rgba(31, 28, 24, 0.08);   /* dividers, borders, edges */
```

### Ink (text)
```css
--ink:   #1f1c18;                    /* primary — headlines, numerals */
--ink-2: rgba(31, 28, 24, 0.66);     /* secondary — body */
--ink-3: rgba(31, 28, 24, 0.40);     /* tertiary — labels, captions */
--ink-4: rgba(31, 28, 24, 0.18);     /* quaternary — disabled, ring track */
```

### Accent (the only chromatic identity)
```css
--ember:      #b85a3b;   /* burnt amber — used SPARINGLY: ring arc, primary CTA highlight, active stage */
--ember-soft: rgba(184, 90, 59, 0.12);
--ember-glow: rgba(184, 90, 59, 0.28);
```

### Semantic
```css
--water:   #4a7894;   /* hydration */
--success: #5e7d52;   /* completion */
--danger:  #9c3a2b;   /* destructive (End Fast confirmation, Reset Data) */
--gold:    #a88445;   /* brass — only on goal-reached celebration */
```

Each semantic color also has a `-soft` alpha variant (≈12-18% for fills) and most have a `-glow` variant (≈30-50% for radial halos and box-shadows). Use these instead of inlining `rgba(...)`:

```css
--water-soft, --water-glow
--success-soft, --success-glow
--gold-soft, --gold-glow
--danger-soft   /* no -glow — danger should never glow */
--ember-soft, --ember-glow   /* same pattern as accent */
```

### Geometry
```css
--card-radius:  3px;
--pill-radius:  3px;
--chip-radius:  2px;

--widget-pad-x: 14px;
--widget-pad-y: 12px;
--card-gap:     8px;
--card-gap-sm:  6px;
--card-pad-x:   12px;
--card-pad-y:   10px;

--button-h-sm: 28px;
--button-h-md: 36px;
--button-h-lg: 44px;
```

### Shadows (sparingly)
```css
--shadow-sm:    none;                                      /* cards have NO shadow */
--shadow-pill:  0 6px 16px rgba(31, 28, 24, 0.10);         /* pill mode floating widget */
--shadow-popover: 0 10px 24px rgba(31, 28, 24, 0.16),
                  0 0 0 1px var(--hairline) inset;
```

### Breakpoints
```css
--bp-compact: 480px;     /* min(w,h) < this OR isMobile() = compact layout */
```

### Z-index ladder
A single overlay scale, exposed via `.z-*` utilities in `utilities.css`. **Never write a literal `z-[N]` in a component** — the CI architectural-grep gate will fail.

```css
--z-base:        0;     /* default content */
--z-card:        10;    /* cards w/ shadows */
--z-dragregion:  15;    /* title bar drag */
--z-overlay:     20;    /* ambient glows */
--z-radial:      30;    /* in-widget radial flashes */
--z-toast:       50;    /* notification banner */
--z-pb:          55;    /* personal-best announcement */
--z-popover:     70;    /* protocol picker, edit-start */
--z-pillmode:    80;    /* pill-mode UI */
--z-contextmenu: 100;   /* right-click menu */
```

## Type scale

| Class | Font | Size | Weight | Use |
|---|---|---|---|---|
| `.timer` | Geist Mono | 28px | 500 | The hero elapsed-time number |
| `.numeral-lg` | Geist Mono | 18px | 500 | Big mono numbers (XP totals, hour counts) |
| `.numeral` | Geist Mono | 12px | 500 | Inline numerals (stat tile values) |
| `.headline` | Geist | 14px | 600 | Panel titles, section heads |
| `.body` | Geist | 12px | 400 | Default body text |
| `.label-cap` | Geist Mono | 9–10px | 500, uppercase, tracked 0.18em | All-caps labels (RANK, HYDRATION, READY, FASTING) |
| `.label-tight` | Geist | 10px | 600, uppercase, tracked 0.10em | Chip text (PROTOCOL, OVER GOAL) |
| `.caption` | Geist | 10px | 400 | Auxiliary copy (stage descriptions, "Begin a focused fast") |

**Drop:** `.font-display` (Newsreader italic). The romantic register fights Rams austerity. Replace ritual italic moments with `label-cap`.

## Spacing scale

Use only multiples of 2px. Reference tokens above. **No magic numbers.** If you need `5px` or `7px`, the design is wrong.

## Component primitives

### Card
```css
background: var(--bg-2);
border-radius: var(--card-radius);
padding-inline: var(--card-pad-x);
padding-block: var(--card-pad-y);
/* no border, no shadow */
```

Hover: swap to `--bg-3` only when interactive.

### Button — secondary (default)
```css
border: 1px solid var(--ink);
background: transparent;
color: var(--ink);
border-radius: var(--pill-radius);
height: var(--button-h-md);
padding-inline: 16px;
font-family: Geist;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.08em;
font-size: 12px;
```

Hover: `background: var(--ink); color: var(--bg-0);`. No transitions over 120ms.

### Button — primary (Start Fast, Complete)
Inverts the secondary: solid `--ink` background by default, swaps to `--bg-0` background + 1px `--ink` border on hover. **No gradients. No shadows. No glow.** The strongest button on the screen earns its weight from contrast and typography, not from neon.

### Button — destructive (End Fast confirmation, Reset Data)
Border + text in `--danger`. Filled-on-hover same pattern as secondary.

### Pill (chip / protocol stamp)
```css
background: var(--bg-3);
border-radius: var(--chip-radius);
padding-inline: 8px;
padding-block: 4px;
font-family: Geist Mono;
font-size: 11px;
```

### Ring (CircularProgress)
```
size:        152px (regular form factor)
stroke:      6px
track:       --ink-4
arc:         --ember
arc-tip:     drop-shadow(0 0 6px var(--ember-glow))   ← only on the leading tip pixel, not the whole arc
```

Stage marks (Phase 4) sit at hour-position angles on the ring perimeter. See "Stage marks" below.

### Toast variants
| Variant | Background | Border | Use |
|---|---|---|---|
| Achievement | var(--bg-2) | 1px var(--ember) | Achievement unlocked |
| LevelUp | var(--bg-2) | 1px var(--gold) | Rank advance |
| StageUp | var(--bg-2) | 1px {stage.color} | Metabolic stage transition |
| MoodPrompt | var(--bg-2) | 1px var(--hairline) | Post-fast mood ask |

All toasts: `border-radius: var(--card-radius)`, no shadow. Top-right corner of widget. Self-dismiss after 4s.

### Stage marks (current — radial tick segments, post-redesign)
Short tick-segments crossing the ring track at each stage's hour-position (computed from `stage.hoursMin / displayMaxHours`). Reached marks fill in their stage color; unreached are dim. The currently-active stage gets a soft pulsing dot anchored just outside the ring (not on the track itself), so it reads as a beacon without disrupting the precision-instrument feel.

The earlier 22px floating-icon design (with stage glyphs in plates over the track) was prototyped and replaced — it competed with the timer for attention. Tick segments are quieter and more legible at the 152px ring size.

### UI primitives (`src/components/ui/`)
The shared building blocks. Use these instead of inlining ad-hoc form controls.

| Primitive | Purpose |
|---|---|
| `<Section title>` | Labelled vertical group used by Settings and any future panel |
| `<Row icon title sub>` | Setting row with icon + title/sub stack on the left, control on the right |
| `<Toggle value onToggle>` | iOS-style on/off switch with `role="switch"` + `aria-checked` |
| `<Stepper value min max onDec onInc>` | Numeric −/value/+ trio, clamps to bounds |
| `<SegmentedToggle options value onChange>` | Two-or-three-way segmented control (used by theme picker) |

Add new primitives to `src/components/ui/` and re-export through its barrel.

### App-shell components (`src/app/`)
| Component | Purpose |
|---|---|
| `<TitleBar>` | Top strip — wordmark + nav icons + window controls. Internal `<NavButton>` is the canonical icon-button primitive. |

### Cross-cutting components (`src/components/`)
| Component | Purpose |
|---|---|
| `<ErrorBoundary>` | Class component wrapping the panel router. Render errors fall back to a recovery surface; users get a "Reset View" button instead of a blank widget. |
| `<CircularProgress>` | The ring. Accepts `marks?` for the stage tick segments. |
| `<ContextMenu>` | Right-click menu (desktop only). |
| `<PillMode>` | Compact 220×56 floating timer. |

## Motion vocabulary

- **Tick fade:** state transitions 120ms ease-out.
- **Stage glow-in:** mark scales 0.6 → 1.2 → 1.0 over 600ms, opacity 0→1, drop-shadow 0→6px. Only on stage transition.
- **Pill mode resize:** OS-driven, no CSS.
- **Toast in/out:** 220ms ease-out for in, 160ms ease-in for out.
- **Active stage pulse:** 3s ease-in-out infinite. Subtle. Almost subliminal.
- **No bounce, no spring, no rotation** outside loaders. Calm, mechanical.

## Accepted artifacts (WONTFIX)

### Windows DWM 1px outer compositor edge
On Windows with `decorations: false` + `transparent: true`, the OS window manager draws a 1px subtle outline at the rounded corners. **This is an OS-level artifact and not fixable from CSS.** Do not chase by altering `--card-radius` — that creates worse seams. Accept and document.

### Cream surface contrast on bright wallpapers
`--bg-0` is opaque cream; the desktop wallpaper does NOT bleed through. The app reads as a card hovering above any wallpaper. Verified at full-bright white wallpaper.

## Don't-do list

- **No neon.** No saturated greens, hot pinks, electric purples.
- **No gradients on buttons or cards.** Two-stop gradients are an AI-slop tell.
- **No drop shadows on cards.** Spacing alone separates them.
- **No glow on body text.** Glow is for the ring tip and stage marks only.
- **No `rounded-2xl` / `rounded-xl` / `rounded-lg` Tailwind utilities.** Use token-backed classes (`.r-card`, `.r-pill`, `.r-chip`).
- **No inline styles for tokenized values.** If you typed `style={{ background: '#f3efe7' }}`, use `var(--bg-0)` instead. The only legitimate inline `style` use is for genuinely dynamic values (e.g., a stage color computed at runtime).
- **No emoji in product copy.** Stage descriptions are nouns, not 🔥 flames.
- **No "AI dashboard" patterns.** No avatar-circle in the top-left, no decorative icon strips, no rounded-pill nav at the bottom. Hollow is editorial.
- **No competing accent colors.** Stage colors exist but are semantic, not decorative — they appear only where the stage is the topic (ring marks, stage indicator).
- **No Newsreader italic anywhere.** It was tried and dropped — see the type-scale "Drop" note.

## Where to look (token edits)

| Want to change | File |
|---|---|
| Any color | `src/styles/themes/{light,dark}.css` (theme-specific) |
| Add a semantic alpha variant (`-soft` / `-glow`) | Both `themes/light.css` AND `themes/dark.css` so the variant exists in every theme |
| Stage colors specifically | `src/lib/stages.ts` (each stage has a `color` field — pure data) |
| Spacing rhythm | `src/styles/tokens.css` (--card-* and --widget-* vars) |
| Z-index of any overlay | `src/styles/tokens.css` `--z-*` block + `.z-*` utility class in `utilities.css` |
| Geometry (radius, button heights, breakpoints) | `src/styles/tokens.css` |
| Type sizes | `src/styles/utilities.css` (`.label-cap`, `.font-mono`, etc) |
| Keyframe animations | `src/styles/keyframes.css` |
| Add a new theme | `src/styles/themes/<name>.css` overriding the same token names; register in `Theme` union (`lib/store.ts`) and `SettingsPanel` picker |
