import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import petchLogoSvg   from '../assets/petch-logo.svg'
import petchSurveySvg from '../assets/petch-survey.svg'
import { PHONE } from '../utils/frame.jsx'
import { playNext } from '../utils/sounds'

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeP0Qzu6qu_lcnv2-JGHZgfSEg4o7MtqbHWRkb199yM8J_00g/viewform'

// ── QR code — generated at runtime from the form URL ─────────────
// The `qrcode` npm package (already in package.json) renders the URL
// into a canvas. White modules on the bubble blue (#50CFFF) so the
// QR sits seamlessly inside the speech bubble card.
function QRCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, FORM_URL, {
      width: 160,
      margin: 1,
      color: { dark: '#FFFFFF', light: '#50CFFF' },
    })
  }, [])

  return <canvas ref={canvasRef} className="rounded-[8px]" />
}

export default function SurveyFrame({ onRestart, entryAnim }) {
  return (
    <div className={`${PHONE} bg-[#BEEDFF]`} style={entryAnim}>

      {/* ── Petch logo icon ── */}
      <div className="shrink-0 flex justify-center mb-4">
        <img src={petchLogoSvg} alt="Petch" className="w-[66px] h-[66px] object-contain" />
      </div>

      {/* ── Thank-you text on blue BG ── */}
      <div className="shrink-0 text-center mb-1">
        <p className="text-[18px] font-black text-black leading-tight">
          THANK YOU FOR TRYING OUT PETCH!
        </p>
      </div>
      <div className="shrink-0 text-center mb-4">
        <p className="text-[14px] font-semibold text-black">
          Your participation is most appreciated!!!
        </p>
      </div>

      {/* ── Spacer ── */}
      <div className="h-4" />

      {/* ── Pets illustration + speech bubble (combined section) ── */}
      <div className="shrink-0 flex flex-col items-center">

        {/* Pets SVG */}
        <img
          src={petchSurveySvg}
          alt="Petch characters"
          className="w-[220px] relative z-10 mb-[-12px]"
        />

        {/* Speech bubble tail + card with text + QR */}
        <div className="w-[220px]">
          {/* tail pointing up toward pets */}
          <div className="tail-blue" style={{ marginLeft: 'calc(50% - 14px)', width: 0 }} />

          {/* Blue card: survey text + QR */}
          <div className="bg-[#50CFFF] rounded-[18px] px-4 pt-4 pb-4 flex flex-col items-center text-center gap-3">
            <p className="text-[12px] text-white leading-snug font-normal">
              Before you leave, please help us fill out a feedback survey telling us how we could improve!
            </p>
            <QRCanvas />
          </div>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="h-4" />

      {/* ── Back button ── */}
      <button
        onClick={() => { playNext(); onRestart() }}
        className="w-full h-[52px] bg-[#0FBDFF] text-white text-[18px] font-black rounded-[14px] shrink-0 transition-all hover:bg-[#7EDCFF] hover:shadow-[4px_5px_0_#50CFFF]"
      >
        BACK TO MAIN SCREEN
      </button>

    </div>
  )
}
