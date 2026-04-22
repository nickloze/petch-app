import { motion, AnimatePresence } from 'framer-motion'
import characterIdle from '../assets/animation/character-idle.gif'
import { haptic } from '../utils/haptics'
import { playNext } from '../utils/sounds'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

const TIPS = [
  { topic: 'Sleep',     text: "Try dimming the lights an hour before bed tonight — it helps your body start winding down naturally." },
  { topic: 'Nutrition', text: "Next time you snack, reach for something with protein or fibre — it keeps you fuller for longer." },
  { topic: 'Exercise',  text: "A 10-minute walk after lunch can boost your energy and help digestion. Small moves add up!" },
  { topic: 'Hydration', text: "Keep a water bottle within sight today — people drink up to 30% more when it's visible." },
  { topic: 'Sleep',     text: "Feeling wired at night? Try the 4-7-8 breath: inhale 4, hold 7, exhale 8. Repeat four times." },
  { topic: 'Nutrition', text: "Add one colourful veg to your next meal — variety matters more than strict rules." },
  { topic: 'Exercise',  text: "Stretch for 2 minutes right after you wake up. It wakes up your body without caffeine." },
]

export function pickNudge() {
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}

export default function NudgeSheet({ open, nudge, onDismiss }) {
  return (
    <AnimatePresence>
      {open && nudge && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { haptic('tap'); onDismiss() }}
            style={{
              position: 'fixed', inset: 0, zIndex: 120,
              background: 'rgba(0, 40, 60, 0.55)',
            }}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 121,
              background: '#00BAFF',
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: '20px 20px 28px',
              maxWidth: 500, margin: '0 auto',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{
              width: 44, height: 4, background: 'rgba(255,255,255,0.45)',
              borderRadius: 2, margin: '0 auto 18px',
            }} />
            <div className="flex gap-4 items-start">
              <motion.img
                src={characterIdle}
                alt=""
                style={{ width: 70, flexShrink: 0 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="flex-1 pt-1">
                <div style={{ ...f, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 4 }}>
                  A QUICK TIP · {nudge.topic.toUpperCase()}
                </div>
                <p style={{ ...f, fontSize: 17, color: 'white', lineHeight: 1.4 }}>
                  {nudge.text}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => { playNext(); haptic('tap'); onDismiss() }}
                className="w-full rounded-[10px] py-[14px]"
                style={{ ...f, fontSize: 17, fontWeight: 700, color: '#0077A8', background: 'white' }}
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
