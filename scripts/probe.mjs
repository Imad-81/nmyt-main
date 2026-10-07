import puppeteer from 'puppeteer-core'
const [, , path, code] = process.argv
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, userDataDir: 'C:/Users/gorre/AppData/Local/Temp/claude/nmyt-qa-profile', args: ['--no-first-run', '--enable-unsafe-swiftshader'], defaultViewport: { width: 1440, height: 900 } })
const p = await b.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
await p.goto('http://localhost:5173' + path + '?noloader&motion=full', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(code), null, 1))
if (errs.length) console.log('ERRS', errs.slice(0, 8))
await b.close()
