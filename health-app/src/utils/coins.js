// Coin ledger (localStorage). Replace with Supabase later.
const BALANCE_KEY = 'petch_coins'
const LEDGER_KEY  = 'petch_ledger'
const STARTING_BALANCE = 10

export function getBalance() {
  const v = localStorage.getItem(BALANCE_KEY)
  return v == null ? STARTING_BALANCE : Number(v) || 0
}

// Demo reset — called on every app restart so testers start fresh at 10.
export function resetBalance() {
  setBalance(STARTING_BALANCE)
  localStorage.removeItem(LEDGER_KEY)
  return STARTING_BALANCE
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
