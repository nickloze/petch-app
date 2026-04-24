import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHONE, SendIcon } from '../utils/frame.jsx'
import { playMcq, playNext } from '../utils/sounds'
import { haptic } from '../utils/haptics'
import coinSvg from '../assets/coin.svg'
import characterIdle from '../assets/animation/character-idle.gif'
import TypingBubble from './TypingBubble.jsx'
import { DEMO_SESSIONS, buildUserContextBlock } from '../utils/demoHistory'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

const PROMPTS_BY_TOPIC = {
  Sleep: [
    'What did I learn in this session?',
    'How has my sleep been trending?',
    'Give me one thing to try tonight',
    'Why does consistent bedtime matter?',
    'What should I avoid before bed?',
    'How many hours do I really need?',
  ],
  Nutrition: [
    'What did I learn in this session?',
    'What patterns are in my eating habits?',
    'Suggest a small swap for tomorrow',
    'What should I eat more of?',
    'How do I beat the afternoon crash?',
    'Is snacking actually bad?',
  ],
  Exercise: [
    'What did I learn in this session?',
    'Am I moving enough this week?',
    'Give me a 10-minute idea for today',
    'What counts as real movement?',
    'When is the best time to move?',
    'How do I stay consistent?',
  ],
}

const FOLLOWUP_PROMPTS = [
  'Tell me more',
  'Why does that matter?',
  'What should I try first?',
  'Give me a concrete example',
  'How do I remember to do this?',
]

const FALLBACK_BY_PROMPT = {
  'What did I learn in this session?':
    "You reflected on your recent patterns and picked one small action to follow through on. The through-line was being honest about where you're at, without judgement — that's the part that makes the next session useful.",
  'How has my sleep been trending?':
    "Your bedtime has been drifting later across the week. That's the biggest lever right now — a consistent lights-off time matters more than total hours.",
  'What patterns are in my eating habits?':
    "You tend to eat well until late afternoon, then grab whatever's quickest. Prepping one easy snack for that window usually fixes it.",
  "Am I moving enough this week?":
    "Movement has been mostly incidental — not much intentional activity. Even two 15-minute walks would shift the needle.",
  'Give me one thing to try tonight':
    "Set a fixed wind-down time tonight — same as yesterday. Not a target wake-up, just a repeat. Consistency beats perfection here.",
  'Suggest a small swap for tomorrow':
    "Swap one packaged snack for a piece of fruit and a handful of nuts. Boring, I know — but it's the swap most people actually stick with.",
  'Give me a 10-minute idea for today':
    "Ten-minute walk after your biggest meal. Doesn't matter when the meal is. Lowers your blood sugar response and it compounds across the week.",
}

function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13" width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-label="Back">
      <path d="M8 1L1 8L8 15M1 8H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function useTypewriter(text, animate, speed = 10, onDone) {
  const [displayed, setDisplayed] = useState(animate ? '' : text)
  useEffect(() => {
    if (!animate) { setDisplayed(text); onDone?.(); return }
    setDisplayed('')
    if (!text) { onDone?.(); return }
    let idx = 0
    const id = setInterval(() => {
      idx++
      setDisplayed(text.slice(0, idx))
      if (idx >= text.length) { clearInterval(id); onDone?.() }
    }, speed)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate, speed])
  return displayed
}

function scrollAncestorToBottom(node) {
  let el = node?.parentElement
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') { el.scrollTop = el.scrollHeight; return }
    el = el.parentElement
  }
}

function PetchMessage({ text, animate = false, onDone }) {
  const displayed = useTypewriter(text, animate, 10, onDone)
  const ref = useRef(null)
  useLayoutEffect(() => { scrollAncestorToBottom(ref.current) }, [displayed])
  return (
    <div ref={ref} className="flex flex-col gap-[6px] pr-[40px]">
      <p
        className="text-white text-[18px] leading-snug"
        style={{ ...f, fontWeight: 400, whiteSpace: 'pre-wrap' }}
      >
        {displayed}
      </p>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[75%] px-[16px] py-[12px] rounded-[14px] rounded-tr-[4px]"
        style={{ background: '#00BAFF' }}
      >
        <p
          className="text-white text-[17px] leading-snug"
          style={{ ...f, fontWeight: 400 }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

export default function SessionRecapScreen({ session, onBack, onMenuOpen, coins = 0, userName = 'there' }) {
  const topic = session?.topic ?? 'Sleep'
  const date = session?.date ?? ''
  const prompts = PROMPTS_BY_TOPIC[topic] ?? PROMPTS_BY_TOPIC.Sleep
  const sessionRecord = DEMO_SESSIONS.find(s => s.date === date && s.topic === topic)

  const [messages, setMessages] = useState([
    {
      role: 'petch',
      text: `Welcome back to your ${topic.toLowerCase()} session on ${date}. What would you like to know about this session?`,
      animate: true,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [askedPrompts, setAskedPrompts] = useState([])
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef(null)

  const [typingDoneFor, setTypingDoneFor] = useState(-1)
  const lastMessage = messages[messages.length - 1]
  const lastIdx = messages.length - 1
  const lastTyped = !lastMessage?.animate || typingDoneFor >= lastIdx
  const showPrompts = !isLoading && lastMessage?.role === 'petch' && lastTyped
  const availableTopicPrompts = prompts.filter((p) => !askedPrompts.includes(p))
  const availableFollowups = FOLLOWUP_PROMPTS.filter((p) => !askedPrompts.includes(p))
  const currentPrompts = [...availableTopicPrompts, ...availableFollowups].slice(0, 3)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  async function ask(text) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    haptic('tap')
    playNext()
    setAskedPrompts((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setInputText('')
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setIsLoading(true)
    const startedAt = Date.now()

    let reply = ''
    try {
      const sessionFacts = sessionRecord
        ? `FACTS FROM THIS PAST SESSION (${sessionRecord.date} · ${sessionRecord.topic}, mood ${sessionRecord.mood}/5):
- What happened: ${sessionRecord.summary}
- Committed action: "${sessionRecord.committedAction}"
- Follow-through: ${sessionRecord.followThrough}

Reference these facts directly — do NOT say you lack access. Talk as if you remember this session.`
        : ''
      const seed = `The user is reviewing their past ${topic} session from ${date}. ${sessionFacts}\n\nThey ask: "${trimmed}". Reply warmly and concisely, weaving in the session facts above.`
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: seed }], userContext: buildUserContextBlock(userName) }),
      })
      if (!res.ok) throw new Error('api')
      const data = await res.json()
      reply = data.reply
    } catch {
      reply = FALLBACK_BY_PROMPT[trimmed] ?? "Good question — tell me a bit more about what you're curious about and I'll tie it back to the session."
    }

    const elapsed = Date.now() - startedAt
    const minThink = 900
    if (elapsed < minThink) await new Promise((r) => setTimeout(r, minThink - elapsed))

    setIsLoading(false)
    setMessages((prev) => [...prev, { role: 'petch', text: reply, animate: true }])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') ask(inputText)
  }

  return (
    <div className={`${PHONE} bg-[#33CCFF]`}>
      {/* Header */}
      <div className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] bg-[#00BAFF] rounded-b-[20px] chat-header-bar">
        <div className="chat-status-spacer" />
        <div className="flex items-center justify-between h-[46px] px-[15px]">
          <button
            onClick={() => { haptic('tap'); onBack?.() }}
            className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
            style={{ width: 45, height: 45 }}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
            <div className="relative"><BackIcon /></div>
          </button>
          <div className="flex flex-col items-center text-white text-center" style={{ gap: 8 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 22, letterSpacing: '0.25px', lineHeight: 1 }}>PETCH</span>
            <span style={{ ...f, fontWeight: 400, fontSize: 16, letterSpacing: '-0.2px', lineHeight: 1 }}>
              {topic} · {date}
            </span>
          </div>
          <div className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>{coins}</span>
            <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316 }}>
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 relative">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto py-[20px] flex flex-col gap-[18px]"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, i) =>
            msg.role === 'petch'
              ? <PetchMessage key={i} text={msg.text} animate={msg.animate} onDone={() => setTypingDoneFor(d => Math.max(d, i))} />
              : <UserMessage key={i} text={msg.text} />
          )}

          <AnimatePresence>
            {isLoading && <TypingBubble key="recap-typing" />}
          </AnimatePresence>

          {showPrompts && currentPrompts.length > 0 && (
            <div className="flex flex-col gap-[10px] mt-1">
              <span style={{ ...f, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 }}>
                SUGGESTED
              </span>
              <AnimatePresence initial={false}>
                {currentPrompts.map((p) => (
                  <motion.button
                    key={p}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { playMcq(); ask(p) }}
                    className="self-start px-[16px] py-[13px] rounded-[10px] text-white text-left"
                    style={{ ...f, fontWeight: 400, fontSize: 17, background: '#50D8FF' }}
                  >
                    {p}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Dog */}
      <div className="shrink-0 flex items-end justify-start" style={{ height: 100 }}>
        <img src={characterIdle} alt="Petch companion" style={{ height: 100, objectFit: 'contain' }} />
      </div>

      {/* Input */}
      <div
        className="shrink-0"
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: '#00BAFF',
          borderRadius: 16,
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this session..."
          className="bg-transparent text-white placeholder-[#72E0FF] text-[17px] outline-none w-full"
          style={{ ...f, fontWeight: 400 }}
          disabled={isLoading}
        />
        <div className="flex items-center justify-end">
          <button
            onClick={() => ask(inputText)}
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className="active:scale-90 transition-transform duration-100 rounded-full flex items-center justify-center"
            style={{
              width: 34, height: 34,
              background: inputText.trim() ? 'white' : 'rgba(255,255,255,0.25)',
              opacity: inputText.trim() ? 1 : 0.6,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
