# NMYT — website

Vite + React 19 + TypeScript · three.js (custom GLSL) · GSAP (ScrollTrigger, SplitText, Flip) · Lenis · Tailwind v4.
Design system and build rules: see [DESIGN.md](DESIGN.md).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve dist/
```

Dev helpers: `?noloader` skips the intro, `?motion=full` forces full motion even when the OS asks for reduced motion.

## Deploy

Static SPA. Any static host works (Vercel / Netlify / Cloudflare Pages). Add an SPA fallback so deep links
(`/tech`, `/creative`, …) resolve to `index.html` — e.g. Netlify `_redirects`: `/* /index.html 200`,
Vercel: rewrites `{ "source": "/(.*)", "destination": "/" }`.

## Pages

| route | what |
|---|---|
| `/` | Loader (logo shines through its colours) → WebGL "Convergence" hero → reel → manifesto + particle morph (wireframe → lens → NMYT mark) → studio cards → selected work → Originals → who we work with / process → footer |
| `/tech` | Tech Studio — white & deep sky blue |
| `/creative` | Creative Studio — greens & deep blues, hyper-stylised |
| `/originals` | NMYT Originals — in-house films & filmmaker program |
| `/work` | Work index with filters, grid/list |
| `/contact` | Brief builder (opens the visitor's mail app — no backend) |

## Before launch — replace these

- `src/data/site.ts` — email, socials, optional phone/location (marked `TODO`).
- `src/data/work.ts` — the six projects are **samples** to show the layout; swap for real case studies.
- `src/pages/contact/BriefForm.tsx` — budget ranges (`BUDGETS`, currently USD placeholders).
- Photography in `media-src/raw/` was generated for this site; replace any with real shoot stills
  when available, then run `python scripts/media.py` to rebuild the optimised `.webp` files.
- Display font is **Archivo** (open licence) standing in for Gothif (commercial). If you license Gothif,
  add the font files and change `--font-display` in `src/styles/tokens.css`.

## Logo

`public/brand/nmyt-logo.png|webp` is the client mark with only the white background removed (no recolouring).
`nmyt-mark.svg` / `src/gl/markPath.ts` are a traced silhouette used for outline and particle graphics only.
