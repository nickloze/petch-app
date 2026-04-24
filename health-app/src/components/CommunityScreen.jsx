import { useState } from 'react'
import { motion } from 'framer-motion'
import { PHONE } from '../utils/frame.jsx'
import coinSvg from '../assets/coin.svg'
import characterIdle from '../assets/animation/character-idle.gif'
import { haptic } from '../utils/haptics'
import { playMcq } from '../utils/sounds'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"   width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13"  width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

const TABS = ['Articles', 'Groups', 'Videos']

const ARTICLES = [
  {
    id: 'a1',
    title: 'Why consistent sleep beats extra hours',
    author: 'Dr. Maya Chen',
    role: 'GP · Sleep Medicine',
    minutes: 4,
    excerpt: 'A regular bedtime is more predictive of daytime energy than total hours slept. Here\'s what the last 10 years of research shows…',
    mission: { label: 'Set a fixed bedtime tonight', topic: 'Sleep', reward: 5 },
  },
  {
    id: 'a2',
    title: 'The 80/20 of everyday nutrition',
    author: 'Dr. Jordan Price',
    role: 'Dietitian',
    minutes: 3,
    excerpt: 'Eat mostly whole foods, mostly plants, and don\'t stress about the rest. Why this boring advice is backed by the strongest evidence…',
    mission: { label: 'Swap one snack for a whole food', topic: 'Nutrition', reward: 5 },
  },
  {
    id: 'a3',
    title: 'Short walks are underrated',
    author: 'Dr. Aisha Patel',
    role: 'Exercise Physiologist',
    minutes: 2,
    excerpt: 'Ten minutes of walking after a meal lowers blood sugar response by up to 30%. And it compounds across the day in surprising ways…',
    mission: { label: 'Take a 10-minute walk', topic: 'Exercise', reward: 5 },
  },
]

const GROUPS = [
  { id: 'g1', name: 'Uni sleep crew', members: 6, activity: 'Maya just hit a 5-day streak 🔥' },
]

function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-[6px]">
      {TABS.map((t) => {
        const on = active === t
        return (
          <motion.button
            key={t}
            whileTap={{ scale: 0.96 }}
            onClick={() => { playMcq(); onChange(t) }}
            className="rounded-[10px] px-[14px] py-[10px]"
            style={{
              background: on ? 'white' : 'rgba(255,255,255,0.18)',
              color: on ? '#0077A8' : 'white',
              ...f, fontSize: 15, fontWeight: on ? 700 : 500,
            }}
          >
            {t}
          </motion.button>
        )
      })}
    </div>
  )
}

function DoctorBadge() {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-[4px]"
      style={{ background: '#FFFFFF26', color: 'white', ...f, fontSize: 11, fontWeight: 700, padding: '2px 6px', letterSpacing: 0.4 }}
    >
      ✓ DOCTOR
    </span>
  )
}

function ArticleCard({ article, onLetsDo }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[14px]"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', padding: '14px 16px' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <DoctorBadge />
        <span style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{article.minutes} min read</span>
      </div>
      <h3 style={{ ...f, fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 6 }}>
        {article.title}
      </h3>
      <p style={{ ...f, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, marginBottom: 10 }}>
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between">
        <span style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {article.author} · {article.role}
        </span>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="rounded-[8px] px-[12px] py-[8px]"
          style={{ background: 'white', color: '#0077A8', ...f, fontSize: 13, fontWeight: 700 }}
        >
          Let's do this together →
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function CommunityScreen({ menuOpen = false, onMenuOpen, onMenuClose, coins = 10, fadeIn = false, onAddMission, onNavigateMissions }) {
  const [tab, setTab] = useState('Articles')

  function handleLetsDo(mission) {
    if (onAddMission) onAddMission(mission)
    if (onNavigateMissions) onNavigateMissions()
  }

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
            <span style={{ ...f, fontWeight: 400, fontSize: 20, letterSpacing: '-0.2px', lineHeight: 1 }}>Community</span>
          </div>
          <div className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}>
            <span style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>{coins}</span>
            <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316 }}>
              <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <TabBar active={tab} onChange={setTab} />
      </div>

      <div className="flex-1 overflow-y-auto py-4 min-h-0 flex flex-col gap-[12px]">
        {tab === 'Articles' && ARTICLES.map((a) => (
          <ArticleCard key={a.id} article={a} onLetsDo={handleLetsDo} />
        ))}

        {tab === 'Groups' && (
          <>
            {GROUPS.map((g) => (
              <div
                key={g.id}
                className="rounded-[14px]"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', padding: '14px 16px' }}
              >
                <div style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{g.members} members</div>
                <h3 style={{ ...f, fontSize: 18, fontWeight: 700, color: 'white', marginTop: 2 }}>{g.name}</h3>
                <p style={{ ...f, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>{g.activity}</p>
                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="rounded-[8px] px-[12px] py-[8px]"
                    style={{ background: 'white', color: '#0077A8', ...f, fontSize: 13, fontWeight: 700 }}
                  >
                    Let's do this together →
                  </motion.button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'Videos' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div style={{ fontSize: 40 }}>🎬</div>
            <p style={{ ...f, fontSize: 16, color: 'white', marginTop: 8 }}>Short-form videos, coming soon.</p>
            <p style={{ ...f, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>We're curating doctor-reviewed clips.</p>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-end justify-start" style={{ height: 90 }}>
        <img src={characterIdle} alt="" style={{ height: 90, objectFit: 'contain', objectPosition: 'bottom left' }} />
      </div>
    </div>
  )
}
