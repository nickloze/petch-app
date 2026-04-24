import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

// Fun rotating streak labels — cycle through playful framings of the
// same number so it doesn't feel like a dry counter.
function streakLabels(count) {
  return [
    `${count} day streak!`,
    `${count} chickens running`,
    `${count} check-ins, wow!`,
    `${count} days strong`,
    `${count} flames lit`,
    `${count} tiny wins`,
  ]
}

// Flame-gradient streak progress bar. Replaces the passive "waiting
// patiently" status text when a streak is active.
export default function StreakBar({ count = 0, justIncremented = false }) {
  const [labelIdx, setLabelIdx] = useState(0)

  useEffect(() => {
    if (count <= 0) return
    const total = streakLabels(count).length
    const id = setInterval(() => {
      setLabelIdx(i => (i + 1) % total)
    }, 3600)
    return () => clearInterval(id)
  }, [count])

  if (count <= 0) {
    return (
      <span style={{ ...f, fontSize: 14, color: 'white', opacity: 0.75 }}>
        Start your streak — check in today
      </span>
    )
  }

  const label = streakLabels(count)[labelIdx]

  return (
    <div className="flex items-center gap-[14px] w-full">
      <motion.div
        initial={false}
        animate={justIncremented ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ fontSize: 18, lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255, 140, 0, 0.8))' }}
        aria-hidden="true"
      >
        🔥
      </motion.div>

      <div
        className="relative rounded-[10px] overflow-hidden"
        style={{ width: 150, flexShrink: 0, height: 14, background: 'rgba(255,255,255,0.22)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[10px]"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, #FF6A00 0%, #FFB800 50%, #FFE066 100%)',
            backgroundSize: '200% 100%',
            animation: 'flame-shimmer 2.2s ease-in-out infinite',
            boxShadow: justIncremented
              ? '0 0 12px rgba(255, 184, 0, 0.9), inset 0 0 8px rgba(255, 255, 255, 0.35)'
              : '0 0 4px rgba(255, 184, 0, 0.45)',
          }}
        />
      </div>

      {/* Ghost-text rotating label — right of the bar. Font size
          matches the "Type something..." input placeholder (18px).
          Fixed min-width keeps the bar from jumping as labels change. */}
      <div
        style={{
          flex: '1 1 auto',
          minWidth: 0,
          textAlign: 'left',
          position: 'relative',
          height: 22,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.65, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              ...f,
              fontSize: 18,
              fontWeight: 400,
              color: 'white',
              letterSpacing: '-0.2px',
              position: 'absolute',
              left: 0,
              top: 0,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
