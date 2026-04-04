---
name: petch-spec
description: >-
  Petch health education app specification and design reference. Use this skill
  whenever working on the Petch app — building features, creating screens,
  writing components, designing flows, choosing colours, implementing the
  learning loop, reward system, pet companion, community features, or any
  development task related to the Petch health education application. Also
  trigger when the user mentions health app, gamification, learning loop,
  Digital Omotenashi, pet companion, or any Petch-specific terminology.
---

# Petch App Specification

## Application Background

Petch (Patch the Health Education application) is basically the Duolingo for Health. It uses gamification to help create a fun and engaging learning environment for users to learn about their own health more on a daily basis and provide incremental learning for these users to make healthier choices, to create easier and healthier daily actions for themselves, which focuses on the objective of providing long-term health benefits for preventive health. The application uses a reward system as its incentivised behavioural tool towards healthier lifestyle through health rewards.

**Target Audience:** Young adults aged 18–30
**Platform:** React Native (cross-platform — iOS & Android)

The App focuses on two main features:

1. **Learning-Knowing-Doing Loop** — The main feature is its learning-knowing-doing loop learning system where it goes through a process for the user to learn. It goes through a process so that the app understands the user. In this sense it is personalisation and management and then the user gets to learn about their health from that personalisation. They are then given a health overview and then they must commit to an action.

2. **Digital Omotenashi (Pet Health Companion)** — The second main unique feature is the digital omotenashi framework where it becomes in the form of a pet health companion. Essentially this mirrors the user's learning progress and also becomes a support system for the user in the form of a pet that they can also add cosmetics.

---

## Main Learning Feature

The objective of the application is very simple: the user should have daily incremental learning for their health, helping users make healthier choices. The learning follows this process/flow:

1. **Topic Selection** — The user will pick a topic they are interested in. Users can choose to continue a previous topic or pick a new one each day.
2. **Get to Know Me (Management)** — The app will first ask about the user's health based on that topic. The jargon has to be simple and easy for any user to comprehend the health information.
3. **Personalised Learning** — The app should create questions for the user to learn based on their answers, that is personalised to them. For example, if the user wants to learn about their sleep, if in the management/get to know me section the user says they have less than 6 hours of sleep, the question in the learning section can be "what's the main thing that can affect someone if they don't get the sleep?".
4. **Health Overview** — The app at the end of the learning section will provide a health overview to the user giving them their priority action to take in the end in the action screen, and then an overview of what about their health they have been doing well and where they need to improve.
5. **Action Commitment** — The last screen part of the learning process is that they need to commit to 1 of 3 actions of their choice for the day that also provides a reward for the type of action.

### Health Topics

Starting with 3–4 core topics at launch, expanding over time:

- Sleep
- Nutrition & Diet
- Exercise & Movement
- Mental Health & Stress

Additional topics (post-launch): Hydration, Screen Time, Sexual Health, Substance Awareness, etc.

---

## Framework (Digital Omotenashi)

This framework is called Digital Omotenashi. It focuses on three pillars:

1. **Personalisation** — Making the app personalised and tailored to the user.
2. **Anticipatory Design** — Makes sure the user feels as if they don't realise that they want this service but they are able to. When they receive it they feel delighted. It's an unexpected service, such as notifications that surprise or even provide these users with special instructions to make certain actions or maybe tell them to learn on the day itself.
3. **Empathy** — The language has to be sensitive within the application. The actions or the lessons that are provided will feel sustainable to make sure that the user can come back every day to learn without it feeling boring or without it feeling less engaging because engagement should be the main priority.

---

## Pet Companion

The pet companion is the embodiment of the Digital Omotenashi framework. It serves as both a support system and a mirror of the user's health learning progress.

- **Pet Selection:** During onboarding, users choose from: Dog, Cat, Rabbit, or Frog
- **Progress Mirroring:** The pet's state and mood reflect the user's learning engagement and consistency
- **Cosmetics:** Users can unlock and apply cosmetic items to their pet (hats, accessories, outfits, etc.) using earned coins
- **Companionship:** The pet delivers encouragement, nudges, and celebrates milestones with the user

---

## Reward System

The rewards in the app are for users to make healthier choices. They can earn rewards by doing actions and they can collect coins. Those coins are like in-game currency that can be exchanged for vouchers, or the actions can also allow users to get vouchers. This reward system has to be healthy and in line with preventive health measures for the longer term.

### Reward Types

- **Coins** — In-game currency earned by completing daily actions and learning sessions. Can be exchanged for vouchers.
- **Streaks** — Consecutive days of engagement, rewarding consistency with bonus coins or exclusive cosmetics.
- **Vouchers** — Health-aligned brand partner rewards. For example, Subway meals discounted by 20% or a Boost drink that is 20% off — providing users something healthier in terms of their choices.

> Note: The full coin economy (earn rates, exchange rates, partner details) is still being defined.

---

## Community

The Community feature serves as a trusted space where users can seek support, ask questions, and explore health-related topics more deeply. It is designed for individuals who may feel uncertain, need clarification, or want to learn from others' experiences.

### Public Community

Within this space, users can:

- Receive support from a community of peers facing similar health journeys
- Browse and participate in discussion threads to gain insights, share experiences, and ask questions
- Access professionally moderated content, ensuring that information remains accurate, safe, and reliable

### Private Groups

Within private groups, users can:

- Share progress and support one another more intimately
- Take part in group-based actions and challenges, encouraging accountability and consistency
- Build shared health habits through collective learning and motivation

### Short-Form Video Content

To further enhance engagement, the feature integrates social media content, such as short-form videos inspired by platforms like TikTok. These videos are curated or created with a focus on credible, health-positive messaging, allowing users to consume familiar content formats in a more responsible and informative way.

Overall, the Community feature acts as a safe, supportive, and verified environment — bridging the gap between personal curiosity and trustworthy health information, while fostering a sense of belonging and shared learning.

---

## Onboarding Flow

When a user first opens the app:

1. **Account Creation** — Sign up with email/social auth
2. **Health Profile** — Answer baseline health questions to establish the user's starting point across key health areas
3. **Pet Selection** — Choose a companion (dog, cat, rabbit, or frog)
4. **Goal Setting** — Set personal health goals and preferences
5. **First Topic** — Pick their first health topic and begin the learning-knowing-doing loop

---

## Content Strategy

Petch uses a hybrid content approach:

- **AI-Generated Personalisation** — An LLM dynamically generates personalised questions, feedback, and health overviews based on the user's profile and answers
- **Expert-Reviewed Foundation** — All health content is grounded in material written or reviewed by medical/health professionals to ensure accuracy and safety
- **Simple Language** — All jargon is simplified so any user can comprehend the health information regardless of their prior knowledge

---

## Notification & Nudge Strategy

Rooted in the Digital Omotenashi anticipatory design principle:

- **Surprise Nudges** — Unexpected notifications that delight users with tips, encouragement, or special challenges
- **Learning Reminders** — Gentle prompts to complete daily learning sessions, delivered through the pet companion's voice
- **Action Check-ins** — Follow-up notifications asking users if they completed their committed action for the day
- **Streak Alerts** — Warnings when a streak is about to break, motivating continued engagement
- **Contextual Tips** — Time-of-day relevant health tips (e.g., wind-down reminders in the evening for sleep topics)

---

## Brand Guide (Style Guide)

### Brand Colours

- **Main Colour:** `#0FBEFF`
- **Secondary Colour:** `#7EDCFF`

### Getting to Know You Screen (Blue)

- Background Colour: `#BEEDFF`
- Question Bubble Colour: `#50CFFF`
- Multiple Choice Button Colour: `#0FBEFF` (unselected), `#7EDCFF` with `#50CFFF` solid colour drop shadow (selected)
- Next Button: `#7EDCFF` (no selection of multiple choice), `#0FBEFF` (when an answer is selected)

### Learning Screen (Purple)

- Background Colour: `#E3AFFF`
- Question Bubble Colour: `#BF48FF`
- Multiple Choice Button Colour: `#A500FF` (unselected), `#CC6FFF` with `#BF48FF` solid colour drop shadow (selected)
- Next Button: `#CC6FFF` (no selection of multiple choice), `#A500FF` (when an answer is selected)

### Action Screen (Green)

- Background Colour: `#B7FF82`
- Priority Action Bubble Colour: `#28D102`
- Multiple Choice Button Colour: `#89F53A` (unselected), `#28D102` with `#1FA700` solid colour drop shadow (selected)
- Next Button: `#89F53A` (no selection of multiple choice), `#28D102` with `#1FA700` solid colour drop shadow (when an answer is selected)

### Typography

- **Font:** Nunito (Google Fonts)

---

## Technical Architecture

### Platform

- **React Native** (cross-platform iOS & Android)
- Expo recommended for rapid development

### Suggested Tech Stack

- **Frontend:** React Native + Expo
- **Navigation:** React Navigation
- **State Management:** Zustand or React Context
- **Backend:** Supabase or Firebase (auth, database, storage)
- **AI/LLM:** Claude API or OpenAI API for personalised content generation
- **Notifications:** Expo Notifications / Firebase Cloud Messaging
- **Analytics:** Mixpanel or PostHog for engagement tracking

### Core Data Models

- **User** — Profile, health baseline, goals, streak count, coin balance
- **Pet** — Type, cosmetics equipped, mood/state
- **Topic** — Health category, lessons, question pools
- **Session** — Daily learning session: management answers, quiz results, health overview, committed action
- **Action** — Type, reward value, completion status
- **Reward** — Coins earned, vouchers redeemed, streak milestones

---

## Data & Privacy

- Health profile data is sensitive — encrypt at rest and in transit
- Users must be able to delete their account and all associated data
- No health data shared with third parties without explicit consent
- Content moderation required for community features
- Age verification for 18+ audience
- Comply with relevant data protection regulations (GDPR, local health data laws)

---

## Usage Guide

Use this spec to:
- Match exact hex colours for each screen (blue/purple/green palettes)
- Follow the Learning-Knowing-Doing loop flow precisely
- Implement the onboarding sequence in the correct order
- Apply Digital Omotenashi principles (personalisation, anticipatory design, empathy) in all UX decisions
- Keep language simple and health jargon accessible for 18-30 year olds
- Align rewards with health-positive brand partnerships
