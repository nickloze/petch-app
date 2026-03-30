// ── Shared iPhone 16/17 Pro shell — 402 × 874 px ───────────────
// Apply as: <div className={`${PHONE} bg-[colour]`}>
export const PHONE = [
  // ── Mobile: fixed to exact visible screen — no scroll, no gaps ─
  // position:fixed + inset:0 beats Safari's dynamic toolbar problem
  'fixed inset-0',
  // Top pad clears status bar; bottom pad clears home indicator
  'pt-14 px-[22px] pb-8',
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
