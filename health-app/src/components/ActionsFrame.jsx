import { useState }           from 'react'
import catSvg                from '../assets/cat.svg'
import { PHONE, Bulb }       from '../utils/frame.jsx'
import { playMcq, playNext } from '../utils/sounds'
import Coin                  from './Coin.jsx'

// ── 3 sleep commitment actions — ordered ascending by coins ─────
const ACTIONS = [
  { id:'a2', emoji:'📵', title:'No screens 30 mins before bed',
    description:'Switch screens off and try reading or light stretching instead.',
    coins: 1 },
  { id:'a3', emoji:'🧘', title:'Try a 5-min wind-down routine',
    description:'Deep breathing or a short body scan to ease gently into sleep.',
    coins: 2 },
  { id:'a1', emoji:'🌙', title:'Sleep by 10:30 PM tonight',
    description:'Set a bedtime alarm and put your phone down 30 minutes before.',
    coins: 3 },
]

// ── Progress bar (all 3 segments active = actions phase) ────────
function ProgressBar() {
  return (
    <div className="flex-1 flex gap-1">
      {[0,1,2].map(i => (
        <div key={i} className="flex-1 h-[14px] rounded-lg bg-action-accent" />
      ))}
    </div>
  )
}

// ── Celebration card ────────────────────────────────────────────
function CelebrationCard({ action, onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <img src={catSvg} alt="Petch cat" className="w-[110px]" />
      <span className="text-5xl leading-none">🏆</span>
      <p className="text-3xl font-black text-[#064E3B]">You're committed!</p>
      <p className="text-base font-bold text-action-accent italic">"{action.title}"</p>

      {/* Coin reward preview */}
      <div className="flex flex-col items-center gap-2 bg-white rounded-[14px] px-6 py-4 w-full shadow-sm">
        <Coin count={action.coins} size={48} />
        <p className="text-sm text-[#064E3B] font-semibold leading-relaxed mt-1">
          {action.coins === 1
            ? 'A coin has been set aside, just for you.'
            : `${action.coins} coins have been set aside, just for you.`}
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Honour tonight's commitment and they will be yours — with Petch's warmest care.
        </p>
      </div>

      <button
        onClick={onNext}
        className="mt-2 px-8 py-3 bg-action-accent text-white font-bold text-base rounded-[10px]"
      >
        NEXT
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function ActionsFrame({ onRestart, onBack, onNext, entryAnim }) {
  const [selected,  setSelected]  = useState(null)
  const [committed, setCommitted] = useState(false)

  if (committed) {
    return (
      <div className={`${PHONE} bg-action-bg`} style={entryAnim}>
        <CelebrationCard action={selected} onNext={onNext} />
      </div>
    )
  }

  return (
    <div className={`${PHONE} bg-action-bg`} style={entryAnim}>

      {/* ── Header ── */}
      <div className="flex flex-col shrink-0 mb-1">
        <div className="flex items-center gap-[10px] mb-2">
          <button
            onClick={onBack}
            className="text-xl font-black text-black p-0 leading-none shrink-0"
            aria-label="Go back to Health Overview"
          >←</button>
          <ProgressBar />
          <span className="shrink-0 flex items-center"><Bulb /></span>
        </div>
        <p className="text-[11px] font-black tracking-[2px] text-action-accent uppercase pt-1">ACTION</p>
        <p className="text-xl font-medium text-black leading-snug pt-0.5">Commit to one action!</p>
      </div>

      {/* ── Cat + bubble ── */}
      <div className="flex flex-col items-start shrink-0 mt-2 mb-4">
        <div className="self-end mr-6 mb-[-20px] relative z-10">
          <img src={catSvg} alt="Petch cat" className="w-[110px]" />
        </div>
        {/* Tail lives OUTSIDE overflow-hidden */}
        <div className="relative w-full">
          <div className="tail-green" style={{ left: 'auto', right: '68px' }} />
          <div className="w-full h-[96px] bg-action-bubble rounded-[14px] px-[18px] flex items-center overflow-hidden">
            <p className="text-[17px] font-normal text-white leading-[1.4] m-0">
              Pick one sleep habit to start tonight. Small steps add up!
            </p>
          </div>
        </div>
      </div>

      {/* ── 3 action cards ── */}
      <div className="flex flex-col gap-3 shrink-0">
        {ACTIONS.map(action => {
          const isSel = selected?.id === action.id
          return (
            <button
              key={action.id}
              onClick={() => { playMcq(); setSelected(isSel ? null : action) }}
              className={[
                'relative w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all',
                isSel
                  ? 'bg-[#ECFDF5] border-2 border-action-accent shadow-[4px_5px_0px_#059669]'
                  : 'bg-white border-2 border-transparent',
              ].join(' ')}
            >
              <span className="text-2xl shrink-0 leading-none">{action.emoji}</span>
              <div className="flex-1 pr-2">
                <p className="text-sm font-bold text-[#064E3B] leading-snug mb-0.5">{action.title}</p>
                <p className="text-xs font-normal text-gray-500 leading-snug">{action.description}</p>
              </div>
              {/* Coin reward badge */}
              <div className="shrink-0">
                <Coin count={action.coins} size={34} />
              </div>
              {/* Animated checkmark overlay */}
              <span className={`absolute top-2 right-2 text-base font-black text-action-accent transition-all duration-200
                ${isSel ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                ✓
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── I'M COMMITTED button — enabled once a card is selected ── */}
      <button
        onClick={() => { if (selected) { playNext(); setCommitted(true) } }}
        disabled={!selected}
        className="w-full h-[52px] bg-action-accent text-white text-lg font-extrabold rounded-[14px] tracking-wide transition-all disabled:opacity-35 disabled:cursor-not-allowed"
      >
        I'M COMMITTED
      </button>

    </div>
  )
}
