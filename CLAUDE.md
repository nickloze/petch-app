# CLAUDE.md — Petch Health App

## Project Overview

Petch is a **gamified AI health companion** for young adults (18–30), where the **chat interface is the core experience**. Instead of a passive multi-screen app, Petch is a daily conversational companion powered by **Digital Omotenashi** — anticipatory, personalised, empathetic AI care. Users progress through a **Knowing → Learning → Doing** loop every day, guided by Petch through a single chat session that resets daily. Built as a design student's graduation project.

**Live:** https://petch-health-app.vercel.app

---

## Core Philosophy: The Knowing–Learning–Doing Loop

Petch runs on a continuous daily loop:

- **Knowing** — the user reflects on their current health state (self-awareness + reflection)
- **Learning** — Petch delivers personalised health knowledge based on what it knows about the user
- **Doing** — the user commits to a concrete action before the session ends

Everything else (articles, missions, rewards) extends this loop outward.

---

## Digital Omotenashi

Petch is built on **Digital Omotenashi** — a system of anticipatory, personalised, and empathetic care delivered through AI.

- **Personalised Content (AIGD)** — health content is dynamically tailored. Insights, articles, and actions surface based on behaviour, patterns, and daily inputs.
- **Anticipatory Interaction** — Petch does not wait to be asked. It proactively prompts reflection and surfaces needs the user may not know they have.
- **Empathetic Communication** — human-centred, supportive language. Petch is a companion, not a tool; the user feels understood, not instructed.

> The system seeks to *know the user first*, so it can guide them better.

---

## Product Vision

### Chat as the Core Interface

**Chat IS the home screen.** Opening the app drops the user directly into today's session with Petch.

- **Pet as chat avatar** — the chosen companion (dog/cat/rabbit/frog) appears in the chat header, mood-reactive to messages and engagement.
- **Daily mandatory check-in** — the session begins with a required check-in that unlocks the rest of the app for the day.
- **One session per day** — each day is a single contained chat. At midnight the chat resets and the day's history is archived as a **health log**. This enforces healthy boundaries (no over-dependence) and structured reflection over time.
- **Claude guides Knowing → Learning → Doing as conversational phases** — the check-in is not a rigid flow of screens but a guided conversation. Petch ensures all three phases happen before the session closes.
- **Topic selection via quick-reply buttons** — Petch asks which area to focus on; the user taps one of Sleep / Nutrition / Exercise.
- **AI behaviour** — asks questions rather than answering; nudges toward articles (Community) and missions (Actions); reframes rather than instructs.

### Knowing → Learning → Doing in Chat

Within the daily session:

1. **Knowing** — Petch prompts reflection; Claude reads the input plus prior history from Supabase.
2. **Learning** — Petch delivers targeted personalised questions and insights based on what it knows about this user.
3. **Doing** — before the session ends, the user commits to one action for the day. This becomes **Slot 1** on the Actions tab.

### Gamification (Coins, Missions, Rewards)

- **Currency:** Coins (sole in-app currency).
- **Earn:** daily check-ins, completed missions, maintained streaks, long-term challenges.
- **Spend:** real-life vouchers (e.g. Subway 20% off, Boost 20% off) and pet cosmetics.
- **Rewards ledger:** every coin event is recorded in the `rewards` table with the reason, providing full gamification history.

**Mission System:**
- Maximum **3 active missions** at any time.
- **Slot 1** is auto-filled by the committed action from the daily check-in.
- **Slots 2 & 3** are optional, filled by Petch-suggested missions targeting the user's weakest health areas.
- Users **cannot create their own missions** — all missions are Petch-suggested.
- Mission types map to concrete behaviours (e.g. `drink_water`, `10min_walk`, `sleep_by_11`).
- Status values: `pending`, `completed`, `skipped`.

**Why max 3?** Keeps the experience sustainable and prevents burnout. User choice within suggestions builds intrinsic motivation.

### Community Tab

A read-and-connect space that feeds motivation and links back to Actions.

- **Articles** — posted by verified doctors only. Users can comment; doctors moderate and pin responses.
- **Friend Groups** — private circles only. Friends see each other's learning progress and achievements; can create group discussion pages.
- **Short-form Video** — TikTok-style, curated for credible health-positive content.
- **"Let's Do This Together"** — articles and group discussions can surface a prompt that links directly to Actions, encouraging shared missions.

### Profile Tab

- **Account & Settings** — user info, preferences, notifications.
- **Pet View & Cosmetics** — view the pet, equip hats/accessories/outfits.
- **Stats & History** — coin balance, streak count, learning history, achievements.

### Rewards Shop (Top Bar)

Accessed via the coin icon in the persistent top bar.
- 🎟️ Real-life vouchers
- 🎨 Pet cosmetics applied to the chat-header avatar

### Navigation

- **Bottom tab bar:** Home (Chat) | Community | Actions | Profile
- **Top bar:** persistent; coin balance icon opens Rewards Shop.

### Pet Companion

- **Placement:** avatar in the chat header, reactive to the conversation.
- **Selection:** during onboarding, users choose from Dog, Cat, Rabbit, or Frog.
- **Mood states** (tied to engagement, NOT health outcomes):

| State | Trigger |
|---|---|
| Happy / Active | Regular check-ins and completed missions |
| Tired | User hasn't engaged for a few days |
| Sleepy / Low Energy | Longer absence |

**Key principle:** the pet is always supportive and uplifting. It never reflects health scores or makes the user feel judged. It is a health companion, not a health monitor.

### Health Topics

Current: Sleep, Nutrition, Exercise
Planned: Mental Health, Hydration, Screen Time, Sexual Health, Substance Awareness

### Content Strategy

- **AI-Generated Personalisation** — Claude generates personalised questions, feedback, and health overviews from the user's profile and history.
- **Expert-Reviewed Foundation** — all health content is grounded in material written or reviewed by medical professionals.
- **Simple Language** — jargon is simplified so any user can comprehend the information regardless of prior knowledge.

### Notification & Nudge Strategy

Rooted in Digital Omotenashi anticipatory design:
- **Surprise Nudges** — unexpected tips, encouragement, special challenges.
- **Learning Reminders** — gentle prompts to start the daily session, voiced through the pet.
- **Action Check-ins** — follow-ups asking whether the committed action was completed.
- **Streak Alerts** — warnings when a streak is about to break.
- **Contextual Tips** — time-of-day relevant (e.g. wind-down reminders for sleep).

### Onboarding Flow

1. **Account Creation** — email/social auth (Supabase Auth).
2. **Health Profile** — baseline health questions establishing the starting point.
3. **Pet Selection** — choose companion (dog/cat/rabbit/frog).
4. **Goal Setting** — personal health goals and preferences.
5. **First Session** — first chat with Petch begins the daily loop.

---

## Full User Flow Summary

```
App Open
  └── Today's Chat Session (home)
        ├── Petch Avatar in Header
        ├── Mandatory Check-in
        │     ├── Knowing — reflection prompts
        │     ├── Learning — personalised Q&A + insights
        │     └── Doing — commit to 1 action → fills Slot 1
        └── Free conversation (nudges to articles + missions)

Actions Tab
  ├── Slot 1: auto from check-in
  ├── Slot 2: optional Petch suggestion
  └── Slot 3: optional Petch suggestion
        └── Complete → coins → Rewards Shop
              ├── Vouchers
              └── Pet Cosmetics → applied to chat avatar

Community Tab
  ├── Articles → "Let's Do This Together" → Actions
  ├── Friend Groups → "Let's Do This Together" → Actions
  └── Short-form Videos

Profile Tab
  ├── Account & Settings
  ├── Pet & Cosmetics
  └── Stats, Streaks, Achievements

Midnight
  └── Chat resets · history archived as health log
```

---

## Tech Stack & Architecture

### Current (Web — Graduation Project)

- **React 19** + **Vite 8** (ES modules)
- **Tailwind CSS v4** with `@theme` block for design tokens
- **Web Audio API** for zero-lag click sounds; HTMLAudioElement for background music
- **qrcode** npm package for runtime QR code generation
- No router, no state library — single-file phase controller in `App.jsx`

### Target (Future)

- **React Native** — native iOS/Android app. Same React paradigm, native primitives (`<View>`, `<Text>`), native navigation, access to push notifications and HealthKit/Health Connect.
- **Supabase** — Postgres + Auth. The persistent memory so Claude can know the user across sessions.
- **Claude API** — `claude-opus-4-6` or `claude-sonnet-4-6`. The personalisation brain; receives history from Supabase each turn and returns empathetic, contextual replies.

### The Core Loop (Technical)

The AI is not a step in the sequence — it is the personalisation layer surrounding the entire system.

1. **Knowing** — user reflects; Claude reads input + history.
2. **Learning** — Claude delivers targeted quizzes + insights.
3. **Doing** — user commits to an action before the check-in ends.
4. **Articles** — Claude surfaces relevant content that bridges learning into action.
5. **Missions** — Claude assigns concrete actions based on patterns and learning.
6. **Rewards** — completing missions earns coins, closing the gamification loop.
7. **Feedback** — every interaction enriches Claude's understanding, so the next cycle is more personalised than the last.

### Supabase Schema

**`users`** — core profile + fast-access gamification state.
```
id             uuid primary key (auth.users.id)
email          text
pet_type       text  -- 'dog' | 'cat' | 'rabbit' | 'frog'
cosmetics_equipped jsonb default '[]'
coins          integer default 0
streak_count   integer default 0
last_check_in  date
health_profile jsonb  -- baseline answers from onboarding
goals          jsonb
created_at     timestamptz default now()
```

**`check_ins`** — daily entry point.
```
id               uuid primary key
user_id          uuid references users(id) on delete cascade
session_date     date not null
mood_score       integer  -- 1–5
free_text        text     -- user's raw reflection
ai_summary       text     -- Claude's distilled version, for future context
topic            text     -- 'sleep' | 'nutrition' | 'exercise'
committed_action text     -- the action picked at end of check-in
created_at       timestamptz default now()
unique (user_id, session_date)
```

**`chat_messages`** — every message in every session.
```
id           uuid primary key
user_id      uuid references users(id) on delete cascade
session_date date not null
role         text   -- 'user' | 'assistant'
content      text
created_at   timestamptz default now()
```
Indexed on `(user_id, session_date, created_at)` — this is what gets passed to Claude to maintain daily context.

**`user_missions`** — missions assigned and tracked.
```
id            uuid primary key
user_id       uuid references users(id) on delete cascade
mission_type  text   -- e.g. 'drink_water', '10min_walk', 'sleep_by_11'
slot          integer check (slot in (1,2,3))
source        text   -- 'check_in' | 'suggested'
status        text   -- 'pending' | 'completed' | 'skipped'
coin_reward   integer
assigned_at   timestamptz default now()
completed_at  timestamptz
```

**`rewards`** — the coin ledger.
```
id                 uuid primary key
user_id            uuid references users(id) on delete cascade
coins_delta        integer   -- positive earn, negative spend
reason             text      -- 'check_in' | 'mission_complete' | 'streak_bonus' | 'voucher_redeem' | 'cosmetic_purchase'
related_mission_id uuid references user_missions(id)
metadata           jsonb
created_at         timestamptz default now()
```

### Claude Integration Pattern

On every chat turn:

1. **Load context from Supabase:**
   - `users` row (profile, coins, streak, pet)
   - Last ~7 `check_ins` with `ai_summary` (efficient long-term context)
   - All `chat_messages` for today's `session_date` (full in-session context)
   - Active `user_missions`
2. **Compose the system prompt** — embed Digital Omotenashi principles + user context (name, pet, goals, recent summaries, current missions, today's check-in state).
3. **Call Claude API** with the message history; stream the reply to the client.
4. **Persist** the assistant message to `chat_messages`.
5. **Structured outputs** — when Claude decides to assign a mission or close the check-in, it emits a structured payload (tool call) that writes to `user_missions` / `check_ins`.
6. **Session close** — at day's end, ask Claude to distil the conversation; write `ai_summary` into today's `check_ins` row.

**Security:**
- `ANTHROPIC_API_KEY` lives **server-side only** (Supabase Edge Function or dedicated API route). Never exposed to the client.
- Supabase Row-Level Security (RLS) on every table keyed to `auth.uid()`.

### Daily Session Lifecycle

- **Open** — first interaction of the day creates a `check_ins` row and an initial `chat_messages` greeting.
- **Active** — all messages tied to today's `session_date`. Re-opening the app the same day resumes the current session.
- **Close** — at local midnight, the chat UI resets. Today's session is archived as a health log (accessible via Profile → History). The `ai_summary` is written so tomorrow's session loads efficiently.

---

## Brand Guide & Colour Styles

### Main Brand Colours

- **Primary:** `#0FBEFF`
- **Secondary:** `#7EDCFF`

### Getting to Know You Screen (Blue)

- Background: `#BEEDFF`
- Question Bubble: `#50CFFF`
- Multiple Choice Button: `#0FBEFF` (unselected), `#7EDCFF` with `#50CFFF` drop shadow (selected)
- Next Button: `#7EDCFF` (no selection), `#0FBEFF` (when selected)

### Learning Screen / Let's Learn (Purple)

- Background: `#8800D3` (purple-300)
- Question Bubble: `#BF48FF` (purple-200)
- Multiple Choice Button: `#A500FF` (unselected), `#DDA3FC` with `#BF48FF` drop shadow (selected)
- Next Button: `#BF48FF`
- "I'm Uncomfortable" Label: `#CC6FFF` (purple-150)
- Phase Badge Background: `#A500FF` (purple-250)
- Scroll Indicator Active: `#A500FF`, Inactive: `#CC6FFF`

### Action Screen (Green)

- Background: `#B7FF82`
- Priority Action Bubble: `#28D102`
- Multiple Choice Button: `#89F53A` (unselected), `#28D102` with `#1FA700` drop shadow (selected)
- Next Button: `#89F53A` (no selection), `#28D102` with `#1FA700` drop shadow (when selected)

### Typography

Font: Nunito (Google Fonts)

---

## Future Features

- **React Native port** — native iOS/Android apps
- **Full Supabase + Claude backend** — persistent memory + chat-first interface
- **Daily chat reset mechanics** — automated archival + health log
- **Mental Health** as 4th health topic
- Streak bonuses on the rewards system
- Expanded pet emotional states
- Additional topics (Hydration, Screen Time, Sexual Health, Substance Awareness)

---

## Core Data Models

These map directly to Supabase tables once the backend is built:

- **User** → `users` — profile, pet, goals, coins, streak, health baseline
- **CheckIn** → `check_ins` — daily session metadata + committed action + AI summary
- **ChatMessage** → `chat_messages` — every message in every session
- **Mission** → `user_missions` — active and historical missions with status + slot
- **Reward** → `rewards` — the coin ledger
- **Pet** — derived from `users.pet_type` + `users.cosmetics_equipped`; mood is computed from engagement
- **Topic** — enum-ish string on `check_ins.topic` for now

---

## Data & Privacy

- Health profile data is sensitive — encrypt at rest and in transit (Supabase handles both by default; verify settings).
- Row-Level Security (RLS) on every Supabase table keyed to `auth.uid()`.
- Users must be able to delete their account and all associated data (cascading deletes configured above).
- No health data shared with third parties without explicit consent.
- Claude API calls must not be logged with PII beyond what's required; review Anthropic data policy.
- Content moderation required for community features.
- Age verification for 18+ audience.
- Comply with relevant regulations (GDPR, local health data laws).

---

> **Current Implementation** — The sections below describe the **existing web codebase**. The chat-first vision above supersedes this for new work. The existing code remains as the live graduation project at petch-health-app.vercel.app and will be rebuilt when the React Native / Supabase / Claude work begins.

## Project Structure

```
src/
├── App.jsx                        # Phase state machine (start → management → learning → health → actions → survey)
├── index.css                      # Tailwind v4 imports, @theme tokens, keyframes, bubble tails
├── main.jsx                       # React entry point
├── components/
│   ├── StartingScreen.jsx         # Welcome intro with cat + "LET'S START!!" CTA
│   ├── ManagementFrame.jsx        # Get-to-know-me survey (personal health habits per topic)
│   ├── LearningFrame.jsx          # Personalised learning quiz based on management answers
│   ├── HealthOverviewFrame.jsx    # Insights dashboard with swipeable card carousel
│   ├── ActionsFrame.jsx           # Pick 1 of 3 health action commitments
│   └── SurveyFrame.jsx            # (Deprecated — survey was demo-only, will be removed)
├── utils/
│   ├── frame.jsx                  # PHONE constant (iPhone 16/17 Pro shell) + Bulb icon
│   └── sounds.js                  # Web Audio pre-decoded buffers, bg music, visibility API pause
└── assets/
    ├── Cat.svg                    # Cat mascot illustration
    ├── petch-logo.svg             # Petch brand icon
    └── petch-survey.svg           # Three-pets illustration for survey screen
```

Unused alternative implementations exist: `CatMascot.jsx`, `LearningScreen.jsx`, `TalkScreen.jsx`, `ActionScreen.jsx`. Ignore these.

## Phase System (current web app)

App.jsx owns all state. Six phases flow linearly (`survey` is deprecated):

```
start → management → learning → health → actions → (survey)
                                  ↑          |
                                  └── back ──┘
```

Each phase has a background colour applied synchronously via `applyPhaseColor()` before React renders, so iOS Safari's theme-color meta tag picks up the correct status bar colour.

| Phase      | BG Colour | Accent    |
|------------|-----------|-----------|
| start      | #BEEDFF   | #0FBDFF   |
| management | #BEEDFF   | #0FBDFF   |
| learning   | #8800D3   | #A500FF   |
| health     | #D1FAE5   | #059669   |
| actions    | #D1FAE5   | #059669   |
| survey     | #BEEDFF   | #0FBDFF   |

## Tailwind v4 Theme Tokens

Defined in `src/index.css` inside `@theme {}`. Used as utility classes like `bg-mgmt-bg`, `text-learn-accent`, `bg-action-bubble`.

Three colour families: `mgmt-*` (blue), `learn-*` (purple), `action-*` (green). Each has `-bg`, `-accent`, `-bubble`, `-selected`, `-next` variants.

Font: `--font-sans: 'Nunito', sans-serif` (loaded via Google Fonts in index.html).

## iPhone Frame (PHONE constant)

`src/utils/frame.jsx` exports `PHONE` — a long Tailwind class string. On mobile it's `fixed inset-0` full-screen. On `md:` breakpoint it renders a 402×874px phone shell with rounded corners, shadow, and Dynamic Island pseudo-element.

Every screen component wraps its content in `<div className={PHONE + ' bg-[colour]'}>`.

## Sound System

`src/utils/sounds.js` uses two strategies:

- **Click sounds** (mcq, next, correct, wrong): Pre-decoded `AudioBuffer`s played via `AudioContext.createBufferSource()` — zero latency.
- **Background music**: `HTMLAudioElement` with loop — better for long audio, lower memory.
- **iOS autoplay**: Attempts on mount, falls back to first user gesture. AudioContext is resumed alongside.
- **Visibility API**: Music pauses on `visibilitychange`/`pagehide`, resumes when visible.

Files live in `public/sounds/`. Wrong-answer gain is set to 1.4 (louder than others).

## Key Patterns

- **Bubble tail CSS**: `.tail-blue`, `.tail-purple`, `.tail-green` classes in index.css create CSS triangles pointing upward (toward cat mascot).
- **Spacer pattern**: `<div className="flex-1" />` pushes buttons to the bottom of the flex column.
- **"I'm uncomfortable"**: Swaps the current question for one from a backup pool (management) or hides itself (learning).
- **Swipeable carousel**: Touch event listeners on HealthOverviewFrame detect >40px horizontal swipes to navigate insight cards.
- **Personalisation flow**: Management answers (by index) → LearningFrame selects question variants. Management answers (by ID: p1–p4) → HealthOverviewFrame generates prioritised insights with tips.
- **Screen transitions**: CSS keyframes `slide-in-from-right` / `slide-in-from-left` (0.32s ease), controlled by `slideDir` state in App.jsx.

## iOS Safari Specifics

- `applyPhaseColor()` updates `<meta name="theme-color">` via `setAttribute()` on the existing element (not remove+recreate — iOS tracks by reference).
- LearningFrame adds a `useLayoutEffect` with `requestAnimationFrame` to double-set the purple theme colour.
- `html` and `body` both get `overflow: hidden` to prevent rubber-band scrolling.

## Data Flow (current web app)

```
ManagementFrame
  → onComplete(resultById, resultByIndex)
    → resultByIndex → LearningFrame (personalises quiz questions per topic)
    → resultById   → HealthOverviewFrame (generates health insights)

HealthOverviewFrame
  → getInsights(answers) evaluates p1–p4 against thresholds
  → Returns up to 3 insights sorted by priority (2=urgent, 1=moderate)
  → Each insight: { icon, label, message, tips[] }

ActionsFrame
  → "NEXT" on celebration card → (previously SurveyFrame, to be updated)
  → "←" back arrow → HealthOverviewFrame (with returning=true)
```

## Build & Deploy

```bash
npm run dev          # Vite dev server on :5173
npm run build        # Production build → dist/
npx vercel --prod    # Deploy to Vercel (may need: npm_config_cache=/tmp/npm-cache-tmp npx vercel --prod)
```

Note: The system `.npm` cache is root-owned. Use the temp cache workaround above if `npx vercel` fails with EACCES.

Vercel config is minimal — just `vercel.json` with `{ "name": "petch" }`. No SSR, no API routes, pure static SPA.

## Common Tasks

**Add a new phase/screen:**
1. Create component in `src/components/`
2. Add phase string + BG colour to `App.jsx` (BG map + applyPhaseColor call)
3. Add transition handler and render in App.jsx's return block

**Add a new health topic:**
1. Add topic-specific questions to `QUESTIONS` / `BACKUP_POOL` arrays in `ManagementFrame.jsx`
2. Add personalised question variants in `getQuestions(answers)` in `LearningFrame.jsx`
3. Add insight rules in `getInsights(answers)` in `HealthOverviewFrame.jsx`
4. Add topic-specific action commitments in `ActionsFrame.jsx`

**Change theme colours:**
Edit `@theme {}` block in `src/index.css`. All tokens are CSS custom properties consumed by Tailwind utilities.

**Add a new sound:**
1. Drop `.mp3` in `public/sounds/`
2. Add buffer variable + `loadBuffer()` call in `src/utils/sounds.js`
3. Export a `playX()` function, call it from the component

**Modify quiz questions:**
- Management: Edit `QUESTIONS` / `BACKUP_POOL` arrays in `ManagementFrame.jsx`
- Learning: Edit the `getQuestions(answers)` function in `LearningFrame.jsx`
- Insights: Edit `getInsights(answers)` in `HealthOverviewFrame.jsx`

---

## Usage Guide

Use this spec to:
- Treat the **chat-first vision** as the source of truth for new product decisions.
- Treat the **Current Implementation** sections as the ground truth for the existing web code.
- Match exact hex colours for each screen (blue/purple/green palettes).
- Apply Digital Omotenashi principles (personalisation, anticipatory design, empathy) in all UX decisions.
- Keep language simple and health jargon accessible for 18–30 year olds.
- Respect the 3-mission cap and Petch-suggested-only mission rule.
- Follow the Supabase schema and Claude integration patterns when the backend is built.
