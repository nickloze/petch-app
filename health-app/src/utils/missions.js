// Missions ledger (localStorage) — Slot 1 driven by check-in commit,
// Slots 2 & 3 are Petch-suggested.
const KEY = 'petch_missions'

export const SUGGESTED_POOL = [
  { type: 'drink_water',    label: 'Drink 8 glasses of water', reward: 5, topic: 'Nutrition' },
  { type: '10min_walk',     label: 'Take a 10-minute walk',    reward: 5, topic: 'Exercise' },
  { type: 'screen_off_1hr', label: '1 hour screen-free tonight', reward: 5, topic: 'Sleep' },
  { type: 'stretch_5',      label: '5 minutes of stretching',  reward: 5, topic: 'Exercise' },
  { type: 'fruit_serve',    label: 'Eat a serving of fruit',    reward: 5, topic: 'Nutrition' },
]

function emptyState() {
  return { slots: [null, null, null], lastAssigned: null }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    if (!parsed.slots) return emptyState()
    return parsed
  } catch {
    return emptyState()
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

// Auto-fill Slot 1 from today's committed action.
export function assignSlot1(label, topic) {
  const state = load()
  state.slots[0] = {
    id: 'm_' + Date.now(),
    label,
    topic,
    source: 'check_in',
    reward: 10,
    status: 'pending',
    assignedAt: Date.now(),
  }
  // Seed empty 2 & 3 with Petch suggestions (different from Slot 1)
  for (let i = 1; i <= 2; i++) {
    if (!state.slots[i]) {
      const pick = SUGGESTED_POOL[(Date.now() + i) % SUGGESTED_POOL.length]
      state.slots[i] = {
        id: 'm_' + Date.now() + '_' + i,
        label: pick.label,
        topic: pick.topic,
        source: 'suggested',
        reward: pick.reward,
        status: 'pending',
        assignedAt: Date.now(),
      }
    }
  }
  state.lastAssigned = Date.now()
  save(state)
  return state
}

export function completeMission(slotIndex) {
  const state = load()
  const m = state.slots[slotIndex]
  if (!m || m.status === 'completed') return state
  m.status = 'completed'
  m.completedAt = Date.now()
  save(state)
  return state
}

export function addSuggestion(mission) {
  const state = load()
  const idx = state.slots.findIndex((s) => !s || s.status === 'completed')
  if (idx === -1) return state
  state.slots[idx] = {
    id: 'm_' + Date.now(),
    label: mission.label,
    topic: mission.topic || 'General',
    source: 'suggested',
    reward: mission.reward || 5,
    status: 'pending',
    assignedAt: Date.now(),
  }
  save(state)
  return state
}

export function reset() {
  save(emptyState())
}
