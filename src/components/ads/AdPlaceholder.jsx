// src/components/ads/AdPlaceholder.jsx
// Placeholder ad component — looks and behaves like a real ad
// Shows a countdown timer. When AdSense is approved, just swap this
// component for the real AdSense component — no other changes needed.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Placeholder "ads" — your own promos until real AdSense kicks in
// These promote GHQ features to players
const PLACEHOLDER_ADS = [
  {
    id:      1,
    title:   '🏆 Compete in GHQ Tournaments',
    body:    'Join free and paid tournaments. Win GHQ Coins, Gollars & real prizes. New tournaments every week!',
    cta:     'Browse Tournaments →',
    link:    '/tournaments',
    color:   '#00f5ff',
    bg:      '#00f5ff08',
  },
  {
    id:      2,
    title:   '🪙 Buy Gollars — Enter Paid Tournaments',
    body:    'Top up your Gollars wallet via UPI. ₹1 = 1 Gollar. Use Gollars to enter premium paid tournaments.',
    cta:     'Buy Gollars →',
    link:    '/wallet',
    color:   '#f5a623',
    bg:      '#f5a62308',
  },
  {
    id:      3,
    title:   '👑 Champions Bracket — Elite Players Only',
    body:    'Think you\'re the best? Enter Champions bracket tournaments. Massive prizes for the top players.',
    cta:     'View Champions →',
    link:    '/champions',
    color:   '#ffd700',
    bg:      '#ffd70008',
  },
  {
    id:      4,
    title:   '⬡ GHQ Coins — Earn While You Play',
    body:    'Earn GHQ Coins by winning, joining tournaments, and daily logins. Convert coins to Gollars!',
    cta:     'Learn More →',
    link:    '/economy',
    color:   '#00ff88',
    bg:      '#00ff8808',
  },
]

// ── Inline Banner Ad (for pages) ──────────────────────────────────────────────
// Shows a GHQ promo banner. Pass size='leaderboard' for 728x90 style
// or size='rectangle' for 300x250 style
export function AdBanner({ size = 'leaderboard', index = 0, className = '' }) {
  const ad = PLACEHOLDER_ADS[index % PLACEHOLDER_ADS.length]

  if (size === 'leaderboard') {
    return (
      <div className={`w-full border border-dashed border-[#1a2545] bg-[#0a0f1e]/40 overflow-hidden ${className}`}>
        <div className="font-mono text-[8px] text-[#4a5568]/40 tracking-widest text-right px-2 pt-1">
          Advertisement
        </div>
        <div className="flex items-center gap-4 px-5 py-3" style={{ borderTop: `1px solid ${ad.color}22` }}>
          <div className="flex-1">
            <div className="font-display font-bold text-sm" style={{ color: ad.color }}>{ad.title}</div>
            <div className="font-mono text-[10px] text-[#4a5568]">{ad.body}</div>
          </div>
          <a href={ad.link}
            className="flex-shrink-0 px-4 py-2 font-mono text-[10px] tracking-widest uppercase border transition-colors hover:text-white"
            style={{ borderColor: `${ad.color}44`, color: ad.color }}>
            {ad.cta}
          </a>
        </div>
      </div>
    )
  }

  // Rectangle
  return (
    <div className={`border border-dashed border-[#1a2545] bg-[#0a0f1e]/40 p-5 ${className}`}
      style={{ borderTop: `2px solid ${ad.color}33` }}>
      <div className="font-mono text-[8px] text-[#4a5568]/40 tracking-widest mb-3">Advertisement</div>
      <div className="text-2xl mb-2">
        {ad.title.split(' ')[0]}
      </div>
      <div className="font-display font-bold text-base text-white mb-2">
        {ad.title.replace(/^[^\s]+\s/, '')}
      </div>
      <div className="font-mono text-[10px] text-[#4a5568] mb-4 leading-relaxed">{ad.body}</div>
      <a href={ad.link}
        className="inline-block px-4 py-2 font-mono text-[10px] tracking-widest uppercase border transition-colors hover:text-white"
        style={{ borderColor: `${ad.color}44`, color: ad.color }}>
        {ad.cta}
      </a>
    </div>
  )
}

// ── Ad Gate Player — for tournament joining ───────────────────────────────────
// Shows one "ad" at a time with a countdown timer
// After timer hits 0, "Next" button unlocks
// Used inside AdGateModal
export function AdGatePlayer({ adIndex, viewSeconds = 8, onComplete }) {
  const [timeLeft,   setTimeLeft]   = useState(viewSeconds)
  const [canAdvance, setCanAdvance] = useState(false)
  const intervalRef = useRef(null)

  const ad = PLACEHOLDER_ADS[adIndex % PLACEHOLDER_ADS.length]

  useEffect(() => {
    setTimeLeft(viewSeconds)
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
  }, [adIndex, viewSeconds])

  return (
    <div>
      {/* Ad content */}
      <div className="border border-[#1a2545] bg-[#050810] overflow-hidden mb-5"
        style={{ borderTop: `2px solid ${ad.color}44` }}>
        <div className="font-mono text-[8px] text-[#4a5568]/50 tracking-widest text-right px-3 pt-2">
          Advertisement
        </div>
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">{ad.title.split(' ')[0]}</div>
          <div className="font-display font-bold text-xl text-white mb-3">
            {ad.title.replace(/^[^\s]+\s/, '')}
          </div>
          <div className="font-body text-sm text-[#4a5568] mb-5 leading-relaxed max-w-sm mx-auto">
            {ad.body}
          </div>
          <a href={ad.link} target="_blank" rel="noreferrer"
            className="inline-block px-5 py-2 font-mono text-xs tracking-widest uppercase border transition-colors hover:text-white"
            style={{ borderColor: `${ad.color}44`, color: ad.color }}>
            {ad.cta}
          </a>
        </div>
        {/* Countdown bar */}
        <div className="h-1 bg-[#1a2545] relative overflow-hidden">
          <motion.div className="h-full"
            style={{ background: ad.color }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: viewSeconds, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Timer / Next button */}
      <AnimatePresence mode="wait">
        {!canAdvance ? (
          <motion.div key="waiting" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex items-center justify-center gap-2 py-3 border border-[#1a2545] bg-[#050810]">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ad.color }} />
            <span className="font-mono text-xs text-[#4a5568]">
              Please wait {timeLeft}s...
            </span>
          </motion.div>
        ) : (
          <motion.button key="next" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            onClick={onComplete}
            className="w-full py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-[#00ff88] group-hover:bg-[#00ff88]/85 transition-colors" />
            <span className="relative text-[#050810]">Continue ✓</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdBanner
