# RespiCare Self-Manager — Design System

Extracted from source code via `stitch::extract-design-md` skill.
Source: `src/` (React + Vite + Tailwind CSS).
Purpose: Source-of-truth for Stitch screen generation and Next.js implementation.

---

## Identity

- **Product name:** RespiCare Self-Manager
- **Category:** Clinical health / patient self-management
- **Target user:** Pasien asma & PPOK dan keluarga pendamping mereka
- **Tone:** Utilitarian-clinical — precise, calm, trustworthy; no decorative flourish
- **Language:** Bahasa Indonesia (labels, copy, clinical terminology)

---

## Colour Tokens

All colours are referenced by semantic token name. No literal hex values appear past this block.

```css
:root {
  /* Brand — Teal (primary clinical accent) */
  --color-brand-900:  #134e4a; /* teal-900 — nav, dark hero bg */
  --color-brand-800:  #115e59; /* teal-800 — primary action bg */
  --color-brand-700:  #0f766e; /* teal-700 — icon tint, CTA hover base */
  --color-brand-600:  #0d9488; /* teal-600 — focus ring, link */
  --color-brand-50:   #f0fdfa; /* teal-50  — icon chip bg, subtle bg */
  --color-brand-100:  #ccfbf1; /* teal-100 — badge bg */

  /* Neutral — Slate (surface & text) */
  --color-surface:    #f8fafc; /* slate-50  — page bg */
  --color-card:       #ffffff; /* white     — card surface */
  --color-border:     #e2e8f0; /* slate-200 — default border */
  --color-border-sub: #f1f5f9; /* slate-100 — divider, card inner border */
  --color-text-900:   #0f172a; /* slate-900 — headings, body strong */
  --color-text-700:   #334155; /* slate-700 — secondary text */
  --color-text-600:   #475569; /* slate-600 — captions, subtitles */
  --color-text-500:   #64748b; /* slate-500 — placeholder, metadata */
  --color-text-400:   #94a3b8; /* slate-400 — disabled, struck-through */

  /* Status — Semantic alert palette */
  --color-critical-bg:     #fff1f2; /* rose-50   */
  --color-critical-border: #fca5a5; /* rose-300  */
  --color-critical-text:   #881337; /* rose-950  */
  --color-critical-badge:  #e11d48; /* rose-600  */

  --color-warning-bg:      #fffbeb; /* amber-50  */
  --color-warning-border:  #fcd34d; /* amber-300 */
  --color-warning-text:    #451a03; /* amber-950 */
  --color-warning-badge:   #d97706; /* amber-600 */

  --color-safe-bg:         #f0fdf4; /* emerald-50  */
  --color-safe-border:     #6ee7b7; /* emerald-300 */
  --color-safe-text:       #052e16; /* emerald-950 */
  --color-safe-badge:      #059669; /* emerald-600 */

  --color-info-bg:         #f0f9ff; /* sky-50  */
  --color-info-border:     #7dd3fc; /* sky-200 */
  --color-info-text:       #0c4a6e; /* sky-900 */
  --color-info-badge:      #0284c7; /* sky-600 */

  /* Dark hero variant (Scheduler notification panel) */
  --color-dark-surface:    #0f172a; /* slate-900 */
  --color-dark-card:       #1e293b; /* slate-800 */
  --color-dark-border:     #334155; /* slate-700 */
  --color-dark-text:       #f1f5f9; /* slate-100 */
  --color-dark-muted:      #94a3b8; /* slate-400 */

  /* Semantic badge — purple (corticosteroid warning) */
  --color-steroid-bg:      #faf5ff; /* purple-50  */
  --color-steroid-border:  #d8b4fe; /* purple-200 */
  --color-steroid-text:    #3b0764; /* purple-950 */

  /* Category chip colours */
  --color-controller-bg:   var(--color-brand-50);
  --color-controller-text: #134e4a;
  --color-controller-border: var(--color-brand-100);

  --color-reliever-bg:   #fffbeb;
  --color-reliever-text: #451a03;
  --color-reliever-border: #fde68a; /* amber-200 */

  --color-addon-bg:    #eef2ff; /* indigo-50  */
  --color-addon-text:  #1e1b4b; /* indigo-950 */
  --color-addon-border:#c7d2fe; /* indigo-200 */
}
```

---

## Typography

```
Font family (sans): Inter → system-ui → -apple-system → BlinkMacSystemFont → Segoe UI → Roboto → sans-serif
Font features: cv02, cv03, cv04, cv11 (Inter alternates — cleaner numerals & punctuation)
```

| Role | Size | Weight | Colour token |
|------|------|--------|--------------|
| App title / H1 | `text-lg` (18px) | `font-extrabold` | `--color-text-900` |
| Section heading / H2 | `text-lg` (18px) | `font-bold` | `--color-text-900` |
| Sub-heading / H3 | `text-base` (16px) | `font-bold` | `--color-text-900` |
| H4 (card sub) | `text-sm` (14px) | `font-bold` | `--color-text-900` |
| Body default | `text-sm` (14px) | `font-normal` | `--color-text-700` |
| Body small | `text-xs` (12px) | `font-normal` | `--color-text-600` |
| Label / eyebrow | `text-xs` (12px) | `font-bold uppercase tracking-wider` | `--color-text-700` |
| Badge / chip | `text-xs` (12px) | `font-semibold` | varies by variant |
| Micro / caption | `text-[11px]` | `font-semibold` | `--color-text-500` |
| Monospace (time / dose) | `font-mono` | `font-extrabold` | `--color-text-900` |

**Rules:**
- Body size minimum 14px (`text-sm`); never smaller than 12px except status chips
- Headings: one weight per level, one colour (never italic inside a roman heading)
- Time and dosis values use `font-mono` for legibility and scan-ability
- Labels use sentence case — never ALL CAPS tracked small-caps for navigation

---

## Spacing & Sizing Scale

The project uses Tailwind's default 4px base unit throughout.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | tight gap within chip |
| `space-2` | 8px | gap within button content |
| `space-3` | 12px | inline gap, tight stack |
| `space-4` | 16px | section inner padding, gap |
| `space-5` | 20px | card padding (mobile) |
| `space-6` | 24px | card padding (desktop sm:) |
| `space-10` | 40px | section vertical margin |
| Container max | `max-w-7xl` (1280px) | centred, gutters grow beyond |

---

## Border Radius

| Level | Token | Usage |
|-------|-------|-------|
| Chip / badge | `rounded-full` | StatusBadge, inline tags |
| Button | `rounded-lg` | secondary & tertiary buttons |
| Button primary | `rounded-xl` | primary CTA buttons |
| Card | `rounded-xl` | all Card components |
| Icon chip | `rounded-lg` | icon containers in CardHeader |
| Input | `rounded-lg` | form inputs and selects |

One radius per nesting level — no card inside a card.

---

## Shadow & Elevation

| Level | Class | Usage |
|-------|-------|-------|
| Default card | `shadow-sm` | Card component |
| Elevated modal / dark | `shadow-lg` | Modal overlays |
| No shadow on print | removed by `@media print` | PDF report view |

---

## Component Patterns

### Card
```
bg: --color-card  |  border: 1px solid --color-border  |  radius: rounded-xl
padding: p-5 (mobile), p-6 (sm:+)  |  shadow: shadow-sm
Print: shadow removed, border forced slate-300
```

### CardHeader
```
layout: flex row (sm:+), flex col (mobile)  |  gap: gap-3
divider: border-b border-slate-100  |  padding-bottom: pb-4  |  margin-bottom: mb-5
Icon chip: p-2.5, rounded-lg, bg-teal-50, text-teal-700, border-teal-100
Title: text-lg font-bold tracking-tight text-slate-900
Subtitle: text-sm text-slate-600
```

### StatusBadge
```
shape: rounded-full  |  padding: px-2.5 py-1  |  text: text-xs font-semibold
variants: critical | warning | safe | info | neutral
border: 1px solid (variant border colour)
ring on critical/warning: ring-1 ring-{color}/20
```

### ClinicalAlert (banner)
```
shape: rounded-xl  |  border: 1px  |  padding: p-4
Layout: flex col → flex row sm:+, justify-between, gap-3
Severity label chip: text-[10px] font-bold uppercase tracking-wider, px-2 py-0.5 rounded
Title: text-sm font-bold
Message: text-xs sm:text-sm leading-relaxed opacity-90
```

### Primary Button (CTA)
```
bg: --color-brand-700  |  hover: --color-brand-800
text: white font-semibold text-sm  |  padding: px-4–5 py-2–3
radius: rounded-lg (small) | rounded-xl (full-width/hero)
shadow: shadow-sm
focus-visible: ring-2 ring-teal-600/40  (required by Floor rule 6)
```

### Schedule Slot Card (Scheduler module)
```
taken state:    bg-emerald-50/60  border-emerald-300
pending state:  bg-white  border-slate-200  hover:border-teal-300
time badge:     font-mono font-extrabold  taken→bg-emerald-700 | pending→bg-slate-900
```

### Dark Panel (Notification / Alarm banner)
```
bg: gradient from --color-brand-900 to --color-dark-surface
text: white  |  border: --color-brand-800 or dark-border
Icon chip: bg-teal-500/20  text-teal-300  border-teal-400/30
```

### Input / Select
```
border: border-slate-300  |  bg: white  |  radius: rounded-lg
padding: px-3 py-2  |  text: text-sm
focus: border-teal-600  outline: none  (no default ring)
```

### Progress Bar (stock level)
```
track: bg-slate-200 h-2.5 rounded-full overflow-hidden
fill:  bg-emerald-600 (safe) | bg-amber-500 (warning ≤7 days) | bg-rose-600 (critical ≤3 days)
transition: transition-all duration-300
```

### Bar Chart (adherence)
```
Container: h-44 flex items-end gap-1.5 sm:gap-2 overflow-x-auto
Bar colours: emerald-600 (≥80% & no dyspnea) | amber-500 (moderate) | rose-600 (missed/dyspnea)
No data: bg-slate-300 h-6% minimum
Selected: bg-teal-100/80 ring-1 ring-teal-600
```

---

## Navigation (Tab Tabs)

```
Container:   overflow-x-auto, no-scrollbar, flex gap-1.5, pb-2.5 pt-1
Tab active:  bg-teal-800 text-white shadow-sm radius-xl
Tab rest:    bg-slate-100/80 text-slate-700 hover:bg-slate-200/70
Badge on tab: text-[10px] font-extrabold px-1.5 py-0.5 rounded-full
  critical → bg-rose-100 text-rose-800
  warning  → bg-amber-100 text-amber-800
  safe     → bg-emerald-100 text-emerald-800
  teal     → bg-teal-100 text-teal-800
  active overlay → bg-white/20 text-white
```

---

## Motion & Animation

**Permitted:** `transform`, `opacity` only. No `width`, `height`, `top`, `left`.

| Element | Rule |
|---------|------|
| Alert box | `transition-colors` |
| Progress bar fill | `transition-all duration-300` |
| Breath-hold timer (progress) | `transition-all duration-500` |
| Alarm pulse icon | `animate-pulse` (Tailwind utility) |

All animations must respect `prefers-reduced-motion: reduce` — Tailwind handles this via `motion-reduce:` variant. Content visible with JS off.

---

## Layout & Grid

```
Page bg:          bg-slate-50 (--color-surface)
Container:        max-w-7xl mx-auto px-4 sm:px-6
                  Gutters grow at 1920px; measure and grids do not widen
overflow-x:       clip on html and body (never hidden, never 100vw)
Main content gap: space-y-6 between module cards
Module grid:      grid grid-cols-1 md:grid-cols-2 gap-3.5 (slot cards)
                  grid grid-cols-1 lg:grid-cols-3 gap-6 (inhaler guide + sidebar)
                  grid grid-cols-2 lg:grid-cols-4 gap-3 (metric summary row)
Print (@media print): bg white, shadow removed, border forced, A4 portrait
```

---

## Iconography

Library: **Lucide React** (`lucide-react` v0.460+)
Size: `w-5 h-5` (default), `w-4 h-4` (compact), `w-6 h-6` (hero icon)
Color: inherited from parent (`text-{color}`)
Icons are always `aria-hidden="true"` — labels carry accessible text.

**Key icon → meaning mapping:**
| Icon | Module |
|------|--------|
| `Clock` | Scheduler / Jadwal Dosis |
| `Wind` | Inhaler Checker / Teknik Hirup |
| `Package` | Refill & Stock Tracker |
| `ClipboardCheck` | Adherence & Symptom Log |
| `FileText` | Summary Report / PDF |
| `Stethoscope` | App logo / clinical identity |
| `AlertOctagon` | Critical clinical alert |
| `AlertTriangle` | Warning clinical alert |
| `CheckCircle2` | Completed / confirmed state |
| `BellRing` | Active alarm |
| `ShieldCheck` | Technique validated |
| `FlaskConical` | BUD / pharmacy tracking |

---

## Status Colour Semantics

| Status | Background | Border | Text | Badge bg | Meaning |
|--------|-----------|--------|------|----------|---------|
| `critical` | rose-50 | rose-300 | rose-950 | rose-600 | Action required immediately |
| `warning` | amber-50 | amber-300 | amber-950 | amber-600 | Prepare / check soon |
| `safe` | emerald-50 | emerald-300 | emerald-950 | emerald-600 | Within safe parameters |
| `info` | sky-50 | sky-200 | sky-900 | sky-600 | Informational / neutral |
| `neutral` | slate-100 | slate-200 | slate-700 | — | No semantic meaning |

---

## Print / PDF Mode

Applied via `@media print`:
```css
body { background: #ffffff; color: #0f172a; font-size: 11pt; }
.no-print { display: none; }
.print-card { box-shadow: none; border: 1px solid #cbd5e1; }
@page { size: A4 portrait; margin: 12mm; }
```
Report uses `break-inside: avoid` on each section block.

---

## Accessibility Baseline

- Every interactive element requires `:focus-visible` with an instant ring (no transition on the ring itself)
- Form inputs use `focus:border-teal-600 focus:outline-none`
- Buttons: `focus-visible:ring-2 ring-teal-600/40 ring-offset-1`
- Icon buttons carry `aria-label`
- All icons are `aria-hidden="true"`
- Color is never the sole differentiator — shape/text always accompanies color in status badges

---

## Anti-Slop Rules (Hallmark Floor — applied)

1. All colour and font references go through `:root` tokens above. No literal hex or `font-family` in component CSS.
2. No `transition: all`. Only `transition-colors`, `transition-all duration-300` on `transform`/`opacity`/`fill`.
3. No italic word inside a roman heading.
4. `overflow-x: clip` on `html` and `body`.
5. `minmax(0, 1fr)` on image-bearing grid tracks.
6. `:focus-visible` on every interactive element, instant appearance.
7. `prefers-reduced-motion` fallback via Tailwind `motion-reduce:` variants.
8. No invented metrics, testimonials, logo walls, or case-study counts.
9. Labels use sentence case — no tracked small-caps navigation.
10. No decorative status dots, middle-dot metadata, or arrows glued to link text.
11. No purple-to-blue gradient, no card inside a card, no emoji as icon.
12. Hero headline visible at 1280×800 without scroll.
13. ~80 words per screen; hero = headline + one sentence + actions only.
14. Container capped at max-w-7xl, centred; gutters grow, grids do not.
