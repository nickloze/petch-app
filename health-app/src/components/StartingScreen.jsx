import catSvg from '../assets/cat.svg'
import { PHONE } from '../utils/frame.jsx'
import { playNext } from '../utils/sounds'

export default function StartingScreen({ onStart }) {
  return (
    <div className={`${PHONE} bg-[#BEEDFF]`}>

      {/* ── Top spacer ── */}
      <div className="flex-1" />

      {/* ── Compact centred group: cat + bubble + button ── */}
      <div className="shrink-0 flex flex-col">

        {/* Cat */}
        <div className="flex justify-center mb-[-16px] relative z-10">
          <img src={catSvg} alt="Petch cat" className="w-[120px]" />
        </div>

        {/* Speech bubble */}
        <div className="px-6">
          <div className="tail-blue mx-auto" style={{ width: 0, marginLeft: 'calc(50% - 14px)' }} />
          <div className="w-full bg-[#50CFFF] rounded-[20px] px-6 py-5 text-center">
            <p className="text-[18px] font-black text-white leading-none mb-1">Welcome to Petch!</p>
            <p className="text-[16px] font-bold text-white leading-snug">
              Here's our demo for the app's main learning feature
            </p>
          </div>
        </div>

        {/* Gap between bubble and button */}
        <div className="h-6" />

        {/* CTA button */}
        <button
          onClick={() => { playNext(); onStart() }}
          className="w-full h-[52px] bg-[#0FBDFF] text-white text-[18px] font-black rounded-[14px] transition-all hover:bg-[#7EDCFF] hover:shadow-[4px_5px_0_#50CFFF]"
        >
          LET'S START!!
        </button>

      </div>

      {/* ── Bottom spacer ── */}
      <div className="flex-1" />

    </div>
  )
}
