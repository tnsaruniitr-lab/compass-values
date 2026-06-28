// @ts-check
/**
 * Dev utility: capture screenshots of the four app screens.
 * Requires the dev server running (npm run serve) and playwright-core installed.
 *
 *   PORT=5173 npm run serve        # in one shell
 *   node scripts/screenshots.mjs   # in another  → writes to ./screenshots/
 *
 * Chromium is located via $PW_CHROMIUM, else auto-detected under
 * $PLAYWRIGHT_BROWSERS_PATH, else playwright-core's default.
 */
import { createRequire } from 'node:module'
import { readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')

const OUT = join(dirname(fileURLToPath(new URL('.', import.meta.url))), 'screenshots')
mkdirSync(OUT, { recursive: true })
const PORT = process.env.PORT || 5173
const HIGH = new Set(['benevolence', 'universalism', 'self_direction'])
const LOW = new Set(['power', 'achievement'])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function findChromium() {
  if (process.env.PW_CHROMIUM && existsSync(process.env.PW_CHROMIUM)) return process.env.PW_CHROMIUM
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (base && existsSync(base)) {
    for (const d of readdirSync(base)) {
      if (d.startsWith('chromium-')) {
        const p = join(base, d, 'chrome-linux', 'chrome')
        if (existsSync(p)) return p
      }
    }
  }
  return undefined // let playwright-core try its default
}

const browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 2 })

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' })
await page.waitForSelector('.display'); await sleep(700)
await page.screenshot({ path: `${OUT}/01-welcome.png` })

await page.click('[data-begin]')
await page.waitForSelector('.md-list'); await sleep(600)
await page.screenshot({ path: `${OUT}/02-maxdiff.png` })

for (let b = 0; b < 10; b++) {
  await page.waitForSelector('.md-list')
  const ids = await page.$$eval('.md-row', (rows) => rows.map((r) => r.getAttribute('data-id')))
  const most = ids.find((id) => HIGH.has(id)) || ids[0]
  let least = ids.find((id) => LOW.has(id)) || ids[ids.length - 1]
  if (least === most) least = ids[ids.length - 1]
  await page.click(`.md-row[data-id="${most}"] button.most`)
  await page.click(`.md-row[data-id="${least}"] button.least`)
  await sleep(360)
}

await page.waitForSelector('.quote')
for (let i = 0; i < 20; i++) {
  await page.waitForSelector('.quote')
  const vid = await page.$eval('.quote', (q) => q.getAttribute('data-value'))
  const val = HIGH.has(vid) ? 6 : LOW.has(vid) ? 2 : 4
  if (i === 6) { await sleep(400); await page.screenshot({ path: `${OUT}/03-portrait.png` }) }
  await page.click(`.dotbtn[data-val="${val}"]`); await sleep(240)
}

await page.waitForSelector('.hero-title'); await sleep(1600)
await page.screenshot({ path: `${OUT}/04-results.png`, fullPage: true })

console.log('Saved screenshots →', OUT)
await browser.close()
