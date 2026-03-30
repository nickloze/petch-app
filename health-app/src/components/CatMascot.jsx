// Orange cat mascot — SVG colours matched to Figma exactly
// Body: #F8A019, outline: #231F20, belly stripes: #FFFFFF, nose: #FFAEAE
function CatMascot({ width = 180, style = {} }) {
  return (
    <svg
      width={width}
      viewBox="0 0 220 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Orange cat mascot"
      style={style}
    >
      {/* Tail */}
      <path
        d="M 30 100 Q 8 88 12 68 Q 16 50 34 54"
        stroke="#E8900A"
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body */}
      <ellipse cx="112" cy="100" rx="84" ry="38" fill="#F8A019" />
      <ellipse cx="112" cy="100" rx="84" ry="38" fill="none" stroke="#231F20" strokeWidth="1.5" />

      {/* White belly */}
      <ellipse cx="112" cy="105" rx="50" ry="24" fill="#fff" opacity="0.9" />

      {/* Belly stripes (3 horizontal white lines) */}
      <line x1="92" y1="99"  x2="132" y2="99"  stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="88" y1="107" x2="136" y2="107" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="92" y1="115" x2="132" y2="115" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

      {/* Front paws */}
      <ellipse cx="74"  cy="124" rx="22" ry="11" fill="#F8A019" stroke="#231F20" strokeWidth="1.2" />
      <ellipse cx="150" cy="124" rx="22" ry="11" fill="#F8A019" stroke="#231F20" strokeWidth="1.2" />

      {/* Paw toe lines */}
      <line x1="65"  y1="124" x2="65"  y2="133" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="74"  y1="126" x2="74"  y2="135" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="83"  y1="124" x2="83"  y2="133" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="141" y1="124" x2="141" y2="133" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="150" y1="126" x2="150" y2="135" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="159" y1="124" x2="159" y2="133" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />

      {/* Head */}
      <circle cx="162" cy="70" r="44" fill="#F8A019" />
      <circle cx="162" cy="70" r="44" fill="none" stroke="#231F20" strokeWidth="1.5" />

      {/* Left ear */}
      <polygon points="126,46 116,16 146,38" fill="#F8A019" />
      <polygon points="126,46 116,16 146,38" fill="none" stroke="#231F20" strokeWidth="1.5" />
      <polygon points="128,43 121,22 143,37" fill="#FFAEAE" opacity="0.5" />

      {/* Right ear */}
      <polygon points="180,38 198,12 202,40" fill="#F8A019" />
      <polygon points="180,38 198,12 202,40" fill="none" stroke="#231F20" strokeWidth="1.5" />
      <polygon points="182,38 196,18 200,39" fill="#FFAEAE" opacity="0.5" />

      {/* Eyes — sleepy / half-closed (dark arcs matching Figma #231F20) */}
      <path d="M 148 65 Q 154 59 160 65" stroke="#231F20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 165 65 Q 171 59 177 65" stroke="#231F20" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="162" cy="76" rx="5" ry="3.5" fill="#FFAEAE" />

      {/* Mouth */}
      <path d="M 158 79 Q 162 84 166 79" stroke="#231F20" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Whiskers left */}
      <line x1="148" y1="74" x2="120" y2="69" stroke="#231F20" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="148" y1="78" x2="120" y2="79" stroke="#231F20" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Whiskers right */}
      <line x1="177" y1="74" x2="205" y2="69" stroke="#231F20" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="177" y1="78" x2="205" y2="79" stroke="#231F20" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export default CatMascot
