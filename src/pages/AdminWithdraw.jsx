// src/pages/AdminWithdraw.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { withdrawAPI } from '../services/api'

const STATUS_COLOR = { PENDING: '#ffd700', PAID: '#00ff88', REJECTED: '#ff2d55' }
const STATUS_ICON  = { PENDING: '⏳', PAID: '✅', REJECTED: '❌' }

export default function AdminWithdraw() {
  const [requests,    setRequests]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('PENDING')
  const [actionMsg,   setActionMsg]   = useState('')
  const [actionError, setActionError] = useState('')
  const [rejectId,    setRejectId]    = useState(null)
  const [rejectNote,  setRejectNote]  = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await withdrawAPI.getAll(filter === 'ALL' ? '' : filter)
      setRequests(data.requests || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const flash = (msg, isError = false) => {
    if (isError) { setActionError(msg); setTimeout(() => setActionError(''), 4000) }
    else         { setActionMsg(msg);   setTimeout(() => setActionMsg(''), 4000) }
  }

  const handlePay = async (id, username, amount) => {
    if (!window.confirm(`Mark ₹${amount} withdrawal for ${username} as PAID?\n\nMake sure you've already sent the money to their UPI.`)) return
    try {
      const res = await withdrawAPI.markPaid(id)
      flash(res.message)
      load()
    } catch (err) {
      flash(err.message, true)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      const res = await withdrawAPI.reject(rejectId, rejectNote || 'Rejected by admin')
      flash(res.message)
      setRejectId(null); setRejectNote('')
      load()
    } catch (err) {
      flash(err.message, true)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
        <h2 className="font-display font-bold text-3xl text-white">WITHDRAWAL REQUESTS</h2>
        {pendingCount > 0 && filter !== 'ALL' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
            <span className="font-mono text-xs text-[#ffd700]">{pendingCount} pending — pay these players</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {actionMsg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{actionMsg}</motion.div>}
        {actionError && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {actionError}</motion.div>}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectId && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}
              className="w-full max-w-md border border-[#ff2d55]/30 bg-[#0a0f1e] p-6"
              style={{clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
              <h3 className="font-display font-bold text-lg text-white mb-4">Reject Withdrawal</h3>
              <p className="font-mono text-xs text-[#4a5568] mb-4">Gollars will be refunded to the player.</p>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-2">Reason (shown to player)</label>
              <input value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Invalid UPI ID, please resubmit"
                className="w-full px-3 py-2.5 mb-5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#ff2d55]/40 transition-colors" />
              <div className="flex gap-3">
                <button onClick={() => { setRejectId(null); setRejectNote('') }}
                  className="flex-1 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="flex-1 py-2.5 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                  style={{clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'}}>
                  <div className="absolute inset-0 bg-[#ff2d55] group-hover:bg-[#ff2d55]/85" />
                  <span className="relative text-white">Reject & Refund</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-6">
        {['PENDING','PAID','REJECTED','ALL'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase border transition-all ${
              filter===s ? 'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10' : 'border-[#1a2545] text-[#4a5568] hover:text-white'
            }`}>{s}</button>
        ))}
        <button onClick={load} className="ml-auto px-3 py-2 font-mono text-[9px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-white transition-all">↻</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-20 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
          <div className="text-4xl mb-3">💸</div>
          <div className="font-display font-bold text-lg text-[#4a5568]">No {filter.toLowerCase()} withdrawals</div>
        </div>
      ) : (
        <div className="border border-[#1a2545]">
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
            {[['col-span-2','PLAYER'],['col-span-1','AMOUNT'],['col-span-3','UPI ID'],['col-span-1','STATUS'],['col-span-2','DATE'],['col-span-3','ACTIONS']].map(([cls,h])=>(
              <span key={h} className={`${cls} font-mono text-[9px] text-[#4a5568] tracking-widest`}>{h}</span>
            ))}
          </div>
          {requests.map((r, i) => (
            <motion.div key={r.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
              className={`grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#1a2545] last:border-0 items-center transition-colors ${r.status==='PENDING'?'bg-[#ffd700]/3 hover:bg-[#ffd700]/5':'hover:bg-[#0a0f1e]/40'}`}>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-[9px] text-[#00f5ff]">{r.user.avatar}</div>
                <div>
                  <div className="font-display text-sm text-white">{r.user.username}</div>
                  <div className="font-mono text-[9px] text-[#4a5568]">{r.user.email}</div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="font-display font-bold text-base text-[#ff2d55]">🪙 {r.amount}</div>
                <div className="font-mono text-[9px] text-[#4a5568]">₹{r.amount}</div>
              </div>
              <div className="col-span-3">
                <div className="font-mono text-sm text-white break-all">{r.upiId}</div>
                {r.upiName && <div className="font-mono text-[9px] text-[#4a5568] mt-0.5">{r.upiName}</div>}
              </div>
              <div className="col-span-1 flex items-center gap-1.5">
                <span>{STATUS_ICON[r.status]}</span>
                <span className="font-mono text-[10px] tracking-wider" style={{color:STATUS_COLOR[r.status]}}>{r.status}</span>
              </div>
              <div className="col-span-2">
                <div className="font-mono text-xs text-[#4a5568]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                <div className="font-mono text-[9px] text-[#4a5568]">{new Date(r.createdAt).toLocaleTimeString('en-IN',{timeStyle:'short'})}</div>
                {r.status==='REJECTED' && r.note && <div className="font-mono text-[9px] text-[#ff2d55] mt-0.5">{r.note}</div>}
              </div>
              <div className="col-span-3 flex gap-2">
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => handlePay(r.id, r.user.username, r.amount)}
                      className="flex-1 py-2 font-display font-bold text-xs tracking-widest uppercase relative overflow-hidden group"
                      style={{clipPath:'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'}}>
                      <div className="absolute inset-0 bg-[#00ff88] group-hover:bg-[#00ff88]/85 transition-colors" />
                      <span className="relative text-[#050810]">✓ Paid</span>
                    </button>
                    <button onClick={() => { setRejectId(r.id); setRejectNote('') }}
                      className="flex-1 py-2 font-display text-xs tracking-widest uppercase border border-[#ff2d55]/30 text-[#ff2d55] hover:bg-[#ff2d55]/10 transition-all">
                      ✕ Reject
                    </button>
                  </>
                )}
                {r.status === 'PAID' && (
                  <div className="font-mono text-[10px] text-[#00ff88]">✅ Paid to {r.upiId}</div>
                )}
                {r.status === 'REJECTED' && (
                  <div className="font-mono text-[10px] text-[#ff2d55]">🪙 {r.amount} refunded</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
