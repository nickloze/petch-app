# CLAUDE.md — Petch Health App

## Project Overview

Petch is a mobile-first health education demo app focused on sleep. Users progress through a linear flow: intro → sleep survey → personalised learning quiz → health insights dashboard → action commitment → feedback survey. Built as a design student's graduation project.

**Live:** https://petch-health-app.vercel.app

## Tech Stack

- **React 19** + **Vite 8** (ES modules)
- **Tailwind CSS v4** with `@theme` block for design tokens (not tailwind.config.js)
- **Web Audio API** for zero-lag click sounds; HTMLAudioElement for background music
- **qrcode** npm package for runtime QR code generation
- No router, no state library — single-file phase controller in App.jsx

## Project Structure

```
src/
├── App.jsx                        # Phase state machine (start → management → learning → health → actions → survey)
├── index.css                      # Tailwind v4 imports, @theme tokens, keyframes, bubble tails
├── main.jsx                       # React entry point
├── components/
│   ├── StartingScreen.jsx         # Welcome intro with cat + "LET'S START!!" CTA
│   ├── ManagementFrame.jsx        # 4-question sleep survey (personal habits)
│   ├── LearningFrame.jsx          # 4-question quiz personalised from management answers
│   ├── HealthOverviewFrame.jsx    # Insights dashboard with swipeable card carousel
│   ├── ActionsFrame.jsx           # Pick 1 of 3 sleep commitments
│   └── SurveyFrame.jsx            # Thank-you screen with QR code to Google Form
├── utils/
│   ├── frame.jsx                  # PHONE constant (iPhone 16/17 Pro shell) + Bulb icon
│   └── sounds.js                  # Web Audio pre-decoded buffers, bg music, visibility API pause
└── assets/
    ├── Cat.svg                    # Cat mascot illustration
    ├── petch-logo.svg             # Petch brand icon
    └── petch-survey.svg           # Three-pets illustration for survey screen
```

Unused alternative implementations exist: `CatMascot.jsx`, `LearningScreen.jsx`, `TalkScreen.jsx`, `ActionScreen.jsx`. Ignore these.

## Phase System

App.jsx owns all state. Six phases flow linearly:

```
start → management → learning → health → actions → survey
                                  ↑          |
                                  └── back ──┘
```

Each phase has a background colour applied synchronously via `applyPhaseColor()` before React renders, so iOS Safari's theme-color meta tag picks up the correct status bar colour.

| Phase      | BG Colour | Accent    |
|------------|-----------|-----------|
| start      | #BEEDFF   | #0FBDFF   |
| management | #BEEDFF   | #0FBDFF   |
| learning   | #EDE0FF   | #8B5CF6   |
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

## Build & Deploy

```bash
npm run dev          # Vite dev server on :5173
npm run build        # Production build → dist/
npx vercel --prod    # Deploy to Vercel (may need: npm_config_cache=/tmp/npm-cache-tmp npx vercel --prod)
```

Note: The system `.npm` cache is root-owned. Use the temp cache workaround above if `npx vercel` fails with EACCES.

Vercel config is minimal — just `vercel.json` with `{ "name": "petch" }`. No SSR, no API routes, pure static SPA.

## Data Flow

```
ManagementFrame
  → onComplete(resultById, resultByIndex)
    → resultByIndex → LearningFrame (personalises quiz questions)
    → resultById   → HealthOverviewFrame (generates health insights)

HealthOverviewFrame
  → getInsights(answers) evaluates p1–p4 against thresholds
  → Returns up to 3 insights sorted by priority (2=urgent, 1=moderate)
  → Each insight: { icon, label, message, tips[] }

ActionsFrame
  → "NEXT" on celebration card → SurveyFrame
  → "←" back arrow → HealthOverviewFrame (with returning=true)
```

## Common Tasks

**Add a new phase/screen:**
1. Create component in `src/components/`
2. Add phase string + BG colour to `App.jsx` (BG map + applyPhaseColor call)
3. Add transition handler and render in App.jsx's return block

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
