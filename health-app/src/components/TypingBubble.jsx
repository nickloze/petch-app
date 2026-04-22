import { motion } from 'framer-motion'

export default function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="self-start flex items-center gap-[5px] rounded-[16px] rounded-tl-[4px] px-[14px] py-[11px]"
      style={{ background: 'rgba(255,255,255,0.18)' }}
      aria-label="Petch is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}
