// ── Petch Sound System — Web Audio API ──────────────────────────
// Click sounds use pre-decoded AudioBuffers so playback is instant
// with zero lag. Background music uses HTMLAudioElement (better for
// long looping tracks).
//
// iOS Safari: AudioContext starts suspended until a user gesture.
// We decode buffers immediately (works while suspended) and resume
// the context on the first touch alongside the bg music start.

let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

// ── Pre-decoded click sound buffers ─────────────────────────────
const buffers = { mcq: null, next: null, correct: null, wrong: null }

async function loadBuffer(url) {
  const res  = await fetch(url)
  const data = await res.arrayBuffer()
  return getCtx().decodeAudioData(data)
}

// Call once on app mount — fetches + decodes all click sounds in
// the background. Each buffer loads independently so one failure
// never blocks the others.
export async function preloadSounds() {
  const load = async (key, url) => {
    try {
      buffers[key] = await loadBuffer(url)
    } catch (e) {
      // Individual buffer failed — others continue loading
    }
  }
  await Promise.all([
    load('mcq',     '/sounds/mcq-click.mp3'),
    load('next',    '/sounds/next-button.mp3'),
    load('correct', '/sounds/correct-answer.mp3'),
    load('wrong',   '/sounds/wrong-answer.mp3'),
  ])
}

// Play a pre-decoded buffer at given volume (instant, no lag)
function playBuffer(buffer, volume = 1) {
  if (!buffer) return
  try {
    const c    = getCtx()
    const src  = c.createBufferSource()
    const gain = c.createGain()
    src.buffer      = buffer
    gain.gain.value = volume
    src.connect(gain)
    gain.connect(c.destination)
    src.start(0)
  } catch (e) {}
}

// ── Background music (HTMLAudioElement — better for long loops) ──
const bgMusic  = new Audio('/sounds/bg-music.mp3')
bgMusic.loop   = true
bgMusic.volume = 0.18   // subtle ambience

let musicStarted = false

// Pause when phone locks / user switches app; resume when they return
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    bgMusic.pause()
  } else if (musicStarted) {
    bgMusic.play().catch(() => {})
  }
})

// iOS fires pagehide when app is backgrounded (covers cases visibilitychange misses)
window.addEventListener('pagehide', () => { bgMusic.pause() })
window.addEventListener('pageshow', () => { if (musicStarted) bgMusic.play().catch(() => {}) })

export function startBgMusic() {
  if (musicStarted) return

  bgMusic.play().then(() => {
    musicStarted = true
  }).catch(() => {
    // Autoplay blocked — unlock on first user interaction
    const unlock = () => {
      // Resume AudioContext so click sounds also work on iOS
      getCtx().resume().catch(() => {})
      bgMusic.play().catch(() => {})
      musicStarted = true
      document.removeEventListener('touchstart', unlock, true)
      document.removeEventListener('mousedown',  unlock, true)
    }
    document.addEventListener('touchstart', unlock, { capture: true, once: true })
    document.addEventListener('mousedown',  unlock, { capture: true, once: true })
  })
}

// ── Public play functions ────────────────────────────────────────
export function playMcq()     { playBuffer(buffers.mcq,     0.85) }
export function playNext()    { playBuffer(buffers.next,    0.85) }
export function playCorrect() { playBuffer(buffers.correct, 0.90) }
export function playWrong()   { playBuffer(buffers.wrong,   1.4)  }
