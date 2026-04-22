import { useState, useLayoutEffect, useRef, useEffect } from 'react'
import HomeScreen              from './components/HomeScreen'
import CommunityScreen         from './components/CommunityScreen'
import MissionsScreen          from './components/MissionsScreen'
import HealthOverviewScreen    from './components/HealthOverviewScreen'
import SessionRecapScreen     from './components/SessionRecapScreen'
import ManagementFrame         from './components/ManagementFrame'
import LearningFrame           from './components/LearningFrame'
import MenuDrawer              from './components/MenuDrawer'
import SettingsSheet           from './components/SettingsSheet'
import Onboarding, { hasOnboarded } from './components/Onboarding'
import NudgeSheet, { pickNudge }    from './components/NudgeSheet'
import VoucherShop             from './components/VoucherShop'
import CoinFly                 from './components/CoinFly'
import { startBgMusic, preloadSounds } from './utils/sounds'
import { getBalance, earn, spend }     from './utils/coins'
import * as MissionsState              from './utils/missions'
import { recordCheckIn, getStreak, milestoneProgress } from './utils/streak'

const SCREEN_BG = {
  home:          '#33CCFF',
  community:     '#33CCFF',
  missions:      '#33CCFF',
  health:        '#002F54',
  'session-recap': '#33CCFF',
}

const BG = {
  home:           '#33CCFF',
  community:      '#33CCFF',
  missions:       '#33CCFF',
  'topic-select': '#50CFFF',
  'topic-wait':   '#50CFFF',
  management:     '#50CFFF',
  learning:       '#50CFFF',
  health:         '#33CCFF',
  onboarding:     '#33CCFF',
}

function applyPhaseColor(colour) {
  document.documentElement.style.backgroundColor = colour
  document.body.style.backgroundColor            = colour
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

export default function App() {
  const [onboarded,     setOnboarded]     = useState(() => hasOnboarded())
  const [phase,         setPhase]         = useState(() => (hasOnboarded() ? 'home' : 'onboarding'))
  const [screen,        setScreen]        = useState('home')
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const [shopOpen,      setShopOpen]      = useState(false)
  const [coins,         setCoins]         = useState(() => getBalance())
  const [fadeReturn,    setFadeReturn]    = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('Sleep')
  const [mgmtAns,       setMgmtAns]       = useState({})
  const [mgmtById,      setMgmtById]      = useState({})
  const [slideDir,      setSlideDir]      = useState('none')
  const [returning,     setReturning]     = useState(false)
  const [postCheckInPhase, setPostCheckInPhase] = useState(null)
  const [healthInitialView, setHealthInitialView] = useState(null)
  const [missions, setMissions] = useState(() => MissionsState.load().slots)
  const [streak,   setStreak]   = useState(() => getStreak())
  const [selectedSession, setSelectedSession] = useState(null)
  const [streakBumped, setStreakBumped] = useState(false)

  // Nudge state — one chance per app open, ~35% of the time, after a short delay
  const [nudgeOpen, setNudgeOpen] = useState(false)
  const [nudge,     setNudge]     = useState(null)

  // Coin fly animation
  const [coinFly, setCoinFly] = useState(null) // { from, to } | null

  const prevScreenRef = useRef('home')
  const topBarCoinRef = useRef(null)

  useLayoutEffect(() => {
    applyPhaseColor(BG[phase] ?? BG.home)
    startBgMusic()
    preloadSounds()
  }, [])

  useEffect(() => {
    if (!onboarded) return
    // 35% chance to show a nudge on app open, after 1.5s
    if (Math.random() < 0.35) {
      const t = setTimeout(() => {
        setNudge(pickNudge())
        setNudgeOpen(true)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [onboarded])

  useLayoutEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const apply = () => {
      document.documentElement.style.setProperty('--vvh', `${vv.height}px`)
      document.documentElement.style.setProperty('--vvoffset', `${vv.offsetTop}px`)
      if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0)
    }
    apply()
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
    window.addEventListener('scroll', apply, { passive: true })
    return () => {
      vv.removeEventListener('resize', apply)
      vv.removeEventListener('scroll', apply)
      window.removeEventListener('scroll', apply)
    }
  }, [])

  useLayoutEffect(() => {
    if (phase === 'home') {
      applyPhaseColor(SCREEN_BG[screen] ?? BG.home)
    } else {
      applyPhaseColor(BG[phase] ?? BG.home)
    }
  }, [phase, screen])

  function handleMenuNavigate(targetScreen) {
    if (targetScreen === screen) { setMenuOpen(false); return }
    const leavingHealth = prevScreenRef.current === 'health' && targetScreen !== 'health'
    setFadeReturn(leavingHealth)
    prevScreenRef.current = targetScreen
    setScreen(targetScreen)
    setMenuOpen(false)
    if (leavingHealth) setTimeout(() => setFadeReturn(false), 350)
  }

  function handleStart() {
    applyPhaseColor(BG['topic-select'])
    setMenuOpen(false)
    setSlideDir('forward')
    setPhase('topic-select')
  }

  function handleTopicConfirm(topic) {
    applyPhaseColor(BG.management)
    setSelectedTopic(topic)
    setSlideDir('none')
    setPhase('management')
  }

  function handleManagementComplete(resultById, resultByIndex) {
    applyPhaseColor(BG.learning)
    setMgmtAns(resultByIndex)
    setMgmtById(resultById)
    setSlideDir('forward')
    setPhase('learning')
  }

  function handleLearningComplete(payload) {
    applyPhaseColor(BG.home)

    // Auto-fill Slot 1 from committed action
    if (payload?.action?.label) {
      const state = MissionsState.assignSlot1(payload.action.label, payload.topic || selectedTopic)
      setMissions(state.slots)
    }

    // Award check-in coins + update streak
    const next = earn(5, 'check_in', { topic: payload?.topic })
    setCoins(next)
    const streakState = recordCheckIn()
    setStreak(streakState)
    setStreakBumped(true)
    setTimeout(() => setStreakBumped(false), 1200)

    // Coin fly: from commit area (rough center) to top-right (where the
    // coin balance lives on every screen's header).
    requestAnimationFrame(() => {
      const w = window.innerWidth
      const h = window.innerHeight
      // Phone shell is centered on desktop; compute right edge of the shell.
      const shellRight = Math.min(w, 500)
      const leftPad    = w > shellRight ? (w - shellRight) / 2 : 0
      const from = { x: w / 2 - 15, y: h / 2 - 15 }
      const to   = { x: leftPad + shellRight - 60, y: 80 }
      setCoinFly({ from, to })
    })

    setSlideDir('none')
    setScreen('home')
    setPhase('home')
    setPostCheckInPhase('done')
    setMenuOpen(false)
  }

  function handleRestart() {
    applyPhaseColor(BG.home)
    setMgmtAns({})
    setMgmtById({})
    setSlideDir('none')
    setReturning(false)
    setScreen('home')
    setPhase('home')
    setPostCheckInPhase(null)
    setMenuOpen(false)
  }

  function handleHomeNavigateToHealth(view) {
    setHealthInitialView(view)
    handleMenuNavigate('health')
  }

  function handleHomeNavigateFromChip(target) {
    setPostCheckInPhase('returned')
    handleMenuNavigate(target)
  }

  // Mission completion handlers (from MissionsScreen)
  function completeMission(slotIndex, reward) {
    const state = MissionsState.completeMission(slotIndex)
    setMissions(state.slots)
    setTimeout(() => {
      const next = earn(reward, 'mission_complete', { slot: slotIndex })
      setCoins(next)
    }, 600)
  }

  function triggerCoinFly(points) {
    // Normalize: if caller provides only `from`, we compute `to` as
    // the fixed top-right coin target.
    const w = window.innerWidth
    const shellRight = Math.min(w, 500)
    const leftPad    = w > shellRight ? (w - shellRight) / 2 : 0
    const to = points?.to ?? { x: leftPad + shellRight - 60, y: 80 }
    setCoinFly({ from: points.from, to })
  }

  function handleAddMissionFromCommunity(mission) {
    const state = MissionsState.addSuggestion(mission)
    setMissions(state.slots)
  }

  function handleShopRedeem(voucher) {
    const next = spend(voucher.cost, 'voucher_redeem', { voucher: voucher.id })
    setCoins(next)
  }

  const menuProps = {
    menuOpen,
    onMenuOpen:  () => setMenuOpen(true),
    onMenuClose: () => setMenuOpen(false),
    coins,
  }

  const streakProgress = milestoneProgress(streak.count)

  if (phase === 'onboarding') {
    return (
      <div className="md:min-h-screen md:flex md:items-center md:justify-center overflow-x-hidden">
        <Onboarding
          onDone={() => {
            setOnboarded(true)
            setPhase('home')
            applyPhaseColor(BG.home)
          }}
        />
      </div>
    )
  }

  return (
    <div className="md:min-h-screen md:flex md:items-center md:justify-center overflow-x-hidden">
      {phase === 'home' && (
        <MenuDrawer
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={handleMenuNavigate}
          activeScreen={screen}
          coins={coins}
          onProfileClick={() => setSettingsOpen(true)}
          onShopClick={() => { setMenuOpen(false); setShopOpen(true) }}
          onCoinsClick={() => { setMenuOpen(false); setShopOpen(true) }}
          onSessionClick={(s) => {
            setSelectedSession(s)
            prevScreenRef.current = 'session-recap'
            setScreen('session-recap')
            setMenuOpen(false)
          }}
          onAllSessionsClick={() => handleMenuNavigate('health')}
        />
      )}

      {phase === 'home' && (
        <SettingsSheet
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={screen === 'health' ? 'navy' : 'cyan'}
        />
      )}

      {phase === 'home' && screen === 'home' && (
        <HomeScreen
          {...menuProps}
          onCheckIn={handleStart}
          onTopicConfirm={handleTopicConfirm}
          fadeIn={fadeReturn}
          postCheckInPhase={postCheckInPhase}
          onPostCheckInNavigate={handleHomeNavigateFromChip}
          onSummaryNavigate={handleHomeNavigateToHealth}
          streakCount={streak.count}
          streakPct={streakProgress.pct}
          streakNext={streakProgress.next}
          streakBumped={streakBumped}
          topBarCoinRef={topBarCoinRef}
        />
      )}
      {phase === 'home' && screen === 'community' && (
        <CommunityScreen
          {...menuProps}
          fadeIn={fadeReturn}
          onAddMission={handleAddMissionFromCommunity}
          onNavigateMissions={() => handleMenuNavigate('missions')}
        />
      )}
      {phase === 'home' && screen === 'missions' && (
        <MissionsScreen
          {...menuProps}
          fadeIn={fadeReturn}
          missions={missions}
          onCompleteMission={{ complete: completeMission, fly: triggerCoinFly }}
          onAddMission={handleAddMissionFromCommunity}
          coinBalanceRef={topBarCoinRef}
        />
      )}
      {phase === 'home' && screen === 'health' && (
        <HealthOverviewScreen
          {...menuProps}
          initialView={healthInitialView}
          onInitialViewConsumed={() => setHealthInitialView(null)}
        />
      )}
      {phase === 'home' && screen === 'session-recap' && (
        <SessionRecapScreen
          session={selectedSession}
          onBack={() => { prevScreenRef.current = 'home'; setScreen('home') }}
          onMenuOpen={() => setMenuOpen(true)}
          coins={coins}
        />
      )}

      {phase === 'management' && (
        <ManagementFrame topic={selectedTopic} onComplete={handleManagementComplete} onRestart={handleRestart} />
      )}
      {phase === 'learning' && (
        <LearningFrame topic={selectedTopic} managementAnswers={mgmtAns} onComplete={handleLearningComplete} onRestart={handleRestart} />
      )}

      <NudgeSheet
        open={nudgeOpen}
        nudge={nudge}
        onDismiss={() => setNudgeOpen(false)}
      />

      <VoucherShop
        open={shopOpen}
        balance={coins}
        onClose={() => setShopOpen(false)}
        onRedeem={handleShopRedeem}
      />

      <CoinFly
        active={!!coinFly}
        from={coinFly?.from}
        to={coinFly?.to}
        count={3}
        onDone={() => setCoinFly(null)}
      />
    </div>
  )
}
