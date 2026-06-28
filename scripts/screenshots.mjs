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
await page.waitForSelector('.sortlist'); await sleep(400)

// Dismiss the first-time tutorial if present.
const tut = await page.$('[data-tut-ok]'); if (tut) { await tut.click(); await sleep(300) }

// Lift 3 "most" and drop 3 "least".
for (const id of ['self_direction', 'universalism', 'benevolence']) {
  await page.click(`.sr-up[data-id="${id}"]`); await sleep(220)
}
for (const id of ['power', 'achievement', 'tradition']) {
  await page.click(`.sr-down[data-id="${id}"]`); await sleep(220)
}
await sleep(300)
await page.screenshot({ path: `${OUT}/02-sort.png` })
const next = await page.$('[data-next]:not([disabled])'); if (next) await next.click()

// Story results — capture the constellation, the career reveal, and the compass.
await page.waitForSelector('.scene-work'); await sleep(1400)
await page.screenshot({ path: `${OUT}/04-results.png` })
const work = await page.$('.scene-work'); await work.scrollIntoViewIfNeeded(); await sleep(500)
await page.screenshot({ path: `${OUT}/05-career.png` })
const love = await page.$('.scene-love'); await love.scrollIntoViewIfNeeded(); await sleep(500)
await page.screenshot({ path: `${OUT}/06-love.png` })

console.log('Saved screenshots →', OUT)
await browser.close()
