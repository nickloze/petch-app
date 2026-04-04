import { useState, useMemo, useLayoutEffect, useEffect } from 'react'
import catSvg               from '../assets/cat.svg'
import { PHONE, Bulb }      from '../utils/frame.jsx'
import { playMcq, playNext, playCorrect, playWrong } from '../utils/sounds'

// ── Personalised questions ──────────────────────────────────────
function buildQuestions(a = {}) {
  // Q1 — sleep duration (slot 0)
  const q1 = a[0] === '< 6 Hours'
    ? { id:'l1a',
        question:'How many hours of sleep do adults actually need each night?',
        options:['5–6 hours', '7–9 hours', '10+ hours'],
        correct:'7–9 hours',
        explanation:"Most adults need 7–9 hours — getting under 6 regularly weakens your immune system, memory, and focus.",
        personalNote:'Even adding just 30 minutes tonight could make a real difference to how you feel tomorrow.' }
    : a[0] === '6–8 Hours'
    ? { id:'l1b',
        question:'What does your brain do with your memories while you sleep?',
        options:['It deletes old ones', 'It creates brand new ones', 'It saves them for later'],
        correct:'It saves them for later',
        explanation:"While you sleep, your brain moves memories from short-term to long-term storage — which is why a full night helps you learn and remember better.",
        personalNote:"With 6–8 hours, your brain is getting solid time to lock in memories each night — keep it up!" }
    : { id:'l1c',
        question:'Which stage of sleep is most important for physical recovery?',
        options:['Deep sleep', 'Light sleep', 'Dreaming (REM)'],
        correct:'Deep sleep',
        explanation:"Deep sleep is when your body repairs muscles, releases growth hormone, and strengthens your immune system for full overnight recovery.",
        personalNote:"Getting 8+ hours means you're likely clocking plenty of deep sleep each night — great for recovery!" }

  // Q2 — bedtime (slot 1)
  const q2 = a[1] === 'After Midnight'
    ? { id:'l2a',
        question:'What natural chemical makes you feel sleepy as it gets dark?',
        options:['Cortisol', 'Adrenaline', 'Melatonin'],
        correct:'Melatonin',
        explanation:"Melatonin is released when it gets dark, but phone screens emit blue light that blocks it — making you feel wide awake even when you're genuinely tired.",
        personalNote:'Even shifting 30 minutes earlier for a few nights can help reset your body clock.' }
    : a[1] === '10 PM – Midnight'
    ? { id:'l2b',
        question:'What bedroom temperature helps you sleep the most deeply?',
        options:['Cool, around 65°F / 18°C', 'Warm, around 75°F / 24°C', 'Cold, below 60°F / 15°C'],
        correct:'Cool, around 65°F / 18°C',
        explanation:"Your body lowers its core temperature to fall asleep, and a cool room around 18°C helps you reach deep sleep faster.",
        personalNote:"Pair your great bedtime with a cool, dark room and you've got an ideal sleep setup!" }
    : { id:'l2c',
        question:'What does your body focus on during the first part of the night?',
        options:['Vivid dreaming', 'Deep, restful sleep', 'Light dozing'],
        correct:'Deep, restful sleep',
        explanation:"The first 90 minutes of sleep are packed with deep sleep — your body's top priority for physical repair and recovery.",
        personalNote:"Being in bed before 10 PM means your body hits deep sleep at exactly the right time!" }

  // Q3 — sleep quality (slot 2)
  const q3 = a[2] === 'Poor'
    ? { id:'l3a',
        question:'Which everyday habit disrupts deep sleep the most?',
        options:['Reading before bed', 'Caffeine after 2 PM', 'Sleeping with the lights on'],
        correct:'Caffeine after 2 PM',
        explanation:"Caffeine has a 5–6 hour half-life, so a 3 PM coffee is still half-active at 8 PM — quietly cutting into how much deep sleep you actually get.",
        personalNote:'Cutting caffeine after 2 PM is one of the fastest wins — many people notice a difference within a few days.' }
    : a[2] === 'Average'
    ? { id:'l3b',
        question:'What single habit improves sleep quality the most?',
        options:['Same bedtime every day', 'Sleeping in on weekends', 'Taking a daily nap'],
        correct:'Same bedtime every day',
        explanation:"Your body's internal clock thrives on routine — going to bed and waking at the same time every day makes falling asleep easier and sleep deeper.",
        personalNote:'A consistent schedule could be the single change that makes the biggest difference for you.' }
    : { id:'l3c',
        question:'How much of your total sleep time is actually deep sleep?',
        options:['About half the night', 'Only around 5%', 'Around 13–23%'],
        correct:'Around 13–23%',
        explanation:"Deep sleep only makes up about 13–23% of your night, but those 1–2 hours are when your body does its most important repair work.",
        personalNote:"You're naturally protecting those deep sleep windows — keep your routine consistent to stay there!" }

  // Q4 — wake feeling (slot 3)
  const q4 = a[3] === 'Rarely'
    ? { id:'l4a',
        question:'How many sleep cycles do most people need to feel properly rested?',
        options:['4–5 cycles', '2–3 cycles', '6+ cycles'],
        correct:'4–5 cycles',
        explanation:"Each sleep cycle lasts 90 minutes — most adults need 4–5 complete cycles, and waking mid-cycle causes that heavy, groggy feeling.",
        personalNote:"Try shifting your alarm 15–20 minutes to find the natural end of your cycle." }
    : a[3] === 'Sometimes'
    ? { id:'l4b',
        question:'When do you feel most refreshed after waking up?',
        options:['Right after a vivid dream', 'At the end of a sleep cycle', 'After hours of deep sleep'],
        correct:'At the end of a sleep cycle',
        explanation:"Waking at the natural end of a sleep cycle (~90 minutes) feels smooth and easy, while waking mid-cycle causes that foggy, groggy feeling.",
        personalNote:"A consistent wake time makes landing at a cycle end happen more reliably." }
    : { id:'l4c',
        question:'Which sleep stage gives you vivid, memorable dreams?',
        options:['Deep sleep (N3)', 'Light sleep (N1)', 'REM sleep'],
        correct:'REM sleep',
        explanation:"REM sleep is when vivid dreaming happens, playing a key role in emotional processing, creativity, and locking in memories.",
        personalNote:"Waking refreshed consistently is a great sign your sleep cycles are completing naturally!" }

  return [q1, q2, q3, q4]
}

const BACKUP_POOL = [
  { id:'lb1',
    question:"Roughly how many adults don't get enough sleep each night?",
    options:['About 1 in 10', 'About 1 in 3', 'More than half'],
    correct:'About 1 in 3',
    explanation:"About 1 in 3 adults regularly get less than 7 hours — so feeling tired has become so normal that most people don't realise it's affecting them.",
    personalNote:null },
  { id:'lb2',
    question:'Why does scrolling on your phone at night make it harder to sleep?',
    options:["It blocks your body's sleep hormone", 'It makes your mind too busy', 'It raises your heart rate'],
    correct:"It blocks your body's sleep hormone",
    explanation:"Phones emit blue light that blocks melatonin and delays sleep by 1–2 hours — stopping screens 30–60 minutes before bed is the most effective fix.",
    personalNote:null },
  { id:'lb3',
    question:'Which age group needs the most sleep per night?',
    options:['Teenagers', 'Adults over 18', 'Newborn babies'],
    correct:'Newborn babies',
    explanation:"Newborns need up to 17 hours, teenagers 8–10, and adults 7–9 — and as we age, quality of sleep becomes even more important than quantity.",
    personalNote:null },
  { id:'lb4',
    question:"What does 'sleep hygiene' actually mean?",
    options:['Washing up right before bed', 'Healthy sleep habits and routines', 'The cleanliness of your bedding'],
    correct:'Healthy sleep habits and routines',
    explanation:"Sleep hygiene is the set of daily habits — like a consistent schedule, limiting caffeine, and a cool quiet room — that support better sleep over time.",
    personalNote:null },
]

// ── Progress bar ────────────────────────────────────────────────
function ProgressBar() {
  return (
    <div className="flex-1 flex gap-1">
      {[0,1,2].map(i => (
        <div key={i} className={`flex-1 h-[14px] rounded-lg ${i <= 1 ? 'bg-learn-accent' : 'bg-learn-selected'}`} />
      ))}
    </div>
  )
}

// ── Scroll indicator ────────────────────────────────────────────
function ScrollIndicator({ index, total }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[5px] w-[10px] py-1 shrink-0">
      {Array.from({ length: total }).map((_,i) => (
        <div
          key={i}
          className={`w-[10px] rounded-full transition-all duration-300 shrink-0
            ${i === index ? 'h-[29px] bg-learn-accent' : 'h-[10px] bg-learn-selected'}`}
        />
      ))}
    </div>
  )
}

// ── Bottom feedback sheet — slides up from below ────────────────
function FeedbackSheet({ feedback, isLast, onNext }) {
  const { isCorrect, correctAnswer, explanation, personalNote } = feedback

  // Fire correct or wrong sound once the sheet mounts (after CHECK tap + slide-up)
  useEffect(() => {
    if (isCorrect) playCorrect()
    else           playWrong()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 rounded-t-[28px] px-5 pt-5 pb-6
        ${isCorrect ? 'bg-[#1A3D2B]' : 'bg-[#2D1040]'}`}
      style={{ animation: 'slide-up-sheet 0.38s cubic-bezier(0.32,0.72,0,1) forwards' }}
    >
      {/* Title row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm
          ${isCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <p className={`text-lg font-black ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
          {isCorrect ? 'Correct!' : `Not quite — "${correctAnswer}"`}
        </p>
      </div>

      {/* Explanation — 1 sentence, larger font */}
      <p className="text-[18px] text-white/90 leading-snug mb-3">{explanation}</p>

      {/* Personal note — same size, distinct amber colour */}
      {personalNote && (
        <p className="text-[16px] text-amber-300 leading-snug mb-4">💬 {personalNote}</p>
      )}

      {/* NEXT / FINISH button */}
      <button
        onClick={onNext}
        className={`w-full h-[52px] text-base font-bold rounded-[14px] mt-1
          ${isCorrect
            ? 'bg-green-400 text-[#1A3D2B]'
            : 'bg-learn-accent text-white'}`}
      >
        {isLast ? 'FINISH' : 'NEXT'}
      </button>
    </div>
  )
}

// ── Completion card ─────────────────────────────────────────────
function CompletionCard({ onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <img src={catSvg} alt="Petch cat" className="w-[120px]" />
      <p className="text-3xl font-black text-black">Great learning! 🧠</p>
      <p className="text-base text-gray-500 leading-relaxed">Now let's see what this means for your health.</p>
      <button onClick={onNext} className="w-full h-[52px] bg-learn-accent text-white text-lg font-bold rounded-[14px] mt-2">
        SEE MY HEALTH OVERVIEW
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function LearningFrame({ managementAnswers, onComplete }) {
  // Re-enforce the learning background on mount.
  // Management and Actions work because:
  //   - Management: color is in static HTML, iOS reads it at page load
  //   - Actions: health screen (same green) is shown first, giving iOS time to repaint
  // Learning is the first dynamic colour change — iOS native chrome may lag.
  // This useLayoutEffect fires synchronously before paint AND triggers a second
  // setAttribute on the next animation frame, giving iOS a second repaint window.
  useLayoutEffect(() => {
    const LEARN_BG = '#EDE0FF'
    document.documentElement.style.backgroundColor = LEARN_BG
    document.body.style.backgroundColor            = LEARN_BG
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', LEARN_BG)
      requestAnimationFrame(() => meta.setAttribute('content', LEARN_BG))
    }
  }, [])

  const baseQs = useMemo(() => buildQuestions(managementAnswers), [managementAnswers])

  const [activeQs, setActiveQs] = useState(baseQs)
  const [usedIds,  setUsedIds]  = useState(new Set(baseQs.map(q => q.id)))
  const [answers,  setAnswers]  = useState({})
  const [qIndex,   setQIndex]   = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [done,     setDone]     = useState(false)

  const current  = activeQs[qIndex]
  const selected = answers[qIndex] ?? null
  const isLast   = qIndex === activeQs.length - 1

  function handleSelect(opt) {
    if (feedback) return
    playMcq()
    setAnswers(prev => ({ ...prev, [qIndex]: opt }))
  }

  function handleCheck() {
    if (!selected || feedback) return
    playNext()
    const isCorrect = selected === current.correct
    setFeedback({ isCorrect, selectedOpt: selected, correctAnswer: current.correct,
                  explanation: current.explanation, personalNote: current.personalNote ?? null })
  }

  function handleNext() {
    if (!feedback) return
    playNext()
    setFeedback(null)
    if (isLast) { setDone(true) }
    else { setQIndex(i => i + 1) }
  }

  function handleUncomfortable() {
    if (feedback) return
    const replacement = BACKUP_POOL.find(q => !usedIds.has(q.id))
    if (!replacement) return
    setUsedIds(prev => new Set([...prev, replacement.id]))
    setActiveQs(prev => { const n=[...prev]; n[qIndex]=replacement; return n })
    setAnswers(prev  => { const n={...prev}; delete n[qIndex]; return n })
  }

  function handleFinish() {
    if (onComplete) onComplete()
  }

  if (done) {
    return <div className={`${PHONE} bg-learn-bg`}><CompletionCard onNext={handleFinish} /></div>
  }

  return (
    <div className={`${PHONE} bg-learn-bg`}>

      {/* ── Header ── */}
      <div className="flex flex-col shrink-0 mb-1">
        <div className="flex items-center gap-[10px] mb-2">
          <button className="text-base font-black text-black p-0 leading-none shrink-0">✕</button>
          <ProgressBar />
          <span className="shrink-0 flex items-center"><Bulb /></span>
        </div>
        <p className="text-[11px] font-black tracking-[2px] text-learn-accent uppercase pt-1">LEARNING</p>
        <p className="text-xl font-medium text-black leading-snug pt-0.5">Let's learn about Sleep!</p>
      </div>

      {/* ── Cat + bubble ── */}
      <div className="flex flex-col items-start shrink-0 mt-8 mb-3">
        <div className="self-end mr-6 mb-[-20px] relative z-10">
          <img src={catSvg} alt="Petch cat" className="w-[110px]" />
        </div>
        <div className="relative w-full">
          <div className="tail-purple" style={{ left: 'auto', right: '68px' }} />
          <div className="w-full h-[96px] bg-learn-bubble rounded-[14px] px-[18px] flex items-center overflow-hidden">
            <p
              key={current.id}
              className="text-[16px] font-normal text-white leading-[1.4] m-0"
              style={{ animation: 'fade-slide-up 0.25s ease forwards' }}
            >
              {current.question}
            </p>
          </div>
        </div>
      </div>

      {/* ── Options + scroll indicator ── */}
      <div className="flex items-stretch gap-2 shrink-0">
        <div className="flex-1 flex flex-col gap-[10px]">
          {current.options.map(opt => {
            const isSel       = selected === opt
            const showCorrect = feedback && opt === current.correct
            const showWrong   = feedback && isSel && !feedback.isCorrect
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={!!feedback}
                className={[
                  'w-full h-12 rounded-lg text-lg transition-all flex items-center justify-center gap-2',
                  showCorrect      ? 'bg-green-400 text-green-900 font-black shadow-[4px_5px_0px_#16A34A]' :
                  showWrong        ? 'bg-red-300   text-red-900   font-black shadow-[4px_5px_0px_#EF4444]' :
                  !feedback&&isSel ? 'bg-learn-selected text-[#3B0764] font-black shadow-[4px_5px_0px_#BF48FF]' :
                                     'bg-learn-accent text-white font-normal',
                  feedback ? 'cursor-default' : '',
                ].join(' ')}
              >
                {opt}
                {showCorrect && <span className="text-sm font-black">✓</span>}
                {showWrong   && <span className="text-sm font-black">✗</span>}
              </button>
            )
          })}
        </div>
        <ScrollIndicator index={qIndex} total={activeQs.length} />
      </div>

      {/* ── Skip link — sits directly below the answer buttons ── */}
      {!feedback && (
        <div className="flex justify-center mt-3 shrink-0">
          <button
            onClick={handleUncomfortable}
            className="text-[11px] font-semibold text-learn-accent uppercase tracking-[0.5px] p-0"
          >
            I'M UNCOMFORTABLE WITH THIS QUESTION
          </button>
        </div>
      )}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── CHECK button (hidden when sheet is open) ── */}
      {!feedback && (
        <button
          onClick={handleCheck}
          disabled={!selected}
          className="w-full h-[52px] bg-learn-accent text-white text-lg font-bold rounded-[14px] shrink-0 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
        >
          CHECK
        </button>
      )}

      {/* ── Feedback sheet slides up from the bottom ── */}
      {feedback && (
        <FeedbackSheet
          feedback={feedback}
          isLast={isLast}
          onNext={handleNext}
        />
      )}

    </div>
  )
}
