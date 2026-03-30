import { useState } from 'react'
import CatMascot from './CatMascot'
import './TalkScreen.css'

// Guided health data questions — TALK / MANAGEMENT phase
const QUESTIONS = [
  {
    id: 'sleep',
    question: "How many hours of sleep did you get last night?",
    options: ['More than 8 Hours', '7 – 8 Hours', '< 6 Hours'],
  },
  {
    id: 'bedtime',
    question: "What time did you go to bed last night?",
    options: ['Before 10 PM', '10 PM – midnight', 'After midnight'],
  },
  {
    id: 'diet',
    question: "How would you describe your diet today?",
    options: ['Mostly healthy', 'A mix of healthy and junk', 'Mostly fast food'],
  },
  {
    id: 'water',
    question: "How much water did you drink today?",
    options: ['8+ glasses', '4 – 7 glasses', '1 – 3 glasses'],
  },
  {
    id: 'stress',
    question: "How stressed do you feel right now?",
    options: ['Not stressed at all', 'A little stressed', 'Very stressed'],
  },
]

function TalkScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const question = QUESTIONS[currentIndex]
  // Progress as fraction of questions answered
  const progress = (currentIndex / QUESTIONS.length) * 100

  function handleSelect(option) {
    setSelected(option)
  }

  function handleNext() {
    if (!selected) return
    const updatedAnswers = { ...answers, [question.id]: selected }
    setAnswers(updatedAnswers)

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      onComplete(updatedAnswers)
    }
  }

  function handleSkip() {
    const updatedAnswers = { ...answers, [question.id]: null }
    setAnswers(updatedAnswers)
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      onComplete(updatedAnswers)
    }
  }

  return (
    <div className="phone-frame talk-screen">
      {/* ── Header: X  |  progress bar  |  bulb ── */}
      <div className="talk-header">
        <button className="talk-close-btn" aria-label="Close">✕</button>
        <div className="talk-progress-bar">
          <div className="talk-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="talk-bulb" aria-hidden="true">
          {/* Light-bulb icon */}
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 1C5.69 1 3 3.69 3 7c0 2.12 1.07 3.97 2.7 5.1L6 14h6l.3-1.9C13.93 10.97 15 9.12 15 7c0-3.31-2.69-6-6-6z" fill="#231F20" />
            <rect x="6" y="15" width="6" height="2" rx="1" fill="#231F20" />
            <rect x="6.5" y="18" width="5" height="2" rx="1" fill="#231F20" />
          </svg>
        </span>
      </div>

      {/* Phase label */}
      <p className="talk-phase-label">MANAGEMENT</p>

      {/* Title */}
      <h1 className="talk-title">Let's TALK about your health!</h1>

      {/* Cat mascot */}
      <div className="talk-mascot">
        <CatMascot width={155} />
      </div>

      {/* Speech bubble */}
      <div className="talk-bubble">
        <p>{question.question}</p>
        <div className="talk-bubble-tail" />
      </div>

      {/* Answer options */}
      <div className="talk-options">
        {question.options.map((option) => (
          <button
            key={option}
            className={`talk-option-btn ${selected === option ? 'talk-option-selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Skip link */}
      <button className="talk-skip-btn" onClick={handleSkip}>
        I'M UNCOMFORTABLE WITH THIS QUESTION
      </button>

      {/* Next button */}
      <button
        className="talk-next-btn"
        onClick={handleNext}
        disabled={!selected}
      >
        NEXT
      </button>
    </div>
  )
}

export default TalkScreen
