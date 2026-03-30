import { useState, useLayoutEffect } from 'react'
import StartingScreen          from './components/StartingScreen'
import ManagementFrame         from './components/ManagementFrame'
import LearningFrame           from './components/LearningFrame'
import HealthOverviewFrame     from './components/HealthOverviewFrame'
import ActionsFrame            from './components/ActionsFrame'
import SurveyFrame             from './components/SurveyFrame'
import { startBgMusic, preloadSounds } from './utils/sounds'

const BG = {
  start:      '#BEEDFF',
  management: '#BEEDFF',
  learning:   '#EDE0FF',
  actions:    '#D1FAE5',
  survey:     '#BEEDFF',
}

// Called SYNCHRONOUSLY inside event handlers — before React re-renders.
// This is the earliest possible moment to update the DOM so Safari
// samples the correct colour when it next paints the status bar.
function applyPhaseColor(colour) {
  document.documentElement.style.backgroundColor = colour
  document.body.style.backgroundColor            = colour
  // Update the existing meta element in-place rather than destroying + recreating it.
  // iOS Safari tracks the element by reference — remove/re-add is not reliably detected,
  // but setAttribute on the same node triggers an immediate re-read of the status bar colour.
  let meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', colour)
  } else {
    meta = document.createElement('meta')
    meta.setAttribute('name',    'theme-color')
    meta.setAttribute('content', colour)
    document.head.appendChild(meta)
  }
}

// Slide animation styles for screen transitions
const ANIM = {
  forward: { animation: 'slide-in-from-right 0.32s ease forwards' },
  back:    { animation: 'slide-in-from-left  0.32s ease forwards' },
  none:    {},
}

export default function App() {
  const [phase,     setPhase]     = useState('start')
  const [mgmtAns,   setMgmtAns]   = useState({})   // by index → LearningFrame
  const [mgmtById,  setMgmtById]  = useState({})   // by question ID → HealthOverviewFrame
  const [slideDir,  setSlideDir]  = useState('none')
  const [returning, setReturning] = useState(false) // user went back to health from actions

  // Set initial colour on first mount (start screen = same blue as management)
  useLayoutEffect(() => {
    applyPhaseColor(BG.start)
    startBgMusic()    // attempt autoplay; falls back to first interaction
    preloadSounds()   // pre-decode click sounds into memory — zero lag on first tap
  }, [])

  function handleStart() {
    applyPhaseColor(BG.management)
    setSlideDir('forward')
    setPhase('management')
  }

  function handleManagementComplete(resultById, resultByIndex) {
    applyPhaseColor(BG.learning)
    setMgmtAns(resultByIndex)
    setMgmtById(resultById)
    setSlideDir('forward')
    setPhase('learning')
  }

  function handleLearningComplete() {
    applyPhaseColor(BG.actions)
    setSlideDir('forward')
    setReturning(false)
    setPhase('health')
  }

  function handleHealthComplete() {
    setSlideDir('forward')
    setPhase('actions')
  }

  // ← Back arrow on actions screen → return to health overview
  function handleGoBackToHealth() {
    setSlideDir('back')
    setReturning(true)
    setPhase('health')
  }

  // NEXT on "You're committed" → survey screen
  function handleActionsNext() {
    applyPhaseColor(BG.survey)
    setSlideDir('forward')
    setPhase('survey')
  }

  function handleRestart() {
    applyPhaseColor(BG.start)
    setMgmtAns({})
    setMgmtById({})
    setSlideDir('none')
    setReturning(false)
    setPhase('start')
  }

  const anim = ANIM[slideDir] ?? {}

  return (
    // Mobile: transparent full-screen passthrough
    // Desktop: grey background, centred phone shell
    <div className="md:min-h-screen md:flex md:items-center md:justify-center">
      {phase === 'start'      && <StartingScreen onStart={handleStart} />}
      {phase === 'management' && <ManagementFrame onComplete={handleManagementComplete} />}
      {phase === 'learning'   && <LearningFrame managementAnswers={mgmtAns} onComplete={handleLearningComplete} />}
      {phase === 'health'     && (
        <HealthOverviewFrame
          managementAnswers={mgmtById}
          onComplete={handleHealthComplete}
          returning={returning}
          entryAnim={anim}
        />
      )}
      {phase === 'actions'    && (
        <ActionsFrame
          onNext={handleActionsNext}
          onBack={handleGoBackToHealth}
          onRestart={handleRestart}
          entryAnim={anim}
        />
      )}
      {phase === 'survey'     && (
        <SurveyFrame
          onRestart={handleRestart}
          entryAnim={anim}
        />
      )}
    </div>
  )
}
