// Walks a page top to bottom one screen at a time and saves each screen, so every scroll
// position can be reviewed (stitch with scripts/walk-sheet.py).
// usage: PORT=5183 node scripts/walk.mjs <path> <outDir> <w> <h> [--loader]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const [, , path = '/', out = 'walk', w = '1366', h = '650', ...flags] = process.argv
mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  defaultViewport: { width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 768, hasTouch: +w < 768 },
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))
const q = flags.includes('--loader') ? '' : '?noloader'
await page.goto(`http://localhost:${process.env.PORT ?? 5173}${path}${q}`, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3200))
const total = await page.evaluate(() => document.documentElement.scrollHeight)
let i = 0
for (let y = 0; y < total - 10; y += Math.round(+h * 0.9)) {
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y)
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 })
  i++
}
console.log(path, `${w}x${h}`, 'height', total, 'screens', i)
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 10).join('\n'))
await browser.close()
