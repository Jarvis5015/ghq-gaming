// src/components/ads/AdGateModal.jsx
// Tournament Ad Gate — shown when a player tries to join a FREE tournament
// that has adsRequired > 0.
//
// Flow:
//   1. Modal opens showing "you must watch N ads to join"
//   2. Player clicks "Watch Ads"
//   3. Ad 1 loads (real AdSense unit) + countdown timer starts
//   4. Timer reaches 0 → "Next Ad" or "Get Slot" button unlocks
//   5. Repeats for all N ads
//   6. After last ad → join API call fires → success screen

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdSense, { AD_SLOTS } from './AdSense'

// How long (seconds) each AdSense unit must be visible before Next unlocks
// AdSense itself decides what ad to show — we just enforce the view time
const DEFAULT_VIEW_SECONDS = 8

export default function AdGateModal({
  tournament,       // full tournament object
  onConfirm,        // called when all ads are watched — triggers the actual join
  onCancel,         // called when player closes without watching
  joining,          // bool — true while join API call is in progress
  joinError,        // string — error message from join API
}) {
  const adsRequired  = tournament?.adsRequired || 0

  // phase: 'intro' | 'watching' | 'done'
  const [phase,       setPhase]       = useState('intro')
  const [adIndex,     setAdIndex]     = useState(0)       // which ad we're on (0-based)
  const [timeLeft,    setTimeLeft]    = useState(DEFAULT_VIEW_SECONDS)
  const [canAdvance,  setCanAdvance]  = useState(false)
  const intervalRef = useRef(null)

  // Reset timer whenever adIndex changes
  useEffect(() => {
    if (phase !== 'watching') return
    setTimeLeft(DEFAULT_VIEW_SECONDS)
    setCanAdvance(false)
    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setCanAdvance(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [adIndex, phase])

  const handleNext = () => {
    if (!canAdvance) return
    if (adIndex + 1 >= adsRequired) {
      // All ads watched
      setPhase('done')
    } else {
      setAdIndex(i => i + 1)
    }
  }

  const handleStartWatching = () => {
    setAdIndex(0)
    setPhase('watching')
  }

  const progressPct = adsRequired > 0 ? ((adIndex + (canAdvance ? 1 : 0)) / adsRequired) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="w-full max-w-lg relative bg-[#0a0f1e] border border-[#1a2545] overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

          {/* Close button */}
          {phase !== 'watching' && !joining && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center font-mono text-[#4a5568] hover:text-white transition-colors z-10"
            >
              ✕
            </button>
          )}

          <div className="p-6">

            {/* ── INTRO PHASE ─────────────────────────────────────────── */}
            {phase === 'intro' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🎮</div>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">
                    This is a <span className="text-[#00ff88]">FREE</span> Tournament
                  </h2>
                  <p className="font-body text-[#4a5568] text-sm leading-relaxed">
                    To join for free, you need to watch{' '}
                    <strong className="text-white">{adsRequired} short ad{adsRequired !== 1 ? 's' : ''}</strong>.
                    This keeps the tournament free for everyone.
                  </p>
                </div>

                {/* Tournament info recap */}
                <div className="border border-[#1a2545] bg-[#050810] p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-display font-bold text-sm text-white truncate pr-2">{tournament?.name}</div>
                    <span className="font-mono text-[9px] text-[#00ff88] border border-[#00ff88]/30 px-2 py-0.5 flex-shrink-0">FREE ENTRY</span>
                  </div>
                  <div className="font-mono text-[10px] text-[#4a5568]">{tournament?.game} · {tournament?.platform}</div>
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-6">
                  {[
                    [`Watch ${adsRequired} ad${adsRequired !== 1 ? 's' : ''}`, `Each ad is about ${DEFAULT_VIEW_SECONDS} seconds`, '📺'],
                    ['Your slot is locked in', 'After all ads, you join instantly', '🔒'],
                    ['Play for free!', 'No Gollars needed', '🎮'],
                  ].map(([title, desc, icon]) => (
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
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartWatching}
                    className="flex-2 px-8 py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
                  >
                    <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                    <span className="relative text-[#050810]">Watch Ads & Join →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── WATCHING PHASE ──────────────────────────────────────── */}
            {phase === 'watching' && (
              <motion.div key={`ad-${adIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-[10px] text-[#4a5568] tracking-widest">
                      AD {adIndex + 1} OF {adsRequired}
                    </div>
                    <div className="font-display font-bold text-lg text-white">
                      {adIndex + 1 < adsRequired ? `${adsRequired - adIndex - 1} more after this` : 'Last ad!'}
                    </div>
                  </div>

                  {/* Countdown circle */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#1a2545" strokeWidth="4" />
                      <circle cx="28" cy="28" r="24" fill="none"
                        stroke={canAdvance ? '#00ff88' : '#00f5ff'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (timeLeft / DEFAULT_VIEW_SECONDS)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-display font-bold text-lg ${canAdvance ? 'text-[#00ff88]' : 'text-white'}`}>
                        {canAdvance ? '✓' : timeLeft}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-[#1a2545] rounded-full mb-5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#00f5ff]"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* ── REAL ADSENSE AD UNIT ── */}
                {/* Each time adIndex changes, a new AdSense unit is rendered */}
                {/* Google rotates the actual ad content automatically */}
                <div className="border border-[#1a2545] bg-[#050810] overflow-hidden mb-5">
                  <div className="font-mono text-[9px] text-[#4a5568]/50 tracking-widest text-right px-3 pt-2">
                    Advertisement
                  </div>
                  {/* Key forces React to remount the AdSense component for each ad */}
                  <div key={`adsense-gate-${adIndex}`} className="min-h-[280px] flex items-center justify-center">
                    <AdSense
                      slotId={AD_SLOTS.gate}
                      format="rectangle"
                      fullWidth={true}
                      label=""
                      style="min-height:280px"
                    />
                  </div>
                </div>

                {/* Status + skip button */}
                {!canAdvance ? (
                  <div className="flex items-center justify-center gap-2 py-3 border border-[#1a2545] bg-[#050810]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse" />
                    <span className="font-mono text-xs text-[#4a5568]">
                      Please wait {timeLeft}s before continuing...
                    </span>
                  </div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
                  >
                    <div className="absolute inset-0 bg-[#00ff88] group-hover:bg-[#00ff88]/85 transition-colors" />
                    <span className="relative text-[#050810]">
                      {adIndex + 1 >= adsRequired ? '🎮 Get My Slot →' : `Next Ad (${adIndex + 2}/${adsRequired}) →`}
                    </span>
                  </motion.button>
                )}

                {/* No-skip notice */}
                <div className="text-center mt-3 font-mono text-[10px] text-[#4a5568]">
                  Closing this window will cancel your registration
                </div>
              </motion.div>
            )}

            {/* ── DONE PHASE (joining) ─────────────────────────────────── */}
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                {joining ? (
                  <>
                    <div className="relative w-16 h-16 mx-auto mb-5">
                      <div className="absolute inset-0 border-4 border-[#00f5ff]/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-[#00f5ff] rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">🎮</div>
                    </div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">Registering you...</h3>
                    <p className="font-mono text-xs text-[#4a5568]">Almost there!</p>
                  </>
                ) : joinError ? (
                  <>
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="font-display font-bold text-xl text-[#ff2d55] mb-2">Registration Failed</h3>
                    <p className="font-mono text-xs text-[#4a5568] mb-5">{joinError}</p>
                    <button
                      onClick={onCancel}
                      className="px-6 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
                      style={{ background: '#00ff8822', border: '2px solid #00ff88', boxShadow: '0 0 30px #00ff8844' }}
                    >
                      🎉
                    </motion.div>
                    <h3 className="font-display font-bold text-2xl text-[#00ff88] mb-2">All Ads Watched!</h3>
                    <p className="font-body text-[#4a5568] text-sm mb-6">
                      Thanks for supporting GHQ. Locking in your slot now...
                    </p>
                    {/* Auto-triggers via useEffect in parent */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                      <span className="font-mono text-xs text-[#4a5568]">Joining tournament...</span>
                    </div>
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
