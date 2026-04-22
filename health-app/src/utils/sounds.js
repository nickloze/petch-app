// ── Petch Sound System — Web Audio API (click SFX only) ─────────
// Background music removed intentionally — health app context is
// often quiet/public; users found bgm distracting during reflection.
// Keep click/correct/wrong SFX as pre-decoded AudioBuffers for zero
// latency. Haptics are fired alongside these from callsites.

import { haptic } from './haptics'

let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

const buffers = { mcq: null, next: null, correct: null, wrong: null }

async function loadBuffer(url) {
  const res  = await fetch(url)
  const data = await res.arrayBuffer()
  return getCtx().decodeAudioData(data)
}

export async function preloadSounds() {
  const load = async (key, url) => {
    try { buffers[key] = await loadBuffer(url) } catch {}
  }
  await Promise.all([
    load('mcq',     '/sounds/mcq-click.mp3'),
    load('next',    '/sounds/next-button.mp3'),
    load('correct', '/sounds/correct-answer.mp3'),
    load('wrong',   '/sounds/wrong-answer.mp3'),
  ])
}

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
  } catch {}
}

// No-op — kept as exported symbol so existing callsites don't break.
// Unlocks AudioContext on first gesture (iOS) so click sounds work.
export function startBgMusic() {
  const unlock = () => {
    getCtx().resume().catch(() => {})
    document.removeEventListener('touchstart', unlock, true)
    document.removeEventListener('mousedown',  unlock, true)
  }
  document.addEventListener('touchstart', unlock, { capture: true, once: true })
  document.addEventListener('mousedown',  unlock, { capture: true, once: true })
}

export function playMcq()     { haptic('select');  playBuffer(buffers.mcq,     0.85) }
export function playNext()    { haptic('tap');     playBuffer(buffers.next,    0.85) }
export function playCorrect() { haptic('correct'); playBuffer(buffers.correct, 0.90) }
export function playWrong()   { haptic('wrong');   playBuffer(buffers.wrong,   1.4)  }
