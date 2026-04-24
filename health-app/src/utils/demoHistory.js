// Hardcoded demo data so anyone testing Petch has a plausible past to
// reference — without this the AI keeps falling back to "I don't have
// access to your past data". The shape is close to what the real
// Supabase-backed history will look like (one row per check-in plus a
// handful of derived patterns), so the switch later is mechanical.

export const DEMO_USER = {
  age: 22,
  pet: 'dog',
  tagline: 'Loves Sleeping',
  goals: [
    'Sleep at least 7 hours on weeknights',
    'Eat a proper breakfast Mon–Fri',
    'Move 3× a week (walks count)',
  ],
}

// Ordered oldest → newest. Dates match MenuDrawer "Previous Sessions".
export const DEMO_SESSIONS = [
  {
    topic: 'Sleep',
    date: '11 Apr 2026',
    mood: 2,
    summary:
      'Only 5 hours of sleep after a late design studio session. Scrolling in bed for ~40 min before falling asleep. Felt groggy in the morning.',
    committedAction: 'Lights out by midnight tonight, phone charging across the room.',
    followThrough: 'partial',
  },
  {
    topic: 'Sleep',
    date: '15 Apr 2026',
    mood: 4,
    summary:
      'Improved to ~7 hours on weeknights. Noticed that iced coffee after 4pm makes it harder to wind down — reported 2 nights where this happened.',
    committedAction: 'No caffeine after 4pm on weeknights.',
    followThrough: 'good',
  },
  {
    topic: 'Nutrition',
    date: '20 Apr 2026',
    mood: 3,
    summary:
      'Skipping breakfast on rushed mornings (3/5 weekdays) and replacing it with iced coffee. Energy crashes around 11am. Dinner is usually fine — home-cooked, veg-heavy.',
    committedAction: 'Prep a 2-minute protein breakfast (greek yogurt + banana) the night before.',
    followThrough: 'pending',
  },
]

// High-level patterns Petch has "noticed" across the recent sessions.
// Name is injected at build-time so the demo reflects the current user.
export function buildDemoPatterns(name) {
  return [
    'Late-night studio work pushes bedtime past midnight around deadlines.',
    `Caffeine after 4pm is the single biggest disruptor of ${name}'s sleep onset.`,
    'Breakfast is the weakest meal of the day — often skipped when mornings feel rushed.',
    'Mood tends to dip on days that combine <6h sleep + skipped breakfast.',
    'Exercise has not been logged yet — a likely next area to explore.',
  ]
}

// Shape what the menu drawer wants (topic + date only).
export const DEMO_SESSION_LIST = DEMO_SESSIONS.map(s => ({
  topic: s.topic,
  date: s.date,
}))

// Compact, AI-friendly text block — appended to the system prompt so
// Claude has concrete facts to reference instead of refusing.
export function buildUserContextBlock(name = 'the user') {
  const sessionLines = DEMO_SESSIONS.map(s =>
    `- ${s.date} · ${s.topic} (mood ${s.mood}/5): ${s.summary} Committed action: "${s.committedAction}" (${s.followThrough}).`
  ).join('\n')
  const patternLines = buildDemoPatterns(name).map(p => `- ${p}`).join('\n')
  const goalLines = DEMO_USER.goals.map(g => `- ${g}`).join('\n')

  return `\n\nCONTEXT ABOUT THIS USER (use naturally — do NOT dump it all at once, and NEVER say you have no data):
Name: ${name} (${DEMO_USER.age}, pet companion: ${DEMO_USER.pet}).
Stated goals:
${goalLines}

Recent check-ins (oldest first):
${sessionLines}

Patterns Petch has noticed:
${patternLines}

When the user asks about their past health, yesterday, trends, or "what have you noticed" — reference specific items above (by date or by pattern) rather than saying you lack data. Keep replies warm and concise.`
}
