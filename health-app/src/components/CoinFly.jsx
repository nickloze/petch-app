import { motion, AnimatePresence } from 'framer-motion'
import coinSvg from '../assets/coin.svg'

// Renders a coin that flies from `from` to `to` viewport points when `active`.
// Fires `onDone` after the transition (~0.8s).
export default function CoinFly({ active, from, to, onDone, count = 3 }) {
  return (
    <AnimatePresence>
      {active && from && to && Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`coin-${i}-${active}`}
          initial={{
            position: 'fixed',
            left: from.x,
            top: from.y,
            width: 30,
            height: 30,
            zIndex: 200,
            pointerEvents: 'none',
          }}
          animate={{
            left: to.x,
            top: to.y,
            scale: [1, 1.25, 0.6],
            rotate: [0, 180, 360],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: i * 0.08,
            ease: [0.4, 0, 0.6, 1],
          }}
          onAnimationComplete={() => { if (i === count - 1) onDone && onDone() }}
        >
          <img
            src={coinSvg}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              filter: 'drop-shadow(0 4px 12px rgba(245, 197, 66, 0.6))',
            }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
