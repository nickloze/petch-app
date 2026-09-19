// Render cover.html frame by frame and encode to H.264.
//
//   node cover-video/render.mjs 1920 1080 cover-video/out/petch-cover-8s-1920x1080.mp4
//
// Frames are not screen-recorded: the page exposes window.setT(seconds),
// so each frame is rendered at an exact timestamp and piped straight into
// ffmpeg. Nothing is ever dropped, and the motion is perfectly even.
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const W    = +(process.argv[2] || 1920)
const H    = +(process.argv[3] || 1080)
const OUT  = process.argv[4] || `cover-video/out/petch-cover-8s-${W}x${H}.mp4`
const BASE = process.env.COVER_URL || 'http://127.0.0.1:4318/cover.html'
const EXE  = process.env.CHROME_PATH || undefined

const DUR = 8, FPS = 60, N = DUR * FPS
mkdirSync(dirname(OUT), { recursive: true })

const ff = spawn('ffmpeg', [
  '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', 'pipe:0',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
  '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  // fixed GOP with no scene cuts: every loop restart decodes identically
  '-x264-params', 'keyint=60:min-keyint=60:scenecut=0',
  '-r', String(FPS), '-movflags', '+faststart',
  OUT,
], { stdio: ['pipe', 'ignore', 'pipe'] })
let ffErr = ''
ff.stderr.on('data', d => { ffErr += d.toString() })

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars', '--disable-lcd-text'],
})
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await page.goto(`${BASE}?w=${W}&h=${H}`, { waitUntil: 'networkidle' })
await page.evaluate(() => window.ready)   // fonts + every image decoded

const clip = { x: 0, y: 0, width: W, height: H }
const t0 = Date.now()
for (let i = 0; i < N; i++) {
  await page.evaluate(t => window.setT(t), i / FPS)
  const buf = await page.screenshot({ clip, animations: 'disabled' })
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain')
  if (i === 0) await page.screenshot({ path: OUT.replace(/\.mp4$/, '-poster.png'), clip })
  if (i % 60 === 0) console.log(`  ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`)
}
ff.stdin.end()
await browser.close()

const [code] = await once(ff, 'close')
if (code !== 0) { console.error(ffErr.slice(-2000)); process.exit(1) }
console.log('encoded ->', OUT, `${((Date.now() - t0) / 1000).toFixed(0)}s`)
