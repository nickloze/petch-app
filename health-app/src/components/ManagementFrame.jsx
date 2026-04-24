import { useState, useRef, useEffect } from 'react'
import characterIdle from '../assets/animation/character-idle.gif'
import coinSvg       from '../assets/coin.svg'
import { PHONE }     from '../utils/frame.jsx'
import { playMcq }   from '../utils/sounds'
import QuitConfirmSheet from './QuitConfirmSheet.jsx'

// ── Question pools ──────────────────────────────────────────────
const TOPIC_POOLS = {
  Sleep: [
    { id:'p1', question:'How many hours of sleep did you get last night?',  options:['More than 8 hours','6–8 hours','Less than 6 hours'] },
    { id:'p2', question:'What time did you go to bed last night?',          options:['Before 10 PM','10 PM – Midnight','After Midnight'] },
    { id:'p3', question:'How would you rate your sleep quality?',           options:['Excellent','Average','Poor'] },
    { id:'p4', question:'Do you wake up feeling rested?',                   options:['Always','Sometimes','Rarely'] },
  ],
  Nutrition: [
    { id:'n1', question:'How many meals or snacks do you eat on a typical day?',       options:['5 or more','3–4 meals','1–2 or I often skip'] },
    { id:'n2', question:'How many servings of fruit and veg do you eat daily?',        options:['5 or more','3–4 servings','1–2 or less'] },
    { id:'n3', question:'How often do you eat processed or packaged food?',             options:['Rarely','A few times a week','Most days'] },
    { id:'n4', question:'When you eat, how present are you with your food?',            options:['I eat mindfully','Sometimes','I usually eat while scrolling'] },
  ],
  Exercise: [
    { id:'e1', question:'How many times per week do you exercise?',          options:['4+ times','2–3 times','0–1 times'] },
    { id:'e2', question:'What type of activity do you mostly do?',           options:['Cardio','Strength training','I mix it up'] },
    { id:'e3', question:'How long is a typical exercise session?',           options:['45 min or more','20–45 min','Under 20 min'] },
    { id:'e4', question:'How do you feel after exercising?',                 options:['Energised','About the same','Exhausted'] },
  ],
}

const TOTAL_STEPS   = 9
const KNOWING_START = 1  // topic selection already counted as step 1

const QUIRKY_LABELS = [
  'Figuring it out...',
  'Connecting dots...',
  'Processing that...',
  'Hmm, interesting...',
  'Noting that down...',
  'Thinking hard...',
]

const ACK_MESSAGES = [
  'Got it!',
  'Interesting!',
  'Makes sense!',
  'Good to know!',
  'Noted!',
  'Okay, got it!',
]

const DIN = { fontFamily: "'DIN Next Rounded', sans-serif" }

// ── Shared sub-components ────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"   width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13"  width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

function Header({ subtitle, onMenu }) {
  return (
    <div
      className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] bg-[#00BAFF] rounded-b-[20px] chat-header-bar"
    >
      <div className="chat-status-spacer" />
      <div className="flex items-center justify-between h-[46px] px-[15px]">

        <button
          onClick={onMenu}
          className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
          style={{ width: 45, height: 45 }}
        >
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
          <div className="relative" style={{ width: 19, height: 14 }}>
            <HamburgerIcon />
          </div>
        </button>

        <div className="flex flex-col items-center text-white text-center" style={{ gap: 6 }}>
          <span style={{ ...DIN, fontWeight: 700, fontSize: 24, letterSpacing: '0.25px', lineHeight: 1 }}>
            PETCH
          </span>
          <span className="flex items-center" style={{ gap: 3 }}>
            <span style={{ ...DIN, fontWeight: 400, fontSize: 16, letterSpacing: '-0.2px', lineHeight: 1, opacity: 0.85 }}>
              {subtitle.endsWith('...') ? subtitle.slice(0, -3) : subtitle}
            </span>
            {subtitle.endsWith('...') && (
              <span className="flex items-end" style={{ gap: 2.5, paddingBottom: 1 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'inline-block', animation: `typing-dot 0.9s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            )}
          </span>
        </div>

        <div
          className="flex items-center shrink-0 rounded-[4px] overflow-hidden"
          style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}
        >
          <span style={{ ...DIN, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>10</span>
          <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316, background: '#F5C542' }}>
            <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

      </div>
    </div>
  )
}

function TypingBubble({ label }) {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      <span style={{ ...DIN, fontSize: 16, color: '#72E0FF' }}>{label}</span>
      <div className="flex items-end" style={{ gap: 3 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 5, height: 5, borderRadius: '50%', background: '#72E0FF',
              animation: `typing-dot 0.9s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function ManagementFrame({ topic = 'Sleep', onComplete, onRestart }) {
  const questions = TOPIC_POOLS[topic] ?? TOPIC_POOLS.Sleep

  // Use refs to avoid stale closures inside setTimeout
  const answersByIndexRef = useRef({})
  const answersByIdRef    = useRef({})

  const [qIndex,        setQIndex]        = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [chatHistory,   setChatHistory]   = useState([])
  const [typing,        setTyping]        = useState(false)
  const [typingLabel,   setTypingLabel]   = useState('')
  const [locked,        setLocked]        = useState(false)
  const [showQuit,      setShowQuit]      = useState(false)
  const chatEndRef = useRef(null)

  // Opening message once the layout paints
  useEffect(() => {
    const t = setTimeout(() => {
      setChatHistory([{
        role: 'petch',
        text: `Alright! To personalise your ${topic.toLowerCase()} insights, I've got 4 quick questions. Answer honestly — no wrong answers here!`,
      }])
    }, 280)
    return () => clearTimeout(t)
  }, [topic])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, typing])

  const progress = (KNOWING_START + answeredCount) / TOTAL_STEPS
  const current  = questions[qIndex]

  function handleBack() {
    if (qIndex === 0 || locked) return
    const prevIndex = qIndex - 1
    delete answersByIndexRef.current[prevIndex]
    delete answersByIdRef.current[questions[prevIndex].id]
    setAnsweredCount(c => c - 1)
    setChatHistory(prev => prev.slice(0, -2)) // remove user bubble + petch ack
    setQIndex(prevIndex)
    setLocked(false)
  }

  function handleAnswer(option) {
    if (locked) return
    playMcq()
    setLocked(true)

    // Record answer in refs immediately (safe in setTimeout)
    answersByIndexRef.current[qIndex] = option
    answersByIdRef.current[current.id] = option

    const newAnsweredCount = answeredCount + 1
    setAnsweredCount(newAnsweredCount)

    // User bubble appears instantly
    setChatHistory(prev => [...prev, { role: 'user', text: option }])

    // Typing indicator
    const label = QUIRKY_LABELS[Math.floor(Math.random() * QUIRKY_LABELS.length)]
    setTyping(true)
    setTypingLabel(label)

    const isLast = qIndex === questions.length - 1

    setTimeout(() => {
      setTyping(false)

      if (isLast) {
        setChatHistory(prev => [...prev, {
          role: 'petch',
          text: `Perfect! I've noted everything down. Now let's get learning about your ${topic.toLowerCase()}!`,
        }])
        setTimeout(() => {
          onComplete(
            { ...answersByIdRef.current },
            { ...answersByIndexRef.current },
          )
        }, 700)
      } else {
        const ack = ACK_MESSAGES[Math.floor(Math.random() * ACK_MESSAGES.length)]
        setChatHistory(prev => [...prev, { role: 'petch', text: ack }])
        setTimeout(() => {
          setQIndex(i => i + 1)
          setLocked(false)
        }, 320)
      }
    }, 1300)
  }

  return (
    <div className={`${PHONE} bg-[#50CFFF] flex flex-col`}>

      <Header subtitle="Understanding..." onMenu={() => setShowQuit(true)} />

      {/* ── Chat area: dog left (fixed), messages right (scrollable) ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 pt-4 gap-3">

        {/* Dog — stays in view always. 125px tall to match every other screen. */}
        <div className="shrink-0">
          <img
            src={characterIdle}
            alt="Riley"
            style={{ height: 125, objectFit: 'contain', animation: 'fade-in 0.35s ease forwards' }}
          />
        </div>

        {/* Messages — scroll independently */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2 pr-1">
          {chatHistory.map((msg, i) =>
            msg.role === 'user'
              ? (
                <div key={i} className="self-end" style={{ animation: 'fade-slide-up 0.2s ease forwards' }}>
                  <div style={{ background: '#00BAFF', borderRadius: 8, padding: '10px 15px' }}>
                    <span style={{ ...DIN, fontSize: 18, color: 'white', lineHeight: 1.35 }}>{msg.text}</span>
                  </div>
                </div>
              )
              : (
                <p
                  key={i}
                  style={{ ...DIN, fontSize: 18, color: 'white', lineHeight: 1.4, animation: 'fade-slide-up 0.25s ease forwards' }}
                >
                  {msg.text}
                </p>
              )
          )}
          {typing && <TypingBubble label={typingLabel} />}
          <div ref={chatEndRef} />
        </div>

      </div>

      {/* ── Progress bar ── */}
      <div className="pb-3 shrink-0 flex items-center gap-[10px]">
        <div className="flex-1 relative rounded-[10px] overflow-hidden" style={{ height: 20, background: '#00BAFF' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-[10px] transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%`, background: '#72E0FF' }}
          >
            <div className="absolute inset-[3.5px_4px] flex gap-[3px]">
              <div className="flex-1 h-full rounded-[10px]" style={{ background: '#9AE9FF' }} />
              <div className="shrink-0 h-full rounded-[10px]" style={{ width: 10, background: '#9AE9FF' }} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ ...DIN, fontWeight: 700, fontSize: 14, color: '#72E0FF', letterSpacing: '0.5px' }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
        <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 35, height: 35, background: '#F5C542' }}>
          <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* ── Bottom question card ── */}
      <div className="shrink-0 pb-4">
        <div
          className="bg-[#00BAFF] rounded-[12.5px] p-5 flex flex-col"
          key={qIndex}
          style={{ animation: locked ? 'none' : 'fade-slide-up 0.22s ease forwards', minHeight: 312 }}
        >

          {/* Counter + close */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-[10px]">
              {qIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="text-white active:opacity-60 transition-opacity"
                  style={{ ...DIN, fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px' }}
                >
                  ‹
                </button>
              )}
              <span style={{ ...DIN, fontWeight: 400, fontSize: 18, color: 'white', letterSpacing: '-0.25px' }}>
                {qIndex + 1} of {questions.length}
              </span>
            </div>
            <button
              onClick={() => setShowQuit(true)}
              className="text-white active:opacity-60 transition-opacity"
              style={{ ...DIN, fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px' }}
            >
              ✕
            </button>
          </div>

          {/* Question */}
          <p className="text-white mb-4" style={{ ...DIN, fontWeight: 400, fontSize: 20, letterSpacing: '-0.25px', lineHeight: 1.35, minHeight: 54 }}>
            {current.question}
          </p>

          {/* Options */}
          <div className="flex flex-col">
            {current.options.map((opt, i) => (
              <div key={opt}>
                <button
                  onClick={() => handleAnswer(opt)}
                  disabled={locked}
                  className="w-full flex items-center gap-[15px] active:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ height: 40 }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center rounded-[20px]"
                    style={{ width: 40, height: 40, background: '#33CCFF' }}
                  >
                    <span style={{ ...DIN, fontWeight: 400, fontSize: 18, color: 'white', letterSpacing: '-0.25px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span
                    className="flex-1 text-left text-white"
                    style={{ ...DIN, fontWeight: 400, fontSize: 18, letterSpacing: '-0.25px' }}
                  >
                    {opt}
                  </span>
                </button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '6px 0' }} />
              </div>
            ))}
          </div>

        </div>
      </div>

      {showQuit && <QuitConfirmSheet onQuit={onRestart} onStay={() => setShowQuit(false)} />}

    </div>
  )
}
