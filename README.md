# NMYT Website

The official website for **NMYT**, a creative tech studio.

- **Live URL:** [nmyt-website-build.vercel.app](https://nmyt-website-build.vercel.app)
- **Repository:** [github.com/Imad-81/nmyt-main](https://github.com/Imad-81/nmyt-main)

A static single-page web experience built with Vite, React 19, TypeScript, custom WebGL/Three.js shaders, GSAP motion, Lenis smooth scrolling, and a custom CSS design system complemented by Tailwind CSS v4. Completely static client-side application: zero backend dependencies, no database, and no required environment variables.

---

## Documentation Quick Links

Before making substantial design or architectural changes, consult the companion documents:

| File | Overview |
|---|---|
| [`HANDOFF.md`](./HANDOFF.md) | Full architectural context, evolution history, owner rules, known constraints, and open items |
| [`DESIGN.md`](./DESIGN.md) | Design tokens, color palette, typography hierarchy, spacing rules, and motion parameters |
| [`CLAUDE.md`](./CLAUDE.md) | Development rules, copy guidelines, QA sweep standards, and commit conventions |

> **Important:** The studio owner rules detailed in [`HANDOFF.md`](./HANDOFF.md) section 5 are strict. Always verify changes against them.

---

## Tech Stack

- **Framework & Core:** React 19, TypeScript (~6.0), Vite 8
- **Graphics & 3D:** Three.js (~0.186) with custom GLSL shaders (interactive pixel field hero, dynamic logo face, 3D volume stage, About globe)
- **Animation & Scroll:** GSAP (ScrollTrigger, SplitText), `@gsap/react`, Lenis smooth scrolling
- **Styling:** Custom CSS design system (`src/styles/`), supplemented with Tailwind CSS v4
- **Typography:** Instrument Serif, Inter, Archivo, Geist, Geist Mono (via Fontsource)
- **Linting & Code Quality:** Oxlint, TypeScript strict project references
- **Automated Verification:** Custom Puppeteer test suite (`scripts/`)
- **Package Management:** Supports `npm` and `bun` (`bun.lock` included)

---

## Route Overview

The site features 8 client-side routes managed by React Router:

| Route | Page | Key Features |
|---|---|---|
| `/` | **Home** | Custom Three.js interactive pixel field, real brand mark artwork, volume stage, studio cards |
| `/tech` | **Tech Studio** | Interactive engineering capabilities kit, system architecture breakdown |
| `/creative` | **Creative Studio** | Interactive ribbon deformation, brand showcase |
| `/originals` | **Originals** | Media motion slots and creative concepts |
| `/work` | **Work** | Gyroscope visual effect, current status overview |
| `/about` | **About** | Interactive 3D Earth globe with NASA Blue Marble surface textures |
| `/contact` | **Contact** | Direct client inquiry flow opening default email client |
| `*` | **404** | Minimalist fallback route with navigation recovery |

---

## Getting Started

### Prerequisites

- Node.js 20 or newer (built on Node 24, npm 11) or Bun

### Installation

```bash
# Using npm
npm install

# Or using bun
bun install
```

### Local Development

Start the development server (configured for port `5183` to match QA test scripts):

```bash
npm run dev -- --port 5183 --strictPort
```

Navigate to `http://localhost:5183`.

#### Useful Query Flags

- `?noloader`: Skips the initial loading intro animation for faster iteration.
- `?motion=reduce`: Forces reduced-motion mode across WebGL scenes and GSAP timelines.

### Production Build & Preview

```bash
# Type-check and produce optimized bundle in dist/
npm run build

# Preview production build locally
npm run preview

# Run fast linter checks
npm run lint
```

---

## Project Structure

```
├── public/                 # Static assets deployed directly
│   ├── brand/              # Brand marks and vector masks (e.g. nmyt-mask-hq.webp)
│   ├── media/              # Optimized photography & video WebP/MP4 assets
│   └── earth/              # Earth texture maps for About globe
├── media-src/              # Original, uncompressed source files (not deployed)
│   ├── raw/                # High-res raw photography (PNG)
│   ├── hf/                 # Source stills for video clips
│   ├── earth/              # Source NASA Blue Marble maps
│   └── brand/              # Original vector / master logo assets
├── scripts/                # Puppeteer QA automation, image conversion, and perf tools
│   ├── probe-all.mjs       # Verifies all routes across 5 viewport sizes
│   ├── gaps.mjs            # Audits vertical spacing and layout gaps
│   ├── perf.mjs            # Benchmarks scroll performance & frame drops
│   ├── contrast.mjs        # WCAG text contrast validation
│   ├── shoot.mjs           # Viewport screenshot capture tool
│   ├── walk.mjs            # Full page screenshot sequences
│   └── media.py            # Converts raw assets to optimized WebP
├── src/
│   ├── components/         # Reusable UI components (Nav, Footer, ScopeMorph, etc.)
│   ├── data/               # Static site content, copy, metadata, and media registries
│   ├── gl/                 # Three.js canvases, custom GLSL shaders, 3D meshes
│   ├── hooks/              # Custom React hooks (breakpoints, motion, scroll)
│   ├── pages/              # Route components (Home, Tech, Creative, About, Contact, etc.)
│   └── styles/             # Global CSS, typography, tokens, animations
├── vercel.json             # SPA rewrites, caching rules, Content Security Policy
└── vite.config.ts          # Vite build configuration
```

---

## Automated QA & Verification

The suite in `scripts/` drives headless Chrome via `puppeteer-core` against a running dev server:

```bash
# 1. Start the dev server in one terminal
npm run dev -- --port 5183 --strictPort

# 2. Run the full verification suite in another terminal
PORT=5183 node scripts/probe-all.mjs      # Checks every route at 5 screen sizes for errors & overflow
PORT=5183 node scripts/gaps.mjs 0.22      # Flags unexpected empty vertical gaps
PORT=5183 node scripts/perf.mjs           # Benchmarks scroll smoothness (3 passes per route)
PORT=5183 node scripts/contrast.mjs       # Inspects text contrast ratios
```

> **Platform Note:** The scripts specify the Chrome binary location at the top of each script. Adjust the path if running outside standard install locations:
> - **macOS:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
> - **Windows:** `C:/Program Files/Google/Chrome/Application/chrome.exe`
> - **Linux:** `/usr/bin/google-chrome`

### Asset Processing

To convert newly added photography in `media-src/raw/` to compressed `.webp` in `public/media/`:

```bash
python scripts/media.py
```

*Requires Python with Pillow (`pip install Pillow`). Register new media in `src/data/media.ts`.*

---

## Deployment

The application is deployed on [Vercel](https://vercel.com) (project `nmyt-website-build`) connected to the `main` branch of this repository.

- **Automated CI/CD:** Pushing commits to `main` triggers an automatic production build and deployment.
- **Security & Headers:** `vercel.json` defines SPA routing fallback to `index.html`, aggressive cache headers for immutable assets, and a strict Content Security Policy (CSP). External resources (scripts, fonts, media) must be permitted in `vercel.json`.

---

## Pre-Launch Considerations

Key items tracked before production rollout to custom domain (`nmyt.in`):

1. **Contact Backend:** Form currently triggers client mailto to `contact@nmyt.in`. Can connect to an API endpoint or email service provider.
2. **Metadata & SEO:** Configure domain-specific sitemap, OpenGraph social share previews, and canonical URLs.
3. **Domain & DNS:** Point apex domain and `www` DNS records for `nmyt.in` to Vercel.
4. **Physical Device Testing:** Validate touch feel, gesture latency, and thermal performance across target mobile hardware.
