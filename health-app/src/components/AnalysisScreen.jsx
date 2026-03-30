import CatMascot from './CatMascot'
import './AnalysisScreen.css'

// ── Scoring ──────────────────────────────────────────────────
function calcHealthScore(userData) {
  const scoreMap = {
    sleep:   { 'More than 8 Hours': 20, '7 – 8 Hours': 20, '< 6 Hours': 5 },
    diet:    { 'Mostly healthy': 20, 'A mix of healthy and junk': 12, 'Mostly fast food': 4 },
    water:   { '8+ glasses': 20, '4 – 7 glasses': 12, '1 – 3 glasses': 4 },
    stress:  { 'Not stressed at all': 20, 'A little stressed': 14, 'Very stressed': 0 },
    bedtime: { 'Before 10 PM': 20, '10 PM – midnight': 14, 'After midnight': 4 },
  }

  let earned = 0
  let possible = 0

  for (const [key, map] of Object.entries(scoreMap)) {
    const answer = userData[key]
    if (answer && map[answer] !== undefined) earned += map[answer]
    possible += 20
  }

  return possible > 0 ? Math.round((earned / possible) * 100) : 50
}

function getScoreInfo(score) {
  if (score >= 80) return { label: 'Excellent', emoji: '🌟' }
  if (score >= 60) return { label: 'Good',      emoji: '😊' }
  if (score >= 40) return { label: 'Fair',      emoji: '😐' }
  return                  { label: 'Needs Work',emoji: '💪' }
}

// ── Insight cards ─────────────────────────────────────────────
function buildInsights(userData) {
  const insights = []

  const sleepMap = {
    'More than 8 Hours': { good: true,  text: 'Great sleep duration! Keep it up.' },
    '7 – 8 Hours':       { good: true,  text: 'Sleep is within the healthy range.' },
    '< 6 Hours':         { good: false, text: 'You could benefit from more sleep each night.' },
  }
  if (userData.sleep && sleepMap[userData.sleep]) {
    insights.push({ icon: '😴', category: 'Sleep', ...sleepMap[userData.sleep] })
  }

  const dietMap = {
    'Mostly healthy':            { good: true,  text: 'Your diet looks great! Nutrition is on point.' },
    'A mix of healthy and junk': { good: false, text: 'Try to reduce processed foods for better energy.' },
    'Mostly fast food':          { good: false, text: 'Eating more whole foods can greatly improve how you feel.' },
  }
  if (userData.diet && dietMap[userData.diet]) {
    insights.push({ icon: '🥗', category: 'Diet', ...dietMap[userData.diet] })
  }

  const waterMap = {
    '8+ glasses':    { good: true,  text: 'Excellent hydration! Your body loves you for it.' },
    '4 – 7 glasses': { good: true,  text: 'Decent hydration — try to reach 8 glasses a day.' },
    '1 – 3 glasses': { good: false, text: 'You are likely mildly dehydrated. Drink more water!' },
  }
  if (userData.water && waterMap[userData.water]) {
    insights.push({ icon: '💧', category: 'Hydration', ...waterMap[userData.water] })
  }

  const stressMap = {
    'Not stressed at all': { good: true,  text: 'Your stress levels look healthy. Keep finding balance.' },
    'A little stressed':   { good: true,  text: 'Mild stress is normal. Try relaxation techniques.' },
    'Very stressed':       { good: false, text: 'High stress impacts your immune system. Make rest a priority.' },
  }
  if (userData.stress && stressMap[userData.stress]) {
    insights.push({ icon: '🧘', category: 'Stress', ...stressMap[userData.stress] })
  }

  return insights
}

// ── Component ─────────────────────────────────────────────────
function AnalysisScreen({ userData, onNext }) {
  const score    = calcHealthScore(userData)
  const info     = getScoreInfo(score)
  const insights = buildInsights(userData)

  return (
    <div className="phone-frame analysis-screen">
      {/* ── Header: same X / progress / bulb bar ── */}
      <div className="analysis-header-bar">
        <button className="analysis-close-btn" aria-label="Close">✕</button>
        <div className="analysis-progress-bar">
          <div className="analysis-progress-fill" style={{ width: '100%' }} />
        </div>
        <span className="analysis-bulb" aria-hidden="true">
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 1C5.69 1 3 3.69 3 7c0 2.12 1.07 3.97 2.7 5.1L6 14h6l.3-1.9C13.93 10.97 15 9.12 15 7c0-3.31-2.69-6-6-6z" fill="#231F20" />
            <rect x="6" y="15" width="6" height="2" rx="1" fill="#231F20" />
            <rect x="6.5" y="18" width="5" height="2" rx="1" fill="#231F20" />
          </svg>
        </span>
      </div>

      {/* ── Section label ── */}
      <div className="analysis-label-row">
        <span className="analysis-label-icon">📋</span>
        <span className="analysis-label-text">YOUR HEALTH INSIGHTS</span>
      </div>

      {/* ── Cat + score ── */}
      <div className="analysis-top">
        <CatMascot width={110} />
        <div className="analysis-score-badge">
          <span className="analysis-score-emoji">{info.emoji}</span>
          <span className="analysis-score-number">{score}</span>
          <span className="analysis-score-label">{info.label}</span>
        </div>
      </div>

      {/* ── Green insight panel ── */}
      <div className="analysis-panel">
        <p className="analysis-panel-heading">SLEEP FOR YOU</p>
        <div className="analysis-cards">
          {insights.length === 0 && (
            <p className="analysis-empty">Complete the Talk section to see your insights.</p>
          )}
          {insights.map((insight) => (
            <div
              key={insight.category}
              className={`analysis-card ${insight.good ? 'analysis-card-good' : 'analysis-card-warn'}`}
            >
              <span className="analysis-card-icon">{insight.icon}</span>
              <div>
                <p className="analysis-card-category">{insight.category}</p>
                <p className="analysis-card-text">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Next button ── */}
      <button className="analysis-next-btn" onClick={onNext}>
        NEXT
      </button>
    </div>
  )
}

export default AnalysisScreen
