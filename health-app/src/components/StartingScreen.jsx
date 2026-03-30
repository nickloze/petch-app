import catSvg from '../assets/Cat.svg'
import { PHONE } from '../utils/frame.jsx'
import { playNext } from '../utils/sounds'

export default function StartingScreen({ onStart }) {
  return (
    <div className={`${PHONE} bg-[#BEEDFF]`}>

      {/* ── Spacer: pushes cat+bubble to upper-centre ── */}
      <div className="flex-1" />

      {/* ── Cat ── */}
      <div className="flex justify-center mb-[-16px] relative z-10 shrink-0">
        <img src={catSvg} alt="Petch cat" className="w-[120px]" />
      </div>

      {/* ── Speech bubble ── */}
      <div className="shrink-0 px-6">
        {/* tail pointing up toward cat */}
        <div className="tail-blue mx-auto" style={{ width: 0, marginLeft: 'calc(50% - 14px)' }} />
        <div className="w-full bg-[#50CFFF] rounded-[20px] px-6 py-5 text-center">
          <p className="text-[18px] font-black text-white leading-none mb-1">Welcome to Petch!</p>
          <p className="text-[16px] font-bold text-white leading-snug">
            Here's our demo for the app's main learning feature
          </p>
        </div>
      </div>

      {/* ── Spacer: larger below, keeping button near bottom ── */}
      <div className="flex-[2]" />

      {/* ── CTA button ── */}
      <button
        onClick={() => { playNext(); onStart() }}
        className="w-full h-[52px] bg-[#7EDCFF] text-white text-[18px] font-black rounded-[14px] shrink-0"
      >
        LET'S START!!
      </button>

    </div>
  )
}
