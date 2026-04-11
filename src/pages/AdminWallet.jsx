// src/pages/AdminWallet.jsx
// Admin panel section: verify Goller top-ups

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { walletAPI } from '../services/api'

const GOLLER_ICON = '🪙'
const STATUS_COLORS = {
  PENDING:   '#4a5568',
  SUBMITTED: '#f5a623',
  VERIFIED:  '#00ff88',
  EXPIRED:   '#ff2d55',
  CANCELLED: '#ff2d55',
}

export default function AdminWallet() {
  const [topUps,    setTopUps]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('SUBMITTED')
  const [verifying, setVerifying] = useState(null)
  const [msg,       setMsg]       = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await walletAPI.getPending(filter)
      setTopUps(data.topUps || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleVerify = async (code, username, amount) => {
    if (!window.confirm(`Verify ₹${amount} payment from ${username}?\n\nThis will credit ${amount} ${GOLLER_ICON} Gollers to their wallet.`)) return
    setVerifying(code)
    setMsg('')
    try {
      const res = await walletAPI.verify(code)
      setMsg(`✓ ${res.message}`)
      setTopUps(prev => prev.filter(t => t.code !== code))
    } catch (err) {
      setMsg(`✗ ${err.message}`)
    } finally {
      setVerifying(null)
    }
  }

  const totalPending = topUps.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin Panel</div>
        <h2 className="font-display font-bold text-3xl text-white">
          {GOLLER_ICON} GOLLER <span className="text-[#f5a623]">TOP-UPS</span>
        </h2>
        <p className="font-body text-sm text-[#4a5568] mt-1">
          Verify UPI payments to credit Gollers to player wallets.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-4 gap-3">
        {[
          ['1', 'Player buys Gollers', 'Enters amount, gets QR code'],
          ['2', 'Player pays via UPI', 'Writes code GHQ-XXXXXX in note'],
          ['3', 'Player submits code', 'Appears here as SUBMITTED'],
          ['4', 'You verify below', `Gollers credited to wallet instantly`],
        ].map(([n, t, d]) => (
          <div key={n} className="border border-[#1a2545] bg-[#0a0f1e]/40 p-4">
            <div className="font-display font-bold text-2xl text-[#f5a623]/30 mb-1">{n}</div>
            <div className="font-display text-xs text-white mb-1">{t}</div>
            <div className="font-body text-[10px] text-[#4a5568]">{d}</div>
          </div>
        ))}
      </div>

      {/* Message */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className={`px-4 py-3 border font-mono text-sm ${
              msg.startsWith('✓')
                ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'
                : 'border-[#ff2d55]/30 bg-[#ff2d55]/10 text-[#ff2d55]'
            }`}>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 items-center">
        {['SUBMITTED', 'PENDING', 'VERIFIED', 'EXPIRED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all"
            style={filter === s
              ? { borderColor: `${STATUS_COLORS[s]}44`, background: `${STATUS_COLORS[s]}15`, color: STATUS_COLORS[s] }
              : { borderColor: '#1a2545', color: '#4a5568' }}>
            {s}
          </button>
        ))}
        <button onClick={load} className="ml-auto px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-white transition-all">
          ↻ Refresh
        </button>
      </div>

      {/* Top-ups list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}
        </div>
      ) : topUps.length === 0 ? (
        <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
          <div className="text-4xl mb-3">{GOLLER_ICON}</div>
          <div className="font-display font-bold text-lg text-[#4a5568]">No {filter.toLowerCase()} top-ups</div>
        </div>
      ) : (
        <div className="border border-[#1a2545]">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
            {[['col-span-2','Code'],['col-span-3','Player'],['col-span-3','Amount'],['col-span-2','Date'],['col-span-2 text-right','Action']].map(([cls,h]) => (
              <span key={h} className={`${cls} font-mono text-[9px] text-[#4a5568] tracking-widest uppercase`}>{h}</span>
            ))}
          </div>

          {topUps.map((t, i) => (
            <motion.div key={t.id}
              initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-[#1a2545] last:border-0 items-center hover:bg-[#0a0f1e]/40 transition-colors">

              {/* Code */}
              <div className="col-span-2">
                <div className="font-mono font-bold text-base text-[#f5a623] tracking-widest">{t.code}</div>
                <div className="font-mono text-[9px]" style={{ color: STATUS_COLORS[t.status] || '#4a5568' }}>
                  {t.status}
                </div>
              </div>

              {/* Player */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-xs text-[#00f5ff] flex-shrink-0">
                  {t.user?.avatar || '??'}
                </div>
                <div>
                  <div className="font-display text-sm text-white">{t.user?.username}</div>
                  <div className="font-mono text-[9px] text-[#4a5568] truncate max-w-[120px]">{t.user?.email}</div>
                </div>
              </div>

              {/* Amount */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{GOLLER_ICON}</span>
                  <div>
                    <div className="font-display font-bold text-xl text-[#f5a623]">{t.amount.toLocaleString()}</div>
                    <div className="font-mono text-[9px] text-[#4a5568]">= ₹{t.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-2">
                <div className="font-mono text-[10px] text-[#4a5568]">
                  {new Date(t.createdAt).toLocaleDateString('en-IN')}
                </div>
                <div className="font-mono text-[9px] text-[#4a5568]">
                  {new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-end">
                {t.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleVerify(t.code, t.user?.username, t.amount)}
                    disabled={verifying === t.code}
                    className="px-4 py-2 font-display font-bold text-xs tracking-widest uppercase relative overflow-hidden group disabled:opacity-50"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
                    <div className="absolute inset-0 bg-[#f5a623] group-hover:bg-[#f5a623]/85 transition-colors" />
                    <span className="relative text-[#050810]">
                      {verifying === t.code ? '...' : `✓ Credit ${GOLLER_ICON}`}
                    </span>
                  </button>
                )}
                {t.status === 'VERIFIED' && (
                  <span className="font-mono text-[10px] text-[#00ff88]">✓ Credited</span>
                )}
                {t.status === 'PENDING' && (
                  <span className="font-mono text-[10px] text-[#4a5568]">Awaiting submission</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Total */}
      {topUps.length > 0 && filter === 'SUBMITTED' && (
        <div className="flex items-center justify-between pt-4 border-t border-[#1a2545]">
          <span className="font-mono text-xs text-[#4a5568]">
            {topUps.length} top-up{topUps.length !== 1 ? 's' : ''} waiting
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#4a5568]">Total to credit:</span>
            <span className="font-display font-bold text-lg text-[#f5a623]">
              {GOLLER_ICON} {totalPending.toLocaleString()} Gollers
            </span>
            <span className="font-mono text-xs text-[#4a5568]">/ ₹{totalPending.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
