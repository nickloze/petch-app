import { useState }           from 'react'
import catSvg                from '../assets/cat.svg'
import { PHONE, Bulb }       from '../utils/frame.jsx'
import { playMcq, playNext } from '../utils/sounds'

// ── Question pool ───────────────────────────────────────────────
const QUESTION_POOL = [
  { id:'p1', question:'How many hours of sleep did you get last night?',  options:['More than 8 Hours','6–8 Hours','< 6 Hours'] },
  { id:'p2', question:'What time did you go to bed last night?',          options:['Before 10 PM','10 PM – Midnight','After Midnight'] },
  { id:'p3', question:'How would you rate your sleep quality?',           options:['Excellent','Average','Poor'] },
  { id:'p4', question:'Do you wake up feeling rested?',                   options:['Always','Sometimes','Rarely'] },
  // Backups (swapped in when "uncomfortable")
  { id:'b1', question:'How long does it usually take you to fall asleep?',options:['Under 15 mins','15–30 mins','Over 30 mins'] },
  { id:'b2', question:'Do you use your phone in bed before sleeping?',    options:['Never','Sometimes','Every night'] },
  { id:'b3', question:'How often do you wake up during the night?',       options:['Rarely','Once or twice','Often'] },
  { id:'b4', question:'Do you follow a consistent sleep schedule?',       options:['Always','Sometimes','Rarely'] },
  { id:'b5', question:'How do you feel about your overall sleep routine?',options:['Happy with it','Could improve','It needs work'] },
]

// ── 3-segment progress bar (segment 0 active = management phase)
function ProgressBar({ activeIndex = 0 }) {
  return (
    <div className="flex-1 flex gap-1">
      {[0,1,2].map(i => (
        <div key={i} className={`flex-1 h-[14px] rounded-lg ${i <= activeIndex ? 'bg-mgmt-accent' : 'bg-mgmt-selected'}`} />
      ))}
    </div>
  )
}

// ── Scroll indicator — pip tracks question index ────────────────
function ScrollIndicator({ index, total }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[5px] w-[10px] py-1 shrink-0">
      {Array.from({ length: total }).map((_,i) => (
        <div
          key={i}
          className={`w-[10px] rounded-full transition-all duration-300 shrink-0
            ${i === index
              ? 'h-[29px] bg-mgmt-accent'
              : 'h-[10px] bg-mgmt-bubble'}`}
        />
      ))}
    </div>
  )
}

// ── Completion card ─────────────────────────────────────────────
function CompletionCard({ onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <img src={catSvg} alt="Petch cat" className="w-[120px]" />
      <p className="text-3xl font-black text-black">All done!</p>
      <p className="text-base font-normal text-gray-500 leading-relaxed">
        Thanks for sharing your sleep details. Let's learn something new!
      </p>
      <button
        onClick={() => { playNext(); onNext() }}
        className="w-full h-[52px] bg-mgmt-next text-white text-lg font-bold rounded-[14px] mt-2"
      >
        LET'S LEARN
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function ManagementFrame({ onComplete }) {
  const [activeQs,  setActiveQs]  = useState(QUESTION_POOL.slice(0,4))
  const [usedIds,   setUsedIds]   = useState(new Set(QUESTION_POOL.slice(0,4).map(q=>q.id)))
  const [answers,   setAnswers]   = useState({})
  const [qIndex,    setQIndex]    = useState(0)
  const [done,      setDone]      = useState(false)

  const current  = activeQs[qIndex]
  const selected = answers[qIndex] ?? null
  const isLast   = qIndex === activeQs.length - 1

  function handleNext() {
    if (!selected) return
    playNext()
    if (isLast) { setDone(true) }
    else { setQIndex(i => i + 1) }
  }

  function handleUncomfortable() {
    const replacement = QUESTION_POOL.find(q => !usedIds.has(q.id))
    if (!replacement) return
    setUsedIds(prev => new Set([...prev, replacement.id]))
    setActiveQs(prev => { const n=[...prev]; n[qIndex]=replacement; return n })
    setAnswers(prev  => { const n={...prev}; delete n[qIndex]; return n })
  }

  function handleSelect(opt) {
    playMcq()
    setAnswers(prev => ({ ...prev, [qIndex]: opt }))
  }

  function handleFinish() {
    const result = {}
    activeQs.forEach((q,i) => { result[q.id] = answers[i] ?? null })
    if (onComplete) onComplete(result, answers)
  }

  if (done) {
    return (
      <div className={`${PHONE} bg-mgmt-bg`}>
        <CompletionCard onNext={handleFinish} />
      </div>
    )
  }

  return (
    <div className={`${PHONE} bg-mgmt-bg`}>

      {/* ── Header ── */}
      <div className="flex flex-col shrink-0">
        <div className="flex items-center gap-[10px] mb-3">
          <button className="text-base font-black text-black p-0 leading-none shrink-0">✕</button>
          <ProgressBar activeIndex={0} />
          <span className="shrink-0 flex items-center"><Bulb /></span>
        </div>
        <p className="text-[11px] font-black tracking-[2px] text-mgmt-accent uppercase mb-1">
          MANAGEMENT
        </p>
        <p className="text-[22px] font-medium text-black leading-snug">
          Let's talk about you <strong className="font-black">Sleep!</strong>
        </p>
      </div>

      {/* ── Cat + bubble — large top gap matches Figma breathing room ── */}
      <div className="shrink-0 mt-16">
        {/* Cat centred above the bubble */}
        <div className="flex justify-center mb-[-20px] relative z-10">
          <img src={catSvg} alt="Petch cat" className="w-[120px]" />
        </div>
        {/* Tail lives OUTSIDE overflow-hidden so it renders above the bubble */}
        <div className="relative">
          <div className="tail-blue" style={{ left: 'calc(50% - 14px)' }} />
          <div className="w-full h-[100px] bg-mgmt-bubble rounded-[18px] px-[18px] flex items-center overflow-hidden">
            <p
              key={current.id}
              className="text-[17px] font-normal text-white leading-[1.4] m-0"
              style={{ animation: 'fade-slide-up 0.25s ease forwards' }}
            >
              {current.question}
            </p>
          </div>
        </div>
      </div>

      {/* ── Answer buttons + scroll indicator — gap below bubble ── */}
      <div className="flex items-stretch gap-2 shrink-0 mt-6">
        <div className="flex-1 flex flex-col gap-[10px]">
          {current.options.map(opt => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`w-full h-12 rounded-lg text-lg text-white transition-all
                ${selected === opt
                  ? 'bg-mgmt-selected font-black shadow-[4px_5px_0px_#50CFFF]'
                  : 'bg-mgmt-accent font-normal'}`}
            >
              {opt}
            </button>
          ))}
        </div>
        <ScrollIndicator index={qIndex} total={activeQs.length} />
      </div>

      {/* ── Skip link — sits directly below the answer buttons ── */}
      <div className="flex justify-center mt-3 shrink-0">
        <button
          onClick={handleUncomfortable}
          className="text-[11px] font-semibold text-mgmt-accent uppercase tracking-[0.5px] p-0"
        >
          I'M UNCOMFORTABLE WITH THIS QUESTION
        </button>
      </div>

      {/* ── Spacer pushes NEXT to bottom ── */}
      <div className="flex-1" />

      {/* ── NEXT / FINISH ── */}
      <button
        onClick={handleNext}
        disabled={!selected}
        className="w-full h-[52px] bg-mgmt-next text-white text-lg font-bold rounded-[14px] shrink-0 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
      >
        {isLast ? 'FINISH' : 'NEXT'}
      </button>

    </div>
  )
}
