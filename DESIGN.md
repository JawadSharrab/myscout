# Design Brief

## Direction

Amman Limestone Editorial — a warm, editorial discovery experience for student extracurricular opportunities in Amman, grounded in the city's limestone architecture and magazine craft, with a fully polished light/dark toggle.

## Tone

Refined editorial warmth: cream limestone canvas, terracotta CTAs, sky-blue accents, and a deep navy featured surface — confident, cultured, and inviting, with an intentionally designed dark counterpart rather than an inverted clone.

## Differentiation

A high-end magazine layout where a deep-navy featured card and terracotta gradient headlines give an academic, culturally-grounded identity to an otherwise utility-style opportunity feed, in both light and dark.

## Color Palette

Light (default):

| Token      | OKLCH         | Role                          |
| ---------- | ------------- | ----------------------------- |
| background | 0.965 0.02 80 | warm cream canvas             |
| foreground | 0.2 0.03 45   | warm charcoal text            |
| card       | 0.99 0.012 80 | lighter cream surface         |
| primary    | 0.5 0.13 35   | terracotta CTA                |
| accent     | 0.72 0.13 225 | sky-blue highlight            |
| navy       | 0.22 0.04 255 | featured card surface         |
| muted      | 0.93 0.02 80  | soft sand secondary           |

Dark (.dark):

| Token      | OKLCH         | Role                          |
| ---------- | ------------- | ----------------------------- |
| background | 0.145 0.018 60 | warm charcoal canvas         |
| foreground | 0.93 0.015 60 | warm ivory text               |
| card       | 0.185 0.022 60 | raised charcoal surface       |
| primary    | 0.72 0.14 35   | bright terracotta CTA         |
| accent     | 0.72 0.13 225 | luminous sky-blue highlight   |
| navy       | 0.3 0.045 255 | featured card surface         |
| muted      | 0.23 0.025 60 | deep sand secondary           |

## Typography

- Display: Fraunces — headlines, hero, featured card titles
- Body: General Sans — paragraphs, UI labels, cards
- Mono: JetBrains Mono — ratings, tags, meta
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered surfaces on the canvas: flat cards with `shadow-card`, elevated featured/hero surfaces with `shadow-elevated`, and a navy gradient featured card for depth without glow; dark mode relies on lighter card surfaces and border contrast rather than heavy shadows.

## Structural Zones

| Zone    | Light Background | Dark Background | Border   | Notes                              |
| ------- | ---------------- | --------------- | -------- | ---------------------------------- |
| Header  | bg-card          | bg-card         | border-b | serif wordmark + theme toggle      |
| Hero    | bg-background    | bg-background   | —        | terracotta headline + navy feature |
| Content | bg-background    | bg-background   | —        | alternate `bg-muted/30` sections   |
| Footer  | bg-muted/40      | bg-muted/40     | border-t | muted sand surface                 |

## Theme Toggle

- Renders in the header on desktop and in the mobile menu; a compact icon button on `bg-card` with `border-border`, `bg-secondary` active track, `shadow-subtle`, `rounded-full`
- Uses `next-themes` (`attribute=class`, `defaultTheme=system`, `enableSystem`) — `html.dark` drives all `.dark` tokens
- Apply `.theme-transition` to chrome surfaces so toggling cross-fades instead of snapping
- `color-scheme` set per mode so native controls (toggle icon, scrollbars) match

## Spacing & Rhythm

Generous editorial spacing: `gap-8`/`gap-12` between sections, `p-6` cards, `gap-4` within cards, `max-w-7xl` container for a spacious magazine rhythm.

## Component Patterns

- Buttons: terracotta `bg-primary`, rounded-lg, hover darken via `hover:bg-primary/90`
- Cards: rounded-xl, `bg-card`, `shadow-card`, hover `shadow-elevated` + lift
- Badges: rounded-full pills, color-coded by category (sky-blue, terracotta, sage)
- Featured: `bg-navy`/`bg-gradient-featured` with cream serif text

## Motion

- Entrance: `animate-fade-up` staggered on cards and hero
- Hover: cards lift with `transition-smooth` + elevated shadow
- Decorative: `animate-float` on the featured card emblem
- Theme: `.theme-transition` 0.35s ease cross-fade on background/color/border

## Constraints

- Token-only styling: semantic classes only, no raw color literals or arbitrary values
- AA+ contrast in both light and dark modes (muted-foreground tuned to 0.62 in dark)
- Fraunces + General Sans + JetBrains Mono from bundled fonts only
- Theme toggle button itself is a frontend task; tokens fully support it

## Signature Detail

A deep-navy featured opportunity card with a terracotta-to-amber gradient headline and sky-blue tag — the editorial anchor that makes the feed feel curated, not scraped, in both light and dark.
