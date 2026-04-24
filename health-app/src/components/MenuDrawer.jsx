import coinSvg from '../assets/coin.svg'
import shopSvg from '../assets/shop.svg'
import { DEMO_SESSION_LIST } from '../utils/demoHistory'

const MENU_WIDTH = 279

const SESSIONS = DEMO_SESSION_LIST

const NAV_ITEMS = [
  { id: 'home',      label: 'Chat with Petch' },
  { id: 'health',    label: 'Health Overview' },
  { id: 'community', label: 'Community' },
  { id: 'missions',  label: 'Missions' },
]

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

// Shared reset style for inner-row buttons (matches Figma items that only used
// a text span — we still want keyboard-accessible buttons).
const BARE_BUTTON = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  WebkitTapHighlightColor: 'transparent',
  textAlign: 'left',
}

export { MENU_WIDTH }

export default function MenuDrawer({
  isOpen,
  onClose,
  onNavigate,
  activeScreen,
  coins,
  onProfileClick,
  onShopClick,
  onCoinsClick,
  onSessionClick,
  onAllSessionsClick,
  userName = 'friend',
}) {
  const isNavy = activeScreen === 'health'
  const theme = isNavy
    ? { bg: '#004981', badge: '#013863', activePill: '#013863', divider: 'rgba(60, 136, 184, 0.45)' }
    : { bg: '#00BAFF', badge: '#33CCFF', activePill: '#33CCFF', divider: 'rgba(154, 233, 255, 0.45)' }

  const closeAfter = (fn) => () => { fn?.(); onClose() }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: MENU_WIDTH,
        zIndex: 50,
        background: theme.bg,
        transform: isOpen ? 'translateX(0)' : `translateX(-${MENU_WIDTH}px)`,
        transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // Top spacing tracks the iOS safe-area so the header sits just
        // below the status bar / Dynamic Island — no hardcoded 61px.
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
        // Respect the iOS home indicator only — no extra dead space
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP: header + nav (gap-39, px-15.5) ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 39, padding: '0 15.5px' }}>

        {/* PETCH + shop icon + coin badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px' }}>
          <span style={{ ...f, fontWeight: 700, fontSize: 32, color: 'white', lineHeight: 1 }}>
            PETCH
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Shop icon — clickable */}
            <button
              onClick={closeAfter(onShopClick)}
              aria-label="Open shop"
              className="active:scale-90 transition-transform duration-100"
              style={{ ...BARE_BUTTON, padding: '0 7px', display: 'flex', alignItems: 'center' }}
            >
              <img src={shopSvg} alt="Shop" style={{ width: 25, height: 25 }} />
            </button>

            {/* Coin badge — clickable */}
            <button
              onClick={closeAfter(onCoinsClick)}
              aria-label={`${coins} coins`}
              className="active:scale-95 transition-transform duration-100"
              style={{
                ...BARE_BUTTON,
                background: theme.badge,
                borderRadius: 4,
                padding: 5,
                display: 'flex',
                gap: 2.5,
                alignItems: 'center',
                transition: 'background 0.3s ease, transform 0.1s ease',
              }}
            >
              <span style={{ ...f, fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1 }}>
                {coins}
              </span>
              <div style={{ width: 15.316, height: 15.316, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={coinSvg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </button>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = activeScreen === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose() }}
                style={{
                  background: active ? theme.activePill : 'transparent',
                  borderRadius: 8,
                  padding: '15px 15px 10px',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.3s ease',
                }}
              >
                <span style={{
                  ...f,
                  fontWeight: active ? 700 : 500,
                  fontSize: 20,
                  color: 'white',
                  letterSpacing: '-0.2px',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MIDDLE: previous sessions ───────────────────── */}
      <div style={{ padding: '0 15.5px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 15px' }}>
          <span style={{ ...f, fontWeight: 500, fontSize: 18, color: 'white', letterSpacing: '-0.18px', textTransform: 'uppercase' }}>
            Previous Sessions
          </span>
        </div>
        {SESSIONS.map((s, i) => (
          <button
            key={i}
            onClick={closeAfter(() => onSessionClick?.(s))}
            className="active:opacity-70 transition-opacity duration-100"
            style={{
              ...BARE_BUTTON,
              padding: '5px 15px',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ ...f, fontWeight: 400, fontSize: 16, color: 'white', letterSpacing: '-0.16px' }}>
              {s.topic}
            </span>
            <span style={{ ...f, fontWeight: 400, fontSize: 16, color: 'white', letterSpacing: '-0.16px' }}>
              {s.date}
            </span>
          </button>
        ))}
      </div>

      {/* ── BOTTOM: All Sessions | divider | Profile (h=124 justify-between) */}
      <div style={{
        padding: '0 15.5px',
        height: 124,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* All Sessions — functional button */}
        <button
          onClick={closeAfter(onAllSessionsClick)}
          className="active:opacity-70 transition-opacity duration-100"
          style={{
            ...BARE_BUTTON,
            padding: '5px 15px',
            borderRadius: 10,
            width: '100%',
          }}
        >
          <span
            className="capitalize"
            style={{ ...f, fontWeight: 300, fontSize: 18, color: 'white', letterSpacing: '-0.18px' }}
          >
            All Sessions
          </span>
        </button>

        {/* Divider (Figma Frame 715 — 20px container with hair-line) */}
        <div
          aria-hidden="true"
          style={{ height: 20, width: '100%', display: 'flex', alignItems: 'center', padding: '0 15px' }}
        >
          <div style={{ height: 1, background: theme.divider, width: '100%', transition: 'background 0.3s ease' }} />
        </div>

        {/* Profile — opens settings */}
        <button
          onClick={onProfileClick}
          className="active:opacity-70 transition-opacity duration-100"
          style={{
            ...BARE_BUTTON,
            padding: '5px 15px',
            borderRadius: 10,
            display: 'flex',
            gap: 15,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.28)',
            flexShrink: 0,
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ ...f, fontWeight: 500, fontSize: 20, color: 'white', letterSpacing: '-0.05px', whiteSpace: 'nowrap' }}>
              {userName}
            </span>
            <span style={{ ...f, fontWeight: 400, fontSize: 16, color: 'white', letterSpacing: '-0.04px' }}>
              Loves Sleeping
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
