# NMYT website

The NMYT agency site. Live at https://nmyt-website-build.vercel.app

Vite + React 19 + TypeScript, three.js with custom shaders, GSAP (ScrollTrigger, SplitText) and
Lenis, plain CSS with a little Tailwind v4. It is a static single-page app: no backend, no
database, no environment variables.

## Read these first

| File | What it holds |
|---|---|
| `HANDOFF.md` | Full context: where things are, architecture, the owner's rules, history of each round, known surprises, open items |
| `DESIGN.md` | Colours, type, layout and motion values |
| `CLAUDE.md` | Short standing rules (written for Claude Code sessions, useful to anyone) |

The owner's rules in `HANDOFF.md` section 5 are firm. Check any change against them.

## Run it

Needs Node 20 or newer (built on Node 24, npm 11).

```bash
npm install
npm run dev -- --port 5183 --strictPort     # http://localhost:5183   (?noloader skips the intro)
npm run build                               # type-check + production build into dist/
npm run preview                             # serve dist/
```

## What is in this folder

```
src/            the site's source (pages, components, WebGL scenes, styles, data)
public/         files served as they are: brand marks, photography, Earth maps, one video
media-src/      original, full-size sources that are not deployed
  raw/            photography (PNG) that public/media was made from
  hf/             stills used to make video clips
  earth/          NASA Blue Marble maps the About globe was made from
  brand/          the owner's original logo files
scripts/        checks (errors, overflow, gaps, contrast, smoothness) and image conversion
previews/       screenshots of each round
index.html, vite.config.ts, tsconfig*.json, package.json, vercel.json     build and deploy config
```

`node_modules/` and `dist/` are not included: `npm install` and `npm run build` recreate them.

## Deploy

The site is on Vercel (project `nmyt-website-build`), connected to the private GitHub repository
https://github.com/gitnityanth-code/nmyt-website-build. Pushing `main` deploys.
`vercel.json` holds the single-page rewrite, cache headers and security headers (including a
strict Content Security Policy: a new outside script, font or embed needs an entry there).

To take over you need, from the owner:
- collaborator access to the GitHub repository (or push this code to your own)
- access to the Vercel project (or connect your own Vercel, Netlify or Cloudflare Pages project;
  any static host works if deep links fall back to `index.html`)
- the domain's DNS, when `nmyt.in` is pointed at the site

## Checks

The scripts in `scripts/` drive a local Chrome through `puppeteer-core`. They expect Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe` and a dev server on the port in `PORT`.
Change the path at the top of each script on another machine.

```bash
export MSYS_NO_PATHCONV=1 PORT=5183        # Git Bash on Windows
node scripts/probe-all.mjs      # every route at five sizes: console errors, failed requests, sideways overflow
node scripts/gaps.mjs 0.22      # empty vertical stretches
node scripts/perf.mjs           # scroll smoothness, three runs per route
node scripts/contrast.mjs       # text contrast
node scripts/walk.mjs / out/home 1366 650 && python scripts/walk-sheet.py out/home out/home.jpg 4 470   # contact sheet
```

`python scripts/media.py` converts photography in `media-src/raw/` to the `.webp` files in
`public/media/` (needs Pillow). Register new images in `src/data/media.ts`.

## Before a real launch

These are placeholders or not done yet (details in `HANDOFF.md` section 10):
- Contact form has no backend: it opens the visitor's email app. Budget ranges are placeholders.
- Social links in `src/data/site.ts` are placeholders; phone is empty.
- No sitemap, one global meta description, no share image. Custom domain not set.
- No client work is shown anywhere; `/work` is a "Work in progress" page by the owner's choice.
- The site ignores the visitor's reduced-motion setting unless the address has `?motion=reduce`.
  This was the owner's decision and is an accessibility trade-off to revisit.
- Not yet tested on physical phones by the people who built it.
