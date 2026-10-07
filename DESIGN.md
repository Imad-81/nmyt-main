# NMYT design system (current, 2026-10-07)

The owner's rules are in `HANDOFF.md` section 5. This file is the working reference for values.

## Who NMYT is
A creative tech studio from Hyderabad, India, founded 2026. Two studios under one roof:
- **Tech Studio**: landing pages, websites, simple dashboards and systems, hosting and upkeep.
- **Creative Studio**: brand commercials, product shoots, social and digital marketing, ads, brand
  design, custom cinematics.
- **NMYT Originals**: in-house short films made with new filmmakers.

Voice: plain, confident, short sentences. No overselling, no invented clients or numbers, no
dashes in visible copy.

## Colour (`src/styles/tokens.css`)

| token | value | use |
|---|---|---|
| `--void` | `#030408` | page background |
| `--ink-900 / 800 / 700` | `#07090f / #0c0f18 / #141826` | raised surfaces |
| `--fg` | `#f4f6fb` | primary text |
| `--fg-2` | `rgba(244,246,251,.76)` | secondary text |
| `--fg-3` | `rgba(244,246,251,.56)` | tertiary text, eyebrows |
| `--royal` | `#1638ff` | logo blue |
| `--royal-deep` | `#0a1a8c` | deep blue |
| `--sky` | `#16b4ff` | Tech accent on dark |
| `--ice` | `#cfefff` | highlights |
| `--acid` | `#7cff3a` | Creative accent |
| `--emerald` | `#00e08a` | Creative secondary |
| `--paper` / `--paper-ink` | `#f6f9ff` / `#050a18` | Tech light sections |
| `--paper-ink-2` | `rgba(5,10,24,.72)` | secondary text on paper |

Per page
- **Home, Work, About, Contact**: void with blue, teal and green.
- **Tech**: dark hero that floods to paper white; small blue text on paper uses `#0a5fe0`.
- **Creative**: hero on a white studio wall (`#eef0f2` to `#e3e6e9`, ink `#06080d`), dark below
  with acid green.
- **Originals**: `.orig` redefines the palette to deep blue (`#02040d`) and ivory (`#f1ead9`).
  No green.

## Type (`src/index.css`)
- Everything is **Inter Variable** (optical size axis). `-apple-system` and SF Pro are the fallbacks.
- `.display`: weight 700, sentence case, letter-spacing -0.04em, line-height 1.04.
- `.h-section`: `clamp(34px, min(5.4vw, 10vh), 92px)`. `.h-sub`: `clamp(28px, 3.8vw, 64px)`.
- `.lede`: `clamp(16px, 1.25vw, 20px)`. `.eyebrow`: 14px, weight 500.
- `.serif` and `.mono` are kept as class names but resolve to the same family.
- Hero-only second voices: Instrument Serif italic (home hero phrase, Originals "shall be served
  soon"), a light Helvetica-style stack (Creative "twice.").

## Layout and rhythm
- `.wrap`: max 1680px, gutter `clamp(16px, 2.2vw, 32px)`.
- `.section`: `padding-block: clamp(45px, 6.3vw, 105px)`.
- Building blocks in `src/components/Simple.tsx`: `Head`, `Steps`, `Catalogue`, `Pillars`,
  `SlideMarquee`. Prefer these for new sections.
- Open layouts. No boxes around content, no hairline rules between sections.

## Motion
- Lenis smooth scroll + GSAP ScrollTrigger. Eases: `expo.out` for reveals, `--ease-out`
  `cubic-bezier(.16,1,.3,1)` in CSS.
- `<Reveal>`: fade and rise. `<SplitReveal>`: lines fade and rise. No clipping masks.
- Scroll-scrubbed: only the Tech and Creative heroes and the hero copy fade-outs.
- Self-running accents: footer logo pass (3 s), Work text sweep (4 s), Steps rail light, hologram
  loop (18 s), Originals bubble beam, ribbon pulse.
- Animate opacity and transform. Never font-weight, width or height on large elements.

## Logo
- `public/brand/nmyt-logo-hq.webp`: the colour artwork, background removed. Use as is.
- `public/brand/nmyt-mask-hq.webp` / `nmyt-mask-sm.webp`: white silhouette cut from it. Used as a
  CSS mask for the nav mark, loader, footer and page-transition curtain.
- `src/gl/nmyt-mark.json`: smooth vector outline for the 3D logo and the hologram.

## Imagery
Photographic, dark, real light. All still images are generated look-development frames, not
client work, and are labelled that way where they act as examples. Add images with
`scripts/media.py` and register them in `src/data/media.ts`.
