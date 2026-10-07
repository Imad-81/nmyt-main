# NMYT website build: handoff (2026-10-07)

Read this first in a new Claude Code thread. It says where everything is, what the site is now,
the owner's rules, how to check and ship, and what is still open.
Companion files: `CLAUDE.md` (short standing rules, loaded automatically), `DESIGN.md` (current
design system), `README.md` (quick start).

---

## 1. Status in one paragraph

The unified NMYT agency site is **live at https://nmyt-website-build.vercel.app**. It is a Vite +
React 19 + TypeScript single-page app with three.js heroes, GSAP + Lenis motion and plain CSS
(Tailwind v4 is present for a few utility classes only). Eight routes: `/`, `/tech`, `/creative`,
`/originals`, `/work`, `/about`, `/contact`, and a 404. Everything is committed on `main`, pushed
to GitHub, and Vercel deploys on every push. The last sweep (all routes, five screen sizes) had
no console errors and no sideways overflow. That sweep runs in headless Chrome on the owner's
machine; nothing has been tested on a physical phone by the agent.

## 2. Where things are

| What | Where |
|---|---|
| Project (work here) | `C:\Users\gorre\OneDrive\Desktop\NMYT DOCUMENTS\nmyt website build` |
| Git | branch `main`, author `G Nityanth <gorrepatinityanth@gmail.com>` |
| GitHub (private) | https://github.com/gitnityanth-code/nmyt-website-build |
| Live site | https://nmyt-website-build.vercel.app (Vercel project `nmyt-website-build`, team `gorrepatinityanth-6142s-projects`, Git-connected) |
| Dev server | port 5183. Launch config `nmyt-dev` exists in both `.claude/launch.json` here and in `NMYT DOCUMENTS\.claude\launch.json` |
| Original photography | `media-src/raw/` (PNG, not deployed), Higgsfield source stills in `media-src/hf/` |
| Preview screenshots | `previews/` (v1 only; later rounds were sent in chat, not saved) |
| Owner's source material | `NMYT DOCUMENTS\` (logos in `nmyt launch\`, references in `nmyt website sources\`) |

The two sites this was merged from, for reference only (do not edit them):
- Base: `NMYT DOCUMENTS\nmyt website sources\nmyt-website` (nmyt-studio.vercel.app).
- Donor: `C:\Users\gorre\Downloads\nmyt-vercel` and `nmyt-v3` (nmyt.vercel.app). The hologram
  shapes (`src/gl/shapes.ts`), the logo outline (`src/gl/nmyt-mark.json`) and the Originals
  images came from it.

## 3. Commands

```bash
npm install
npm run dev -- --port 5183 --strictPort    # http://localhost:5183  (?noloader skips the intro)
npm run build                              # tsc -b + vite build, output in dist/
```

Checks (Git Bash, dev server running):

```bash
export MSYS_NO_PATHCONV=1 PORT=5183
node scripts/probe-all.mjs                         # every route x 5 sizes: errors, failed requests, overflow
node scripts/contrast.mjs                          # text contrast per route (see section 8 for how to read it)
node scripts/shoot.mjs /creative out/prefix 1366 650 0 300 600 --wait=4500   # screenshots at scroll positions
node scripts/walk.mjs / out/home 1366 650          # one screenshot per screen, top to bottom
python scripts/walk-sheet.py out/home out/home.jpg 4 470                     # stitch them into a contact sheet
```

Ship:

```bash
git add -A && git commit -m "..." && git push origin main    # Vercel builds from the push
vercel deploy --prod --yes                                   # optional: deploy now and get a READY state back
```

## 4. Architecture

```
index.html                 meta, favicon, preload of the logo mask
vercel.json                SPA rewrite, cache headers, security headers (CSP etc.)
src/main.tsx, App.tsx      router, page-transition curtain, loader, routes (pages lazy-loaded)
src/index.css              fonts, base type classes (.display, .lede, .eyebrow, .section, .wrap)
src/styles/tokens.css      colours, text tones, layout and easing variables
src/styles/simple.css      calm vertical blocks (prefix sx) and the Motion wrapper (.mo)
src/lib/smooth.ts          GSAP plugins, Lenis, prefersReducedMotion (see section 7)
src/components/
  Nav, Footer, Loader      global chrome. Loader = white mark forming. Footer = white mark, gradient pass every 3 s
  Reveal.tsx               <Reveal> fade-up, <SplitReveal> line fade-up (no clipping masks), whenRevealed()
  Simple.tsx               Head, Steps, Catalogue, Pillars, SlideMarquee
  Motion.tsx               still image that plays a clip if one is registered in CLIPS
  MagneticButton, ui.tsx   buttons, MonoLabel (plain eyebrow), SectionHead, Marquee, Brackets (no-op)
src/gl/
  domeHero.ts              HOME hero: space background, 3D chrome logo, embers (plain three.js)
  ribbonForm.ts            CREATIVE hero: chrome ribbon knot, beads, pulse (plain three.js)
  ScopeMorph.tsx           home hologram: particles morphing through 7 figures on an 18 s loop
  shapes.ts, scopeMeta.ts  hologram figures and labels
  ShaderCanvas.tsx         fullscreen shader canvas with adaptive resolution (Tech hero, Creative warp)
  techShader.ts            Tech horizon that floods to white
  creativeShader.ts        warped "CREATIVE" type background
  nmyt-mark.json           smooth vector outline of the logo (used for the 3D extrusion and hologram)
src/pages/
  Home.tsx + home/         HomeHero, Manifesto (text + hologram), Pillars, Studios, Approach (sliding line), OriginalsTeaser (bubble)
  Tech.tsx + tech/         TechHero (sticky, floods to white), TechServices, TechKit, Steps, TechWork (studio gallery), dusk
  Creative.tsx + creative/ CreativeHero (sticky white wall + ribbon), GlassWarp ("One team"), CreativeServices, Catalogue, Steps, SlideMarquee
  Originals.tsx + originals/ OriginalsHero (dolly clip), Manifesto, Program (Steps), FilmSlate (one line), CallForFilmmakers
  Work.tsx + work/         "Work in progress" with a light sweep and a CSS 3D gyroscope
  About.tsx, about.css     who NMYT is, facts, who we work with, process
  Contact.tsx + contact/   4-step brief builder that opens the visitor's email app (no backend)
src/data/site.ts           email, socials, services, audiences, process
src/data/media.ts          image registry: every key resolves to /media/<name>.webp and <name>-sm.webp
public/brand/              nmyt-mask-hq.webp and nmyt-mask-sm.webp (white logo silhouette), nmyt-logo-hq.webp (colour logo)
public/media/              photography (.webp, 2000w + 900w "-sm"), video/originals-stage.mp4
scripts/                   QA scripts above, media.py (PNG to WebP)
```

### The three WebGL pieces
- **Home hero (`domeHero.ts`)**: one background sphere shader (near-black with a breath of blue
  and teal), the logo extruded from `nmyt-mark.json`, and about 1,200 embers in three streams
  (white from the upper left, blue rising, green from the right). The logo's flat faces are shaded
  procedurally (royal blue, navy troughs, sky and ice streaks) because a flat face can only mirror
  one direction; bevels use a baked environment. Environment strength is set with
  `scene.environmentIntensity` (the material's `envMapIntensity` does nothing when the map comes
  from `scene.environment`). Tone mapping is Neutral: ACES turns saturated blue purple.
- **Creative hero (`ribbonForm.ts`)**: torus knot flattened to a band, vertex colours blue to
  green, bright studio environment with black flags, emissive pulse along the length, three
  orbiting beads. Scroll state pulls it to the centre and scales it up.
- **Hologram (`ScopeMorph.tsx`)**: runs on its own clock. Scroll never drives it.

All three lower their own resolution when frames run slow, pause off-screen, and fall back
quietly if WebGL is missing (the home hero shows a poster of the real logo).

### The two sticky heroes
- **Tech**: `.th` is 280svh with a sticky stage; the shader floods to paper white.
- **Creative**: `.chw` is 185svh with a sticky `.ch`. The next section sits underneath it
  (`.ch-under { margin-top: -100svh }`). Timeline: copy leaves, the dark opens from behind the
  ribbon (`--fr` on `.ch-flood`), then the whole stage fades out onto the section below. The nav
  switches between ink and white through `html[data-navtone]`.

These two are the only pinned sections. The owner approved both. Do not add others.

## 5. The owner's rules (follow these without being asked)

Voice and facts
- NMYT is "a creative tech studio", never "a small studio". Founded 2026, Hyderabad, India.
- Official email: `contact@nmyt.in`.
- No client work is shown anywhere yet. `/work` says "Work in progress". Showcases are examples
  of what the studio makes, labelled as such. No invented clients, numbers or awards.
- No dashes (em or en) in visible copy. Plain, confident, short sentences.

Look
- One type family for body and section headings (Inter, standing in for Graphik / SF Pro), bold,
  sentence case. A second contrasting face is allowed only in hero lines, where he asked for it
  (Instrument Serif italic on the home hero and the Originals line; a light Helvetica-style partner
  on the Creative hero).
- No mono or "techy" label font, no corner HUD labels, brackets, REC timecodes, `//` tags, index
  numbers with rules, outlined (stroked) text, or highlight boxes behind words.
- No lens flares or light streaks crossing a visual.
- Sizes are deliberately modest (he asked for 20 to 25 percent smaller, then 30 percent less empty
  space between sections). Do not let headings or gaps creep back up.
- Text must never be clipped. Reveals fade and rise; they do not use clipping masks.
- Default cursor. No custom dot or ring.
- The white NMYT mark is the logo in the nav (with the word NMYT), the loader and the footer. Always
  cut from the high-resolution file. Never distort or recolour the logo artwork.
- Home hero: very dark space, the 3D logo in the logo's own blues, embers. The words sit
  bottom-left and support the picture; no big headline over the logo; no "Where code meets cinema".
- Colours: royal blue, sky, teal, green, space white. Saturated, never washed out. Originals uses
  deep blue and ivory instead of green.

Behaviour
- No pinned sections (other than the two approved heroes) and no sideways scrolling or scrubbing.
  Animated visuals run on their own clock.
- No hover pop-up previews. Marquees are a simple sideways slide.
- The home page stays short. No Originals section or studio photo there, only the small bubble.
- Photographs are not to be turned into video. The one exception is the Originals hero dolly clip.
- Plain text sections should carry one subtle animated element so they are not "too simple".
- Heroes can be bold; everything after them is calm and minimal.

How he likes to work
- End-to-end execution, verify, then show screenshots. He reviews on his laptop and phone and
  replies with numbered screenshots.
- He rates honesty about what was and was not done.

## 6. What changed, round by round

- **v1**: merged the two sites on the nmyt-studio base. 3D chrome logo hero, white footer logo,
  security headers, QA sweep script.
- **v2**: one type family, sizes scaled down, no custom cursor, no mono labels or HUD details, no
  clipping reveals, pinned and sideways sections rebuilt as vertical blocks, new loader and nav
  logo, hologram on its own loop. Site ignores the OS reduced-motion setting (section 7).
- **v3**: `contact@nmyt.in`, sample client projects removed, `/about` and the Work-in-progress page
  added, catalogue on Creative, white Creative hero, motion clip slot (`Motion.tsx`), GitHub repo
  created and connected to Vercel.
- **v3.1**: darker home hero, logo in its own blues, chrome ribbon on the Creative hero with a
  dark flood transition, contrast pass and `scripts/contrast.mjs`.
- **v3.2**: home trimmed (no studio band, Originals bubble instead of the section), stronger
  hologram, seamless Creative hand-over, heavier colour-filled Creative headline, ribbon pulse and
  beads, "One team" restyled, Originals flares removed, manifesto paragraphs stacked, animated
  Steps, "Cooking some content" line, Work gyroscope, large spacing cut by 30 percent.

## 7. Things that will surprise you

- **Reduced motion is ignored on purpose.** The owner's laptop has Windows animation effects
  turned off, and the reduced variants looked broken to him. `prefersReducedMotion()` in
  `src/lib/smooth.ts` now returns true only for `?motion=reduce`. This is an accessibility
  trade-off he has not been asked to revisit.
- **Bash heredocs on this machine mangle `\n` escapes and backticks.** Write helper scripts with
  the Write tool, or edit with the Edit tool, instead of piping multi-line code through a heredoc.
- **`gh` is not installed.** The GitHub repo was created through the owner's Chrome.
- **`--fg-2`, `--fg-3`, `--emerald`, `--acid`, `--ice`, `--void` are redefined inside `.orig`**
  (Originals palette). The footer inside that page inherits them.
- **`background-clip: text` and transforms**: put the fill on the element that has the text, not
  on a parent of a transformed or inline-block child, or the child stops painting.
- **Animating `font-weight` on large type** froze the headless browser. Use opacity and transform.
- **`scripts/shoot.mjs` reuses a Chrome profile.** If a run dies, kill leftover headless Chrome
  processes before the next one or navigation times out.
- **CSP** in `vercel.json` is strict (`script-src 'self'`, `media-src 'self'`). A new third-party
  script, font or embed needs a CSP entry or it will be blocked only in production.

## 8. Reading the contrast script

`scripts/contrast.mjs` measures text against the nearest solid background colour. It reports
false failures for text over gradients, photos or canvases, text inside hover-only or cycling
states, and decorative marquee words. Originals, Work, About and Contact pass. Home, Tech and
Creative list a few rows of those kinds. One real small failure is left: the 10px
"Illustrative UI" label on Tech.

## 9. Assets made outside the repo

- **Higgsfield** (account in the owner's Chrome, Seedance 2.0): 4-second, 720p, audio-off clips
  cost 18 credits each. 54 credits were spent on three clips; only `originals-stage.mp4` is still
  used (the studio desk and night runner clips were removed at his request). His cap for the
  site is 170 to 200 credits. The Higgsfield page froze repeatedly when typing prompts through
  automation, so later hero work was done in code instead.
- **ChatGPT image generation**: he suggested it for replacing out-of-place images. Not done yet.
- Register a new clip in `CLIPS` in `src/components/Motion.tsx` and put the file in
  `public/media/video/`.

## 10. Open items

Asked for, not done
1. A section-by-section, device-by-device hunt for leftover empty gaps. Only the global 30 percent
   cut was applied.
2. Replacing out-of-place photographs with ChatGPT-generated images.
3. A Higgsfield-made element for the home hero. Note that Higgsfield makes video, not anything
   interactive, and a 4-second loop shows a jump; the interactive hero is code.
4. The older card-and-divider styling in the lower sections (Tech "What you get" panels, Creative
   services list, home Studios cards) had labels removed but was never redesigned.

Before a real launch
5. Contact form has no backend: it opens the visitor's email app. Budget ranges in
   `src/pages/contact/BriefForm.tsx` are USD placeholders.
6. Social links in `src/data/site.ts` are placeholders. Phone is empty.
7. No sitemap and only a global meta description; no OG image beyond the icon. Custom domain not
   set (nmyt.in is implied by the email).
8. Unused packages still in `package.json` (`archivo`, `geist`, `geist-mono` fonts).
   `src/pages/originals/OriginalsSections.tsx` still exports an unused `ReelMarquee`.
9. Not tested on physical phones or on the owner's laptop by the agent. He does that himself.
10. The reduced-motion decision in section 7.
