// Compares variants of a page for scroll stalls. Each variant is a CSS rule injected before
// scrolling; every variant is run several times in turn and the report gives, per variant, the
// worst frame of each run and the median of those. One noisy run cannot mislead.
// usage: PORT=5183 node scripts/ab.mjs <route> <w> <h> <runs> "name=css" "name=css" ...
import puppeteer from 'puppeteer-core'

const [, , route = '/', w = '1366', h = '650', runs = '5', ...specs] = process.argv
const variants = (specs.length ? specs : ['as is=']).map((s) => {
  const i = s.indexOf('=')
  return { name: s.slice(0, i), css: s.slice(i + 1) }
})
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  defaultViewport: { width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 768, hasTouch: +w < 768 },
})
const once = async (css) => {
  const page = await browser.newPage()
  await page.goto(`http://localhost:${process.env.PORT ?? 5173}${route}?noloader`, { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 3500))
  if (css) await page.addStyleTag({ content: css })
  await new Promise((r) => setTimeout(r, 600))
  // the page scrolls itself at a steady brisk pace, so the test adds no round trips of its own
  const res = await page.evaluate(
    (speed) =>
      new Promise((done) => {
        const total = document.documentElement.scrollHeight - innerHeight
        const frames = []
        const t0 = performance.now()
        let last = t0
        const tick = (now) => {
          const d = now - last
          last = now
          const y = Math.min(total, ((now - t0) / 1000) * speed)
          if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true })
          else window.scrollTo(0, y)
          frames.push([d, y])
          if (y < total) requestAnimationFrame(tick)
          else done(frames.slice(3))
        }
        requestAnimationFrame(tick)
      }),
    +(process.env.SPEED ?? 1200),
  )
  await page.close()
  let worst = [0, 0]
  let over = 0
  for (const f of res) {
    if (f[0] > worst[0]) worst = f
    if (f[0] > 34) over++
  }
  return { worst: Math.round(worst[0]), at: Math.round(worst[1]), over }
}
const results = variants.map(() => [])
for (let r = 0; r < +runs; r++) for (let v = 0; v < variants.length; v++) results[v].push(await once(variants[v].css))
console.log(`${route} ${w}x${h}, ${runs} runs each, scrolling at ${process.env.SPEED ?? 1200} px a second`)
for (let v = 0; v < variants.length; v++) {
  const ws = results[v].map((x) => x.worst).sort((a, b) => a - b)
  const med = ws[Math.floor(ws.length / 2)]
  console.log(`  ${variants[v].name.padEnd(26)} median worst frame ${String(med).padStart(4)} ms   runs: ${results[v].map((x) => `${x.worst}ms@${x.at}(${x.over})`).join('  ')}`)
}
await browser.close()
