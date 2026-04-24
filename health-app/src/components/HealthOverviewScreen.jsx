import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { PHONE, SendIcon } from '../utils/frame.jsx'
import coinSvg from '../assets/coin.svg'
import characterIdle from '../assets/animation/character-idle.gif'
import characterIdleClicked from '../assets/animation/character-idle-clicked.gif'
import { buildUserContextBlock } from '../utils/demoHistory'

// ── Navy theme ───────────────────────────────────────────────────
const NAVY = {
  bg:       '#002F54',
  header:   '#004981',
  dark:     '#013863',
  muted:    '#004981',
}

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

// ── Static health log items (placeholder until AI is wired) ──────
const HEALTH_ITEMS = [
  { text: '< 6 hours of sleep',     status: 'urgent'   },
  { text: 'Drinking sugary drinks', status: 'aware'    },
  { text: 'Going to the Gym',       status: 'maintain' },
]

const STATUS_CONFIG = {
  urgent:   { label: 'URGENT',   bg: '#ff5858' },
  aware:    { label: 'AWARE',    bg: '#ffc758' },
  maintain: { label: 'MAINTAIN', bg: '#81f42d' },
}

// ── Fallback overview text (used when /api/chat is unavailable) ──
const OVERVIEW_FALLBACK = `Here's your overall health picture, Nic!

Sleep, nutrition, and exercise are deeply connected — and right now, your sleep is the biggest lever.

When you sleep under 7 hours, your body ramps up ghrelin (the hunger hormone) and dials down leptin (the fullness one). That's partly why sugary drinks feel so hard to resist the next day — your brain is literally looking for a quick energy hit.

Nutrition then feeds back into sleep and movement. Sugary drinks spike your blood sugar, then crash it, leaving you too drained to make it to the gym. Whole foods and steady hydration keep your energy stable and your sleep deeper.

Exercise is the multiplier. Even a 10-minute walk improves sleep quality, reduces cravings, and lifts mood. Going to the gym is already a strength of yours — let's protect it.

The big picture: sort out sleep, and nutrition and exercise get easier automatically. Want me to suggest a small step for tonight?`

// Fallback per-item responses (used when API is unavailable)
const ITEM_FALLBACK = {
  urgent: (text) => `This one's flagged URGENT, Nic — "${text}" is where the biggest return on effort is right now.

Chronic under-sleep isn't just feeling tired. It ramps up ghrelin (your hunger hormone), dulls leptin (the one that tells you you're full), and impairs next-day decisions. That's why cravings and low energy often track back to here.

The single most useful move is protecting a wind-down window — even 30 minutes earlier tonight is worth more than a perfect workout tomorrow.

Want me to suggest a specific wind-down plan?`,
  aware: (text) => `"${text}" is flagged as AWARE, meaning it's not an emergency, but it's quietly draining your energy.

Sugary drinks spike blood sugar fast, then crash it just as fast, leaving you tired and reaching for more. Replacing even one a day with water or an unsweetened alternative is usually enough to notice steadier energy within a week.

No need to go cold turkey — trade, don't eliminate.

Want to pick one swap to try tomorrow?`,
  maintain: (text) => `"${text}" is in MAINTAIN territory, Nic — and this is worth celebrating.

Going to the gym supports basically every other health area: deeper sleep, better mood, steadier blood sugar, stronger stress tolerance. The goal here isn't to push harder — it's to protect the habit so it doesn't slip when life gets busy.

What would make this easier to stick to in a hectic week?`,
}

// ── Icons ─────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"   width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13"  width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

function ArrowUpRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H8M17 7v9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M14 4l6 6-3 1-5 5-1-1-5 5-1-1 5-5-1-1 5-5 1-3z" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-label="Voice input">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-label="Attach">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-label="Save">
      <path d="M12 16l-5-5h3V4h4v7h3l-5 5z"/>
      <path d="M4 20h16v-2H4v2z"/>
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-label="Back">
      <path d="M8 1L2 8l6 7M2 8h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Typewriter ────────────────────────────────────────────────────
function useTypewriter(text, delay = 600, speed = 10, onDone) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!text) { onDone?.(); return }
    let idx = 0
    let timer
    const start = setTimeout(() => {
      timer = setInterval(() => {
        idx++
        setDisplayed(text.slice(0, idx))
        if (idx >= text.length) { clearInterval(timer); onDone?.() }
      }, speed)
    }, delay)
    return () => { clearTimeout(start); clearInterval(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, speed])

  return displayed
}

function scrollAncestorToBottom(node) {
  let el = node?.parentElement
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      el.scrollTop = el.scrollHeight
      return
    }
    el = el.parentElement
  }
}

function PetchMessage({ text, animate = false, onDone }) {
  const displayed = useTypewriter(animate ? text : '', 400, 10, onDone)
  const shown = animate ? displayed : text
  const ref = useRef(null)

  // Auto-scroll the chat feed as characters stream in
  useLayoutEffect(() => {
    scrollAncestorToBottom(ref.current)
  }, [shown])

  return (
    <p ref={ref} style={{ ...f, fontWeight: 400, fontSize: 18, color: 'white', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
      {shown}
      {animate && shown.length < text.length && (
        <span className="inline-block w-[2px] h-[18px] bg-white ml-[2px] align-middle animate-pulse" />
      )}
    </p>
  )
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] px-[16px] py-[12px] rounded-[14px] rounded-tr-[4px]" style={{ background: NAVY.dark }}>
        <p style={{ ...f, fontWeight: 400, fontSize: 17, color: 'white', lineHeight: 1.4 }}>{text}</p>
      </div>
    </div>
  )
}

// ── Shared navy header ───────────────────────────────────────────
function NavyHeader({ onMenuOpen, coins }) {
  return (
    <div
      className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] rounded-b-[20px] chat-header-bar"
      style={{ background: NAVY.header }}
    >
      <div className="chat-status-spacer" />
      <div className="flex items-center justify-between h-[46px] px-[15px]">
        <button
          onClick={onMenuOpen}
          className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
          style={{ width: 45, height: 45 }}
        >
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />
          <div className="relative" style={{ width: 19, height: 14 }}>
            <HamburgerIcon />
          </div>
        </button>
        <div className="flex flex-col items-center text-white text-center" style={{ gap: 10 }}>
          <span style={{ ...f, fontWeight: 700, fontSize: 24, letterSpacing: '0.25px', lineHeight: 1 }}>PETCH</span>
          <span style={{ ...f, fontWeight: 400, fontSize: 20, letterSpacing: '-0.2px', lineHeight: 1 }}>Health Overview</span>
        </div>
        <div className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: NAVY.dark, padding: 5, gap: 2.5 }}>
          <span style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>{coins}</span>
          <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316 }}>
            <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return null
  return (
    <div style={{ background: cfg.bg, borderRadius: 5, padding: '7.5px 10px', flexShrink: 0 }}>
      <span style={{ ...f, fontWeight: 700, fontSize: 14, color: 'white', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    </div>
  )
}

// ── LOG VIEW ─────────────────────────────────────────────────────
function LogView({ onAskFull, onQuickAsk, onItemClick, onMenuOpen, coins }) {
  const [inputText, setInputText] = useState('')
  const [petClicked, setPetClicked] = useState(false)

  function handlePetTap() {
    setPetClicked(true)
    setTimeout(() => setPetClicked(false), 3200)
  }

  function handleSend() {
    const trimmed = inputText.trim()
    if (!trimmed) return
    setInputText('')
    onQuickAsk(trimmed)
  }

  return (
    <>
      <NavyHeader onMenuOpen={onMenuOpen} coins={coins} />

      {/* Body prompt */}
      <div className="flex-1 overflow-y-auto py-[20px] min-h-0">
        <p style={{ ...f, fontWeight: 400, fontSize: 20, color: 'white', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
          This is your health story, Nic. Ask me anything about your health. I'll answer from what I know about you.
        </p>
      </div>

      {/* Dog + status */}
      <div className="shrink-0 w-full">
        <div
          className="cursor-pointer active:scale-95 transition-transform duration-100 flex items-end justify-start"
          style={{ height: 125 }}
          onClick={handlePetTap}
        >
          <img
            src={petClicked ? characterIdleClicked : characterIdle}
            alt="Petch companion"
            style={{ height: 125, objectFit: 'contain', objectPosition: 'bottom left' }}
          />
        </div>
        <div className="py-[6px]" style={{ ...f, fontWeight: 400, fontSize: 20, color: NAVY.muted, minHeight: 32 }}>
          Waiting Patiently...
        </div>
      </div>

      {/* Footer card */}
      <div className="shrink-0 mb-[2px]">
        <div className="rounded-[15px] p-[15px] flex flex-col gap-[15px] w-full" style={{ background: NAVY.header }}>

          {/* Date nav */}
          <div className="flex items-center justify-between w-full">
            <span style={{ ...f, fontWeight: 400, fontSize: 20, color: 'white', letterSpacing: '-0.2px' }}>{'<'}</span>
            <span style={{ ...f, fontWeight: 400, fontSize: 16, color: 'white', letterSpacing: '-0.16px' }}>
              Today {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ ...f, fontWeight: 400, fontSize: 20, color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.2px' }}>{'>'}</span>
          </div>

          {/* Ask full overview */}
          <button
            onClick={onAskFull}
            className="active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-[8px] w-full rounded-[10px] py-[6px] px-[10px]"
            style={{ background: NAVY.dark }}
          >
            <span style={{ ...f, fontWeight: 500, fontSize: 18, color: 'white' }}>Ask Petch for a full overview</span>
            <ArrowUpRightIcon />
          </button>

          {/* Items list */}
          <div className="flex flex-col gap-[5px] w-full">
            {HEALTH_ITEMS.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between gap-[10px] py-[2px]">
                  <button
                    onClick={() => onItemClick(item)}
                    className="text-left active:opacity-60 transition-opacity duration-100"
                    style={{
                      ...f, fontWeight: 400, fontSize: 18, color: 'white',
                      flex: 1, background: 'transparent', border: 'none',
                      padding: 0, cursor: 'pointer',
                    }}
                  >
                    {item.text}
                  </button>
                  <StatusBadge status={item.status} />
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginTop: 5 }} />
              </div>
            ))}

            {/* Ask input */}
            <div className="flex items-center justify-between gap-[10px] py-[2px]">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                placeholder="Ask Petch about your health"
                className="navy-input bg-transparent outline-none flex-1"
                style={{
                  ...f, fontWeight: 400, fontSize: 18,
                  color: 'white',
                  letterSpacing: '-0.25px',
                }}
              />
              <button
                type="button"
                aria-label="Voice input"
                className="active:scale-90 transition-transform duration-100 shrink-0 opacity-80"
              >
                <MicIcon />
              </button>
              <button
                type="button"
                onClick={handleSend}
                aria-label="Send message"
                disabled={!inputText.trim()}
                className="active:scale-90 transition-transform duration-100 shrink-0 disabled:opacity-50"
              >
                <SendIcon size={24} color="#004981" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// ── FULL OVERVIEW CHAT VIEW ──────────────────────────────────────
function FullOverviewView({ initialQuestion, selectedItem, onBack, onMenuOpen, coins }) {
  const [messages, setMessages]     = useState([])
  const [inputText, setInputText]   = useState('')
  const [isLoading, setIsLoading]   = useState(true)
  const [petClicked, setPetClicked] = useState(false)
  const scrollRef = useRef(null)

  // Fetch overview on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      let seedContent, fallback

      if (selectedItem) {
        const label = STATUS_CONFIG[selectedItem.status]?.label ?? ''
        seedContent = `Tell me about "${selectedItem.text}" — this has been flagged as ${label} in my health log. Explain what it means for me, why it matters, and what specific step I can take. Be warm, concise, and end with a question to continue the conversation.`
        fallback = ITEM_FALLBACK[selectedItem.status]?.(selectedItem.text) ?? OVERVIEW_FALLBACK
      } else if (initialQuestion) {
        seedContent = initialQuestion
        fallback = OVERVIEW_FALLBACK
      } else {
        seedContent = 'Give me a health overview covering sleep, nutrition, and exercise, and explain how each one influences the others.'
        fallback = OVERVIEW_FALLBACK
      }

      let reply = ''
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: seedContent }], userContext: buildUserContextBlock(userName) }),
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        reply = data.reply || fallback
      } catch {
        reply = fallback
      }

      if (cancelled) return
      setIsLoading(false)
      // For selected items, don't show the user prompt — the item card itself is the prompt
      setMessages(
        initialQuestion && !selectedItem
          ? [{ role: 'user', text: initialQuestion }, { role: 'petch', text: reply, animate: true }]
          : [{ role: 'petch', text: reply, animate: true }]
      )
    }

    load()
    return () => { cancelled = true }
  }, [initialQuestion, selectedItem])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    setInputText('')
    setIsLoading(true)

    const userMsg = { role: 'user', text: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)

    const history = next.map(m => ({
      role: m.role === 'petch' ? 'assistant' : 'user',
      content: m.text,
    }))

    let reply = ''
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userContext: buildUserContextBlock(userName) }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      reply = data.reply
    } catch {
      reply = "I'd love to explore that with you. Once the full AI is connected, I'll give you a more personalised answer based on what I know about you."
    }

    setIsLoading(false)
    setMessages(prev => [...prev, { role: 'petch', text: reply, animate: true }])
  }

  function handlePetTap() {
    setPetClicked(true)
    setTimeout(() => setPetClicked(false), 3200)
  }

  const statusText = isLoading
    ? (selectedItem ? 'Providing...' : 'Giving...')
    : 'Waiting Patiently...'

  return (
    <>
      {/* Header with back button overriding the hamburger */}
      <div
        className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] rounded-b-[20px] chat-header-bar"
        style={{ background: NAVY.header }}
      >
        <div className="chat-status-spacer" />
        <div className="flex items-center justify-between h-[46px] px-[15px]">
          <button
            onClick={onBack}
            className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
            style={{ width: 45, height: 45 }}
            aria-label="Back"
          >
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />
            <div className="relative" style={{ width: 19, height: 14 }}>
              <BackIcon />
            </div>
          </button>
          <div className="flex flex-col items-center text-white text-center" style={{ gap: 10 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 24, letterSpacing: '0.25px', lineHeight: 1 }}>PETCH</span>
            <span style={{ ...f, fontWeight: 400, fontSize: 20, letterSpacing: '-0.2px', lineHeight: 1 }}>Health Overview</span>
          </div>
          <div className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: NAVY.dark, padding: 5, gap: 2.5 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>{coins}</span>
            <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316 }}>
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pinned card */}
      <div className="shrink-0 pt-[16px]">
        <div
          className="flex items-center gap-[10px] px-[10px] py-[10px] rounded-[10px] w-full"
          style={{ background: NAVY.header }}
        >
          <PinIcon />
          {selectedItem ? (
            <>
              <span className="flex-1 min-w-0" style={{ ...f, fontWeight: 400, fontSize: 18, color: 'white' }}>
                {selectedItem.text}
              </span>
              <StatusBadge status={selectedItem.status} />
            </>
          ) : (
            <span style={{ ...f, fontWeight: 400, fontSize: 18, color: 'white' }}>
              {initialQuestion ? 'Specific Question' : 'Overall Health'}
            </span>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-[16px] flex flex-col gap-[16px] min-h-0"
      >
        {isLoading && messages.length === 0 && (
          <div className="flex gap-[4px] items-center">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="inline-block w-[6px] h-[6px] rounded-full bg-white opacity-60"
                style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === 'petch'
            ? <PetchMessage key={i} text={msg.text} animate={!!msg.animate} />
            : <UserMessage  key={i} text={msg.text} />
        )}
      </div>

      {/* Dog + status */}
      <div className="shrink-0 w-full">
        <div
          className="cursor-pointer active:scale-95 transition-transform duration-100 flex items-end justify-start"
          style={{ height: 125 }}
          onClick={handlePetTap}
        >
          <img
            src={petClicked ? characterIdleClicked : characterIdle}
            alt="Petch companion"
            style={{ height: 125, objectFit: 'contain', objectPosition: 'bottom left' }}
          />
        </div>
        <div className="py-[4px]" style={{ ...f, fontWeight: 400, fontSize: 20, color: NAVY.muted, minHeight: 28 }}>
          {statusText}
        </div>
      </div>

      {/* Footer input */}
      <div className="shrink-0 mb-[2px]">
        <div className="rounded-[14px] px-[14px] py-[12px] flex flex-col gap-[10px] w-full" style={{ background: NAVY.header }}>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(inputText) } }}
            placeholder="Chat with Petch"
            className="navy-input bg-transparent outline-none w-full"
            style={{
              ...f, fontWeight: 400, fontSize: 20,
              color: 'white',
              letterSpacing: '-0.25px',
            }}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <button className="active:scale-90 transition-transform duration-100 p-[2px]"><AddIcon /></button>
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                aria-label="Voice input"
                className="active:scale-90 transition-transform duration-100 p-[2px]"
              >
                <MicIcon />
              </button>
              <button
                type="button"
                onClick={() => sendMessage(inputText)}
                aria-label="Send message"
                disabled={!inputText.trim() || isLoading}
                className="active:scale-90 transition-transform duration-100 disabled:opacity-50"
              >
                <SendIcon color="#004981" />
              </button>
              <button className="active:scale-90 transition-transform duration-100 p-[2px]"><DownloadIcon /></button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function HealthOverviewScreen({
  menuOpen = false,
  onMenuOpen,
  onMenuClose,
  coins = 10,
  initialView = null,
  onInitialViewConsumed,
  userName = 'there',
}) {
  // If the home chat routed us here with a specific view, honour it.
  const [view, setView] = useState(initialView === 'fullOverview' ? 'fullOverview' : 'log')
  const [initialQuestion, setInitialQuestion] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  // One-shot: tell the parent we've consumed the initialView so the
  // next render doesn't force the view again on navigation back.
  useEffect(() => {
    if (initialView) onInitialViewConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAskFull() {
    setInitialQuestion(null)
    setSelectedItem(null)
    setView('fullOverview')
  }

  function handleQuickAsk(question) {
    setInitialQuestion(question)
    setSelectedItem(null)
    setView('fullOverview')
  }

  function handleItemClick(item) {
    setInitialQuestion(null)
    setSelectedItem(item)
    setView('fullOverview')
  }

  function handleBack() {
    setView('log')
    setInitialQuestion(null)
    setSelectedItem(null)
  }

  return (
    <div
      className={PHONE}
      style={{
        background: NAVY.bg,
        transform: menuOpen ? 'translateX(279px)' : 'translateX(0)',
        transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: 'fade-in 0.3s ease forwards',
      }}
    >
      {/* Dim overlay when menu open */}
      <div
        onClick={onMenuClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(0,47,84,0.8)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.32s ease',
        }}
      />

      {view === 'log' && (
        <LogView
          onAskFull={handleAskFull}
          onQuickAsk={handleQuickAsk}
          onItemClick={handleItemClick}
          onMenuOpen={onMenuOpen}
          coins={coins}
        />
      )}
      {view === 'fullOverview' && (
        <FullOverviewView
          key={selectedItem ? `item-${selectedItem.text}` : initialQuestion ?? 'overview'}
          initialQuestion={initialQuestion}
          selectedItem={selectedItem}
          onBack={handleBack}
          onMenuOpen={onMenuOpen}
          coins={coins}
        />
      )}
    </div>
  )
}
