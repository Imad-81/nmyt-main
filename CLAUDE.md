# NMYT website build

Read `HANDOFF.md` before doing anything: it has the full context, the owner's rules and the open items.
`DESIGN.md` has the current design system.

Standing rules
- Live site: https://nmyt-website-build.vercel.app. Pushing `main` deploys it. The owner builds
  "in the live site", so ship after each verified round unless he says otherwise.
- Commit as `G Nityanth <gorrepatinityanth@gmail.com>` (already set in this repo's git config).
- Before shipping: `npx tsc -b`, `npm run build`, and with the dev server on port 5183 run
  `MSYS_NO_PATHCONV=1 PORT=5183 node scripts/probe-all.mjs` until it prints `all clean`.
- Look at the result before reporting it: use `scripts/shoot.mjs` or `scripts/walk.mjs` and view the images.
- Write helper scripts with the Write tool. Bash heredocs on this machine mangle `\n` and backticks.
- No dashes in visible copy. NMYT is "a creative tech studio". Email is `contact@nmyt.in`. No client
  work is shown anywhere.
- No new pinned or sideways-scrolling sections, no mono label font, no HUD decorations, no lens
  flares, no custom cursor, no clipped text. Keep sizes and gaps modest.
- Never distort or recolour the logo artwork. The white mark comes from `public/brand/nmyt-mask-hq.webp`.
