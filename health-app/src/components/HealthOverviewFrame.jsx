import { useState, useRef } from 'react'
import catSvg from '../assets/Cat.svg'
import { PHONE } from '../utils/frame.jsx'
import { playNext } from '../utils/sounds'

// ── Build priority insights from management answers (by question ID) ─
function getInsights(answers = {}) {
  const insights = []

  if (answers.p1 === '< 6 Hours') {
    insights.push({
      priority: 2, icon: '😴', label: 'Sleep Duration',
      message: 'Getting under 6 hours is one of the biggest things to work on — it affects your energy, mood, and immunity every single day.',
      tips: ['Try going to bed just 30 minutes earlier this week — small shifts add up fast', 'Set a gentle bedtime alarm so you actually wind down on time', 'Cut caffeine after 2 PM — it lingers in your system longer than you think'],
    })
  } else if (answers.p1 === '6–8 Hours') {
    insights.push({
      priority: 1, icon: '🕐', label: 'Sleep Duration',
      message: "You're close to the sweet spot — nudging toward 7–9 hours could make a real difference to how sharp and energised you feel each day.",
      tips: ['Aim for the higher end of that 7–9 hour range when life allows', 'A consistent wake time anchors your whole sleep rhythm, even on weekends', 'A short wind-down before bed helps you fall asleep faster and sleep deeper'],
    })
  }

  if (answers.p2 === 'After Midnight') {
    insights.push({
      priority: 2, icon: '🌙', label: 'Bedtime',
      message: 'Going to bed late pushes your body clock out of sync and chips away at your deep sleep — even a gradual shift earlier makes a big difference.',
      tips: ['Try moving your bedtime 30 minutes earlier every few days rather than all at once', 'Dim your lights after 9 PM — your brain reads that as a cue to wind down', 'Put your phone face down at least 30 minutes before you want to sleep'],
    })
  } else if (answers.p2 === '10 PM – Midnight') {
    insights.push({
      priority: 1, icon: '🌙', label: 'Bedtime',
      message: "You're going to bed at a reasonable time — locking that in as a consistent habit is what turns good sleep into great sleep.",
      tips: ['Same bedtime every night — yes, weekends too — makes this stick', 'A small bedtime reminder on your phone can be surprisingly helpful', 'Even a 10-minute wind-down ritual tells your body sleep is coming'],
    })
  }

  if (answers.p3 === 'Poor') {
    insights.push({
      priority: 2, icon: '✨', label: 'Sleep Quality',
      message: "Even if you're spending enough time in bed, poor sleep quality means your body isn't getting the deep rest it actually needs to recover.",
      tips: ['Caffeine after 2 PM still affects your sleep at midnight — try cutting it earlier', 'A cooler bedroom, around 18°C, genuinely helps your body drop into deep sleep', 'Screens before bed keep your brain alert — even 20 minutes away from them helps'],
    })
  } else if (answers.p3 === 'Average') {
    insights.push({
      priority: 1, icon: '✨', label: 'Sleep Quality',
      message: "Your sleep is okay but there is room to feel meaningfully more rested — a few small consistent changes can shift this quite a bit.",
      tips: ['A regular sleep schedule is honestly the single most effective thing you can do', 'Dark, quiet, and cool — your bedroom environment matters more than most people realise', 'Alcohol might help you fall asleep but it disrupts your deep sleep cycles later in the night'],
    })
  }

  if (answers.p4 === 'Rarely') {
    insights.push({
      priority: 2, icon: '⚡', label: 'Morning Recovery',
      message: "Rarely waking up rested is a sign your sleep cycles aren't completing properly — this is very much something you can change.",
      tips: ['A fixed wake time every day helps your body learn exactly when to finish its sleep cycles', 'Try shifting your alarm by 15 minutes — sometimes that lands you at a better point in your cycle', 'Snoozing feels good but fragments your last sleep cycle and leaves you groggier, not less'],
    })
  } else if (answers.p4 === 'Sometimes') {
    insights.push({
      priority: 1, icon: '⚡', label: 'Morning Recovery',
      message: "Waking up rested sometimes means you're close — a bit more consistency in your routine could make that feeling happen every morning.",
      tips: ['Same wake time every day, weekends included, is the quickest way to make this consistent', 'Getting outside or into natural light within 30 minutes of waking resets your body clock fast', 'Keep any naps under 20 minutes — longer ones make it harder to feel rested the next morning'],
    })
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

// ── Top priority headline + motivational message ─────────────────
function getPriorityCard(insights) {
  if (insights.length === 0) return {
    headline: "Your sleep habits are in great shape!",
    motivation: "Keep your current routine consistent and you'll continue to feel your best.",
  }
  const map = {
    'Sleep Duration':   { headline: "You need more sleep time above everything else.",    motivation: "Even 30 extra minutes makes a measurable difference to your memory, mood, and immunity." },
    'Bedtime':          { headline: "Shifting your bedtime earlier is your biggest win.",  motivation: "Going to bed later cuts into your deep sleep and keeps your body clock out of sync." },
    'Sleep Quality':    { headline: "Improving how deeply you sleep is the priority.",     motivation: "Poor quality sleep means your body can't repair fully — no matter how long you're in bed." },
    'Morning Recovery': { headline: "Waking up rested should be your first goal.",         motivation: "Rarely feeling rested signals your sleep cycles aren't completing — fixing this changes everything." },
  }
  return map[insights[0].label] ?? { headline: `${insights[0].label} is your main focus right now.`, motivation: insights[0].message }
}

// ── Swipeable insight carousel ───────────────────────────────────
function InsightCarousel({ insights }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(null)

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 40 && current < insights.length - 1) setCurrent(c => c + 1)
    if (diff < -40 && current > 0) setCurrent(c => c - 1)
    touchStartX.current = null
  }

  if (insights.length === 0) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Section label */}
      <p className="text-[13px] font-black text-[#059669] uppercase tracking-[2px] mb-2 px-1 shrink-0">Your Insights</p>

      {/* Card track — fills all remaining space */}
      <div
        className="overflow-hidden rounded-[16px] flex-1 min-h-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {insights.map((insight, i) => (
            <div key={i} className="w-full h-full shrink-0 bg-white px-4 pt-4 pb-3 flex flex-col">
              {/* Card header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{insight.icon}</span>
                  <p className="text-[18px] font-black text-[#064E3B]">{insight.label}</p>
                </div>
                <span className="text-[13px] font-bold text-[#6EE7B7] bg-[#ECFDF5] rounded-full px-2 py-0.5">
                  {i + 1} / {insights.length}
                </span>
              </div>

              {/* Message */}
              <p className="text-[16px] text-[#374151] leading-snug mb-3 shrink-0">{insight.message}</p>

              {/* Tips */}
              <div className="bg-[#F0FDF4] rounded-[12px] px-4 py-3 flex-1">
                <p className="text-[13px] font-black text-[#059669] uppercase tracking-[1.5px] mb-2">What to do about it</p>
                <div className="flex flex-col gap-2">
                  {insight.tips.map((tip, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-[#059669] text-sm shrink-0 mt-0.5">•</span>
                      <p className="text-[16px] text-[#374151] leading-snug">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2 mt-2.5">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-5 h-2 bg-[#059669]'
                : 'w-2 h-2 bg-[#A7F3D0]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function HealthOverviewFrame({ managementAnswers, onComplete, returning, entryAnim }) {
  const insights = getInsights(managementAnswers)
  const { headline, motivation } = getPriorityCard(insights)

  return (
    <div className={`${PHONE} bg-[#D1FAE5]`} style={entryAnim}>

      {/* ── Banner ── */}
      <div className="shrink-0 flex items-center gap-2 bg-[#6EE7B7] rounded-[14px] px-4 py-[10px] mb-4">
        <span className="text-base">📊</span>
        <p className="text-[11px] font-black tracking-[2px] text-[#065F46] uppercase">YOUR HEALTH OVERVIEW</p>
      </div>

      {/* ── Title ── */}
      <div className="shrink-0 mb-3">
        <p className="text-[24px] font-black text-[#064E3B] leading-tight">Health Overview</p>
        <p className="text-[13px] font-black text-[#059669] uppercase tracking-[2px] mt-0.5">Sleep</p>
      </div>

      {/* ── Priority card — deep forest green ── */}
      <div className="shrink-0 bg-[#064E3B] rounded-[16px] p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⚡</span>
          <p className="text-[11px] font-black text-[#6EE7B7] uppercase tracking-[2px]">
            WHAT WE CAN IMPROVE FIRST
          </p>
        </div>
        <p className="text-[17px] font-black text-white leading-snug mb-1">{headline}</p>
        <p className="text-[13px] text-green-200 leading-snug">{motivation}</p>
      </div>

      {/* ── Swipeable insight carousel — fills remaining space ── */}
      <InsightCarousel insights={insights} />

      {/* ── CTA button ── */}
      <button
        onClick={() => { playNext(); onComplete() }}
        className="w-full h-[52px] bg-[#059669] text-white text-lg font-bold rounded-[14px] shrink-0 mt-3"
      >
        {returning ? 'BACK TO YOUR ACTIONS!' : "LET'S TAKE ACTION"}
      </button>

    </div>
  )
}
