import { useState } from 'react'
import CatMascot from './CatMascot'
import './ActionScreen.css'

// Actions the user can commit to, each worth points
const ACTIONS = [
  { id: 'water',     icon: '💧', text: 'Drink 8 glasses of water every day',       points: 50 },
  { id: 'sleep',     icon: '😴', text: 'Sleep 7–8 hours each night',               points: 60 },
  { id: 'steps',     icon: '🚶', text: 'Walk at least 8,000 steps daily',          points: 80 },
  { id: 'veggies',   icon: '🥦', text: 'Eat vegetables with every meal',           points: 40 },
  { id: 'screen',    icon: '📵', text: 'No screens 30 minutes before bed',         points: 45 },
  { id: 'breathe',   icon: '🧘', text: 'Practice deep breathing for 5 minutes',   points: 35 },
  { id: 'breakfast', icon: '🍳', text: 'Never skip breakfast',                     points: 30 },
]

function ActionScreen({ onRestart }) {
  const [committed, setCommitted] = useState(new Set())
  const [submitted, setSubmitted] = useState(false)

  const totalPoints = Array.from(committed).reduce((sum, id) => {
    const action = ACTIONS.find((a) => a.id === id)
    return sum + (action ? action.points : 0)
  }, 0)

  function toggleAction(id) {
    if (submitted) return
    setCommitted((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCommit() {
    if (committed.size === 0) return
    setSubmitted(true)
  }

  return (
    <div className="phone-frame action-screen">
      {/* ── Header ── */}
      <div className="action-header">
        <button className="action-close-btn" aria-label="Close">✕</button>
        <div className="action-progress-bar">
          <div className="action-progress-fill" />
        </div>
        <span className="action-bulb" aria-hidden="true">
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 1C5.69 1 3 3.69 3 7c0 2.12 1.07 3.97 2.7 5.1L6 14h6l.3-1.9C13.93 10.97 15 9.12 15 7c0-3.31-2.69-6-6-6z" fill="#231F20" />
            <rect x="6" y="15" width="6" height="2" rx="1" fill="#231F20" />
            <rect x="6.5" y="18" width="5" height="2" rx="1" fill="#231F20" />
          </svg>
        </span>
      </div>

      {/* Phase label */}
      <p className="action-phase-label">ACTION</p>

      {/* Title */}
      <h1 className="action-title">Let's TAKE ACTION about your health!</h1>

      {/* Cat mascot */}
      <div className="action-mascot">
        <CatMascot width={120} />
      </div>

      {submitted ? (
        /* ── Success state ── */
        <div className="action-success">
          <div className="action-success-badge">🏆</div>
          <h2 className="action-success-heading">You're committed!</h2>
          <p className="action-success-sub">
            You've earned <strong>{totalPoints} points</strong> by committing to{' '}
            {committed.size} healthy action{committed.size !== 1 ? 's' : ''}. Keep it up!
          </p>
          <div className="action-pts-display">🏅 +{totalPoints} pts</div>
          <div className="action-committed-list">
            {Array.from(committed).map((id) => {
              const action = ACTIONS.find((a) => a.id === id)
              return action ? (
                <div key={id} className="action-committed-item">
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                  <span className="action-pts-badge">+{action.points}</span>
                </div>
              ) : null
            })}
          </div>
          <button className="action-restart-btn" onClick={onRestart}>
            START OVER
          </button>
        </div>
      ) : (
        /* ── Selection state ── */
        <>
          {/* Speech bubble */}
          <div className="action-bubble">
            <p>Try 5 minutes of deep breathing or meditation. Pick the actions you are ready to commit to and earn points! 🌱</p>
            <div className="action-bubble-tail" />
          </div>

          {/* Points tally + commit label */}
          <div className="action-tally-row">
            <span className="action-tally-label">NOW START WITH ONE ACTION, &amp; COMMIT!</span>
            <span className="action-tally-pts">🏅 {totalPoints} pts</span>
          </div>

          {/* Action list */}
          <div className="action-list">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                className={`action-item ${committed.has(action.id) ? 'action-item-selected' : ''}`}
                onClick={() => toggleAction(action.id)}
              >
                <span className="action-item-check">
                  {committed.has(action.id) ? '✓' : '○'}
                </span>
                <span className="action-item-icon">{action.icon}</span>
                <span className="action-item-text">{action.text}</span>
                <span className="action-pts-badge">+{action.points}</span>
              </button>
            ))}
          </div>

          {/* Commit button — Figma: bg #89F53A, text #B7FF82 */}
          <button
            className="action-commit-btn"
            onClick={handleCommit}
            disabled={committed.size === 0}
          >
            I'M COMMITTED!
          </button>
        </>
      )}
    </div>
  )
}

export default ActionScreen
