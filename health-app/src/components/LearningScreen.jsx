import { useState } from 'react'
import CatMascot from './CatMascot'
import './LearningScreen.css'

// Quiz questions — LEARNING phase
// multiSelect: true → user can pick more than one answer
const QUESTIONS = [
  {
    id: 'sleepHours',
    question: 'How many hours of sleep should someone get everyday?',
    multiSelect: false,
    options: ['More than 8 Hours', '7 Hours', '> 6 Hours'],
    correctAnswers: ['7 Hours'],
  },
  {
    id: 'sleepAvoid',
    question: 'What should you avoid doing before you sleep?',
    hint: 'You can select more than one',
    multiSelect: true,
    options: ['Looking at Screens', 'Drinking Coffee', 'Saying I love you'],
    correctAnswers: ['Looking at Screens', 'Drinking Coffee'],
  },
  {
    id: 'hydration',
    question: 'How many glasses of water should you drink per day?',
    multiSelect: false,
    options: ['2 – 4 glasses', '6 – 8 glasses', '10 – 12 glasses'],
    correctAnswers: ['6 – 8 glasses'],
  },
  {
    id: 'exercise',
    question: 'How many minutes of exercise does the WHO recommend per week?',
    multiSelect: false,
    options: ['At least 60 minutes', 'At least 150 minutes', 'At least 300 minutes'],
    correctAnswers: ['At least 150 minutes'],
  },
  {
    id: 'stress',
    question: 'Which of these activities help reduce stress?',
    hint: 'You can select more than one',
    multiSelect: true,
    options: ['Deep Breathing', 'Meditation', 'Scrolling Social Media', 'Walking in Nature'],
    correctAnswers: ['Deep Breathing', 'Meditation', 'Walking in Nature'],
  },
]

function LearningScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(new Set())

  const question = QUESTIONS[currentIndex]
  const progress = (currentIndex / QUESTIONS.length) * 100
  const isLast = currentIndex === QUESTIONS.length - 1

  function toggleOption(option) {
    if (question.multiSelect) {
      setSelected((prev) => {
        const next = new Set(prev)
        next.has(option) ? next.delete(option) : next.add(option)
        return next
      })
    } else {
      setSelected(new Set([option]))
    }
  }

  function handleSubmit() {
    if (selected.size === 0) return
    const updatedAnswers = { ...answers, [question.id]: Array.from(selected) }
    setAnswers(updatedAnswers)
    advance(updatedAnswers)
  }

  function handleSkip() {
    const updatedAnswers = { ...answers, [question.id]: [] }
    setAnswers(updatedAnswers)
    advance(updatedAnswers)
  }

  function advance(updatedAnswers) {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1)
      setSelected(new Set())
    } else {
      onComplete(updatedAnswers)
    }
  }

  return (
    <div className="phone-frame learn-screen">
      {/* ── Header: X  |  progress  |  bulb ── */}
      <div className="learn-header">
        <button className="learn-close-btn" aria-label="Close">✕</button>
        <div className="learn-progress-bar">
          <div className="learn-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="learn-bulb" aria-hidden="true">
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 1C5.69 1 3 3.69 3 7c0 2.12 1.07 3.97 2.7 5.1L6 14h6l.3-1.9C13.93 10.97 15 9.12 15 7c0-3.31-2.69-6-6-6z" fill="#231F20" />
            <rect x="6" y="15" width="6" height="2" rx="1" fill="#231F20" />
            <rect x="6.5" y="18" width="5" height="2" rx="1" fill="#231F20" />
          </svg>
        </span>
      </div>

      {/* Phase label */}
      <p className="learn-phase-label">LEARNING</p>

      {/* Title */}
      <h1 className="learn-title">Let's LEARN about your health!</h1>

      {/* Cat mascot */}
      <div className="learn-mascot">
        <CatMascot width={148} />
      </div>

      {/* Speech bubble */}
      <div className="learn-bubble">
        <p>
          {question.question}
          {question.hint && (
            <span className="learn-bubble-hint"> ({question.hint})</span>
          )}
        </p>
        <div className="learn-bubble-tail" />
      </div>

      {/* Answer options */}
      <div className="learn-options">
        {question.options.map((option) => (
          <button
            key={option}
            className={`learn-option-btn ${selected.has(option) ? 'learn-option-selected' : ''}`}
            onClick={() => toggleOption(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Skip link */}
      <button className="learn-skip-btn" onClick={handleSkip}>
        I'M UNCOMFORTABLE WITH THIS QUESTION
      </button>

      {/* Submit */}
      <button
        className="learn-submit-btn"
        onClick={handleSubmit}
        disabled={selected.size === 0}
      >
        SUBMIT
      </button>
    </div>
  )
}

export default LearningScreen
