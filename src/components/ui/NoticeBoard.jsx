// src/components/ui/NoticeBoard.jsx
// Homepage notice board — shows active announcements from admin
// Scrollable ticker + expandable cards

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { announcementAPI } from '../../services/api'

const TYPE_STYLES = {
  info:    { border: '#00f5ff', bg: '#00f5ff10', text: '#00f5ff', badge: 'INFO'    },
  success: { border: '#00ff88', bg: '#00ff8810', text: '#00ff88', badge: 'UPDATE'  },
  warning: { border: '#f5a623', bg: '#f5a62310', text: '#f5a623', badge: 'WARNING' },
  urgent:  { border: '#ff2d55', bg: '#ff2d5510', text: '#ff2d55', badge: '🚨 URGENT' },
}

export default function NoticeBoard() {
  const [announcements, setAnnouncements] = useState([])
  const [expanded,      setExpanded]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [current,       setCurrent]       = useState(0)  // for ticker

  useEffect(() => {
    announcementAPI.getAll()
      .then(res => setAnnouncements(res.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-rotate ticker every 4 seconds
  useEffect(() => {
    if (announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [announcements.length])

  if (loading || announcements.length === 0) return null

  const active = announcements[current]
  const style  = TYPE_STYLES[active?.type] || TYPE_STYLES.info

  return (
    <div className="max-w-7xl mx-auto px-6 mt-6">
      {/* ── Scrolling ticker (if 1+ announcements) ── */}
      {announcements.length === 1 ? (
        // Single announcement — show full card
        <SingleCard announcement={announcements[0]} />
      ) : (
        <div className="space-y-3">
          {/* Ticker bar */}
          <div className="flex items-center gap-0 border border-[#1a2545] overflow-hidden"
            style={{ borderColor: `${style.border}33` }}>
            {/* Label */}
            <div className="flex-shrink-0 px-4 py-3 font-mono text-[10px] tracking-widest font-bold"
              style={{ background: style.bg, color: style.text }}>
              📢 NOTICE
            </div>
            {/* Scrolling text */}
            <div className="flex-1 overflow-hidden px-4 py-3">
              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  exit={{    y: -16, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setExpanded(expanded === current ? null : current)}>
                  <span className="text-sm">{active.icon}</span>
                  <span className="font-display font-semibold text-sm text-white truncate">{active.title}</span>
                  {active.pinned && <span className="font-mono text-[9px] text-[#4a5568]">📌 PINNED</span>}
                  <span className="ml-auto font-mono text-[10px] flex-shrink-0" style={{ color: style.text }}>
                    {expanded === current ? '▲ Hide' : '▼ Read'}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Dots indicator */}
            <div className="flex-shrink-0 flex items-center gap-1 px-3">
              {announcements.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === current ? style.border : '#1a2545' }} />
              ))}
            </div>
          </div>

          {/* Expanded message */}
          <AnimatePresence>
            {expanded === current && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden">
                <div className="border p-4 font-body text-sm text-[#e8eaf6]/80 leading-relaxed"
                  style={{ borderColor: `${style.border}33`, background: style.bg }}>
                  {active.message}
                  <div className="font-mono text-[9px] text-[#4a5568] mt-2">
                    {new Date(active.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {active.expiresAt && ` · Expires ${new Date(active.expiresAt).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All announcements expanded list */}
          {announcements.length > 1 && (
            <div className="space-y-2">
              {announcements.slice(1).map((a, i) => (
                <SingleCard key={a.id} announcement={a} compact />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Single announcement card ──────────────────────────────────────────────────
function SingleCard({ announcement: a, compact = false }) {
  const [open, setOpen] = useState(!compact)
  const style = TYPE_STYLES[a.type] || TYPE_STYLES.info

  return (
    <div className="border overflow-hidden" style={{ borderColor: `${style.border}33` }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-90 transition-opacity"
        style={{ background: style.bg }}
        onClick={() => compact && setOpen(o => !o)}>
        {a.pinned && <span className="text-[10px]">📌</span>}
        <span className="text-base">{a.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 border"
              style={{ color: style.text, borderColor: `${style.border}44` }}>
              {style.badge}
            </span>
            <span className="font-display font-semibold text-sm text-white">{a.title}</span>
          </div>
        </div>
        {compact && (
          <span className="font-mono text-[10px] flex-shrink-0" style={{ color: style.text }}>
            {open ? '▲' : '▼'}
          </span>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-3 border-t font-body text-sm text-[#e8eaf6]/80 leading-relaxed"
              style={{ borderColor: `${style.border}22` }}>
              {a.message}
              <div className="font-mono text-[9px] text-[#4a5568] mt-2">
                {new Date(a.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                {a.expiresAt && ` · Expires ${new Date(a.expiresAt).toLocaleDateString('en-IN')}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
