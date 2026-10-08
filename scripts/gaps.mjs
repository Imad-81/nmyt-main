// Finds empty vertical stretches: for every route and screen size, lists each run of page
// height that holds no text, image, video, canvas or drawing, when that run is taller than
// a share of the screen. Sticky heroes are measured at rest, so their scroll room shows up
// here too; read those rows with the hero's own timeline in mind.
// usage: PORT=5183 node scripts/gaps.mjs [minShareOfScreen=0.2] [route ...]
import puppeteer from 'puppeteer-core'

const [, , minArg = '0.2', ...only] = process.argv
const MIN = +minArg
const ROUTES = only.length ? only : ['/', '/tech', '/creative', '/originals', '/work', '/about', '/contact']
const SIZES = [
  [1920, 1080],
  [1366, 650],
  [820, 1180],
  [390, 844],
  [360, 640],
]

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
let total = 0
for (const route of ROUTES) {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 })
    await page.goto(`http://localhost:${process.env.PORT ?? 5173}${route}?noloader`, { waitUntil: 'networkidle0', timeout: 60000 })
    await new Promise((r) => setTimeout(r, 2500))
    const gaps = await page.evaluate((min) => {
      const vh = innerHeight
      const spans = []
      const name = (el) => {
        const c = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''
        return el.tagName.toLowerCase() + c
      }
      for (const el of document.querySelectorAll('body *')) {
        const tag = el.tagName
        const media = tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'svg'
        const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        const cs = getComputedStyle(el)
        if (cs.display === 'none') continue
        // drawn without text or media: a masked logo, or a leaf that paints its own shape
        const mask = (cs.maskImage || cs.webkitMaskImage || 'none') !== 'none'
        const leaf = !el.firstElementChild && (cs.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor))
        if (!media && !text && !mask && !leaf) continue
        const r = el.getBoundingClientRect()
        if (r.width < 4 || r.height < 4) continue
        // elements waiting for their reveal are hidden for now but do fill their space
        spans.push([r.top + scrollY, r.bottom + scrollY, name(el)])
      }
      spans.sort((a, b) => a[0] - b[0])
      const out = []
      let end = 0
      let last = 'top'
      for (const [t, b, n] of spans) {
        if (t - end > vh * min) out.push({ from: Math.round(end), size: Math.round(t - end), share: +((t - end) / vh).toFixed(2), after: last, before: n })
        if (b > end) {
          end = b
          last = n
        }
      }
      return out
    }, MIN)
    for (const g of gaps) {
      total++
      console.log(`${route.padEnd(10)} ${String(w).padStart(4)}x${String(h).padEnd(4)} y=${String(g.from).padStart(5)}  ${String(g.size).padStart(4)}px (${g.share} of screen)  after ${g.after}  before ${g.before}`)
    }
    await page.close()
  }
}
console.log(total ? `${total} stretches over ${MIN} of a screen` : 'no empty stretches')
await browser.close()
