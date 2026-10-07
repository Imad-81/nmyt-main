// Headless QA screenshots (independent of any open browser).
// usage: node scripts/shoot.mjs <path> <outPrefix> <w> <h> <positions...>
//   positions: numbers = px, "s:<selector>" = scroll to element top, "f:<fraction>" of page height
//   flags: --loader (don't skip intro), --hover=<selector>, --wait=<ms>
import puppeteer from 'puppeteer-core'

const [, , path = '/', out = 'shot', w = '1440', h = '900', ...rest] = process.argv
const flags = rest.filter((r) => r.startsWith('--'))
const positions = rest.filter((r) => !r.startsWith('--'))
const flag = (k) => flags.find((f) => f.startsWith(`--${k}`))?.split('=')[1] ?? (flags.some((f) => f === `--${k}`) ? true : undefined)

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  userDataDir: 'C:/Users/gorre/AppData/Local/Temp/claude/nmyt-qa-profile',
  args: ['--no-first-run', '--no-default-browser-check', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
  defaultViewport: { width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 768, hasTouch: +w < 768 },
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))
const q = flag('loader') ? '?motion=full' : '?noloader&motion=full'
await page.goto(`http://localhost:5173${path}${path.includes('?') ? '&' + q.slice(1) : q}`, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, +(flag('wait') ?? 2600)))

const list = positions.length ? positions : ['0']
let i = 0
for (const p of list) {
  let y = 0
  if (p.startsWith('s:')) y = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, p.slice(2))
  else if (p.startsWith('f:')) y = await page.evaluate((f) => (document.documentElement.scrollHeight - innerHeight) * f, +p.slice(2))
  else y = +p
  await page.evaluate((y) => {
    const l = window.__lenis
    if (l) l.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo(0, y)
  }, y)
  await new Promise((r) => setTimeout(r, 1300))
  const hov = flag('hover')
  if (hov && i === list.length - 1) {
    const el = await page.$(hov)
    if (el) {
      const b = await el.boundingBox()
      await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.4, { steps: 8 })
      await new Promise((r) => setTimeout(r, 1400))
    }
  }
  const file = `${out}-${String(i).padStart(2, '0')}.jpg`
  await page.screenshot({ path: file, type: 'jpeg', quality: 72 })
  console.log('shot', file, 'y=', Math.round(y))
  i++
}
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 12).join('\n'))
await browser.close()
