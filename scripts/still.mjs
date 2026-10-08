// Holds a route still at given scroll positions and lists every frame slower than 30 ms with
// its time, to separate stalls caused by scrolling from stalls on a clock.
// usage: PORT=5183 node scripts/still.mjs <route> <w> <h> <y...>
import puppeteer from 'puppeteer-core'

const [, , route = '/', w = '1366', h = '650', ...ys] = process.argv
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  defaultViewport: { width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 768, hasTouch: +w < 768 },
})
const page = await browser.newPage()
await page.goto(`http://localhost:${process.env.PORT ?? 5173}${route}?noloader`, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))
// SLOW=4 slows the processor four times
if (process.env.SLOW) await (await page.createCDPSession()).send('Emulation.setCPUThrottlingRate', { rate: +process.env.SLOW })
for (const y of ys.length ? ys : ['0']) {
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), +y)
  await new Promise((r) => setTimeout(r, 1500))
  const res = await page.evaluate(
    () =>
      new Promise((done) => {
        const out = []
        const t0 = performance.now()
        let last = t0
        let n = 0
        const tick = (now) => {
          const d = now - last
          last = now
          n++
          if (d > 30) out.push([Math.round(now - t0), Math.round(d)])
          if (now - t0 < 9000) requestAnimationFrame(tick)
          else done({ out, fps: Math.round((n * 1000) / (now - t0)) })
        }
        requestAnimationFrame(tick)
      }),
  )
  console.log(`${route} y=${y}: ${res.fps} fps over 9 s, slow frames: ${res.out.length ? res.out.map(([t, d]) => `${d}ms@${(t / 1000).toFixed(1)}s`).join('  ') : 'none'}`)
}
await browser.close()
