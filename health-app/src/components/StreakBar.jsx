import { motion } from 'framer-motion'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

// Flame-gradient streak progress bar. Replaces the passive "waiting
// patiently" status text when a streak is active.
export default function StreakBar({ count = 0, pct = 0, nextMilestone = 3, justIncremented = false }) {
  if (count <= 0) {
    return (
      <span style={{ ...f, fontSize: 14, color: 'white', opacity: 0.75 }}>
        Start your streak — check in today
      </span>
    )
  }

  return (
    <div className="flex items-center gap-[10px] w-full">
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
        className="flex-1 relative rounded-[10px] overflow-hidden"
        style={{ height: 14, background: 'rgba(255,255,255,0.22)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[10px]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
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
      <span style={{ ...f, fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1 }}>
        {count}/{nextMilestone}
      </span>
    </div>
  )
}
