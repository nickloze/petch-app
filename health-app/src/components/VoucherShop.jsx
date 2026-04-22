import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import coinSvg from '../assets/coin.svg'
import { haptic } from '../utils/haptics'
import { playMcq, playNext } from '../utils/sounds'

const f = { fontFamily: "'DIN Next Rounded', sans-serif" }

const VOUCHERS = [
  { id: 'v1', brand: 'Subway',       title: '20% off any Sub',       cost: 40,  color: '#008C3A' },
  { id: 'v2', brand: 'Boost Juice',  title: '20% off any drink',     cost: 35,  color: '#E30613' },
  { id: 'v3', brand: 'Guzman',       title: 'Free chips w/ burrito', cost: 60,  color: '#FFB400' },
  { id: 'v4', brand: 'Local Gym',    title: '1-day free pass',       cost: 80,  color: '#7B5CFF' },
  { id: 'v5', brand: 'Grill\'d',     title: '$5 off next order',     cost: 50,  color: '#D64B22' },
]

function randomCode() {
  return Array.from({ length: 8 }, () =>
    'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]
  ).join('')
}

export default function VoucherShop({ open, balance = 0, onClose, onRedeem }) {
  const [redeemed, setRedeemed] = useState(null)

  function doRedeem(v) {
    if (balance < v.cost) { haptic('wrong'); return }
    playNext()
    haptic('commit')
    onRedeem(v)
    setRedeemed({ ...v, code: randomCode() })
  }

  function close() {
    setRedeemed(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sh-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            style={{ position: 'fixed', inset: 0, zIndex: 160, background: 'rgba(0, 30, 50, 0.6)' }}
          />
          <motion.div
            key="sh-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 161,
              background: '#002F54',
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: '18px 18px 28px',
              maxWidth: 500, margin: '0 auto',
              maxHeight: '86dvh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              color: 'white',
            }}
          >
            <div style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.35)', borderRadius: 2, margin: '0 auto 14px' }} />

            {!redeemed ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ ...f, fontSize: 22, fontWeight: 700 }}>Rewards Shop</h2>
                  <div className="flex items-center gap-[6px] rounded-[6px]" style={{ background: '#00BAFF', padding: '6px 10px' }}>
                    <span style={{ ...f, fontWeight: 700, fontSize: 16 }}>{balance}</span>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={coinSvg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                </div>
                <p style={{ ...f, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
                  Spend coins on real vouchers or pet cosmetics (soon).
                </p>
                <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] pr-1">
                  {VOUCHERS.map((v) => {
                    const afford = balance >= v.cost
                    return (
                      <motion.button
                        key={v.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { playMcq(); doRedeem(v) }}
                        disabled={!afford}
                        className="w-full rounded-[12px] flex items-center gap-[12px] text-left"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1.5px solid rgba(255,255,255,0.14)',
                          padding: '12px 14px',
                          opacity: afford ? 1 : 0.5,
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: v.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', ...f, fontWeight: 700, fontSize: 13,
                          flexShrink: 0,
                        }}>
                          {v.brand.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{ ...f, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{v.brand}</div>
                          <div style={{ ...f, fontSize: 16, fontWeight: 500, color: 'white' }}>{v.title}</div>
                        </div>
                        <div className="flex items-center gap-[4px] rounded-[6px]" style={{ background: afford ? '#00BAFF' : 'rgba(255,255,255,0.12)', padding: '6px 10px' }}>
                          <span style={{ ...f, fontWeight: 700, fontSize: 15, color: 'white' }}>{v.cost}</span>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', overflow: 'hidden' }}>
                            <img src={coinSvg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="flex flex-col items-center text-center px-4"
                style={{ paddingTop: 16 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  style={{ fontSize: 56, lineHeight: 1 }}
                >🎉</motion.div>
                <h3 style={{ ...f, fontSize: 22, fontWeight: 700, marginTop: 12 }}>Redeemed!</h3>
                <p style={{ ...f, fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
                  {redeemed.brand} — {redeemed.title}
                </p>
                <div
                  className="rounded-[12px] px-[18px] py-[14px] mt-5"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px dashed rgba(255,255,255,0.25)' }}
                >
                  <div style={{ ...f, fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6 }}>CODE</div>
                  <div style={{ ...f, fontSize: 26, fontWeight: 700, letterSpacing: 3, marginTop: 4 }}>{redeemed.code}</div>
                </div>
                <button
                  onClick={close}
                  className="w-full rounded-[12px] py-[14px] mt-6"
                  style={{ ...f, fontSize: 17, fontWeight: 700, color: '#002F54', background: 'white' }}
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
