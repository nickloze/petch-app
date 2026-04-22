// ── Shared iPhone 16/17 Pro shell — 402 × 874 px ───────────────
// Apply as: <div className={`${PHONE} bg-[colour]`}>
export const PHONE = [
  // ── Mobile: pinned to top-left, height tracks visual viewport ──
  // Using var(--vvh) (set by a JS visualViewport listener) + 100dvh
  // fallback means the container shrinks as the software keyboard
  // opens, so the flex layout pushes the chat input above it while
  // the header stays pinned at the top. No more "everything scrolls
  // off except the keyboard" on iOS Safari.
  'fixed top-0 left-0 right-0',
  'phone-shell',
  // Top pad clears status bar; bottom pad is the home-indicator safe
  // area only (no extra dead space beyond what iOS actually reserves).
  'pt-14 px-[16px] pb-[env(safe-area-inset-bottom,0px)]',
  'flex flex-col overflow-hidden',

  // ── Desktop (md: 768px+): back to relative + phone shell ───────
  'md:relative md:inset-auto',
  'md:w-[402px] md:h-[874px]',
  'md:rounded-[55px]',
  'md:pt-[64px] md:pb-[44px]',
  'md:shadow-[0_0_0_2px_#4a4a4a,0_0_0_11px_#1c1c1e,0_0_0_13px_#3a3a3c,0_40px_100px_rgba(0,0,0,0.45)]',

  // Dynamic Island — desktop only
  'before:content-none',
  "md:before:content-[''] md:before:absolute md:before:top-3 md:before:left-1/2 md:before:-translate-x-1/2",
  'md:before:w-[126px] md:before:h-[37px] md:before:bg-black md:before:rounded-[20px] md:before:z-10',
].join(' ')

// ── Shared microphone icon ───────────────────────────────────────
export function MicIcon({ size = 22, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-label="Voice input">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  )
}

// ── Reusable input row for in-card text + voice entry ────────────
// Sits at the bottom of a question/content card. Text on the left,
// mic on the right. `theme` switches placeholder tint between the
// cyan and navy card backgrounds.
export function CardInputRow({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Type something...',
  theme = 'cyan',
}) {
  const phClass = theme === 'navy' ? 'navy-input' : 'placeholder-[#72E0FF]'
  return (
    <div
      style={{
        marginTop: 'auto',
        paddingTop: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
            e.preventDefault()
            onSubmit?.(value)
          }
        }}
        placeholder={placeholder}
        className={`bg-transparent outline-none flex-1 text-white text-[16px] ${phClass}`}
        style={{
          fontFamily: "'DIN Next Rounded', sans-serif",
          fontWeight: 400,
          letterSpacing: '-0.2px',
        }}
      />
      <button
        type="button"
        aria-label="Voice input"
        className="shrink-0 active:scale-90 transition-transform duration-100"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
      >
        <MicIcon />
      </button>
    </div>
  )
}

// ── Shared "send" button — white circle with up-arrow ────────────
export function SendIcon({ size = 26, color = '#00BAFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-label="Send">
      <circle cx="13" cy="13" r="13" fill="white" />
      <path
        d="M13 7v11M8 12l5-5 5 5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Shared lightbulb icon SVG ────────────────────────────────────
export function Bulb() {
  return (
    <svg width="15" height="21" viewBox="0 0 15 21" fill="none" aria-hidden="true">
      <path
        d="M7.5 0C3.91 0 1 2.91 1 6.5c0 2.38 1.29 4.45 3.2 5.58L4.5 14h6l.3-1.92C12.71 10.95 14 8.88 14 6.5 14 2.91 11.09 0 7.5 0z"
        fill="#000"
      />
      <rect x="4.5" y="15"   width="6" height="2" rx="1" fill="#000" />
      <rect x="5"   y="18.5" width="5" height="2" rx="1" fill="#000" />
    </svg>
  )
}
