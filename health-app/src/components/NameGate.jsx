import { useState } from 'react'
import { motion } from 'framer-motion'
import { PHONE } from '../utils/frame.jsx'
import characterIdle from '../assets/animation/character-idle.gif'
import { playNext } from '../utils/sounds'
import { haptic } from '../utils/haptics'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

export default function NameGate({ onSubmit }) {
  const [name, setName] = useState('')
  const canSubmit = name.trim().length > 0

  function submit(e) {
    e?.preventDefault?.()
    if (!canSubmit) return
    playNext()
    haptic('commit')
    onSubmit(name.trim())
  }

  return (
    <div className={PHONE} style={{ background: '#33CCFF', padding: '56px 20px 24px', color: 'white' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex flex-col"
      >
        <div className="flex-1 flex items-end justify-center w-full">
          <motion.img
            src={characterIdle}
            alt="Petch"
            style={{ height: 170, objectFit: 'contain' }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
            transition={{
              duration: 0.7, ease: 'easeOut',
              y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        </div>

        <h1 style={{ ...f, fontSize: 28, fontWeight: 700, marginTop: 18, textAlign: 'center' }}>
          Hi there, I'm Petch!
        </h1>
        <p style={{ ...f, fontSize: 17, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45, marginTop: 10, marginBottom: 24, textAlign: 'center' }}>
          Before we get started, what should I call you?
        </p>

        <form onSubmit={submit} className="flex flex-col">
          <label style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 }}>YOUR NAME</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name"
            maxLength={24}
            className="rounded-[10px] px-[14px] py-[14px] mt-1 bg-white/15 text-white outline-none placeholder:text-white/55"
            style={{ ...f, fontSize: 18, border: '1.5px solid rgba(255,255,255,0.35)' }}
          />
          <div className="flex-1" />
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-[12px] py-[16px] mt-6"
            style={{
              ...f, fontSize: 18, fontWeight: 700, color: '#0077A8',
              background: canSubmit ? 'white' : 'rgba(255,255,255,0.4)',
              opacity: canSubmit ? 1 : 0.6,
              transition: 'opacity 0.2s ease, background 0.2s ease',
            }}
          >
            Let's go!
          </button>
        </form>
      </motion.div>
    </div>
  )
}
