// Coin ledger (localStorage). Replace with Supabase later.
const BALANCE_KEY = 'petch_coins'
const LEDGER_KEY  = 'petch_ledger'

export function getBalance() {
  const v = localStorage.getItem(BALANCE_KEY)
  return v == null ? 10 : Number(v) || 0
}

export function setBalance(n) {
  localStorage.setItem(BALANCE_KEY, String(n))
}

export function earn(amount, reason, meta = {}) {
  const next = getBalance() + amount
  setBalance(next)
  const ledger = JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]')
  ledger.push({ delta: amount, reason, meta, at: Date.now() })
  localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger.slice(-50)))
  return next
}

export function spend(amount, reason, meta = {}) {
  return earn(-Math.abs(amount), reason, meta)
}
