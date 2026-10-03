# NMYT Website — Handoff

Everything needed to continue building the NMYT website: brief, design references, brand assets, source
code, photography, deployment and open to-dos.

- **Live (preview) site:** https://nmyt-studio.vercel.app — Vercel project `nmyt-studio`
  (the older site at https://nmyt.vercel.app is a separate project and was not touched)
- **Stack:** Vite 8 · React 19 · TypeScript · three.js (custom GLSL shaders) · GSAP 3 (ScrollTrigger,
  SplitText, Flip) · Lenis smooth scroll · Tailwind v4 · self-hosted fonts via @fontsource

---

## Folder map

```
NMYT-Website-Handoff/
├─ HANDOFF.md                  ← you are here
├─ 01_code/nmyt-website/       ← the full site source (run it from here)
│  ├─ DESIGN.md                ← design system: colours, type, motion rules, voice (read first)
│  ├─ README.md                ← run / build / deploy / before-launch checklist
│  ├─ src/                     ← React app (pages, components, WebGL, data)
│  ├─ public/brand/            ← logo files used by the site (cut-out PNG/WebP, sizes, favicons, mask)
│  ├─ public/media/            ← optimised photography (.webp, 2000w + 900w "-sm")
│  ├─ media-src/raw/           ← original full-res photography (PNG) — not deployed
│  ├─ scripts/                 ← media.py (PNG→WebP), shoot.mjs / probe.mjs (headless QA screenshots)
│  └─ vercel.json              ← SPA rewrites + cache headers
├─ 02_brand-logo/              ← original logo as supplied + final transparent cut-out + tooling
└─ 03_design-references/       ← the client's sketches, moodboards and style references (numbered)
```

---

## 1. The brief (from the founder)

- **Who NMYT is:** a small, new-generation digital agency with high standards. Two studios:
  - **Tech Studio** — landing pages, websites, simple dashboards/systems.
  - **Creative Studio** — digital & social media marketing, brand commercials, brand design, product
    shoots, ads, custom cinematics.
  - **NMYT Originals** — in-house short films that give young filmmakers made films, a portfolio, and
    paid work on NMYT's commercial productions.
- **Clients:** brands, mid-sized firms, founder/owner-run businesses, independent service providers.
- **Presentation benchmark:** how Aevy TV / Aeos group present themselves. Main taste references:
  **Blacklead Studio** (blacklead.studio) and **Aeos Labs** (labs.aeoscompany.com).
- **Vibe:** dark, minimal, hi-tech; Apple / SpaceX launch-video motion graphics; cinematic visuals
  throughout; interactive and animated; premium, *no overselling*.
- **Colour:** Tech = white + deep sky blue. Creative = greens + deep blues (hyper-stylised).
  NMYT master = all three, as the logo suggests. Saturated — never washed-out / "AI-faded".
- **Type:** cinematic heavy display like **Gothif**, paired with an elegant contrasting face; premium
  standard text face for information.
- **Imagery:** photographic, not glossy-AI.
- **Logo:** must be used flawlessly — never damaged or altered.

Sketch flow (see `03_design-references/01–03`): loader where the logo "shines through its colours" →
home with nav + full-bleed cinematic visuals → text about the agency + interactive visual elements →
two highly interactive Tech / Creative studio cards.

## 2. What's built

| Route | Content |
|---|---|
| Loader | Logo silhouette fills with royal→sky→green light, resolves to the real metal logo with a sheen, curtain wipes up |
| `/` Home | WebGL "Convergence" hero (blue tech threads × green creative ribbons, service tags ride the light) → sticky "Reel" camera frame (We build / We shoot / We tell stories) → manifesto + particle morph (website wireframe → lens → NMYT mark) + facts → interactive Tech/Creative cards → pinned horizontal Selected Work → Originals letterbox teaser → Who we work with → studio photo band → How we work → marquee → footer |
| `/tech` | Sky-blue horizon shader that floods to white; services; illustrative UI panels; pinned process; tech work |
| `/creative` | Green ribbon shader + halftone portrait; warped type behind glass cards; services with cursor previews; work carousel; scroll-driven edit timeline; velocity marquee |
| `/originals` | Letterboxed hero + clapper slate; manifesto; the filmmaker program; "In development" slate; call for filmmakers |
| `/work` | Filterable (Flip-animated) grid / list of projects |
| `/contact` | 4-step brief builder → opens visitor's email app (no backend) |
| 404 | Glitch "Lost the signal" |

Global: custom cursor, film grain, Lenis smooth scroll, page-transition curtain, reduced-motion policy
("reduced ≠ none": keep fades/reveals, drop scrubbed pins/parallax), responsive to 375px.

## 3. Key decisions (and why)

- **Display font = Archivo (variable, wdth 78, weight 900)** — Gothif is a paid commercial font
  (demo = personal use only). Swap is one CSS variable (`--font-display` in `src/styles/tokens.css`) once
  licensed. Accent = Instrument Serif italic; text = Geist; labels = Geist Mono.
- **Logo:** `02_brand-logo/nmyt-logo-transparent-FINAL.png` is the supplied logo with *only* the white
  background removed (alpha matte, edge colour unmixing — see `matte.py`). No recolouring. At small sizes
  the site uses exact-size Lanczos renditions (`public/brand/nmyt-logo-h34/43/51/68.png`) for crispness.
  `nmyt-mark-outline-trace.svg` is a traced silhouette used only for the footer outline and particles.
- **Other logo variants:** the founder also has a lighter-blue and an iridescent-green NMYT logo (not
  supplied for the site). They could become Tech / Creative sub-marks — ask the founder.
- **Photography:** 19 images generated in ChatGPT with a strict photographic prompt (35mm, Vision3 500T,
  grain, no CGI look). Originals in `media-src/raw/`; run `python scripts/media.py` after replacing any.
  Replace with real shoot stills when available.
- **Performance lessons:** avoid large `mix-blend-mode` overlays (killed FPS on Intel iGPUs); animate
  `clip-path`/`transform` not `width/height`; WebGL canvases pause when off-screen.
- **Gotchas found in QA:** GSAP transforms need `display:inline-block` (not inline); late tweens in a
  scrubbed timeline don't pre-render (set start states with `gsap.set`); don't put glows
  (text-shadow/drop-shadow) on text inside SplitText masks (renders as boxes); use unique CSS class
  prefixes per section (a `.wk` clash once collapsed the Work page).

## 4. Run it

```bash
cd 01_code/nmyt-website
npm install
npm run dev          # http://localhost:5173   (?noloader skips intro, ?motion=full forces full motion)
npm run build        # → dist/
```
Requires Node 20+ (built on Node 24). Python 3 + Pillow only needed for `scripts/media.py`.

## 5. Deploy (Vercel)

`vercel.json` is included. From `01_code/nmyt-website`:
```bash
vercel link          # link to your own Vercel project (or the existing nmyt-studio one, with access)
vercel deploy --prod
```
Any static host works; keep the SPA fallback (all routes → `/index.html`).

## 6. Before launch — to-do

- [ ] `src/data/site.ts` — real email (currently placeholder `hello@nmyt.studio`), social links, phone, city.
- [ ] `src/data/work.ts` — the 6 projects are **samples** (fictional names) to demo the layout → replace
      with real case studies + images. The home Work section shows a "Sample projects" note — remove after.
- [ ] `src/pages/contact/BriefForm.tsx` — budget ranges are USD placeholders (`BUDGETS`).
- [ ] Contact form has no backend (mailto). Consider Formspree / Resend / a Vercel function.
- [ ] Case-study detail pages (`/work/:slug`) don't exist yet — cards link to `/work`.
- [ ] Real Originals films/trailers when ready (slate currently "Untitled No. 01–03, In development").
- [ ] Optional: license Gothif; optional: video reel files for the hero/reel.
- [ ] SEO: per-page titles/meta, OG image, sitemap; analytics.
- [ ] Custom domain on Vercel.
