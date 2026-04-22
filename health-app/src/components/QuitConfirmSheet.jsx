export default function QuitConfirmSheet({ onQuit, onStay }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-[#1A2335] px-5 pt-6 pb-8 z-20"
      style={{ animation: 'slide-up-sheet 0.38s cubic-bezier(0.32,0.72,0,1) forwards' }}
    >
      {/* Drag handle */}
      <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

      <p className="text-[22px] font-black text-white text-center mb-2">
        Hang on! 👋
      </p>
      <p className="text-[15px] text-white/70 text-center leading-snug mb-6">
        Are you sure you want to leave? Your progress today won't be saved.
      </p>

      <button
        onClick={onStay}
        className="w-full h-[52px] bg-[#0FBEFF] text-white text-[17px] font-bold rounded-[14px] mb-3"
      >
        Keep Going!
      </button>

      <button
        onClick={onQuit}
        className="w-full h-[52px] bg-white/10 text-white/80 text-[15px] font-semibold rounded-[14px]"
      >
        I'll come back and try again next time!
      </button>
    </div>
  )
}
