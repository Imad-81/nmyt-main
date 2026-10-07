// Route sweep: loads every page at several viewport sizes, scrolls top to bottom,
// and reports console errors, failed requests and horizontal overflow.
// usage: PORT=5183 node scripts/probe-all.mjs
import puppeteer from 'puppeteer-core'
const base = `http://localhost:${process.env.PORT ?? 5173}`
const routes = ['/', '/tech', '/creative', '/originals', '/work', '/about', '/contact', '/nope']
const sizes = [[1440, 900], [1366, 650], [768, 1024], [390, 844], [320, 640]]
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
let bad = 0
for (const [w, h] of sizes) {
  for (const r of routes) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 })
    const errs = []
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
    page.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()))
    page.on('requestfailed', (q) => !q.url().endsWith('.mp4') && errs.push('failed: ' + q.url())) // video range requests are aborted when a clip scrolls away
    page.on('response', (s) => s.status() >= 400 && errs.push(`${s.status()}: ${s.url()}`))
    await page.goto(`${base}${r}?noloader&motion=full`, { waitUntil: 'networkidle0', timeout: 60000 })
    await new Promise((x) => setTimeout(x, 1200))
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    let over = 0
    for (let y = 0; y <= total; y += h * 0.8) {
      await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y)
      await new Promise((x) => setTimeout(x, 160))
      over = Math.max(over, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    }
    const ok = !errs.length && over <= 1
    if (!ok) bad++
    console.log(`${ok ? 'ok ' : 'BAD'} ${w}x${h} ${r.padEnd(11)} height=${total} overflowX=${over}${errs.length ? '\n   ' + [...new Set(errs)].slice(0, 5).join('\n   ') : ''}`)
    await page.close()
  }
}
await browser.close()
console.log(bad ? `${bad} problem(s)` : 'all clean')
