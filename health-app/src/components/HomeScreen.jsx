import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHONE, SendIcon } from '../utils/frame.jsx'
import { playMcq, playNext } from '../utils/sounds'
import { haptic } from '../utils/haptics'
import coinSvg from '../assets/coin.svg'
import characterIdle from '../assets/animation/character-idle.gif'
import characterIdleClicked from '../assets/animation/character-idle-clicked.gif'
import StreakBar from './StreakBar.jsx'
import TypingBubble from './TypingBubble.jsx'

const TOPICS = ['Sleep', 'Nutrition', 'Exercise']
const CHECKIN_REGEX = /check[\s-]?in/i

// ── Hamburger icon ────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"  width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13" width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

// ── Mic icon ─────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-label="Voice input">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  )
}

// ── Add icon ──────────────────────────────────────────────────────
function AddIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-label="Attach">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  )
}

// Phase 0 — mood check
const MOOD_REPLIES = [
  'Excited!',
  'Tired from School',
  'Feeling like learning about my health!',
]

// Phase 1 — check-in prompt (after Petch responds to mood)
const CHECKIN_REPLIES = [
  'Yes!',
  "Later! I'll be back",
]

// ── Post-check-in conversation state ─────────────────────────────
// The App passes `postCheckInPhase` after the user finishes today's
// check-in. HomeScreen maps it into a `chatMode` that drives the
// welcome message + quick-reply chips + chip click behaviour.
const WELCOME_MESSAGE =
  "Welcome back to Petch! It's been a while, Nick! Hope you're ready to learn more about your health. Tell me, how've you been?"
const DONE_MESSAGE =
  "Nice work, Nick — you already did your check-in today! Want a quick look at what we learned?"
const DONE_NOTHANKS_MESSAGE =
  "Cool, I'll check in with you tomorrow. Let's look at other things you could do today!"
const RETURNED_MESSAGE =
  "Oh, that was fast! The more you share about your health, the better I can help. Want to tell me a bit more?"

const DONE_REPLIES = ['Full summary', "Today's summary", "No thanks, I'm good"]
const DONE_NOTHANKS_REPLIES = ['Read an article', 'Start a new mission', 'Complete a mission']
const RETURNED_REPLIES = ['How I slept last night', 'What I ate today', 'How active I was']

const MODE_MESSAGES = {
  normal:            WELCOME_MESSAGE,
  done:              DONE_MESSAGE,
  'done-nothanks':   DONE_NOTHANKS_MESSAGE,
  returned:          RETURNED_MESSAGE,
}
const MODE_REPLIES = {
  normal:            MOOD_REPLIES,
  done:              DONE_REPLIES,
  'done-nothanks':   DONE_NOTHANKS_REPLIES,
  returned:          RETURNED_REPLIES,
}

// ── Status bar with animated streaming text ──────────────────────
function StatusBar({ isLoading, hasMessages, phase }) {
  const statusText = isLoading
    ? 'Thinking...'
    : phase === 1
      ? "Riley's excited to see you!"
      : hasMessages
        ? 'Waiting Patiently...'
        : ''
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!statusText) return

    let idx = 0
    const interval = setInterval(() => {
      idx++
      setDisplayed(statusText.slice(0, idx))
      if (idx >= statusText.length) clearInterval(interval)
    }, 40) // ~40ms per char for streaming effect

    return () => clearInterval(interval)
  }, [statusText])

  return (
    <>
      {displayed}
      {isLoading && displayed.length < statusText.length && (
        <span className="inline-block w-[2px] h-[16px] bg-[#72E0FF] ml-[2px] align-middle animate-pulse" />
      )}
    </>
  )
}

// Typewriter hook — returns the visible slice of `text`, starts after `delay` ms
function useTypewriter(text, delay = 1500, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let idx = 0
    let timer

    const start = setTimeout(() => {
      timer = setInterval(() => {
        idx++
        setDisplayed(text.slice(0, idx))
        if (idx >= text.length) {
          clearInterval(timer)
          setDone(true)
        }
      }, speed)
    }, delay)

    return () => { clearTimeout(start); clearInterval(timer) }
  }, [text, delay, speed])

  return { displayed, done }
}

// ── Scroll nearest scrollable ancestor to the bottom ─────────────
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

// ── Chat message bubble ───────────────────────────────────────────
function PetchMessage({ text, animate = false }) {
  const { displayed } = useTypewriter(animate ? text : '', 0, 28)
  const shown = animate ? displayed : text
  const ref = useRef(null)

  // Follow the typewriter as it types — keep latest text in view
  useLayoutEffect(() => {
    scrollAncestorToBottom(ref.current)
  }, [shown])

  return (
    <div ref={ref} className="flex flex-col gap-[6px] pr-[40px]">
      <p
        className="text-white text-[18px] leading-snug"
        style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 400 }}
      >
        {shown}
        {animate && shown.length < text.length && (
          <span className="inline-block w-[2px] h-[18px] bg-white ml-[2px] align-middle animate-pulse" />
        )}
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
          style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 400 }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

// ── Main HomeScreen ───────────────────────────────────────────────
export default function HomeScreen({
  onCheckIn,
  onTopicConfirm,
  menuOpen = false,
  onMenuOpen,
  onMenuClose,
  fadeIn = false,
  postCheckInPhase = null,
  onPostCheckInNavigate,
  onSummaryNavigate,
  streakCount = 0,
  streakPct = 0,
  streakNext = 3,
  streakBumped = false,
}) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Chat messages — each: { role: 'petch'|'user', text, animate? }
  const [messages, setMessages]       = useState([])
  const [showReplies, setShowReplies] = useState(false)
  const [inputText, setInputText]     = useState('')
  const [isLoading, setIsLoading]     = useState(false)
  const [petClicked, setPetClicked]   = useState(false)
  // 0 = mood question, 1 = check-in prompt
  const [phase, setPhase]             = useState(0)
  const [leaving, setLeaving]         = useState(false)

  // ── Check-in card state ──────────────────────────────────────────
  const [cardExpanded, setCardExpanded] = useState(false)
  const [topicSelected, setTopicSelected] = useState(null)

  // ── Chat mode — what message + chips to show on mount ──────────
  // 'normal' → fresh (mood question → check-in prompt)
  // 'done'   → just finished check-in (summary chips)
  // 'returned' → came back from Community/Missions post-check-in
  // 'done-nothanks' → transitioned in-session after "No thanks"
  const [chatMode, setChatMode] = useState(() => {
    if (postCheckInPhase === 'done') return 'done'
    if (postCheckInPhase === 'returned') return 'returned'
    return 'normal'
  })

  const scrollRef    = useRef(null)
  const inputRef     = useRef(null)
  const petClickTimer = useRef(null)

  // Typewriter for the first petch message — runs once on mount
  const [firstMsgDone, setFirstMsgDone] = useState(false)

  // ── On mount: delay then start typing welcome (depends on mode) ─
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ role: 'petch', text: MODE_MESSAGES[chatMode], animate: true }])
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  // ── When typewriter finishes, reveal quick replies ────────────
  useEffect(() => {
    if (messages.length === 1 && messages[0].animate) {
      const text = messages[0].text
      const totalTime = 1500 + text.length * 28 + 300
      const t = setTimeout(() => {
        setShowReplies(true)
        setFirstMsgDone(true)
      }, totalTime - 1500)
      return () => clearTimeout(t)
    }
  }, [messages])

  // ── Auto-scroll to bottom whenever messages change ────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, showReplies])

  // ── Open the check-in card (card expand interaction) ──────────
  function openCheckInCard() {
    setShowReplies(false)
    setInputText('')
    setTopicSelected(null)
    setCardExpanded(true)
  }

  function handleCardClose() {
    setCardExpanded(false)
    setTopicSelected(null)
    // After the close animation finishes, reset chat to the initial welcome
    setTimeout(() => {
      setPhase(0)
      setShowReplies(false)
      setFirstMsgDone(false)
      setMessages([])
      setInputText('')
      // Re-trigger the welcome typing sequence (same logic as initial mount)
      setTimeout(() => {
        setMessages([{ role: 'petch', text: WELCOME_MESSAGE, animate: true }])
      }, 400)
    }, 640)
  }

  function handlePlusToggle() {
    if (cardExpanded) {
      handleCardClose()
    } else {
      openCheckInCard()
    }
  }

  function handleTopicPick(topic) {
    playMcq()
    setTopicSelected(topic)
  }

  function handleConfirmTopic() {
    if (!topicSelected) return
    playNext()
    onTopicConfirm?.(topicSelected)
  }

  // Route a chip click based on the current chat mode.
  function handleChipClick(reply) {
    // Normal mood / check-in chips fall through to the existing
    // sendMessage flow (API call + phase transitions).
    if (chatMode === 'normal') {
      sendMessage(reply)
      return
    }

    // "Done" state — user just finished a check-in.
    if (chatMode === 'done') {
      if (reply === 'Full summary')           { onSummaryNavigate?.('fullOverview'); return }
      if (reply === "Today's summary")        { onSummaryNavigate?.('log');          return }
      if (reply === "No thanks, I'm good")    {
        // Transition the chat in place to the follow-up prompt.
        setMessages(prev => [...prev, { role: 'user', text: reply }])
        setShowReplies(false)
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { role: 'petch', text: DONE_NOTHANKS_MESSAGE, animate: true },
          ])
          setChatMode('done-nothanks')
          // Reveal the new chip set after the typewriter finishes
          setTimeout(() => setShowReplies(true), DONE_NOTHANKS_MESSAGE.length * 28 + 400)
        }, 360)
        return
      }
    }

    // "Done → No thanks" — pick one of three things to do today.
    if (chatMode === 'done-nothanks') {
      if (reply === 'Read an article')       { onPostCheckInNavigate?.('community'); return }
      // Both mission chips go to the Missions screen for now.
      if (reply === 'Start a new mission')   { onPostCheckInNavigate?.('missions');  return }
      if (reply === 'Complete a mission')    { onPostCheckInNavigate?.('missions');  return }
    }

    // "Returned" state — back from Community/Missions, Petch is
    // asking for more health info.
    if (chatMode === 'returned') {
      // Log the pick and have Petch ask for details. Keeping this
      // demo-simple — no real data capture yet.
      setMessages(prev => [...prev, { role: 'user', text: reply }])
      setShowReplies(false)
      setTimeout(() => {
        const followup = `Nice — tell me more about "${reply.toLowerCase()}". The more specific the better!`
        setMessages(prev => [...prev, { role: 'petch', text: followup, animate: true }])
      }, 400)
    }
  }

  // ── Send a message (quick reply or typed) ─────────────────────
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return

    // "check-in" keyword anywhere in user input → expand card
    if (CHECKIN_REGEX.test(text)) {
      setMessages(prev => [...prev, { role: 'user', text }])
      openCheckInCard()
      return
    }

    // Phase 1 special handling — check-in decision
    if (phase === 1) {
      if (text === 'Yes!') {
        setMessages(prev => [...prev, { role: 'user', text }])
        openCheckInCard()
        return
      }
      if (text === "Later! I'll be back") {
        setShowReplies(false)
        setMessages(prev => [
          ...prev,
          { role: 'user', text },
          { role: 'petch', text: "No worries! I'll be here when you're ready. Come back anytime 🐾", animate: true },
        ])
        return
      }
    }

    setShowReplies(false)
    setInputText('')
    const userMsg = { role: 'user', text }
    const isFirstUserMsg = phase === 0
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    const loadingStartedAt = Date.now()

    let reply = ''
    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'petch' ? 'assistant' : 'user',
        content: m.text,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      reply = data.reply
    } catch {
      // Fallback response when API isn't available — contextual to the mood
      if (isFirstUserMsg) {
        const lower = text.toLowerCase()
        if (lower.includes('tired') || lower.includes('school') || lower.includes('study')) {
          reply = "Yep, we totally get that! Uni finals are no joke. Even a short break to learn something for yourself can help reset your mind. Want to do a quick check-in and get that reward?"
        } else if (lower.includes('excited')) {
          reply = "Love that energy! Let's make the most of it. Want to kick off today's check-in and see what's on the agenda for your health?"
        } else {
          reply = "That's good to hear! Ready to dive into today's check-in? It only takes a few minutes and you'll earn coins for completing it!"
        }
      } else {
        reply = "Sounds good! I'm always here when you need me."
      }
    } finally {
      const elapsed = Date.now() - loadingStartedAt
      const minThink = 900
      if (elapsed < minThink) {
        await new Promise(r => setTimeout(r, minThink - elapsed))
      }
      setIsLoading(false)
    }

    setMessages(prev => [...prev, { role: 'petch', text: reply, animate: true }])

    // After typing finishes, advance phase and show next quick replies
    const replyTime = reply.length * 28 + 400
    setTimeout(() => {
      if (isFirstUserMsg) setPhase(1)
      setShowReplies(true)
    }, replyTime)
  }

  function handlePetTap() {
    if (petClickTimer.current) clearTimeout(petClickTimer.current)
    setPetClicked(true)
    petClickTimer.current = setTimeout(() => setPetClicked(false), 3200)
  }

  function handleSend() {
    sendMessage(inputText)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={`${PHONE} bg-[#33CCFF]`}
      style={{
        transform: menuOpen ? 'translateX(279px)' : 'translateX(0)',
        transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        ...(fadeIn && { animation: 'fade-in 0.3s ease forwards' }),
      }}
    >
      {/* Dim overlay when menu is open */}
      <div
        onClick={onMenuClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(0, 116, 184, 0.55)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.32s ease',
        }}
      />

      {/* ══ HEADER — 122px total, matches Figma node 2043:2529 ═══════ */}
      <div
        className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] bg-[#00BAFF] rounded-b-[20px]"
        style={{ height: 122 }}
      >
        {/* Status bar spacer — content row starts at top:61px in Figma */}
        <div style={{ height: 61 }} />

        {/* Content row — 46px tall, px-15px, matches Figma exactly */}
        <div className="flex items-center justify-between h-[46px] px-[15px]">

          {/* Hamburger — 45×45 circle */}
          <button
            onClick={onMenuOpen}
            className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
            style={{ width: 45, height: 45 }}
          >
            {/* Circle bg — semi-transparent white */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            />
            {/* Icon — 19×14px */}
            <div className="relative" style={{ width: 19, height: 14 }}>
              <HamburgerIcon />
            </div>
          </button>

          {/* Centre: PETCH + date — gap 10px as per Figma */}
          <div
            className="flex flex-col items-center text-white text-center"
            style={{ gap: 10 }}
          >
            <span
              style={{
                fontFamily: "'DIN Next Rounded', sans-serif",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: '0.25px',
                lineHeight: 1,
              }}
            >
              PETCH
            </span>
            {cardExpanded ? (
              <span
                className="flex items-center"
                style={{ gap: 3, height: 20 }}
              >
                <span style={{
                  fontFamily: "'DIN Next Rounded', sans-serif",
                  fontWeight: 400, fontSize: 18,
                  letterSpacing: '-0.2px', lineHeight: 1,
                  opacity: 0.9,
                }}>
                  Selecting Topic
                </span>
                {/* Dots start AFTER the card finishes expanding (~700ms) */}
                <span className="flex items-end" style={{ gap: 2.5, paddingBottom: 1, animation: 'fade-in 0.3s ease 0.7s both' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)',
                      display: 'inline-block',
                      animation: `typing-dot 0.9s ease-in-out ${0.7 + i * 0.2}s infinite`,
                    }} />
                  ))}
                </span>
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "'DIN Next Rounded', sans-serif",
                  fontWeight: 400,
                  fontSize: 20,
                  letterSpacing: '-0.2px',
                  lineHeight: 1,
                }}
              >
                {today}
              </span>
            )}
          </div>

          {/* Coin badge — #33CCFF bg, p-5px, gap 2.5px, rounded-4px */}
          <div
            className="flex items-center shrink-0 rounded-[4px] overflow-hidden"
            style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}
          >
            <span
              style={{
                fontFamily: "'DIN Next Rounded', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: 'white',
                lineHeight: 1,
              }}
            >
              10
            </span>
            {/* 15.316px coin circle — gold */}
            <div
              className="rounded-full shrink-0 overflow-hidden"
              style={{ width: 15.316, height: 15.316, background: '#F5C542', position: 'relative' }}
            >
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

        </div>
      </div>

      {/* ══ CHAT AREA ═ shares space with topic-frame overlay ═══════ */}
      <div className="flex-1 min-h-0 relative">
        {/* Chat messages + quick replies — fade out when card expands */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto py-[20px] flex flex-col gap-[18px]"
          style={{
            scrollBehavior: 'smooth',
            opacity: cardExpanded ? 0 : 1,
            pointerEvents: cardExpanded ? 'none' : 'auto',
            transition: 'opacity 220ms ease',
          }}
        >
          {messages.map((msg, i) =>
            msg.role === 'petch'
              ? <PetchMessage key={i} text={msg.text} animate={!!msg.animate} />
              : <UserMessage  key={i} text={msg.text} />
          )}

          <AnimatePresence>
            {isLoading && <TypingBubble key="petch-typing" />}
          </AnimatePresence>

          {/* Quick reply buttons — set depends on the current chat mode */}
          {showReplies && (
            <div className="flex flex-col gap-[14px]">
              {(chatMode === 'normal'
                ? (phase === 0 ? MOOD_REPLIES : CHECKIN_REPLIES)
                : (MODE_REPLIES[chatMode] ?? [])
              ).map(reply => (
                <button
                  key={reply}
                  onClick={() => handleChipClick(reply)}
                  className="self-start px-[16px] py-[13px] rounded-[10px] text-white text-[17px] text-left
                             active:scale-[0.97] transition-transform duration-100"
                  style={{
                    background: '#50D8FF',
                    fontFamily: "'DIN Next Rounded', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── TOPIC FRAME OVERLAY — dog + bubble + progress bar ── */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: cardExpanded ? 1 : 0,
            pointerEvents: cardExpanded ? 'auto' : 'none',
            transition: cardExpanded
              ? 'opacity 320ms ease 520ms'
              : 'opacity 160ms ease',
          }}
        >
          {/* Dog + chat bubble — top. Dog is 125px to match every other screen. */}
          <div className="flex items-start gap-3 pt-4">
            <img
              src={characterIdle}
              alt="Petch"
              className="shrink-0"
              style={{ height: 125, objectFit: 'contain' }}
            />
            <p
              className="text-white pt-2 flex-1"
              style={{
                fontFamily: "'DIN Next Rounded', sans-serif",
                fontWeight: 400, fontSize: 17,
                lineHeight: 1.4,
              }}
            >
              Before we start pick a topic to learn about! We've curated 3 for you to start with!
            </p>
          </div>

          {/* Progress bar — pinned above the card */}
          <div className="mt-auto pb-3 flex items-center gap-[10px]">
            <div className="flex-1 relative rounded-[10px] overflow-hidden" style={{ height: 20, background: '#00BAFF' }}>
              <div
                className="absolute left-0 top-0 h-full rounded-[10px] transition-all duration-500"
                style={{ width: `${topicSelected ? 10 : 0}%`, background: '#72E0FF' }}
              >
                <div className="absolute inset-[3.5px_4px] flex gap-[3px]">
                  <div className="flex-1 h-full rounded-[10px]" style={{ background: '#9AE9FF' }} />
                  <div className="shrink-0 h-full rounded-[10px]" style={{ width: 10, background: '#9AE9FF' }} />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 700, fontSize: 14, color: '#72E0FF', letterSpacing: '0.5px' }}>
                  {topicSelected ? 10 : 0}%
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 35, height: 35, background: '#F5C542' }}>
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ DOG + STATUS ═ collapses when check-in card expands ═════ */}
      <div
        className="shrink-0 w-full overflow-hidden"
        style={{
          maxHeight: cardExpanded ? 0 : 400,
          opacity: cardExpanded ? 0 : 1,
          transition: 'max-height 640ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease',
          ...(leaving ? { animation: 'fade-out-down 0.3s ease forwards' } : {}),
        }}
      >

        {/* Dog — 125px tall, left-aligned. Gentle breathing loop + tap reaction. */}
        <div
          className="cursor-pointer flex items-end justify-start"
          style={{ height: 125 }}
          onClick={() => { haptic('tap'); handlePetTap() }}
        >
          <img src={characterIdleClicked} aria-hidden="true" style={{ display: 'none' }} />
          <motion.img
            src={petClicked ? characterIdleClicked : characterIdle}
            alt="Petch companion"
            animate={
              petClicked
                ? { scale: [1, 0.92, 0.97], y: [0, 4, 0] }
                : isLoading
                  ? { y: [0, -4, 0], rotate: [0, -2, 2, 0] }
                  : { y: [0, -3, 0] }
            }
            transition={
              petClicked
                ? { duration: 0.35, ease: 'easeOut' }
                : isLoading
                  ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{
              height: 125,
              objectFit: 'contain',
              objectPosition: 'bottom left',
              transformOrigin: 'left bottom',
            }}
          />
        </div>

        {/* Status bar — streak replaces the "waiting patiently" line
           whenever a streak is active; otherwise falls back to the
           original typewriter status text. */}
        <div
          className="py-[8px] text-[#72E0FF]"
          style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 400, fontSize: 20, minHeight: 36 }}
        >
          {streakCount > 0 && !isLoading ? (
            <StreakBar count={streakCount} pct={streakPct} nextMilestone={streakNext} justIncremented={streakBumped} />
          ) : (
            <StatusBar isLoading={isLoading} hasMessages={messages.length > 0} phase={phase} />
          )}
        </div>

      </div>

      {/* ══ CHECK-IN CARD ═ collapsed = input bar, expanded = topic picker
         Expanded size matches the ManagementFrame card — a compact block
         floating above the home-indicator safe area, not a full-height
         sheet. The wrapper's mb-4 lets the screen bg (#33CCFF) show below. */}
      <div
        className={`shrink-0 ${cardExpanded ? 'mb-4' : 'mb-[2px]'} relative overflow-hidden ${cardExpanded ? 'card-expanded rounded-[12.5px]' : 'rounded-[14px]'}`}
        style={{
          background: '#00BAFF',
          height: cardExpanded ? 'min(360px, calc(var(--vvh, 100dvh) - 340px))' : 82,
          transition: 'height 640ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 320ms ease, margin-bottom 320ms ease',
          ...(leaving ? { animation: 'shoot-up 0.4s cubic-bezier(0.4,0,0.2,1) forwards' } : {}),
        }}
      >
        {/* ── Expanded content — fills the entire card when open ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            opacity: cardExpanded ? 1 : 0,
            pointerEvents: cardExpanded ? 'auto' : 'none',
            transition: cardExpanded
              ? 'opacity 240ms ease 280ms'
              : 'opacity 160ms ease',
          }}
        >
          {/* Header — matches original: "Select a topic" + ✕ */}
          <div
            className="flex items-center justify-between"
            style={{
              marginBottom: 16,
              opacity: cardExpanded ? 1 : 0,
              transform: cardExpanded ? 'translateY(0)' : 'translateY(6px)',
              transition: cardExpanded
                ? 'opacity 320ms ease 520ms, transform 320ms cubic-bezier(0.22,1,0.36,1) 520ms'
                : 'none',
            }}
          >
            <span
              className="text-white"
              style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 400, fontSize: 18, letterSpacing: '-0.25px' }}
            >
              Select a topic
            </span>
            <button
              onClick={handleCardClose}
              aria-label="Close check-in"
              className="text-white active:opacity-60 transition-opacity"
              style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Prompt */}
          <p
            className="text-white"
            style={{
              fontFamily: "'DIN Next Rounded', sans-serif",
              fontWeight: 400, fontSize: 20,
              letterSpacing: '-0.25px', lineHeight: 1.35,
              marginBottom: 16,
              opacity: cardExpanded ? 1 : 0,
              transform: cardExpanded ? 'translateY(0)' : 'translateY(6px)',
              transition: cardExpanded
                ? 'opacity 320ms ease 580ms, transform 320ms cubic-bezier(0.22,1,0.36,1) 580ms'
                : 'none',
            }}
          >
            Select the topic you'd want to understand about yourself today!
          </p>

          {/* Topic list — matches original: #33CCFF badge, no chevron */}
          <div className="flex flex-col">
            {TOPICS.map((topic, i) => {
              const isSel = topicSelected === topic
              const delay = 660 + i * 70
              return (
                <div key={topic}
                  style={{
                    opacity: cardExpanded ? 1 : 0,
                    transform: cardExpanded ? 'translateY(0)' : 'translateY(6px)',
                    transition: cardExpanded
                      ? `opacity 320ms ease ${delay}ms, transform 320ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`
                      : 'none',
                  }}
                >
                  <button
                    onClick={() => handleTopicPick(topic)}
                    className="w-full flex items-center active:opacity-80 transition-opacity"
                    style={{
                      gap: 15,
                      height: 40,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center rounded-[20px] transition-colors duration-200"
                      style={{
                        width: 40, height: 40,
                        background: isSel ? 'white' : '#33CCFF',
                      }}
                    >
                      <span style={{
                        fontFamily: "'DIN Next Rounded', sans-serif",
                        fontWeight: isSel ? 700 : 400, fontSize: 18,
                        letterSpacing: '-0.25px',
                        color: isSel ? '#00BAFF' : 'white',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span
                      className="flex-1 text-left text-white transition-all"
                      style={{
                        fontFamily: "'DIN Next Rounded', sans-serif",
                        fontWeight: isSel ? 600 : 400, fontSize: 18,
                        letterSpacing: '-0.25px',
                      }}
                    >
                      {topic}
                    </span>
                  </button>
                  <div className="w-full" style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '6px 0' }} />
                </div>
              )
            })}
          </div>

          {/* Footer slot — "Waiting..." while no pick, LET'S GO once picked.
             Same vertical footprint either way so the card doesn't jump. */}
          <div style={{ marginTop: 'auto', paddingTop: 16, height: 56 }}>
            {topicSelected ? (
              <button
                onClick={handleConfirmTopic}
                className="w-full h-10 rounded-full text-white active:opacity-80 transition-opacity"
                style={{
                  fontFamily: "'DIN Next Rounded', sans-serif",
                  fontWeight: 600, fontSize: 18,
                  letterSpacing: '-0.25px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer',
                  animation: 'fade-slide-up 0.2s ease forwards',
                }}
              >
                LET'S GO →
              </button>
            ) : (
              <div
                className="flex items-center justify-center text-white w-full h-10"
                style={{
                  fontFamily: "'DIN Next Rounded', sans-serif",
                  fontWeight: 400, fontSize: 15,
                  letterSpacing: '-0.2px',
                  color: 'rgba(255,255,255,0.65)',
                  gap: 6,
                }}
              >
                Waiting for your pick
                <span className="flex items-end" style={{ gap: 3, paddingBottom: 2 }}>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.7)',
                        display: 'inline-block',
                        animation: `typing-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Input row — only visible when card is collapsed. The card
             IS the input when collapsed; when expanded the topic content
             fills the whole card instead (no input / no send / no faint
             line at the bottom). */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            height: 82,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#00BAFF',
            opacity: cardExpanded ? 0 : 1,
            pointerEvents: cardExpanded ? 'none' : 'auto',
            transition: cardExpanded
              ? 'opacity 200ms ease'
              : 'opacity 240ms ease 260ms',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            className="bg-transparent text-white placeholder-[#72E0FF] text-[18px] outline-none w-full"
            style={{ fontFamily: "'DIN Next Rounded', sans-serif", fontWeight: 400 }}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlusToggle}
              aria-label={cardExpanded ? 'Close check-in' : 'Start check-in'}
              className="active:scale-90 transition-transform duration-100 p-[2px]"
              style={{
                transform: cardExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <AddIcon />
            </button>
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                aria-label="Voice input"
                className="active:scale-90 transition-transform duration-100 p-[2px]"
                style={{
                  opacity: cardExpanded ? 0 : 1,
                  pointerEvents: cardExpanded ? 'none' : 'auto',
                  transition: 'opacity 220ms ease',
                }}
              >
                <MicIcon />
              </button>
              <button
                type="button"
                onClick={handleSend}
                aria-label="Send message"
                disabled={!inputText.trim() || isLoading}
                className="active:scale-90 transition-transform duration-100 disabled:opacity-50"
              >
                <SendIcon color="#00BAFF" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
