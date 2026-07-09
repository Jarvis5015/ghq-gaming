// src/components/ads/AdSense.jsx
// Real Google AdSense component
// CURRENTLY: Shows placeholder GHQ promo ads until AdSense is approved
// LATER: Replace PUB_ID and AD_SLOTS with real values from AdSense dashboard

import { useEffect, useRef } from 'react'
import { AdBanner } from './AdPlaceholder'

// ── Fill these in after AdSense approval ─────────────────────────────────────
export const AD_SLOTS = {
  leaderboard: 'XXXXXXXXXX',   // 728×90
  rectangle:   'XXXXXXXXXX',   // 300×250
  gate:        'XXXXXXXXXX',   // 336×280
  inArticle:   'XXXXXXXXXX',   // auto
}
export const PUB_ID = 'ca-pub-6895012947164003'
// ─────────────────────────────────────────────────────────────────────────────

const APPROVED = PUB_ID !== 'ca-pub-XXXXXXXXXXXXXXXX'   // false until you fill in real ID

let adCounter = 0  // global counter for cycling placeholder ads

export default function AdSense({ slotId, format = 'auto', style = '', fullWidth = true, className = '', label = 'Advertisement' }) {
  const ref    = useRef(null)
  const pushed = useRef(false)
  const index  = useRef(adCounter++)

  useEffect(() => {
    if (!APPROVED) return           // don't push placeholder ads to AdSense
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  // Not approved yet — show placeholder
  if (!APPROVED) {
    const size = format === 'rectangle' ? 'rectangle' : 'leaderboard'
    return <AdBanner size={size} index={index.current} className={className} />
  }

  // Real AdSense unit
  return (
    <div className={`ghq-ad-wrap ${className}`}>
      {label && <div className="font-mono text-[9px] text-[#4a5568]/60 tracking-widest text-center mb-1">{label}</div>}
      <ins ref={ref} className="adsbygoogle"
        style={{ display:'block', width: fullWidth ? '100%' : undefined }}
        data-ad-client={PUB_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? 'true' : 'false'} />
    </div>
  )
}
