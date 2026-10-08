// Smoothness check. Each route scrolls itself from top to bottom at a brisk, steady pace (the
// page drives the scroll, so the test adds no delay of its own) and the time between frames is
// recorded. Every route is run three times; the report gives the median frame rate, the median
// of each run's worst frame, and how many frames in all took longer than 50 ms (a visible
// hitch). The phone size also runs with the processor slowed four times, as a stand-in for a
// mid-range handset.
// usage: PORT=5183 node scripts/perf.mjs [route ...]      (SPEED=px per second, default 1200)
import puppeteer from 'puppeteer-core'

const only = process.argv.slice(2)
const ROUTES = only.length ? only : ['/', '/tech', '/creative', '/originals', '/work', '/about', '/contact']
const RUNS = [
  { name: 'laptop 1366x650', w: 1366, h: 650, slow: 1 },
  { name: 'phone 390x844, processor 4x slower', w: 390, h: 844, slow: 4 },
]
const SPEED = +(process.env.SPEED ?? 1200)
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--hide-scrollbars'],
})
let bad = 0
for (const run of RUNS) {
  console.log(`\n${run.name}`)
  for (const route of ROUTES) {
    const fps = []
    const worst = []
    let hitches = 0
    let frames = 0
    const errors = []
    for (let k = 0; k < 3; k++) {
      const page = await browser.newPage()
      await page.setViewport({ width: run.w, height: run.h, deviceScaleFactor: run.w < 768 ? 2 : 1, isMobile: run.w < 768, hasTouch: run.w < 768 })
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(`http://localhost:${process.env.PORT ?? 5173}${route}?noloader`, { waitUntil: 'networkidle0', timeout: 60000 })
      await new Promise((r) => setTimeout(r, 3500))
      if (run.slow > 1) await (await page.createCDPSession()).send('Emulation.setCPUThrottlingRate', { rate: run.slow })
      const ft = await page.evaluate(
        (speed) =>
          new Promise((done) => {
            const total = document.documentElement.scrollHeight - innerHeight
            const out = []
            const t0 = performance.now()
            let last = t0
            const tick = (now) => {
              out.push(now - last)
              last = now
              // one second resting on the hero, then the scroll
              const y = Math.min(total, Math.max(0, (now - t0 - 1000) / 1000) * speed)
              if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true })
              else window.scrollTo(0, y)
              if (y < total) requestAnimationFrame(tick)
              else done(out.slice(3))
            }
            requestAnimationFrame(tick)
          }),
        SPEED,
      )
      await page.close()
      fps.push(1000 / (ft.reduce((a, b) => a + b, 0) / ft.length))
      worst.push(Math.max(...ft))
      hitches += ft.filter((t) => t > 50).length
      frames += ft.length
    }
    if (med(worst) > 50) bad++
    console.log(`  ${route.padEnd(10)} ${med(fps).toFixed(0).padStart(3)} fps   worst frame per run: ${worst.map((x) => x.toFixed(0) + ' ms').join(', ')}   frames over 50 ms: ${hitches} of ${frames}${errors.length ? '   ERRORS: ' + errors[0] : ''}`)
  }
}
console.log(bad ? `\n${bad} route and size combinations had a typical worst frame over 50 ms` : '\nno route had a typical worst frame over 50 ms')
await browser.close()
