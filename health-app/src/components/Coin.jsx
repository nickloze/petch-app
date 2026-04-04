import coinSvg from '../assets/coin.svg'

/**
 * Coin badge — shows the coin icon with a count label beneath it.
 * size: controls the coin image width (default 36px)
 */
export default function Coin({ count = 1, size = 36 }) {
  return (
    <div className="flex flex-col items-center gap-[2px]">
      <div className="relative" style={{ width: size, height: size }}>
        <img src={coinSvg} alt="coin" style={{ width: size, height: size }} />
        {count > 1 && (
          <span
            className="absolute -top-1 -right-1 bg-[#E2A900] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none border border-white"
          >
            {count}
          </span>
        )}
      </div>
      <span className="text-[10px] font-extrabold text-[#B07D00] leading-none">
        {count === 1 ? '1 coin' : `${count} coins`}
      </span>
    </div>
  )
}
