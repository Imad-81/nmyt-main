// Contrast audit: every visible text element on every route, measured against the nearest
// solid background behind it. Lists anything under WCAG AA (4.5:1 body, 3:1 large).
// Text over photos, gradients or canvases is measured against the page colour, so read
// those rows as "check by eye". usage: PORT=5183 node scripts/contrast.mjs
import puppeteer from 'puppeteer-core'
const base = `http://localhost:${process.env.PORT ?? 5173}`
const routes = ['/', '/tech', '/creative', '/originals', '/work', '/about', '/contact']
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  defaultViewport: { width: 1366, height: 700 },
})
for (const r of routes) {
  const page = await browser.newPage()
  await page.goto(`${base}${r}?noloader`, { waitUntil: 'load', timeout: 60000 })
  await new Promise((x) => setTimeout(x, 2500))
  // let scroll-triggered reveals finish
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= total; y += 500) {
    await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y)
    await new Promise((x) => setTimeout(x, 120))
  }
  await new Promise((x) => setTimeout(x, 1200))
  const rows = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }
    }
    const lum = ({ r, g, b }) => {
      const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 })
    const out = new Map()
    for (const el of document.querySelectorAll('main *, footer *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)
      if (!own) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const rect = el.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) continue
      let fg = parse(cs.color)
      if (!fg || cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || fg.a === 0) continue // gradient-filled text
      let op = 1
      let bg = null
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const s = getComputedStyle(n)
        op *= parseFloat(s.opacity)
        if (!bg) {
          const b = parse(s.backgroundColor)
          if (b && b.a > 0.6) bg = b
        }
      }
      if (!bg) bg = parse(getComputedStyle(document.body).backgroundColor) || { r: 3, g: 4, b: 8, a: 1 }
      fg = over({ ...fg, a: fg.a * op }, bg)
      const l1 = lum(fg)
      const l2 = lum(bg)
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      const size = parseFloat(cs.fontSize)
      const large = size >= 24 || (size >= 18.5 && parseInt(cs.fontWeight) >= 700)
      if (ratio < (large ? 3 : 4.5)) {
        const key = (el.className && el.className.toString().split(' ')[0]) || el.tagName
        if (!out.has(key)) out.set(key, `${ratio.toFixed(2)}  ${key}  ${Math.round(size)}px  "${el.textContent.trim().slice(0, 34)}"`)
      }
    }
    return [...out.values()]
  })
  console.log(`\n${r}: ${rows.length ? '' : 'all text passes'}`)
  rows.sort().forEach((x) => console.log('  ' + x))
  await page.close()
}
await browser.close()
