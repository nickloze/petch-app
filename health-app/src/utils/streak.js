// Streak counter — day-based, resets if gap >1 day.
const KEY = 'petch_streak'

function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { count: 0, lastDay: null }
    return JSON.parse(raw)
  } catch {
    return { count: 0, lastDay: null }
  }
}

export function recordCheckIn() {
  const state = getStreak()
  const t = today()
  if (state.lastDay === t) return state // already counted today
  if (state.lastDay === yesterday()) {
    state.count += 1
  } else {
    state.count = 1
  }
  state.lastDay = t
  localStorage.setItem(KEY, JSON.stringify(state))
  return state
}

// Progress toward next milestone (3, 7, 30, 100).
export function milestoneProgress(count) {
  const milestones = [3, 7, 30, 100]
  const next = milestones.find((m) => m > count) ?? count + 10
  const prev = [0, ...milestones].reverse().find((m) => m <= count) ?? 0
  const pct = Math.round(((count - prev) / (next - prev)) * 100)
  return { next, prev, pct: Math.max(0, Math.min(100, pct)) }
}
