// src/components/ads/AdSense.jsx
// Reusable Google AdSense ad unit component
//
// HOW TO USE:
//   1. Replace YOUR_PUB_ID in index.html with your real ca-pub-XXXXXXXXXXXXXXXX
//   2. Create ad units in AdSense dashboard → Ads → By ad unit
//   3. Copy the data-ad-slot number for each unit and pass it as slotId prop
//
// SLOT TYPES YOU SHOULD CREATE IN ADSENSE:
//   - "GHQ Leaderboard"   → 728x90  → use for banners
//   - "GHQ Rectangle"     → 300x250 → use for sidebar
//   - "GHQ Gate Ad"       → 336x280 → use for tournament ad gate
//   - "GHQ In-Article"    → responsive → use inline in pages

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// FILL IN YOUR ACTUAL SLOT IDs BELOW after creating units in AdSense dashboard
// AdSense dashboard → Ads → By ad unit → Create ad unit → copy the slot number
// ─────────────────────────────────────────────────────────────────────────────
export const AD_SLOTS = {
  leaderboard: 'XXXXXXXXXX',   // 728×90  — top/bottom banners
  rectangle:   'XXXXXXXXXX',   // 300×250 — sidebar / inline
  gate:        'XXXXXXXXXX',   // 336×280 — tournament gate modal
  inArticle:   'XXXXXXXXXX',   // auto    — in-page responsive
}

// Your AdSense publisher ID — same as what's in index.html
export const PUB_ID = 'ca-pub-XXXXXXXXXXXXXXXX'

// ─────────────────────────────────────────────────────────────────────────────

/**
 * AdSense component
 * @param {string}  slotId     - AdSense data-ad-slot value (from AD_SLOTS)
 * @param {string}  format     - "auto" | "rectangle" | "leaderboard" (default "auto")
 * @param {string}  style      - inline style string for the container div
 * @param {boolean} fullWidth  - if true, sets width:100%
 * @param {string}  className  - extra Tailwind/CSS classes on wrapper
 * @param {string}  label      - optional small label shown above ad (e.g. "Advertisement")
 */
export default function AdSense({
  slotId,
  format      = 'auto',
  style       = '',
  fullWidth   = true,
  className   = '',
  label       = 'Advertisement',
}) {
  const ref       = useRef(null)
  const pushed    = useRef(false)

  useEffect(() => {
    // Push only once per mount — AdSense throws if you push twice
    if (pushed.current) return
    pushed.current = true

    try {
      // adsbygoogle is injected by the script in index.html
      // eslint-disable-next-line no-undef
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      // Silently fail in dev or if AdSense blocked
    }
  }, [])

  return (
    <div className={`ghq-ad-wrap ${className}`}>
      {label && (
        <div className="font-mono text-[9px] text-[#4a5568]/60 tracking-widest text-center mb-1">
          {label}
        </div>
      )}
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{
          display:   'block',
          width:      fullWidth ? '100%' : undefined,
          ...parseStyle(style),
        }}
        data-ad-client={PUB_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? 'true' : 'false'}
      />
    </div>
  )
}

// Parse "key:value;key:value" strings into style object (for convenience)
function parseStyle(s) {
  if (!s || typeof s !== 'string') return {}
  return Object.fromEntries(
    s.split(';').filter(Boolean).map(p => {
      const [k, v] = p.split(':')
      return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()]
    })
  )
}
