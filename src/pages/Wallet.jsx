import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import { walletAPI, withdrawAPI } from '../services/api'

const G = '🪙'
const GC = '#f5a623'

function QRCode({ data, size = 180 }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=050810&color=f5a623&margin=14`}
      alt="UPI QR Code"
      width={size} height={size}
      className="rounded-sm border border-[#f5a623]/30"
    />
  )
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

// ── Buy Gollars Panel ─────────────────────────────────────────────────────────
function BuyGollarsPanel({ onSuccess }) {
  const [amount,    setAmount]    = useState('')
  const [phase,     setPhase]     = useState('INPUT')
  const [qrData,    setQrData]    = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [timeLeft,  setTimeLeft]  = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    if (!qrData?.expiresAt || phase !== 'QR') return
    const tick = () => {
      const diff = new Date(qrData.expiresAt) - new Date()
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [qrData?.expiresAt, phase])

  useEffect(() => {
    walletAPI.getTopUpStatus()
      .then(res => {
        if (res.topUp?.status === 'SUBMITTED') {
          setQrData(res.topUp)
          setAmount(String(res.topUp.amount))
          setPhase('PENDING')
          startPolling()
        }
      })
      .catch(() => {})
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await walletAPI.getTopUpStatus()
        if (res.topUp?.status === 'VERIFIED') {
          clearInterval(pollRef.current)
          setPhase('DONE')
          if (onSuccess) onSuccess(res.newBalance)
        }
      } catch {}
    }, 6000)
  }

  const handleGenerate = async () => {
    const amt = Number(amount)
    if (!amount || isNaN(amt)) return setError('Enter a valid amount')
    if (amt < 10)    return setError('Minimum is ₹10 (10 Gollars)')
    if (amt > 10000) return setError('Maximum is ₹10,000 per top-up')
    setLoading(true); setError('')
    try {
      const res = await walletAPI.initiateTopUp(amt)
      setQrData({ ...res, amount: amt })
      setPhase('QR')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!codeInput.trim()) return setError('Enter your payment code from the receipt')
    setLoading(true); setError('')
    try {
      await walletAPI.submitCode(codeInput.trim())
      setPhase('PENDING')
      startPolling()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setPhase('INPUT'); setQrData(null); setAmount(''); setCodeInput(''); setError('')
  }

  return (
    <div className="border border-[#f5a623]/20 bg-[#0a0f1e] relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f5a623] to-transparent" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{G}</span>
          <div>
            <h2 className="font-display font-bold text-xl text-white">BUY GOLLARS</h2>
            <p className="font-mono text-[10px] text-[#4a5568] tracking-wider">1 Rupee = 1 Gollar · Pay via UPI</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'INPUT' && (
            <motion.div key="input" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="mb-4">
                <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-2">QUICK SELECT</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(String(a)); setError('') }}
                      className={`px-4 py-2 font-display font-bold text-sm border transition-all ${Number(amount) === a ? 'border-[#f5a623] text-[#f5a623] bg-[#f5a623]/15' : 'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                      ₹{a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-2">OR ENTER CUSTOM AMOUNT</div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-bold text-xl text-[#4a5568]">₹</span>
                  <input type="number" min="10" max="10000" step="1" value={amount}
                    onChange={e => { const val = e.target.value.replace(/[^0-9]/g,''); if (val===''||(Number(val)>=1&&Number(val)<=10000)){setAmount(val);setError('')} }}
                    placeholder="Enter amount (min ₹10)" onKeyDown={e => e.key==='Enter'&&handleGenerate()}
                    className="w-full pl-10 pr-4 py-3 bg-[#050810] border border-[#1a2545] font-display font-bold text-xl placeholder-[#4a5568]/40 focus:outline-none focus:border-[#f5a623]/50 transition-colors"
                    style={{ color: GC }} />
                </div>
                {amount && Number(amount) >= 10 && (
                  <div className="font-mono text-xs text-[#4a5568] mt-1.5">You will receive <span className="font-bold" style={{color:GC}}>{G} {Number(amount).toLocaleString()} Gollars</span></div>
                )}
              </div>
              {error && <div className="mb-4 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">⚠ {error}</div>}
              <button onClick={handleGenerate} disabled={!amount||Number(amount)<10||loading}
                className="w-full py-3.5 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                <div className="absolute inset-0 transition-colors" style={{ background: GC }} />
                <span className="relative text-[#050810]">{loading ? 'Generating...' : `Generate UPI QR for ₹${amount||'?'}`}</span>
              </button>
            </motion.div>
          )}

          {phase === 'QR' && qrData && (
            <motion.div key="qr" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div className="p-3 border border-[#f5a623]/20 bg-[#f5a623]/5 mb-5 flex items-start gap-3">
                <span className="text-lg flex-shrink-0">📱</span>
                <div className="font-mono text-xs text-[#e8eaf6]/70 leading-relaxed">
                  Scan with <strong className="text-white">Google Pay, PhonePe or Paytm</strong>. Amount and note pre-filled.
                  <br /><strong className="text-[#f5a623]">After paying, find the code on your receipt</strong> — it will say <span className="text-white bg-[#f5a623]/10 px-1 rounded font-bold">GamingHQ Tournament Entry | HQ Code: XXXXXX</span>
                </div>
              </div>
              <div className="flex gap-6 items-start mb-6">
                <div className="flex-shrink-0 p-3 border border-[#1a2545] bg-[#050810]">
                  <QRCode data={qrData.upiUrl} size={160} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">PAY TO</div>
                    <div className="font-mono text-sm text-white font-bold">{qrData.upiName||'GamerHeadQuarter'}</div>
                    <div className="font-mono text-xs" style={{color:GC}}>{qrData.upiId}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">AMOUNT</div>
                    <div className="font-display font-bold text-3xl text-white">₹{qrData.amount}</div>
                    <div className="font-mono text-xs mt-0.5" style={{color:GC}}>= {G} {qrData.amount} Gollars</div>
                  </div>
                  <div className="p-3 border border-[#00ff88]/20 bg-[#00ff88]/5">
                    <div className="font-mono text-[9px] text-[#00ff88] tracking-widest mb-1">🧾 AFTER PAYMENT</div>
                    <div className="font-mono text-xs text-[#e8eaf6]/70 leading-relaxed">Receipt shows:<br /><span className="text-white font-bold">HQ Code: XXXXXX</span><br />Enter those 6 chars next.</div>
                  </div>
                  {timeLeft && <div className="font-mono text-[10px] text-[#4a5568]">QR expires in <span className="text-[#ff2d55]">{timeLeft}</span></div>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">← Change Amount</button>
                <button onClick={() => setPhase('SUBMIT')} className="flex-1 py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                  style={{ clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 bg-[#00ff88] group-hover:bg-[#00ff88]/85 transition-colors" />
                  <span className="relative text-[#050810]">I've Paid — Enter Code →</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'SUBMIT' && (
            <motion.div key="submit" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0}}>
              <div className="p-4 border border-[#ffd700]/20 bg-[#ffd700]/5 mb-6 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🧾</span>
                <div>
                  <div className="font-display font-bold text-sm text-white mb-1">Enter Code from Your UPI Receipt</div>
                  <div className="font-mono text-xs text-[#4a5568] leading-relaxed">Open your UPI app → find the completed payment → look for <strong className="text-[#f5a623]">HQ Code: XXXXXX</strong> in the remarks.</div>
                </div>
              </div>
              <div className="mb-3">
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-2">6-digit code from receipt</label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-3 bg-[#050810] border border-[#1a2545] font-mono text-sm text-[#4a5568] whitespace-nowrap">HQ Code:</div>
                  <input value={codeInput} onChange={e => { setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')); setError('') }}
                    placeholder="4X9K2M" maxLength={6} autoFocus onKeyDown={e => e.key==='Enter'&&handleSubmitCode()}
                    className="flex-1 px-4 py-3 bg-[#050810] border border-[#1a2545] font-mono text-2xl text-center tracking-[0.4em] placeholder-[#4a5568]/40 focus:outline-none focus:border-[#f5a623]/50 transition-colors uppercase"
                    style={{ color: GC }} />
                </div>
                <div className="font-mono text-[10px] text-[#4a5568] mt-1.5">Amount: ₹{qrData?.amount} → {G} {qrData?.amount} Gollars</div>
                {error && <div className="mt-2 font-mono text-xs text-[#ff2d55]">⚠ {error}</div>}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setPhase('QR')} className="flex-1 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">← Back</button>
                <button onClick={handleSubmitCode} disabled={codeInput.length!==6||loading}
                  className="flex-1 py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 transition-colors" style={{ background: GC }} />
                  <span className="relative text-[#050810]">{loading ? 'Submitting...' : 'Submit Code'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'PENDING' && (
            <motion.div key="pending" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-6">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 border-4 border-[#f5a623]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-[#f5a623] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">{G}</div>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Code Submitted!</h3>
              <p className="font-body text-sm text-[#4a5568] mb-1">Our team is verifying your ₹{qrData?.amount} UPI payment.</p>
              <p className="font-mono text-xs text-[#4a5568] mb-5">{G} {qrData?.amount} Gollars will be credited once confirmed.</p>
              <div className="flex items-center justify-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" /><span className="font-mono text-xs text-[#4a5568]">Checking every 6 seconds...</span></div>
            </motion.div>
          )}

          {phase === 'DONE' && (
            <motion.div key="done" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center py-6">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
                style={{ background:`${GC}22`, border:`2px solid ${GC}`, boxShadow:`0 0 30px ${GC}44` }}>{G}</motion.div>
              <h3 className="font-display font-bold text-2xl mb-1" style={{color:GC}}>{qrData?.amount} Gollars Added!</h3>
              <p className="font-body text-[#4a5568] text-sm mb-5">Your wallet has been topped up successfully.</p>
              <button onClick={handleReset} className="px-8 py-3 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group"
                style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                <div className="absolute inset-0 transition-colors" style={{ background: GC }} />
                <span className="relative text-[#050810]">Buy More Gollars</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Withdraw Panel ────────────────────────────────────────────────────────────
function WithdrawPanel({ userGollars, onSuccess }) {
  const [amount,    setAmount]    = useState('')
  const [upiId,     setUpiId]     = useState('')
  const [upiName,   setUpiName]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [msg,       setMsg]       = useState('')
  const [error,     setError]     = useState('')
  const [requests,  setRequests]  = useState([])
  const [loadReq,   setLoadReq]   = useState(true)

  useEffect(() => {
    withdrawAPI.getMyRequests()
      .then(res => setRequests(res.requests || []))
      .catch(() => {})
      .finally(() => setLoadReq(false))
  }, [msg])

  const handleWithdraw = async () => {
    const amt = Number(amount)
    if (!amt || amt < 50)   return setError('Minimum withdrawal is 🪙 50 Gollars (₹50)')
    if (amt > userGollars)  return setError(`You only have 🪙 ${userGollars} Gollars`)
    if (!upiId.trim())      return setError('Enter your UPI ID')
    setLoading(true); setMsg(''); setError('')
    try {
      const res = await withdrawAPI.request({ amount: amt, upiId: upiId.trim(), upiName: upiName.trim() })
      setMsg(res.message)
      setAmount(''); setUpiId(''); setUpiName('')
      if (onSuccess) onSuccess(res.newBalance)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = { PENDING: '#ffd700', PAID: '#00ff88', REJECTED: '#ff2d55' }
  const statusIcon  = { PENDING: '⏳', PAID: '✅', REJECTED: '❌' }

  return (
    <div className="space-y-8">
      {/* Withdraw form */}
      <div className="border border-[#ff2d55]/20 bg-[#0a0f1e] relative overflow-hidden"
        style={{ clipPath:'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">💸</span>
            <div>
              <h2 className="font-display font-bold text-xl text-white">WITHDRAW GOLLARS</h2>
              <p className="font-mono text-[10px] text-[#4a5568] tracking-wider">1 Gollar = ₹1 · Paid to your UPI within 24 hours</p>
            </div>
          </div>

          <div className="p-3 border border-[#ffd700]/20 bg-[#ffd700]/5 mb-6 flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div className="font-mono text-xs text-[#e8eaf6]/70 leading-relaxed">
              Gollars are deducted from your wallet immediately when you submit. Admin will send ₹ to your UPI within 24 hours.
              If rejected, Gollars are <strong className="text-white">fully refunded</strong> to your wallet.
            </div>
          </div>

          <AnimatePresence>
            {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-4 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Amount (🪙 Gollars) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#4a5568]">{G}</span>
                <input type="number" min="50" max={userGollars} value={amount}
                  onChange={e => { setAmount(e.target.value.replace(/[^0-9]/g,'')); setError('') }}
                  placeholder={`Min 50, Max ${userGollars}`}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#050810] border border-[#1a2545] font-display font-bold text-lg text-[#ff2d55] placeholder-[#4a5568]/40 focus:outline-none focus:border-[#ff2d55]/40 transition-colors" />
              </div>
              {amount && Number(amount) >= 50 && Number(amount) <= userGollars && (
                <div className="font-mono text-xs text-[#4a5568] mt-1">You'll receive <span className="text-[#00ff88] font-bold">₹{Number(amount)}</span> to your UPI</div>
              )}
            </div>
            <div>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Your UPI ID *</label>
              <input type="text" value={upiId} onChange={e => { setUpiId(e.target.value); setError('') }}
                placeholder="yourname@paytm / @okhdfcbank"
                className="w-full px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#ff2d55]/40 transition-colors" />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">Your Name (for UPI)</label>
            <input type="text" value={upiName} onChange={e => setUpiName(e.target.value)}
              placeholder="Name on your UPI account (optional but helps)"
              className="w-full max-w-sm px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#ff2d55]/40 transition-colors" />
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[50, 100, 200, 500].filter(a => a <= userGollars).map(a => (
              <button key={a} onClick={() => { setAmount(String(a)); setError('') }}
                className={`px-4 py-1.5 font-display font-bold text-sm border transition-all ${Number(amount)===a?'border-[#ff2d55] text-[#ff2d55] bg-[#ff2d55]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                🪙 {a}
              </button>
            ))}
            {userGollars > 0 && (
              <button onClick={() => { setAmount(String(userGollars)); setError('') }}
                className={`px-4 py-1.5 font-display font-bold text-sm border transition-all ${Number(amount)===userGollars?'border-[#ff2d55] text-[#ff2d55] bg-[#ff2d55]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                All ({G} {userGollars})
              </button>
            )}
          </div>

          <button onClick={handleWithdraw} disabled={loading || !amount || Number(amount) < 50}
            className="relative px-8 py-3 overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-[#ff2d55] group-hover:bg-[#ff2d55]/85 transition-colors" />
            <span className="relative font-display font-bold text-sm tracking-widest uppercase text-white">
              {loading ? 'Submitting...' : `💸 Withdraw ${amount ? `🪙 ${amount}` : 'Gollars'}`}
            </span>
          </button>
        </div>
      </div>

      {/* Withdrawal history */}
      <div>
        <h3 className="font-display font-bold text-lg text-white mb-4">WITHDRAWAL HISTORY</h3>
        {loadReq ? (
          <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-16 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40"/>)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 border border-[#1a2545]/40 border-dashed">
            <div className="text-3xl mb-2">💸</div>
            <div className="font-display text-[#4a5568]">No withdrawals yet</div>
          </div>
        ) : (
          <div className="border border-[#1a2545]">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
              {[['col-span-3','AMOUNT'],['col-span-4','UPI ID'],['col-span-2','STATUS'],['col-span-3','DATE']].map(([cls,h])=>(
                <span key={h} className={`${cls} font-mono text-[9px] text-[#4a5568] tracking-widest`}>{h}</span>
              ))}
            </div>
            {requests.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-[#1a2545] last:border-0 items-center">
                <div className="col-span-3 font-display font-bold text-base text-[#ff2d55]">{G} {r.amount}</div>
                <div className="col-span-4">
                  <div className="font-mono text-xs text-white truncate">{r.upiId}</div>
                  {r.upiName && <div className="font-mono text-[9px] text-[#4a5568]">{r.upiName}</div>}
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <span>{statusIcon[r.status]}</span>
                  <span className="font-mono text-[10px] tracking-wider" style={{color:statusColor[r.status]}}>{r.status}</span>
                </div>
                <div className="col-span-3">
                  <div className="font-mono text-xs text-[#4a5568]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                  {r.status==='REJECTED' && r.note && <div className="font-mono text-[9px] text-[#ff2d55] mt-0.5">{r.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Wallet Page ──────────────────────────────────────────────────────────
export default function Wallet() {
  const { user, isLoggedIn, updateGollers } = useAuthStore()
  const navigate = useNavigate()

  const [history,     setHistory]     = useState([])
  const [loadHistory, setLoadHistory] = useState(false)
  const [activeTab,   setActiveTab]   = useState('buy')

  useEffect(() => { if (!isLoggedIn) navigate('/login') }, [isLoggedIn])

  useEffect(() => {
    if (activeTab === 'history') {
      setLoadHistory(true)
      walletAPI.getHistory()
        .then(res => setHistory(res.history || []))
        .catch(() => {})
        .finally(() => setLoadHistory(false))
    }
  }, [activeTab])

  if (!user) return null

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-10">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2" style={{color:GC}}>GHQ Wallet</div>
          <h1 className="font-display font-bold text-5xl text-white">{G} <span style={{color:GC}}>GOLLARS</span></h1>
          <p className="font-body text-[#4a5568] mt-1">1 Rupee = 1 Gollar · Buy Gollars to enter tournaments · Win prizes · Withdraw anytime</p>
        </motion.div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="col-span-2 border p-6 relative overflow-hidden"
            style={{ borderColor:`${GC}33`, background:`${GC}08`, clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(90deg, ${GC}, transparent)`}} />
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{color:`${GC}99`}}>GOLLAR BALANCE</div>
            <div className="flex items-end gap-3">
              <div className="font-display font-bold text-5xl" style={{color:GC}}>{(user.gollers||0).toLocaleString()}</div>
              <div className="font-mono text-lg text-[#4a5568] mb-1">Gollars</div>
            </div>
            <div className="flex gap-6 mt-4 pt-4 border-t" style={{borderColor:`${GC}20`}}>
              <div><div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">TOTAL BOUGHT</div><div className="font-display font-bold text-lg text-[#00ff88]">{(user.totalBought||0).toLocaleString()}</div></div>
              <div><div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">TOTAL SPENT</div><div className="font-display font-bold text-lg text-[#ff2d55]">{(user.totalSpent||0).toLocaleString()}</div></div>
            </div>
          </div>
          <div className="border border-[#ffd700]/20 bg-[#ffd700]/5 p-5" style={{clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
            <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-2">GHQ COINS</div>
            <div className="font-display font-bold text-3xl text-[#ffd700]">{(user.coins||0).toLocaleString()}</div>
            <div className="font-mono text-[9px] text-[#4a5568] mt-2 leading-relaxed">Earned from wins & achievements.</div>
            <Link to="/economy" className="font-mono text-[10px] text-[#ffd700] hover:text-white transition-colors tracking-wider mt-2 block">View Economy →</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#1a2545] mb-8">
          {[['buy',`${G} Buy Gollars`],['withdraw','💸 Withdraw'],['history','History']].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className={`px-5 py-3 font-display text-sm tracking-widest uppercase transition-all border-b-2 -mb-px ${
                activeTab===v
                  ? v==='withdraw'
                    ? 'border-[#ff2d55] text-[#ff2d55]'
                    : 'border-[#f5a623] text-[#f5a623]'
                  : 'border-transparent text-[#4a5568] hover:text-white'
              }`}>{l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'buy' && (
            <motion.div key="buy" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <BuyGollarsPanel onSuccess={(bal) => updateGollers(bal)} />
              <div className="mt-8 grid grid-cols-4 gap-3">
                {[['1','Enter amount','Choose how many Gollars to buy'],['2','Scan & Pay','Pay via Google Pay, PhonePe or Paytm'],['3','Enter receipt code','Find "HQ Code: XXXXXX" in your UPI receipt'],['4','Gollars credited','Auto-added after admin confirms']].map(([n,t,d]) => (
                  <div key={n} className="border border-[#1a2545] bg-[#0a0f1e]/40 p-4 text-center">
                    <div className="font-display font-bold text-2xl mb-2" style={{color:`${GC}50`}}>{n}</div>
                    <div className="font-display text-xs text-white mb-1">{t}</div>
                    <div className="font-body text-[10px] text-[#4a5568]">{d}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'withdraw' && (
            <motion.div key="withdraw" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <WithdrawPanel userGollars={user.gollers||0} onSuccess={(bal) => updateGollers(bal)} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              {loadHistory ? (
                <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-14 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40"/>)}</div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
                  <div className="text-4xl mb-3">{G}</div>
                  <div className="font-display text-lg text-[#4a5568]">No transactions yet</div>
                  <button onClick={() => setActiveTab('buy')} className="mt-4 font-mono text-sm text-[#f5a623] hover:text-white transition-colors">Buy your first Gollars →</button>
                </div>
              ) : (
                <div className="border border-[#1a2545]">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a2545] bg-[#050810]">
                    {[['col-span-5','DESCRIPTION'],['col-span-3','STATUS'],['col-span-2','DATE'],['col-span-2 text-right','AMOUNT']].map(([cls,h])=>(
                      <span key={h} className={`${cls} font-mono text-[9px] text-[#4a5568] tracking-widest`}>{h}</span>
                    ))}
                  </div>
                  {history.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a2545] last:border-0 hover:bg-[#0a0f1e]/40 transition-colors">
                      <div className="col-span-5 flex items-center gap-2">
                        <span>{tx.type==='TOPUP'?G:'🎮'}</span>
                        <span className="font-body text-sm text-[#e8eaf6]/80 truncate">{tx.label}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className={`font-mono text-[10px] tracking-wider uppercase ${tx.status==='VERIFIED'||tx.status==='COMPLETED'?'text-[#00ff88]':tx.status==='SUBMITTED'?'text-[#ffd700]':'text-[#4a5568]'}`}>{tx.status}</span>
                      </div>
                      <div className="col-span-2 flex items-center"><span className="font-mono text-xs text-[#4a5568]">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</span></div>
                      <div className="col-span-2 flex items-center justify-end">
                        <span className={`font-mono text-sm font-bold ${tx.amount>0?'text-[#00ff88]':'text-[#ff2d55]'}`}>{tx.amount>0?'+':''}{tx.amount} {G}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
