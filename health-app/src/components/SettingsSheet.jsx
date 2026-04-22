const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

const THEMES = {
  cyan: {
    bg:      '#00BAFF',
    border:  '#9AE9FF',
    divider: 'rgba(154, 233, 255, 0.5)',
  },
  navy: {
    bg:      '#004981',
    border:  '#3C88B8',
    divider: 'rgba(60, 136, 184, 0.6)',
  },
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-label="Close">
      <path d="M2 2L13 13M13 2L2 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const PRIMARY_ITEMS = ['Profile', 'Notifications', 'Permission', 'Updates']
const SECONDARY_ITEMS = ['Data Policy', 'Health Data Protection', 'Privacy', 'FAQ']

export default function SettingsSheet({ isOpen, onClose, theme = 'cyan', email = 'nicklozekoh@gmail.com' }) {
  const c = THEMES[theme] ?? THEMES.cyan

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 0,
          transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
          width: 379,
          maxWidth: '94vw',
          height: 539,
          maxHeight: '75vh',
          background: c.bg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          zIndex: 201,
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '15px 24px',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        {/* Top bar: X | Settings | i */}
        <div className="flex items-center justify-between w-full" style={{ padding: '0 5px' }}>
          <button
            onClick={onClose}
            className="active:scale-90 transition-transform duration-100"
            aria-label="Close settings"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <CloseIcon />
          </button>
          <div style={{ padding: 5 }}>
            <span style={{ ...f, fontWeight: 500, fontSize: 20, color: 'white', letterSpacing: '-0.05px' }}>
              Settings
            </span>
          </div>
          <button
            className="active:scale-90 transition-transform duration-100"
            aria-label="Info"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', width: 15, height: 15 }}
          >
            <span style={{ ...f, fontWeight: 400, fontSize: 20, color: 'white', letterSpacing: '-0.05px', lineHeight: 1 }}>
              i
            </span>
          </button>
        </div>

        {/* Email field */}
        <div
          className="w-full"
          style={{
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: 10,
            transition: 'border-color 0.3s ease',
          }}
        >
          <span style={{ ...f, fontWeight: 400, fontSize: 20, color: 'white', letterSpacing: '-0.05px' }}>
            {email}
          </span>
        </div>

        {/* Primary items */}
        <div className="flex flex-col w-full">
          {PRIMARY_ITEMS.map(label => (
            <SettingRow key={label} label={label} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: c.divider, width: '100%', transition: 'background 0.3s ease' }} />

        {/* Secondary items */}
        <div className="flex flex-col w-full">
          {SECONDARY_ITEMS.map(label => (
            <SettingRow key={label} label={label} />
          ))}

          {/* Delete Account  |  Log Out */}
          <div className="flex items-center justify-between w-full">
            <SettingRow label="Delete Account" />
            <SettingRow label="Log Out" />
          </div>
        </div>
      </div>
    </>
  )
}

function SettingRow({ label }) {
  return (
    <button
      className="active:opacity-70 transition-opacity duration-100 text-left"
      style={{
        padding: 10,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ ...f, fontWeight: 400, fontSize: 20, color: 'white', letterSpacing: '-0.05px', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  )
}
