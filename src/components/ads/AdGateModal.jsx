// src/components/ads/AdGateModal.jsx
// Tournament Ad Gate — shown when a player tries to join a FREE tournament
// with adsRequired > 0
// Uses placeholder ads for now — swap AdGatePlayer for real AdSense later

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdGatePlayer } from './AdPlaceholder'

export default function AdGateModal({
  tournament,
  onConfirm,
  onCancel,
  joining,
  joinError,
}) {
  const adsRequired  = tournament?.adsRequired || 0
  const viewSeconds  = 8

  const [phase,      setPhase]      = useState('intro')   // intro | watching | done
  const [adIndex,    setAdIndex]    = useState(0)

  // When phase becomes 'done', auto-trigger join
  useEffect(() => {
    if (phase === 'done') onConfirm()
  }, [phase])

  const handleAdComplete = () => {
    if (adIndex + 1 >= adsRequired) {
      setPhase('done')
    } else {
      setAdIndex(i => i + 1)
    }
  }

  const progressPct = adsRequired > 0
    ? ((adIndex / adsRequired) * 100)
    : 0

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(8px)' }}>

        <motion.div initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:20 }}
          transition={{ type:'spring', stiffness:260, damping:24 }}
          className="w-full max-w-lg relative bg-[#0a0f1e] border border-[#1a2545] overflow-hidden"
          style={{ clipPath:'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>

          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

          {/* Close button — only when not watching */}
          {phase !== 'watching' && !joining && (
            <button onClick={onCancel}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center font-mono text-[#4a5568] hover:text-white transition-colors z-10">
              ✕
            </button>
          )}

          <div className="p-6">

            {/* ── INTRO ── */}
            {phase === 'intro' && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">📺</div>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">
                    Free Entry — Watch {adsRequired} Ad{adsRequired !== 1 ? 's' : ''}
                  </h2>
                  <p className="font-body text-[#4a5568] text-sm leading-relaxed max-w-sm mx-auto">
                    This tournament is free to enter. Watch {adsRequired} short ad{adsRequired !== 1 ? 's' : ''} to unlock your slot.
                    Each ad is about {viewSeconds} seconds.
                  </p>
                </div>

                {/* Tournament recap */}
                <div className="border border-[#1a2545] bg-[#050810] p-4 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-display font-bold text-sm text-white truncate pr-2">{tournament?.name}</div>
                    <span className="font-mono text-[9px] text-[#00ff88] border border-[#00ff88]/30 px-2 py-0.5 flex-shrink-0">FREE</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#4a5568]">{tournament?.game} · {tournament?.platform}</div>
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-6">
                  {[
                    ['📺', `Watch ${adsRequired} short ad${adsRequired !== 1 ? 's' : ''}`, `~${adsRequired * viewSeconds} seconds total`],
                    ['🔒', 'Slot locked in',   'After watching, you join instantly'],
                    ['🎮', 'Play for free!',    'No Gollars needed'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} className="flex items-center gap-3 p-3 border border-[#1a2545]/60">
                      <span className="text-xl flex-shrink-0">{icon}</span>
                      <div>
                        <div className="font-display text-sm text-white">{title}</div>
                        <div className="font-mono text-[10px] text-[#4a5568]">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={onCancel}
                    className="flex-1 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
                    Cancel
                  </button>
                  <button onClick={() => { setAdIndex(0); setPhase('watching') }}
                    className="flex-1 py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                    style={{ clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                    <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                    <span className="relative text-[#050810]">Watch Ads & Join →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── WATCHING ── */}
            {phase === 'watching' && (
              <motion.div key={`ad-${adIndex}`} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-[10px] text-[#4a5568] tracking-widest">
                      AD {adIndex + 1} OF {adsRequired}
                    </div>
                    <div className="font-display font-bold text-lg text-white">
                      {adIndex + 1 < adsRequired ? `${adsRequired - adIndex - 1} more after this` : '🎯 Last ad!'}
                    </div>
                  </div>
                  {/* Progress dots */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: adsRequired }, (_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i < adIndex ? 'bg-[#00ff88]' : i === adIndex ? 'bg-[#00f5ff]' : 'bg-[#1a2545]'
                      }`} />
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-[#1a2545] rounded-full mb-5 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#00f5ff]"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4 }} />
                </div>

                {/* Ad player */}
                <AdGatePlayer
                  adIndex={adIndex}
                  viewSeconds={viewSeconds}
                  onComplete={handleAdComplete}
                />

                <div className="text-center mt-3 font-mono text-[10px] text-[#4a5568]">
                  Don't close this window — you'll lose your progress
                </div>
              </motion.div>
            )}

            {/* ── DONE / JOINING ── */}
            {phase === 'done' && (
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="text-center py-6">
                {joinError ? (
                  <>
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="font-display font-bold text-xl text-[#ff2d55] mb-2">Registration Failed</h3>
                    <p className="font-mono text-xs text-[#4a5568] mb-5">{joinError}</p>
                    <button onClick={onCancel}
                      className="px-6 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
                      Close
                    </button>
                  </>
                ) : joining ? (
                  <>
                    <div className="relative w-16 h-16 mx-auto mb-5">
                      <div className="absolute inset-0 border-4 border-[#00f5ff]/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-[#00f5ff] rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">🎮</div>
                    </div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">Registering you...</h3>
                    <p className="font-mono text-xs text-[#4a5568]">Almost there!</p>
                  </>
                ) : (
                  <>
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200, delay:0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
                      style={{ background:'#00ff8822', border:'2px solid #00ff88', boxShadow:'0 0 30px #00ff8844' }}>
                      🎉
                    </motion.div>
                    <h3 className="font-display font-bold text-2xl text-[#00ff88] mb-2">All Done!</h3>
                    <p className="font-body text-[#4a5568] text-sm">Locking in your slot...</p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
