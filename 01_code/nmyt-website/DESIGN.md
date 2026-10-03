# NMYT — Design System & Build Brief

Single source of truth for everyone building this site. Read fully before writing code.

## 1. Who NMYT is
A small, new-generation digital studio with high standards. Two studios under one roof:
- **Tech Studio** — landing pages, websites, simple dashboards & internal systems.
- **Creative Studio** — digital & social media marketing, brand commercials, brand design,
  product shoots, ads, custom cinematics, and in-house short films (**NMYT Originals**) that give
  young filmmakers paid work, a portfolio and a platform.
Clients: brands, mid-sized firms, founder/owner-run businesses, independent service providers.

Voice: confident, precise, short sentences. **No overselling, no fake stats, no invented awards
or client logos.** Say what we do, show it beautifully. Think Apple keynote captions, SpaceX
launch overlays, Blacklead Studio, Aeos Labs.

## 2. Colour (saturated, never washed out)
Defined as CSS custom properties in `src/styles/tokens.css`. Use the variables, not raw hex.

| token | hex | use |
|---|---|---|
| `--void` | `#030408` | page background |
| `--ink-900` | `#07090F` | raised surface |
| `--ink-800` | `#0C0F18` | cards |
| `--ink-700` | `#141826` | borders on dark / hover surface |
| `--line` | `rgba(255,255,255,.10)` | hairlines |
| `--fg` | `#F4F6FB` | primary text |
| `--fg-2` | `rgba(244,246,251,.64)` | secondary text |
| `--fg-3` | `rgba(244,246,251,.38)` | tertiary / labels |
| **NMYT master (logo)** | | |
| `--royal` | `#1638FF` | logo royal blue, primary brand |
| `--royal-deep` | `#0A1A8C` | deep ultramarine |
| `--sky` | `#16B4FF` | deep sky blue (Tech) |
| `--ice` | `#CFEFFF` | tech highlight |
| `--acid` | `#7CFF3A` | acid / neon green (Creative) |
| `--emerald` | `#00E08A` | emerald green (Creative secondary) |
| `--navy` | `#04123F` | creative deep blue |

Themes:
- **NMYT master** (home, work, contact): void black + all three hues — royal, sky, acid/emerald —
  exactly like the logo's metal (royal body, cyan highlights) plus the green of Creative.
- **Tech Studio** (`/tech`): white + deep sky blue. Minimal. Dark hero that blooms into a
  sky-blue light orb, then large white/ice sections (`#F6F9FF` bg, `#050A18` text, `--sky` accents).
  Blurred light gradients (Sui / Clustr / "Beside" references), glass stat panels.
- **Creative Studio** (`/creative`): greens + deep blues. Hyper-stylised. Acid green on black and
  navy, glitch/scanline type, terminal labels `//LIKE_THIS`, warped blurred giant type behind
  frosted glass cards, glowing light-streak ribbons.

Glows: hue at the bottom edge of cards (reference: bifurcation cards) — use
`--glow-tech`, `--glow-creative`, `--glow-master` gradients.

## 3. Typography
All self-hosted via @fontsource (already installed):
- **Display — "Archivo" variable** (`--font-display`): heavy semi-condensed grotesque standing in
  for Gothif (commercial). Always UPPERCASE, `font-weight: 900`, `font-stretch: 78%`
  (use class `.display`), tight tracking `-0.02em`, line-height `.86`. Hero sizes via clamp up to
  ~14vw. Gothif can later replace it by changing `--font-display` only.
- **Elegant accent — "Instrument Serif"** (`--font-serif`): italic, used for 1–3 contrasting words
  inside display headlines ("Where code *meets* cinema"), pull quotes and big numbers. Mixed case.
- **Text — "Geist" variable** (`--font-sans`): all body copy, nav, buttons. 15–18px body,
  `letter-spacing: -0.01em`, weights 400/500.
- **Mono — "Geist Mono" variable** (`--font-mono`): labels, indices, metadata:
  `01 / ABOUT`, `[ TECH STUDIO ]`, `SYS_01`, 11–12px uppercase, tracking `.08em`.

## 4. Layout & motion
- 12-col grid, `--gutter: clamp(16px, 2.2vw, 32px)`, max content width 1680px. Hairline rules
  (`--line`) separate sections like Aiera/Blacklead. Section index labels top-left in mono.
- Smooth scroll: Lenis (global, in `src/lib/smooth.ts`), GSAP ScrollTrigger synced to it.
- Motion language: slow, expensive, deliberate. Easing `--ease-out: cubic-bezier(.16,1,.3,1)`,
  `--ease-io: cubic-bezier(.76,0,.24,1)`. Text reveals = line mask slide-up (`<Reveal>`),
  headline chars stagger (`<SplitReveal>`), images = clip-path wipe + scale 1.15→1.
- Cursor: custom dot + ring (`<Cursor>`), grows over links and shows labels (`data-cursor="View"`).
- Film grain overlay (`<Grain>`) sits over the entire site at 6–8% opacity.
- Respect `prefers-reduced-motion`: disable scroll-scrubbing, keep fades.
- Mobile: must work at 375px. No horizontal overflow. WebGL downgrades DPR on mobile.

## 5. Components (src/components) — reuse, don't re-invent
`Nav`, `Footer`, `Loader`, `Cursor`, `Grain`, `Reveal`, `SplitReveal`, `MonoLabel`,
`MagneticButton`, `GlowCard`, `Marquee`, `SectionHead`, `Img` (lazy + wipe-in),
`PageTransition`. WebGL scenes live in `src/gl/`.

## 6. Imagery
Photographic, never glossy-AI. Film grain, real light, deep blacks. Stored in
`public/media/` (see `public/media/manifest.json` for names and intended use).
Treat every image with a subtle grade: slight crush of blacks + hue-tinted overlay matching the
page theme.

## 7. Logo
`public/brand/nmyt-logo.png` — the exact client-supplied 3D metallic mark, background removed.
**Never recolour, stretch, crop, rotate or apply filters that alter it.** Allowed: opacity,
uniform scale, drop-glow behind it, mask-based shine sweep in the loader.
