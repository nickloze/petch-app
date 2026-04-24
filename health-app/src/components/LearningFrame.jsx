import { useState, useMemo, useLayoutEffect, useEffect, useRef } from 'react'
import coinSvg               from '../assets/coin.svg'
import idleGif               from '../assets/animation/character-idle-answer.gif'
import { PHONE } from '../utils/frame.jsx'
import { playMcq, playNext } from '../utils/sounds'
import QuitConfirmSheet      from './QuitConfirmSheet.jsx'

const DIN = { fontFamily: "'DIN Next Rounded', sans-serif" }

const ACTIONS_BY_TOPIC = {
  Sleep: [
    { id: 'sa1', label: 'Sleep between 10–12am' },
    { id: 'sa2', label: 'Meditate before you sleep' },
    { id: 'sa3', label: 'Read an article about sleep' },
  ],
  Nutrition: [
    { id: 'na1', label: 'Eat 5 servings of fruit and veg today' },
    { id: 'na2', label: 'Have one screen-free meal today' },
    { id: 'na3', label: 'Swap one snack for a whole food' },
  ],
  Exercise: [
    { id: 'ea1', label: 'Take a 20-minute walk outside' },
    { id: 'ea2', label: 'Do 10 minutes of stretching' },
    { id: 'ea3', label: 'Complete a 20-minute workout' },
  ],
}
const TOTAL_STEPS    = 9
const LEARNING_START = 5  // steps 1–5 already done (topic + 4 knowing answers)

const QUIRKY_LABELS = [
  'Figuring it out...',
  'Connecting dots...',
  'Processing that...',
  'Hmm, interesting...',
  'Thinking hard...',
  'Discussing with Riley...',
]

// ═══════════════════════════════════════════════════════════════
// SLEEP questions
// ═══════════════════════════════════════════════════════════════
function buildSleepQuestions(a = {}) {
  // Q1, sleep duration (slot 0): 'More than 8 hours' | '6–8 hours' | 'Less than 6 hours'
  const q1 = a[0] === 'Less than 6 hours'
    ? { id:'l1a',
        question:'How many hours of sleep do adults actually need each night?',
        options:['5–6 hours', '7–9 hours', '10+ hours'],
        correct:'7–9 hours',
        explanation:"Most adults need 7–9 hours, getting under 6 regularly weakens your immune system, memory, and focus.",
        personalNote:'Even adding just 30 minutes tonight could make a real difference to how you feel tomorrow.' }
    : a[0] === '6–8 hours'
    ? { id:'l1b',
        question:'What does your brain do with your memories while you sleep?',
        options:['It deletes old ones', 'It creates brand new ones', 'It saves them for later'],
        correct:'It saves them for later',
        explanation:"While you sleep, your brain moves memories from short-term to long-term storage, which is why a full night helps you learn and remember better.",
        personalNote:"With 6–8 hours, your brain is getting solid time to lock in memories each night, keep it up!" }
    : { id:'l1c',
        question:'Which stage of sleep is most important for physical recovery?',
        options:['Deep sleep', 'Light sleep', 'Dreaming (REM)'],
        correct:'Deep sleep',
        explanation:"Deep sleep is when your body repairs muscles, releases growth hormone, and strengthens your immune system for full overnight recovery.",
        personalNote:"Getting 8+ hours means you're likely clocking plenty of deep sleep each night, great for recovery!" }

  // Q2, bedtime (slot 1): 'Before 10 PM' | '10 PM – Midnight' | 'After Midnight'
  const q2 = a[1] === 'After Midnight'
    ? { id:'l2a',
        question:'What natural chemical makes you feel sleepy as it gets dark?',
        options:['Cortisol', 'Adrenaline', 'Melatonin'],
        correct:'Melatonin',
        explanation:"Melatonin is released when it gets dark, but phone screens emit blue light that blocks it, making you feel wide awake even when you're genuinely tired.",
        personalNote:'Even shifting 30 minutes earlier for a few nights can help reset your body clock.' }
    : a[1] === '10 PM – Midnight'
    ? { id:'l2b',
        question:'What bedroom temperature helps you sleep the most deeply?',
        options:['Cool, around 65°F / 18°C', 'Warm, around 75°F / 24°C', 'Cold, below 60°F / 15°C'],
        correct:'Cool, around 65°F / 18°C',
        explanation:"Your body lowers its core temperature to fall asleep, and a cool room around 18°C helps you reach deep sleep faster.",
        personalNote:"Pair your great bedtime with a cool, dark room and you've got an ideal sleep setup!" }
    : { id:'l2c',
        question:'What does your body focus on during the first part of the night?',
        options:['Vivid dreaming', 'Deep, restful sleep', 'Light dozing'],
        correct:'Deep, restful sleep',
        explanation:"The first 90 minutes of sleep are packed with deep sleep, your body's top priority for physical repair and recovery.",
        personalNote:"Being in bed before 10 PM means your body hits deep sleep at exactly the right time!" }

  // Q3, sleep quality (slot 2): 'Excellent' | 'Average' | 'Poor'
  const q3 = a[2] === 'Poor'
    ? { id:'l3a',
        question:'Which everyday habit disrupts deep sleep the most?',
        options:['Reading before bed', 'Caffeine after 2 PM', 'Sleeping with the lights on'],
        correct:'Caffeine after 2 PM',
        explanation:"Caffeine has a 5–6 hour half-life, so a 3 PM coffee is still half-active at 8 PM, quietly cutting into how much deep sleep you actually get.",
        personalNote:'Cutting caffeine after 2 PM is one of the fastest wins, many people notice a difference within a few days.' }
    : a[2] === 'Average'
    ? { id:'l3b',
        question:'What single habit improves sleep quality the most?',
        options:['Same bedtime every day', 'Sleeping in on weekends', 'Taking a daily nap'],
        correct:'Same bedtime every day',
        explanation:"Your body's internal clock thrives on routine, going to bed and waking at the same time every day makes falling asleep easier and sleep deeper.",
        personalNote:'A consistent schedule could be the single change that makes the biggest difference for you.' }
    : { id:'l3c',
        question:'How much of your total sleep time is actually deep sleep?',
        options:['About half the night', 'Only around 5%', 'Around 13–23%'],
        correct:'Around 13–23%',
        explanation:"Deep sleep only makes up about 13–23% of your night, but those 1–2 hours are when your body does its most important repair work.",
        personalNote:"You're naturally protecting those deep sleep windows, keep your routine consistent to stay there!" }

  // Q4, wake feeling (slot 3): 'Always' | 'Sometimes' | 'Rarely'
  const q4 = a[3] === 'Rarely'
    ? { id:'l4a',
        question:'How many sleep cycles do most people need to feel properly rested?',
        options:['4–5 cycles', '2–3 cycles', '6+ cycles'],
        correct:'4–5 cycles',
        explanation:"Each sleep cycle lasts 90 minutes, most adults need 4–5 complete cycles, and waking mid-cycle causes that heavy, groggy feeling.",
        personalNote:"Try shifting your alarm 15–20 minutes to find the natural end of your cycle." }
    : a[3] === 'Sometimes'
    ? { id:'l4b',
        question:'When do you feel most refreshed after waking up?',
        options:['Right after a vivid dream', 'At the end of a sleep cycle', 'After hours of deep sleep'],
        correct:'At the end of a sleep cycle',
        explanation:"Waking at the natural end of a sleep cycle (~90 minutes) feels smooth and easy, while waking mid-cycle causes that foggy, groggy feeling.",
        personalNote:"A consistent wake time makes landing at a cycle end happen more reliably." }
    : { id:'l4c',
        question:'Which sleep stage gives you vivid, memorable dreams?',
        options:['Deep sleep (N3)', 'Light sleep (N1)', 'REM sleep'],
        correct:'REM sleep',
        explanation:"REM sleep is when vivid dreaming happens, playing a key role in emotional processing, creativity, and locking in memories.",
        personalNote:"Waking refreshed consistently is a great sign your sleep cycles are completing naturally!" }

  return [q1, q2, q3, q4]
}

const SLEEP_BACKUP_POOL = [
  { id:'lb1',
    question:"Roughly how many adults don't get enough sleep each night?",
    options:['About 1 in 10', 'About 1 in 3', 'More than half'],
    correct:'About 1 in 3',
    explanation:"About 1 in 3 adults regularly get less than 7 hours, so feeling tired has become so normal that most people don't realise it's affecting them.",
    personalNote:null },
  { id:'lb2',
    question:'Why does scrolling on your phone at night make it harder to sleep?',
    options:["It blocks your body's sleep hormone", 'It makes your mind too busy', 'It raises your heart rate'],
    correct:"It blocks your body's sleep hormone",
    explanation:"Phones emit blue light that blocks melatonin and delays sleep by 1–2 hours, stopping screens 30–60 minutes before bed is the most effective fix.",
    personalNote:null },
  { id:'lb3',
    question:'Which age group needs the most sleep per night?',
    options:['Teenagers', 'Adults over 18', 'Newborn babies'],
    correct:'Newborn babies',
    explanation:"Newborns need up to 17 hours, teenagers 8–10, and adults 7–9, and as we age, quality of sleep becomes even more important than quantity.",
    personalNote:null },
  { id:'lb4',
    question:"What does 'sleep hygiene' actually mean?",
    options:['Washing up right before bed', 'Healthy sleep habits and routines', 'The cleanliness of your bedding'],
    correct:'Healthy sleep habits and routines',
    explanation:"Sleep hygiene is the set of daily habits, consistent schedule, limiting caffeine, cool quiet room, that support better sleep over time.",
    personalNote:null },
]

// ═══════════════════════════════════════════════════════════════
// NUTRITION questions
// ═══════════════════════════════════════════════════════════════
function buildNutritionQuestions(a = {}) {
  // Q1, meal frequency (slot 0): '5 or more meals / snacks' | '3–4 meals a day' | '1–2 meals or I often skip'
  const q1 = a[0] === '1–2 meals or I often skip'
    ? { id:'nl1a',
        question:'What does regularly skipping meals do to your metabolism?',
        options:['Speeds it up', 'Has no real effect', 'Slows it down'],
        correct:'Slows it down',
        explanation:"Skipping meals puts your body into conservation mode, it slows your metabolism, causes blood sugar crashes, and often triggers overeating later in the day.",
        personalNote:'Even a simple snack like a banana and yoghurt can keep your metabolism steady between meals.' }
    : a[0] === '3–4 meals a day'
    ? { id:'nl1b',
        question:'Which macronutrient keeps you feeling full the longest after eating?',
        options:['Carbohydrates', 'Protein', 'Fat'],
        correct:'Protein',
        explanation:"Protein takes the longest to digest and triggers satiety hormones more strongly than carbs or fat, that's why high-protein meals keep hunger away for longer.",
        personalNote:"Adding a protein source to each meal helps you stay satisfied and reduces snacking in between." }
    : { id:'nl1c',
        question:"What's the main benefit of eating smaller, more frequent meals?",
        options:['It significantly boosts metabolism', 'It keeps blood sugar and energy steadier', 'It automatically lowers total calorie intake'],
        correct:'It keeps blood sugar and energy steadier',
        explanation:"Frequent smaller meals help keep blood sugar stable throughout the day, preventing energy crashes and improving focus. Total intake still matters most for weight management.",
        personalNote:"You're on a great pattern, just make sure each meal includes protein or fibre to keep it balanced." }

  // Q2, fruit & veg (slot 1): '5 or more' | '3–4 servings' | '1–2 or less'
  const q2 = a[1] === '1–2 or less'
    ? { id:'nl2a',
        question:"What's the minimum daily servings of fruit and veg that health guidelines recommend?",
        options:['2 servings', '5 servings', '8 servings'],
        correct:'5 servings',
        explanation:"5 servings a day is the global benchmark, it's linked to a 20% lower risk of heart disease, and each extra serving beyond that adds more benefit.",
        personalNote:"Swapping one daily snack for a piece of fruit or a handful of veg is the easiest first step." }
    : a[1] === '3–4 servings'
    ? { id:'nl2b',
        question:'Which colour of vegetables tends to have the highest antioxidant content?',
        options:['White and pale vegetables', 'Deep red, purple, and orange', 'Light green vegetables'],
        correct:'Deep red, purple, and orange',
        explanation:"Dark-coloured vegetables, like red peppers, purple cabbage, and carrots, get their colour from antioxidants that fight inflammation and cell damage.",
        personalNote:"You're doing well, eating more colour variety is the next meaningful step for your nutrition." }
    : { id:'nl2c',
        question:'What nutrient in fruit and veg slows digestion and feeds your gut bacteria?',
        options:['Vitamin C', 'Fibre', 'Iron'],
        correct:'Fibre',
        explanation:"Dietary fibre slows digestion, keeps blood sugar stable, feeds beneficial gut bacteria, and is linked to lower risk of bowel cancer, yet most people don't eat nearly enough.",
        personalNote:"Getting 5+ servings means your fibre intake is already well above average, your gut bacteria thank you!" }

  // Q3, processed food (slot 2): 'Rarely or never' | 'A few times a week' | 'Most days'
  const q3 = a[2] === 'Most days'
    ? { id:'nl3a',
        question:'What ingredient in processed food is most strongly linked to energy crashes?',
        options:['Salt', 'Added sugar', 'Saturated fat'],
        correct:'Added sugar',
        explanation:"Added sugar spikes blood glucose rapidly, triggering an insulin rush followed by a crash, that mid-afternoon slump after a sugary snack is this in action.",
        personalNote:'Swapping one processed snack for something with fibre and protein can noticeably change your afternoon energy.' }
    : a[2] === 'A few times a week'
    ? { id:'nl3b',
        question:"Roughly how much of the average young adult's diet comes from ultra-processed foods?",
        options:['About 10%', 'Around 30%', 'More than 50%'],
        correct:'More than 50%',
        explanation:"Studies show ultra-processed foods make up over 50% of many young adults' diets, often without them realising, because these foods are designed to be easy, tasty, and convenient.",
        personalNote:"You're already below average, staying aware of your go-to snacks can strengthen this further." }
    : { id:'nl3c',
        question:'What makes whole foods more beneficial than their processed versions?',
        options:['They are always lower in calories', 'They retain fibre, vitamins, and beneficial plant compounds', 'They are always organic'],
        correct:'They retain fibre, vitamins, and beneficial plant compounds',
        explanation:"Processing strips out much of the fibre, vitamins, and beneficial plant compounds. Whole foods keep these intact, supporting better digestion, immunity, and sustained energy.",
        personalNote:"Eating mostly whole foods is one of the single most impactful dietary habits, you're already there!" }

  // Q4, mindful eating (slot 3): 'I eat mindfully' | 'Sometimes I pay attention' | 'I usually eat while scrolling...'
  const q4 = a[3] === 'I usually eat while scrolling or watching TV'
    ? { id:'nl4a',
        question:'What does distracted eating do to how much you end up consuming?',
        options:['Makes you eat less', 'Has no real effect', 'Makes you eat significantly more'],
        correct:'Makes you eat significantly more',
        explanation:"Distracted eating delays your brain's satiety signals, studies show people eat up to 25% more when focused on a screen, and feel less satisfied after the meal.",
        personalNote:'Even one screen-free meal a day helps your brain reconnect with your actual hunger and fullness signals.' }
    : a[3] === 'Sometimes I pay attention'
    ? { id:'nl4b',
        question:"What is mindful eating actually about?",
        options:['Counting every calorie', 'Paying attention to hunger, taste, and fullness signals', 'Only eating natural foods'],
        correct:'Paying attention to hunger, taste, and fullness signals',
        explanation:"Mindful eating is about being present with your food, noticing hunger and fullness cues, eating without distraction, and savouring your meals. It's linked to better digestion and a healthier relationship with food.",
        personalNote:"You're already sometimes mindful, building this into a consistent habit has a compounding positive effect." }
    : { id:'nl4c',
        question:"How long does it take for your stomach to signal your brain that you're full?",
        options:['About 5 minutes', 'Around 20 minutes', 'Over 30 minutes'],
        correct:'Around 20 minutes',
        explanation:"It takes about 20 minutes for stretch receptors and satiety hormones to reach your brain, which is why eating slowly helps you naturally stop at the right point before you've overeaten.",
        personalNote:"Eating mindfully means you're already working with this 20-minute window, a real advantage for healthy eating habits." }

  return [q1, q2, q3, q4]
}

const NUTRITION_BACKUP_POOL = [
  { id:'nlb1',
    question:"What does 'added sugar' on a food label actually mean?",
    options:['Sugar from fruit', 'Sugar added during manufacturing', 'Natural sweeteners only'],
    correct:'Sugar added during manufacturing',
    explanation:"Added sugar is sugar that manufacturers put into food, different from what's naturally in fruit or dairy. The WHO recommends keeping added sugar to under 10% of your daily calories.",
    personalNote:null },
  { id:'nlb2',
    question:'Which fat is essential for brain and heart health?',
    options:['Trans fat', 'Saturated fat', 'Omega-3 fatty acids'],
    correct:'Omega-3 fatty acids',
    explanation:"Omega-3 fatty acids, found in oily fish, flaxseeds, and walnuts, are essential for brain function, reducing inflammation, and protecting heart health. Most young adults don't get nearly enough.",
    personalNote:null },
  { id:'nlb3',
    question:"Why do nutritionists say to 'eat the rainbow'?",
    options:['For aesthetic reasons only', 'Different coloured plants contain different vitamins and antioxidants', 'Colourful food is lower in calories'],
    correct:'Different coloured plants contain different vitamins and antioxidants',
    explanation:"Each colour in plant foods represents different nutrients, eating a wide variety ensures you get a broad spectrum of vitamins, minerals, and antioxidants that no supplement can fully replicate.",
    personalNote:null },
  { id:'nlb4',
    question:"What happens to your gut bacteria when you eat more fibre?",
    options:["They don't change much", 'They become more diverse and beneficial', 'They temporarily die off'],
    correct:'They become more diverse and beneficial',
    explanation:"Fibre feeds beneficial gut bacteria, helping them thrive and multiply. A diverse gut microbiome is linked to better immunity, improved mood, and even clearer skin.",
    personalNote:null },
]

// ═══════════════════════════════════════════════════════════════
// EXERCISE questions
// ═══════════════════════════════════════════════════════════════
function buildExerciseQuestions(a = {}) {
  // Q1, frequency (slot 0): '4 or more times' | '2–3 times' | '0–1 times'
  const q1 = a[0] === '0–1 times'
    ? { id:'el1a',
        question:'How many minutes of moderate exercise per week do health guidelines recommend for adults?',
        options:['60 minutes', '150 minutes', '300 minutes'],
        correct:'150 minutes',
        explanation:"The WHO recommends at least 150 minutes of moderate activity per week, just 30 minutes, 5 days a week. Even splitting it into 10-minute blocks throughout the day counts.",
        personalNote:'Starting with two 20-minute walks a week builds a real foundation, consistency matters more than intensity.' }
    : a[0] === '2–3 times'
    ? { id:'el1b',
        question:'What happens to your muscles on rest days between workouts?',
        options:['They shrink back to where they were', 'They repair and grow stronger', 'They stay exactly the same'],
        correct:'They repair and grow stronger',
        explanation:"Muscle growth happens during rest, not during exercise. The micro-tears from your workout repair and grow stronger between sessions, which is why rest is as important as training.",
        personalNote:"Your 2–3 sessions a week give your muscles proper recovery time to repair and grow." }
    : { id:'el1c',
        question:'What is the main risk of training intensely every day without rest?',
        options:['Losing muscle mass quickly', 'Overtraining, reducing performance and raising injury risk', 'Developing too much endurance'],
        correct:'Overtraining, reducing performance and raising injury risk',
        explanation:"Overtraining syndrome occurs when you push harder than your body can recover from, it causes fatigue, decreased performance, mood changes, and higher injury risk. Even the very fit need rest days.",
        personalNote:"One or two active recovery days a week (yoga, walking, stretching) help maintain consistency while protecting your body." }

  // Q2, exercise type (slot 1): 'Cardio...' | 'Strength...' | 'I mix it up...'
  const q2 = a[1] === 'Cardio (running, cycling, swimming)'
    ? { id:'el2a',
        question:'What is one major benefit of adding strength training to a cardio routine?',
        options:['It replaces the need for cardio entirely', 'It increases bone density and resting metabolism', 'It only benefits older adults'],
        correct:'It increases bone density and resting metabolism',
        explanation:"Strength training builds muscle mass, which burns more calories at rest and strengthens your bones. For young adults, it's a long-term investment that significantly reduces injury and osteoporosis risk later in life.",
        personalNote:"Even one resistance session per week alongside your cardio delivers meaningful long-term benefits." }
    : a[1] === 'Strength or resistance training'
    ? { id:'el2b',
        question:'What benefit does cardio provide that strength training alone cannot fully deliver?',
        options:['Improved cardiovascular efficiency and mental health', 'More visible muscle definition', 'Faster weight loss only'],
        correct:'Improved cardiovascular efficiency and mental health',
        explanation:"Cardio trains your heart and lungs to work more efficiently and triggers endorphin release more reliably than strength training, making it one of the most effective natural mood boosters available.",
        personalNote:"Even 20 minutes of brisk walking or cycling a few times a week adds significant heart and mental health benefits." }
    : { id:'el2c',
        question:"What does 'functional fitness' mean?",
        options:['Training only for sports performance', 'Exercises that improve movement for everyday life', 'Fitness focused purely on aesthetics'],
        correct:'Exercises that improve movement for everyday life',
        explanation:"Functional fitness focuses on movements you use in real life, squatting, carrying, pushing, pulling. Mixing cardio and strength naturally builds this, reducing injury risk and making daily activities easier.",
        personalNote:"Your mixed approach is one of the most well-rounded exercise habits you can have, it builds strength, endurance, and coordination simultaneously." }

  // Q3, session duration (slot 2): '45 minutes or more' | '20–45 minutes' | 'Under 20 minutes'
  const q3 = a[2] === 'Under 20 minutes'
    ? { id:'el3a',
        question:'Can a short 10–15 minute workout provide real health benefits?',
        options:['No, 45+ minutes is the minimum', 'Yes, even short bouts meaningfully improve health', 'Only if done at very high intensity'],
        correct:'Yes, even short bouts meaningfully improve health',
        explanation:"Research shows three 10-minute bouts of exercise provide similar cardiovascular benefits to one 30-minute session. Consistency over time matters far more than session length.",
        personalNote:"Your short sessions absolutely count, stacking two or three of them across the day can match a full workout." }
    : a[2] === '20–45 minutes'
    ? { id:'el3b',
        question:'When does fat burning begin during moderate-intensity exercise?',
        options:['Only after 20 minutes of activity', 'Immediately and increases over time', 'Fat is only burned after exercise, not during'],
        correct:'Immediately and increases over time',
        explanation:"Your body starts using fat as fuel as soon as you start moving, and the proportion increases as glycogen stores lower. The myth that 'fat burning starts after 20 minutes' significantly overstates the threshold.",
        personalNote:"Your 20–45 minute sessions are in the sweet spot for both cardiovascular and metabolic benefit." }
    : { id:'el3c',
        question:'What is the role of post-exercise nutrition after longer workouts?',
        options:['It has little impact if you eat well generally', 'Eating protein within 1–2 hours accelerates muscle repair', 'Carbohydrates should be avoided after training'],
        correct:'Eating protein within 1–2 hours accelerates muscle repair',
        explanation:"After longer workouts, muscle protein synthesis is elevated, consuming 20–40g of protein within 1–2 hours takes advantage of this window to accelerate repair and support growth.",
        personalNote:"For your longer sessions, a protein-rich meal or snack afterwards is one of the most impactful things you can do for recovery." }

  // Q4, feeling after exercise (slot 3): 'Energised and good' | 'About the same as before' | 'Exhausted and drained'
  const q4 = a[3] === 'Exhausted and drained'
    ? { id:'el4a',
        question:'What might it mean if you consistently feel drained after exercise?',
        options:['You are very unfit and should rest more', 'You may be overtraining or under-fuelling', 'This is completely normal for everyone'],
        correct:'You may be overtraining or under-fuelling',
        explanation:"Feeling persistently exhausted after exercise often signals overtraining, insufficient sleep, or not eating enough before and after workouts. Exercise should leave you tired but refreshed, not depleted.",
        personalNote:"Try a light carb and protein snack 30–60 minutes before your next workout, and check you're getting 7–9 hours of sleep." }
    : a[3] === 'About the same as before'
    ? { id:'el4b',
        question:'What chemical does moderate exercise release that improves mood and reduces stress?',
        options:['Cortisol', 'Adrenaline', 'Endorphins'],
        correct:'Endorphins',
        explanation:"Exercise triggers the release of endorphins, your brain's natural feel-good chemicals. Most people notice this 'post-exercise glow' grows stronger as fitness improves and becomes one of the biggest motivators to keep going.",
        personalNote:"The endorphin boost tends to grow stronger as you get fitter, keep going and you'll start to feel it more clearly." }
    : { id:'el4c',
        question:'What long-term mental health benefit does regular exercise deliver?',
        options:['Only helps with physical anxiety symptoms', 'Reduces depression and anxiety as effectively as medication for mild cases', 'Improves mood only during the activity itself'],
        correct:'Reduces depression and anxiety as effectively as medication for mild cases',
        explanation:"Large-scale studies show regular exercise reduces symptoms of depression and anxiety as effectively as antidepressants for mild-to-moderate cases, primarily through neurochemical changes in the brain.",
        personalNote:"The energised feeling you get is your brain already benefiting from those neurochemical boosts, keep nurturing that." }

  return [q1, q2, q3, q4]
}

const EXERCISE_BACKUP_POOL = [
  { id:'elb1',
    question:"What is 'NEAT' and why does it matter for your health?",
    options:['A type of gym training method', "Non-exercise activity thermogenesis, movement throughout your day", 'A nutrition concept'],
    correct:"Non-exercise activity thermogenesis, movement throughout your day",
    explanation:"NEAT is all the energy you burn through daily movement, walking, taking stairs, fidgeting. For most people, NEAT burns more calories than formal exercise and significantly impacts long-term health.",
    personalNote:null },
  { id:'elb2',
    question:'How does regular exercise affect your sleep quality?',
    options:['It disrupts sleep patterns', 'It significantly improves sleep quality and depth', 'It has no consistent effect on sleep'],
    correct:'It significantly improves sleep quality and depth',
    explanation:"Regular exercise deepens sleep, increases time in slow-wave (deep) sleep, and reduces the time it takes to fall asleep. Even moderate activity like daily walking has a measurable positive effect.",
    personalNote:null },
  { id:'elb3',
    question:'What is one of the most underrated benefits of exercise for young adults?',
    options:['Improved nail and hair growth', 'Improved focus, memory, and brain function', 'Reduced need for hydration'],
    correct:'Improved focus, memory, and brain function',
    explanation:"Exercise increases blood flow to the brain and stimulates BDNF, often called 'brain fertiliser', which supports learning, memory, and focus. Students who exercise regularly consistently outperform peers on cognitive tasks.",
    personalNote:null },
  { id:'elb4',
    question:'What percentage of young adults worldwide meet the minimum physical activity guidelines?',
    options:['Over 80%', 'Around 50%', 'Less than 20%'],
    correct:'Less than 20%',
    explanation:"WHO data shows fewer than 1 in 5 young adults globally meets recommended activity levels, rising screen time is the main competing factor, making even short daily walks a significant step forward.",
    personalNote:null },
]

// ═══════════════════════════════════════════════════════════════
// Dispatcher, pick question builder + backup pool by topic
// ═══════════════════════════════════════════════════════════════
function buildQuestions(topic, a = {}) {
  if (topic === 'Nutrition') return buildNutritionQuestions(a)
  if (topic === 'Exercise')  return buildExerciseQuestions(a)
  return buildSleepQuestions(a)
}

function getBackupPool(topic) {
  if (topic === 'Nutrition') return NUTRITION_BACKUP_POOL
  if (topic === 'Exercise')  return EXERCISE_BACKUP_POOL
  return SLEEP_BACKUP_POOL
}

// ═══════════════════════════════════════════════════════════════
// Shared UI sub-components
// ═══════════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getPetchResponse(question) {
  return question.personalNote ?? (question.explanation.split('.')[0] + '.')
}

function getHealthReportMessage(topic) {
  if (topic === 'Nutrition') return "Here's today's health report! Try adding more protein to your meals, it'll keep you fuller for longer and earn you one more coin!"
  if (topic === 'Exercise')  return "Here's today's health report! Remember to take a 20-minute walk today to keep your streak and earn one more coin!"
  return "Here's today's health report! Remember to sleep from 10–12am to get one more coin!"
}

function HamburgerIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 22 16" fill="none" aria-label="Menu">
      <rect y="0"   width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="6.5" width="22" height="2.5" rx="1.25" fill="white" />
      <rect y="13"  width="22" height="2.5" rx="1.25" fill="white" />
    </svg>
  )
}

function Header({ subtitle, onMenu, coinLabel = '10' }) {
  return (
    <div
      className="shrink-0 mx-[-16px] mt-[-56px] md:mt-[-64px] bg-[#00BAFF] rounded-b-[20px] chat-header-bar"
    >
      <div className="chat-status-spacer" />
      <div className="flex items-center justify-between h-[46px] px-[15px]">
        <button
          onClick={onMenu}
          className="active:scale-90 transition-transform duration-100 relative shrink-0 flex items-center justify-center"
          style={{ width: 45, height: 45 }}
        >
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
          <div className="relative" style={{ width: 19, height: 14 }}><HamburgerIcon /></div>
        </button>
        <div className="flex flex-col items-center text-white text-center" style={{ gap: 6 }}>
          <span style={{ ...DIN, fontWeight: 700, fontSize: 24, letterSpacing: '0.25px', lineHeight: 1 }}>PETCH</span>
          <span className="flex items-center" style={{ gap: 3 }}>
            <span style={{ ...DIN, fontWeight: 400, fontSize: 16, letterSpacing: '-0.2px', lineHeight: 1, opacity: 0.85 }}>
              {subtitle.endsWith('...') ? subtitle.slice(0, -3) : subtitle}
            </span>
            {subtitle.endsWith('...') && (
              <span className="flex items-end" style={{ gap: 2.5, paddingBottom: 1 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'inline-block', animation: `typing-dot 0.9s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center shrink-0 rounded-[4px] overflow-hidden" style={{ background: '#33CCFF', padding: 5, gap: 2.5 }}>
          <span style={{ ...DIN, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>{coinLabel}</span>
          <div className="rounded-full shrink-0 overflow-hidden" style={{ width: 15.316, height: 15.316, background: '#F5C542' }}>
            <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingBubble({ label }) {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      <span style={{ ...DIN, fontSize: 16, color: '#72E0FF' }}>{label}</span>
      <div className="flex items-end" style={{ gap: 3 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#72E0FF', animation: `typing-dot 0.9s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════
export default function LearningFrame({ topic = 'Sleep', managementAnswers, onComplete, onRestart }) {
  useLayoutEffect(() => {
    const BG = '#50CFFF'
    document.documentElement.style.backgroundColor = BG
    document.body.style.backgroundColor            = BG
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', BG)
      requestAnimationFrame(() => meta.setAttribute('content', BG))
    }
  }, [])

  const baseQs     = useMemo(() => shuffle(buildQuestions(topic, managementAnswers)), [topic, managementAnswers])
  const backupPool = useMemo(() => getBackupPool(topic), [topic])

  const [activeQs,      setActiveQs]      = useState(baseQs)
  const [usedIds,       setUsedIds]       = useState(new Set(baseQs.map(q => q.id)))
  const [qIndex,        setQIndex]        = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [chatHistory,   setChatHistory]   = useState([])
  const [typing,        setTyping]        = useState(false)
  const [typingLabel,   setTypingLabel]   = useState('')
  const [locked,        setLocked]        = useState(false)
  const [selectedOpt,   setSelectedOpt]   = useState(null)
  const [done,          setDone]          = useState(false)
  const [coinVisible,   setCoinVisible]   = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [showQuit,      setShowQuit]      = useState(false)
  const chatEndRef = useRef(null)

  // Opening message
  useEffect(() => {
    const t = setTimeout(() => {
      setChatHistory([{ role: 'petch', text: `Time to put your ${topic.toLowerCase()} knowledge to the test! Answer each question, don't worry if you're unsure, it's all part of learning!` }])
    }, 280)
    return () => clearTimeout(t)
  }, [topic])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, typing])

  // Coin drop-in when quiz completes
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setCoinVisible(true), 350)
    return () => clearTimeout(t)
  }, [done])

  // Switch bg to committing blue when done
  useLayoutEffect(() => {
    if (!done) return
    const BG = '#33CCFF'
    document.documentElement.style.backgroundColor = BG
    document.body.style.backgroundColor            = BG
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', BG)
  }, [done])

  const current  = activeQs[qIndex]
  const total    = activeQs.length
  const isLast   = qIndex === total - 1
  const progress = (LEARNING_START + answeredCount) / TOTAL_STEPS

  function handleAnswer(opt) {
    if (locked) return
    playMcq()
    setLocked(true)
    setSelectedOpt(opt)

    const newCount = answeredCount + 1
    setAnsweredCount(newCount)

    // User bubble immediately
    setChatHistory(prev => [...prev, { role: 'user', text: opt }])

    // Typing animation, then a short acknowledgement in chat.
    // The detailed personal note now lives in the card feedback block.
    const label = QUIRKY_LABELS[Math.floor(Math.random() * QUIRKY_LABELS.length)]
    setTyping(true)
    setTypingLabel(label)

    const ack = opt === current.correct
      ? 'Nice one!'
      : 'Not quite, let me explain.'

    setTimeout(() => {
      setTyping(false)
      setChatHistory(prev => [...prev, { role: 'petch', text: ack }])
    }, 1300)
  }

  function handleNextQuestion() {
    playNext()
    if (isLast) {
      setDone(true)
    } else {
      setQIndex(i => i + 1)
      setLocked(false)
      setSelectedOpt(null)
    }
  }

  // ── Completion + commit screen ──
  if (done) {
    const actions = ACTIONS_BY_TOPIC[topic] ?? ACTIONS_BY_TOPIC.Sleep

    return (
      <div className={`${PHONE} bg-[#33CCFF] flex flex-col`}>
        <Header subtitle="Committing..." onMenu={() => {}} />

        {/* Dog + message */}
        <div className="shrink-0 pt-6 flex gap-5 items-start">
          <img src={idleGif} alt="Riley" style={{ width: 82, flexShrink: 0 }} />
          <p style={{ ...DIN, fontSize: 20, color: 'white', letterSpacing: '-0.2px', lineHeight: 1.4, flex: 1, paddingTop: 4 }}>
            Done! Pick one action to commit to and earn your reward!
          </p>
        </div>

        {/* Progress bar 100% */}
        <div className="shrink-0 mt-5">
          <div className="relative rounded-[10px] overflow-hidden" style={{ height: 20, background: '#72E0FF' }}>
            <div className="absolute inset-0 rounded-[10px]" style={{ background: '#00BAFF' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ ...DIN, fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: '0.5px' }}>100%</span>
            </div>
          </div>
        </div>

        {/* Coin drops in below the bar */}
        <div className="shrink-0 flex justify-center" style={{ marginTop: 10 }}>
          <div
            style={{
              width: 35, height: 35, borderRadius: '50%', overflow: 'hidden',
              opacity: coinVisible ? 1 : 0,
              transform: coinVisible ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <div className="flex-1" />

        {/* TIME TO COMMIT card */}
        <div className="shrink-0 pb-4">
          <div className="bg-[#00BAFF] rounded-[12.5px] p-5 flex flex-col" style={{ gap: 0, minHeight: 312 }}>

            <div className="flex items-center justify-between mb-4">
              <p style={{ ...DIN, fontSize: 18, color: 'white', letterSpacing: '-0.25px' }}>TIME TO COMMIT!</p>
              <button
                onClick={() => setShowQuit(true)}
                style={{ ...DIN, fontSize: 18, fontWeight: 700, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
              >✕</button>
            </div>

            <p className="text-white mb-4" style={{ ...DIN, fontWeight: 400, fontSize: 20, letterSpacing: '-0.25px', lineHeight: 1.35 }}>
              Choose one out of three actions to make time for!
            </p>

            <div className="flex flex-col">
              {actions.map((action, i) => (
                <div key={action.id}>
                  <button
                    onClick={() => { playMcq(); setSelectedAction(prev => prev?.id === action.id ? null : action) }}
                    className="w-full flex items-center gap-[15px] active:opacity-80 transition-opacity"
                    style={{ height: 40 }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0 rounded-[20px]"
                      style={{
                        width: 40, height: 40,
                        background: selectedAction?.id === action.id ? 'white' : '#33CCFF',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span style={{
                        ...DIN, fontSize: 18, letterSpacing: '-0.25px',
                        color: selectedAction?.id === action.id ? '#00BAFF' : 'white',
                        fontWeight: selectedAction?.id === action.id ? 700 : 400,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="flex-1 text-left text-white" style={{
                      ...DIN, fontSize: 18, letterSpacing: '-0.25px',
                      fontWeight: selectedAction?.id === action.id ? 600 : 400,
                    }}>
                      {action.label}
                    </span>
                  </button>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '6px 0' }} />
                </div>
              ))}
            </div>

            <button
              onClick={() => { if (selectedAction) { playNext(); onComplete && onComplete({ action: selectedAction, topic }) } }}
              disabled={!selectedAction}
              style={{
                ...DIN, width: '100%', height: 45,
                background: '#33CCFF', color: 'white',
                fontSize: 18, fontWeight: 700, letterSpacing: '0.5px',
                borderRadius: 10, border: 'none', cursor: selectedAction ? 'pointer' : 'not-allowed',
                opacity: selectedAction ? 1 : 0.4,
                transition: 'opacity 0.15s ease',
                marginTop: 4,
              }}
            >
              I'M COMMITTED!
            </button>

          </div>
        </div>

        {showQuit && <QuitConfirmSheet onQuit={onRestart} onStay={() => setShowQuit(false)} />}
      </div>
    )
  }

  // ── Quiz screen ──
  return (
    <div className={`${PHONE} bg-[#50CFFF] flex flex-col`}>
      <Header subtitle="Learning..." onMenu={() => setShowQuit(true)} />

      {/* Dog left (fixed) + messages right (scrollable) */}
      <div className="flex-1 flex overflow-hidden min-h-0 pt-4 gap-3">
        <div className="shrink-0">
          <img src={idleGif} alt="Riley" style={{ height: 125, objectFit: 'contain' }} />
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2 pr-1">
          {chatHistory.map((msg, i) =>
            msg.role === 'user'
              ? (
                <div key={i} className="self-end" style={{ animation: 'fade-slide-up 0.2s ease forwards' }}>
                  <div style={{ background: '#00BAFF', borderRadius: 8, padding: '10px 15px' }}>
                    <span style={{ ...DIN, fontSize: 18, color: 'white', lineHeight: 1.35 }}>{msg.text}</span>
                  </div>
                </div>
              )
              : (
                <p key={i} style={{ ...DIN, fontSize: 18, color: 'white', lineHeight: 1.4, animation: 'fade-slide-up 0.25s ease forwards' }}>
                  {msg.text}
                </p>
              )
          )}
          {typing && <TypingBubble label={typingLabel} />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="pb-3 shrink-0 flex items-center gap-[10px]">
        <div className="flex-1 relative rounded-[10px] overflow-hidden" style={{ height: 20, background: '#00BAFF' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-[10px] transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%`, background: '#72E0FF' }}
          >
            <div className="absolute inset-[3.5px_4px] flex gap-[3px]">
              <div className="flex-1 h-full rounded-[10px]" style={{ background: '#9AE9FF' }} />
              <div className="shrink-0 h-full rounded-[10px]" style={{ width: 10, background: '#9AE9FF' }} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ ...DIN, fontWeight: 700, fontSize: 14, color: '#72E0FF', letterSpacing: '0.5px' }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
        <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 35, height: 35, background: '#F5C542' }}>
          <img src={coinSvg} alt="coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Bottom question card */}
      <div className="shrink-0 pb-4">
        <div className="bg-[#00BAFF] rounded-[12.5px] p-5 flex flex-col" key={qIndex} style={{ animation: locked ? 'none' : 'fade-slide-up 0.22s ease forwards', minHeight: 312 }}>

          <div className="flex items-center justify-between mb-4">
            <span style={{ ...DIN, fontWeight: 400, fontSize: 18, color: 'white', letterSpacing: '-0.25px' }}>
              {qIndex + 1} of {total}
            </span>
            <button onClick={() => setShowQuit(true)} className="text-white active:opacity-60 transition-opacity" style={{ ...DIN, fontSize: 18, fontWeight: 700 }}>
              ✕
            </button>
          </div>

          <p className="text-white mb-4" style={{ ...DIN, fontWeight: 400, fontSize: 20, letterSpacing: '-0.25px', lineHeight: 1.35, minHeight: 54 }}>
            {current.question}
          </p>

          <div className="flex flex-col">
            {current.options.map((opt, i) => {
              const isPicked  = selectedOpt === opt
              const isCorrect = opt === current.correct
              const pickedRight = locked && isPicked && isCorrect
              const pickedWrong = locked && isPicked && !isCorrect
              const revealRight = locked && !isPicked && isCorrect && selectedOpt != null && selectedOpt !== current.correct
              // Dark green / dark red
              const bg = pickedRight || revealRight
                ? '#0B7A3B'
                : pickedWrong
                ? '#8B1A1A'
                : 'transparent'
              const numBg = pickedRight || revealRight
                ? '#0B7A3B'
                : pickedWrong
                ? '#8B1A1A'
                : '#33CCFF'
              return (
                <div key={opt}>
                  <button
                    onClick={() => handleAnswer(opt)}
                    disabled={locked}
                    className="w-full flex items-center gap-[15px] active:opacity-80 transition-opacity"
                    style={{
                      height: 40,
                      background: bg,
                      borderRadius: 8,
                      paddingRight: bg === 'transparent' ? 0 : 8,
                      transition: 'background 0.25s ease',
                    }}
                  >
                    <div className="shrink-0 flex items-center justify-center rounded-[20px]" style={{ width: 40, height: 40, background: numBg, transition: 'background 0.25s ease' }}>
                      <span style={{ ...DIN, fontWeight: 400, fontSize: 18, color: 'white', letterSpacing: '-0.25px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="flex-1 text-left text-white" style={{ ...DIN, fontWeight: pickedRight || pickedWrong || revealRight ? 700 : 400, fontSize: 18, letterSpacing: '-0.25px' }}>
                      {opt}
                    </span>
                  </button>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '6px 0' }} />
                </div>
              )
            })}
          </div>

          {locked && (
            <div
              style={{
                marginTop: 12,
                padding: '12px 14px',
                background: selectedOpt === current.correct ? 'rgba(11,122,59,0.22)' : 'rgba(139,26,26,0.22)',
                border: `1px solid ${selectedOpt === current.correct ? '#0B7A3B' : '#8B1A1A'}`,
                borderRadius: 10,
                animation: 'fade-slide-up 0.28s ease forwards',
              }}
            >
              <p style={{ ...DIN, fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.4px', textTransform: 'uppercase', opacity: 0.85, marginBottom: 6 }}>
                {selectedOpt === current.correct ? 'Correct · what this means for you' : 'Not quite · what this means for you'}
              </p>
              <p style={{ ...DIN, fontSize: 15, color: 'white', lineHeight: 1.4 }}>
                {current.explanation}
              </p>
              {current.personalNote && (
                <p style={{ ...DIN, fontSize: 15, color: 'white', lineHeight: 1.4, marginTop: 8, fontWeight: 600 }}>
                  {current.personalNote}
                </p>
              )}
              <button
                onClick={handleNextQuestion}
                style={{
                  ...DIN, width: '100%', height: 40, marginTop: 12,
                  background: '#33CCFF', color: 'white',
                  fontSize: 16, fontWeight: 700, letterSpacing: '0.5px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                }}
              >
                {isLast ? 'FINISH' : 'NEXT'}
              </button>
            </div>
          )}

        </div>
      </div>

      {showQuit && <QuitConfirmSheet onQuit={onRestart} onStay={() => setShowQuit(false)} />}
    </div>
  )
}
