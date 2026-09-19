// Capture the four app screens that appear on the cover conveyor.
//
//   cd health-app && npm run build && npx vite preview --port 4317 --strictPort
//   node cover-video/capture-screens.mjs
//
// Shots land in cover-video/screens/ at 402x874 CSS px, 3x DPR.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT  = resolve(HERE, 'screens')
const BASE = process.env.PETCH_URL || 'http://localhost:4317/'
const EXE  = process.env.CHROME_PATH || undefined

mkdirSync(OUT, { recursive: true })

const today = new Date().toISOString().slice(0, 10)
const weekStart = (() => {
  const x = new Date(); x.setHours(0, 0, 0, 0)
  const day = x.getDay(); x.setDate(x.getDate() - (day === 0 ? 6 : day - 1))
  return x.getTime()
})()

// Demo state, so Missions and the streak bar aren't empty in the shot.
const seed = {
  petch_user: JSON.stringify({ name: 'Nicholas', pet: 'dog', done: true }),
  petch_streak: JSON.stringify({ count: 5, lastDay: today }),
  petch_weekly_goal: JSON.stringify({ weekStart, count: 6 }),
  petch_missions: JSON.stringify({
    lastAssigned: today,
    slots: [
      { id: 'm1', label: 'Sleep by 11pm tonight',    topic: 'Sleep',     source: 'check_in',  reward: 10, status: 'pending',   assignedAt: Date.now() },
      { id: 'm2', label: 'Take a 10-minute walk',    topic: 'Exercise',  source: 'suggested', reward: 5,  status: 'completed', assignedAt: Date.now(), completedAt: Date.now() },
      { id: 'm3', label: 'Drink 8 glasses of water', topic: 'Nutrition', source: 'suggested', reward: 5,  status: 'pending',   assignedAt: Date.now() },
    ],
  }),
}

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--mute-audio', '--hide-scrollbars'],
})
const ctx = await browser.newContext({
  viewport: { width: 402, height: 874 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
})
await ctx.addInitScript(([seed]) => {
  for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v)
  Math.random = () => 0.87                                   // suppress the random nudge sheet
  HTMLMediaElement.prototype.play = () => Promise.resolve()  // no audio in headless
}, [seed])

const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

await page.locator('input').first().fill('Nicholas')
await page.keyboard.press('Enter')
await page.waitForTimeout(2200)

async function shot(name) {
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('captured', name)
}

await shot('home')

for (const [label, name] of [
  ['Missions', 'missions'],
  ['Community', 'community'],
  ['Health Overview', 'health'],
]) {
  await page.locator('[aria-label="Menu"], button:has(svg[aria-label="Menu"])').first().click()
  await page.waitForTimeout(800)
  await page.getByText(label, { exact: true }).first().click()
  await page.waitForTimeout(1600)
  await shot(name)
}

await browser.close()
