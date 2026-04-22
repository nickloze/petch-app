// Thin wrapper around navigator.vibrate — iOS Safari silently no-ops.
const can = typeof navigator !== 'undefined' && 'vibrate' in navigator

export const PATTERNS = {
  tap:      [10],
  select:   [8],
  correct:  [15, 30, 15],
  wrong:    [30],
  coin:     [20],
  commit:   [15, 40, 15, 40, 25],
}

export function haptic(pattern = 'tap') {
  if (!can) return
  const p = typeof pattern === 'string' ? PATTERNS[pattern] : pattern
  try { navigator.vibrate(p || PATTERNS.tap) } catch {}
}
