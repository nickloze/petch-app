import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHONE } from '../utils/frame.jsx'
import characterIdle from '../assets/animation/character-idle.gif'
import { playMcq, playNext } from '../utils/sounds'
import { haptic } from '../utils/haptics'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }
const KEY = 'petch_user'

export function hasOnboarded() {
  try { return !!JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return false }
}

export function saveUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

const QUESTIONS = [
  {
    key: 'ageRange',
    q: 'What age group are you in?',
    options: ['18–22', '23–26', '27–30', 'Other'],
  },
  {
    key: 'sleepSchedule',
    q: 'When do you usually get to bed?',
    options: ['Before 10pm', '10pm – midnight', 'After midnight'],
  },
  {
    key: 'biggestWorry',
    q: "What's on your mind most lately?",
    options: ['Energy / sleep', 'Eating habits', 'Movement', 'Stress'],
  },
]

const GOAL_OPTIONS = [
  { id: 'sleep',     label: 'Sleep better' },
  { id: 'nutrition', label: 'Eat better' },
  { id: 'exercise',  label: 'Move more' },
  { id: 'energy',    label: 'More daily energy' },
]

function Chip({ active, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="rounded-[12px] px-[16px] py-[14px] text-left"
      style={{
        background: active ? 'white' : 'rgba(255,255,255,0.18)',
        color: active ? '#0077A8' : 'white',
        fontFamily: f.fontFamily,
        fontSize: 17,
        fontWeight: active ? 700 : 400,
        border: active ? '2px solid white' : '2px solid rgba(255,255,255,0.25)',
      }}
    >
      {label}
    </motion.button>
  )
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0) // 0 account, 1-3 questions, 4 goals, 5 welcome
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState({})
  const [goals, setGoals] = useState([])

  function next() { playNext(); setStep((s) => s + 1) }
  function back() { haptic('tap'); setStep((s) => Math.max(0, s - 1)) }

  function finish() {
    playNext()
    haptic('commit')
    saveUser({ name: name || 'Friend', email, answers, goals, createdAt: Date.now() })
    onDone?.()
  }

  function renderStep() {
    if (step === 0) {
      const canNext = name.trim().length > 0
      return (
        <div className="flex flex-col h-full">
          <h1 style={{ ...f, fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>Welcome to Petch</h1>
          <p style={{ ...f, fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>
            Let's set up your account — it only takes a minute.
          </p>
          <label style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 }}>NAME</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should Petch call you?"
            className="navy-input rounded-[10px] px-[14px] py-[14px] mb-4 mt-1 bg-white/15 text-white outline-none"
            style={{ ...f, fontSize: 17, border: '1.5px solid rgba(255,255,255,0.3)' }}
          />
          <label style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 }}>EMAIL</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="navy-input rounded-[10px] px-[14px] py-[14px] mt-1 bg-white/15 text-white outline-none"
            style={{ ...f, fontSize: 17, border: '1.5px solid rgba(255,255,255,0.3)' }}
          />
          <div className="flex-1" />
          <button
            onClick={next}
            disabled={!canNext}
            className="w-full rounded-[12px] py-[16px]"
            style={{
              ...f, fontSize: 18, fontWeight: 700, color: '#0077A8',
              background: canNext ? 'white' : 'rgba(255,255,255,0.4)',
              opacity: canNext ? 1 : 0.6,
            }}
          >
            Continue
          </button>
        </div>
      )
    }

    if (step >= 1 && step <= QUESTIONS.length) {
      const q = QUESTIONS[step - 1]
      const picked = answers[q.key]
      return (
        <div className="flex flex-col h-full">
          <div style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 10 }}>
            GETTING TO KNOW YOU · {step}/{QUESTIONS.length}
          </div>
          <h2 style={{ ...f, fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 24 }}>
            {q.q}
          </h2>
          <div className="flex flex-col gap-[10px]">
            {q.options.map((opt) => (
              <Chip
                key={opt}
                active={picked === opt}
                label={opt}
                onClick={() => { playMcq(); setAnswers({ ...answers, [q.key]: opt }) }}
              />
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex gap-[10px]">
            <button onClick={back} className="rounded-[12px] py-[16px] px-[20px]" style={{ ...f, fontSize: 17, color: 'white', background: 'rgba(255,255,255,0.18)' }}>
              Back
            </button>
            <button
              onClick={next}
              disabled={!picked}
              className="flex-1 rounded-[12px] py-[16px]"
              style={{ ...f, fontSize: 18, fontWeight: 700, color: '#0077A8', background: picked ? 'white' : 'rgba(255,255,255,0.4)', opacity: picked ? 1 : 0.6 }}
            >
              Continue
            </button>
          </div>
        </div>
      )
    }

    if (step === QUESTIONS.length + 1) {
      const canNext = goals.length > 0
      function toggle(id) {
        playMcq()
        setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
      }
      return (
        <div className="flex flex-col h-full">
          <div style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 10 }}>
            YOUR GOALS
          </div>
          <h2 style={{ ...f, fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 10 }}>
            What would you like to work on?
          </h2>
          <p style={{ ...f, fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
            Pick any that feel right — you can change later.
          </p>
          <div className="flex flex-col gap-[10px]">
            {GOAL_OPTIONS.map((g) => (
              <Chip key={g.id} active={goals.includes(g.id)} label={g.label} onClick={() => toggle(g.id)} />
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex gap-[10px]">
            <button onClick={back} className="rounded-[12px] py-[16px] px-[20px]" style={{ ...f, fontSize: 17, color: 'white', background: 'rgba(255,255,255,0.18)' }}>
              Back
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="flex-1 rounded-[12px] py-[16px]"
              style={{ ...f, fontSize: 18, fontWeight: 700, color: '#0077A8', background: canNext ? 'white' : 'rgba(255,255,255,0.4)', opacity: canNext ? 1 : 0.6 }}
            >
              Continue
            </button>
          </div>
        </div>
      )
    }

    // Final welcome with pet
    return (
      <div className="flex flex-col h-full items-center text-center">
        <div className="flex-1 flex items-end justify-center w-full">
          <motion.img
            src={characterIdle}
            alt="Petch"
            style={{ height: 180, objectFit: 'contain' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
            transition={{ duration: 0.9, ease: 'easeOut', y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
          />
        </div>
        <h2 style={{ ...f, fontSize: 26, fontWeight: 700, color: 'white', marginTop: 16 }}>
          Hi {name || 'there'} — I'm Riley.
        </h2>
        <p style={{ ...f, fontSize: 17, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45, marginTop: 10, marginBottom: 28 }}>
          I'll check in with you every day, help you build habits, and cheer you on. Ready for our first session?
        </p>
        <div className="flex-1" />
        <button onClick={finish} className="w-full rounded-[12px] py-[18px]" style={{ ...f, fontSize: 18, fontWeight: 700, color: '#0077A8', background: 'white' }}>
          Let's go!
        </button>
      </div>
    )
  }

  const bg = step === QUESTIONS.length + 2 ? '#00BAFF' : '#33CCFF'

  return (
    <div className={`${PHONE}`} style={{ background: bg, padding: '56px 20px 24px', color: 'white' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="h-full flex flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
