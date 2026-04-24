import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PHONE } from '../utils/frame.jsx'
import coinSvg from '../assets/coin.svg'
import characterIdle from '../assets/animation/character-idle.gif'
import characterIdleClicked from '../assets/animation/character-idle-clicked.gif'
import { haptic } from '../utils/haptics'
import { playMcq } from '../utils/sounds'
import { SUGGESTED_POOL, loadWeekly, WEEKLY_TARGET } from '../utils/missions'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

const TABS = ['New', 'Active', 'Completed']

function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"   width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13"  width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#72E0FF" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="#72E0FF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2V5z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function hoursLeftUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.max(0, Math.ceil((midnight - now) / (1000 * 60 * 60)))
}

function readUserName() {
  try {
    const u = JSON.parse(localStorage.getItem('petch_user') || 'null')
    return u?.name || 'friend'
  } catch {
    return 'friend'
  }
}

function SourceBadge({ source }) {
  const map = {
    check_in:  { text: 'FROM YOU',    bg: '#00BAFF' },
    suggested: { text: 'PETCH PICK',  bg: '#7B5CFF' },
  }
  const m = map[source] ?? { text: 'MISSION', bg: '#00BAFF' }
  return (
    <div className="shrink-0 rounded-[5px]" style={{ background: m.bg, padding: '6px 10px' }}>
      <span style={{ ...f, fontWeight: 700, fontSize: 12, color: 'white', letterSpacing: 0.4 }}>
        {m.text}
      </span>
    </div>
  )
}

function TabBar({ active, onChange, counts }) {
  return (
    <div className="flex gap-[6px]">
      {TABS.map((t) => {
        const on = active === t
        return (
          <motion.button
            key={t}
            whileTap={{ scale: 0.96 }}
            onClick={() => { playMcq(); haptic('tap'); onChange(t) }}
            className="rounded-[10px] px-[14px] py-[10px] flex items-center gap-[6px]"
            style={{
              background: on ? 'white' : 'rgba(255,255,255,0.18)',
              color: on ? '#0077A8' : 'white',
              ...f, fontSize: 15, fontWeight: on ? 700 : 500,
            }}
          >
            <span style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>{t}</span>
            <span
              className="rounded-full"
              style={{
                ...f, fontSize: 12, fontWeight: 700,
                minWidth: 20, padding: '2px 6px',
                background: on ? '#0077A8' : 'rgba(0,0,0,0.18)',
                color: on ? 'white' : 'white',
              }}
            >
              {counts[t] ?? 0}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function MissionSlot({ mission, slotIndex, onComplete, onCoinFlight }) {
  const ref = useRef(null)

  if (!mission) {
    return (
      <div
        className="w-full rounded-[12px] flex items-center justify-center"
        style={{
          minHeight: 72,
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px dashed rgba(255,255,255,0.3)',
        }}
      >
        <span style={{ ...f, fontSize: 15, color: 'rgba(255,255,255,0.65)' }}>
          Slot {slotIndex + 1} — Petch is thinking…
        </span>
      </div>
    )
  }

  const done = mission.status === 'completed'

  function handleTap() {
    if (done) return
    playMcq()
    haptic('coin')
    const r = ref.current?.getBoundingClientRect()
    if (r && onCoinFlight) {
      onCoinFlight({ x: r.left + r.width / 2 - 15, y: r.top + r.height / 2 - 15 })
    }
    onComplete(slotIndex, mission.reward)
  }

  return (
    <motion.button
      ref={ref}
      onClick={handleTap}
      whileTap={{ scale: 0.97 }}
      animate={{ opacity: done ? 0.55 : 1 }}
      transition={{ duration: 0.25 }}
      disabled={done}
      className="w-full rounded-[12px] flex items-center justify-between text-left"
      style={{
        background: done ? 'rgba(255,255,255,0.14)' : '#00BAFF',
        padding: '14px 16px',
        minHeight: 72,
        border: done ? '1.5px solid rgba(255,255,255,0.35)' : 'none',
      }}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div style={{ ...f, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, marginBottom: 4 }}>
          SLOT {slotIndex + 1} · {mission.topic.toUpperCase()}
        </div>
        <div style={{ ...f, fontSize: 18, color: 'white', fontWeight: done ? 400 : 500, textDecoration: done ? 'line-through' : 'none' }}>
          {mission.label}
        </div>
      </div>
      {done ? (
        <div className="shrink-0 rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      ) : (
        <div className="shrink-0 flex items-center gap-[6px]">
          <SourceBadge source={mission.source} />
          <div className="flex items-center gap-[3px] rounded-[5px]" style={{ background: 'rgba(0,0,0,0.18)', padding: '5px 8px' }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 14, color: 'white' }}>+{mission.reward}</span>
            <div style={{ width: 14, height: 14, borderRadius: '50%', overflow: 'hidden' }}>
              <img src={coinSvg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      )}
    </motion.button>
  )
}

function NewMissionCard({ suggestion, onAdd, canAdd }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="w-full rounded-[12px] flex items-center justify-between"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.22)', padding: '14px 16px', minHeight: 72 }}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div style={{ ...f, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 4 }}>
          {suggestion.topic.toUpperCase()}
        </div>
        <div style={{ ...f, fontSize: 17, color: 'white', fontWeight: 500 }}>
          {suggestion.label}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={!canAdd}
        onClick={() => { if (canAdd) { haptic('commit'); playMcq(); onAdd(suggestion) } }}
        className="shrink-0 rounded-[8px] flex items-center gap-[4px]"
        style={{
          background: canAdd ? 'white' : 'rgba(255,255,255,0.25)',
          color: canAdd ? '#0077A8' : 'rgba(255,255,255,0.6)',
          padding: '8px 12px',
          ...f, fontSize: 13, fontWeight: 700,
        }}
      >
        <span>+ Add</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <span>{suggestion.reward}</span>
          <img src={coinSvg} alt="" style={{ width: 12, height: 12, borderRadius: '50%' }} />
        </span>
      </motion.button>
    </motion.div>
  )
}

function WeeklyGoalBar({ pct }) {
  return (
    <div className="flex items-center gap-[10px] w-full">
      <div
        className="flex-1 relative rounded-[10px] overflow-hidden"
        style={{ height: 14, background: 'rgba(255,255,255,0.22)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[10px]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, #FFE066 0%, #FFB800 50%, #FF6A00 100%)',
            boxShadow: '0 0 4px rgba(255, 184, 0, 0.45)',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ ...f, fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 0.4 }}
        >
          {Math.round(pct)}%
        </div>
      </div>
      <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 22, height: 22 }}>
        <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  )
}

export default function MissionsScreen({
  menuOpen = false,
  onMenuOpen,
  onMenuClose,
  onAskPetch,
  coins = 10,
  fadeIn = false,
  missions = [null, null, null],
  onCompleteMission,
  onAddMission,
  coinBalanceRef,
}) {
  const [tab, setTab] = useState('Active')
  const [petClicked, setPetClicked] = useState(false)
  const [hoursLeft, setHoursLeft] = useState(() => hoursLeftUntilMidnight())
  const [weekly, setWeekly] = useState(() => loadWeekly())
  const userName = useMemo(() => readUserName(), [])
  const topBarCoinRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setHoursLeft(hoursLeftUntilMidnight()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setWeekly(loadWeekly())
  }, [missions])

  function handlePetTap() {
    haptic('tap')
    setPetClicked(true)
    setTimeout(() => setPetClicked(false), 3200)
  }

  function handleCoinFlight(from) {
    const target = coinBalanceRef?.current?.getBoundingClientRect()
    if (!target) return
    const to = { x: target.left + target.width / 2 - 15, y: target.top + target.height / 2 - 15 }
    if (onCompleteMission) onCompleteMission.fly && onCompleteMission.fly({ from, to })
  }

  function handleComplete(slotIndex, reward) {
    if (onCompleteMission && onCompleteMission.complete) {
      onCompleteMission.complete(slotIndex, reward)
    }
  }

  function handleAskPetch() {
    haptic('tap')
    playMcq()
    if (onAskPetch) onAskPetch()
  }

  const activeSlots = missions
    .map((m, i) => ({ m, i }))
    .filter((s) => s.m && s.m.status !== 'completed')

  const completedSlots = missions
    .map((m, i) => ({ m, i }))
    .filter((s) => s.m && s.m.status === 'completed')

  const hasFreeSlot = missions.some((m) => !m || m.status === 'completed')

  const newSuggestions = useMemo(() => {
    const active = new Set(missions.filter(Boolean).map((m) => m.label))
    return SUGGESTED_POOL.filter((s) => !active.has(s.label))
  }, [missions])

  const counts = {
    New: newSuggestions.length,
    Active: activeSlots.length,
    Completed: completedSlots.length,
  }

  const weeklyPct = Math.min(100, (weekly.count / WEEKLY_TARGET) * 100)

  return (
    <div
      className={`${PHONE} bg-[#33CCFF]`}
      style={{
        transform: menuOpen ? 'translateX(279px)' : 'translateX(0)',
        transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        ...(fadeIn && { animation: 'fade-in 0.3s ease forwards' }),
      }}
    >
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

      {/* HEADER */}
      <div className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] bg-[#00BAFF] rounded-b-[20px] chat-header-bar">
        <div className="chat-status-spacer" />
        <div className="flex items-center justify-between h-[46px] px-[15px]">
          <button onClick={onMenuOpen} className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center" style={{ width: 45, height: 45 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
            <div className="relative" style={{ width: 19, height: 14 }}><HamburgerIcon /></div>
          </button>
          <div className="flex flex-col items-center text-white text-center" style={{ gap: 10 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 24, letterSpacing: '0.25px', lineHeight: 1 }}>PETCH</span>
            <span style={{ ...f, fontWeight: 400, fontSize: 20, letterSpacing: '-0.2px', lineHeight: 1 }}>Mission Log</span>
          </div>
          <div ref={topBarCoinRef} className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}>
            <motion.span
              key={coins}
              initial={{ scale: 1.4, y: -2 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 500, damping: 20 }}
              style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1, display: 'inline-block' }}
            >
              {coins}
            </motion.span>
            <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316 }}>
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* DAILY MISSIONS META ROW */}
      <div className="shrink-0 pt-4 flex items-center justify-between">
        <span style={{ ...f, fontWeight: 500, fontSize: 15, color: '#72E0FF', letterSpacing: 0.6 }}>
          DAILY MISSIONS
        </span>
        <div className="flex items-center gap-[5px]">
          <ClockIcon />
          <span style={{ ...f, fontWeight: 500, fontSize: 15, color: '#72E0FF', letterSpacing: 0.4 }}>
            {hoursLeft} {hoursLeft === 1 ? 'HOUR' : 'HOURS'} LEFT
          </span>
        </div>
      </div>

      <p className="shrink-0 pt-[8px]" style={{ ...f, fontWeight: 400, fontSize: 17, color: 'white', letterSpacing: '-0.2px', lineHeight: 1.35 }}>
        Filter through to view your mission log!
      </p>

      <div className="shrink-0 pt-[12px]">
        <TabBar active={tab} onChange={setTab} counts={counts} />
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto py-[14px] flex flex-col gap-[10px] min-h-0">
        {tab === 'Active' && (
          <>
            {!hasFreeSlot && (
              <p style={{ ...f, fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px', lineHeight: 1.35 }}>
                All 3 slots are full. Complete one first, then add a new mission.
              </p>
            )}
            <AnimatePresence mode="popLayout">
              {missions.map((m, i) => (
                m && m.status === 'completed' ? null : (
                  <motion.div
                    key={(m && m.id) || `empty-${i}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MissionSlot
                      mission={m}
                      slotIndex={i}
                      onComplete={handleComplete}
                      onCoinFlight={handleCoinFlight}
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </>
        )}

        {tab === 'New' && (
          <>
            {!hasFreeSlot && (
              <p style={{ ...f, fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px', lineHeight: 1.35 }}>
                All 3 slots are full. Complete one first, then add a new mission.
              </p>
            )}
            <AnimatePresence initial={false}>
              {newSuggestions.map((s) => (
                <NewMissionCard
                  key={s.type}
                  suggestion={s}
                  canAdd={hasFreeSlot}
                  onAdd={(m) => onAddMission && onAddMission(m)}
                />
              ))}
            </AnimatePresence>
          </>
        )}

        {tab === 'Completed' && (
          <>
            {completedSlots.length === 0 && (
              <p style={{ ...f, fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.2px', lineHeight: 1.35 }}>
                Nothing here yet — finish a mission to see it land in this tab.
              </p>
            )}
            <AnimatePresence initial={false}>
              {completedSlots.map(({ m, i }) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <MissionSlot mission={m} slotIndex={i} onComplete={() => {}} onCoinFlight={() => {}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* PET */}
      <div
        className="shrink-0 cursor-pointer active:scale-95 transition-transform duration-100 flex items-end justify-start"
        style={{ height: 125 }}
        onClick={handlePetTap}
      >
        <img
          src={petClicked ? characterIdleClicked : characterIdle}
          alt="Petch companion"
          style={{ height: 125, objectFit: 'contain', objectPosition: 'bottom left' }}
        />
      </div>

      {/* WEEKLY GOAL */}
      <div className="shrink-0 flex flex-col gap-[6px]" style={{ paddingTop: 4 }}>
        <span style={{ ...f, fontWeight: 500, fontSize: 15, color: 'white', letterSpacing: '-0.2px' }}>
          Weekly Goal
        </span>
        <WeeklyGoalBar pct={weeklyPct} />
        <span style={{ ...f, fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.2px' }}>
          Are you captain {userName}?!
        </span>
      </div>

      {/* ASK PETCH CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAskPetch}
        className="shrink-0 w-full rounded-[12px] flex items-center gap-[10px]"
        style={{
          background: 'rgba(255,255,255,0.18)',
          padding: '14px 16px',
          marginTop: 10,
          border: '1.5px solid rgba(255,255,255,0.22)',
        }}
      >
        <ChatIcon />
        <span style={{ ...f, fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Ask Petch for a mission
        </span>
      </motion.button>

    </div>
  )
}
