import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import { economyAPI, configAPI } from '../services/api'

function CoinPop({ amount, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 0, opacity: 1 }} animate={{ y: -80, opacity: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
          className="fixed top-24 right-8 font-display text-3xl text-[#ffd700] z-50 pointer-events-none"
          style={{ textShadow: '0 0 20px #ffd700' }}>
          +{amount} ⬡
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Coin → Gollar Converter ───────────────────────────────────────────────────
function ConvertPanel({ config, user, onConverted }) {
  const [amount,   setAmount]   = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState('')
  const [error,    setError]    = useState('')

  const rate      = config?.convert_rate       || 200
  const dailyMax  = config?.convert_daily_limit || 10
  const minCoins  = config?.convert_min_coins   || 200
  const enabled   = String(config?.convert_enabled) === 'true'
  const coinsHave = user?.coins || 0
  const maxCanBuy = Math.min(dailyMax, Math.floor(coinsHave / rate))

  const handleConvert = async () => {
    setLoading(true); setMsg(''); setError('')
    try {
      const res = await economyAPI.convertCoins(amount)
      setMsg(res.message)
      if (onConverted) onConverted(res.newCoins, res.newGollers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!enabled) {
    return (
      <div className="border border-[#1a2545] p-5 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <div className="font-display text-sm text-[#4a5568]">Coin conversion is currently disabled</div>
      </div>
    )
  }

  return (
    <div className="border border-[#f5a623]/30 bg-[#0a0f1e] p-5 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f5a623] to-transparent" />

      <div className="font-mono text-[10px] text-[#f5a623] tracking-widest mb-3">🔄 CONVERT COINS → GOLLARS</div>

      <div className="flex items-center gap-2 mb-3 p-3 bg-[#050810] border border-[#1a2545]">
        <span className="font-mono text-xs text-[#4a5568]">Rate:</span>
        <span className="font-mono text-sm font-bold text-[#ffd700]">⬡ {rate.toLocaleString()}</span>
        <span className="font-mono text-xs text-[#4a5568]">= 🪙 1 Gollar</span>
        <span className="ml-auto font-mono text-[9px] text-[#4a5568]">Max {dailyMax}/day</span>
      </div>

      {/* Amount selector */}
      <div className="mb-3">
        <div className="flex gap-2 mb-2 flex-wrap">
          {[1, 2, 5, 10].filter(n => n <= dailyMax).map(n => (
            <button key={n} onClick={() => setAmount(n)}
              className={`px-3 py-1.5 font-mono text-xs border transition-all ${
                amount === n ? 'border-[#f5a623] text-[#f5a623] bg-[#f5a623]/10' : 'border-[#1a2545] text-[#4a5568] hover:text-white'
              }`}>
              {n} Gollar{n > 1 ? 's' : ''}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 p-3 bg-[#050810] border border-[#1a2545]">
          <div className="flex-1">
            <div className="font-mono text-[9px] text-[#4a5568] mb-1">YOU SPEND</div>
            <div className="font-display font-bold text-xl text-[#ffd700]">⬡ {(amount * rate).toLocaleString()}</div>
          </div>
          <div className="text-[#4a5568] text-xl">→</div>
          <div className="flex-1 text-right">
            <div className="font-mono text-[9px] text-[#4a5568] mb-1">YOU GET</div>
            <div className="font-display font-bold text-xl text-[#f5a623]">🪙 {amount} Gollar{amount > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-3 p-2 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mb-3 p-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>

      <button onClick={handleConvert}
        disabled={loading || maxCanBuy === 0 || amount * rate > coinsHave}
        className="w-full py-2.5 font-display font-bold text-xs tracking-widest uppercase border border-[#f5a623]/40 text-[#f5a623] hover:bg-[#f5a623]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {loading ? 'Converting...' : maxCanBuy === 0
          ? `Need ⬡ ${rate} coins minimum`
          : `Convert ⬡ ${(amount * rate).toLocaleString()} → 🪙 ${amount} Gollar${amount > 1 ? 's' : ''}`}
      </button>

      <div className="mt-2 font-mono text-[9px] text-[#4a5568] text-center">
        Your balance: ⬡ {coinsHave.toLocaleString()} · Max convertible today: 🪙 {maxCanBuy}
      </div>
    </div>
  )
}

export default function Economy() {
  const { user, updateUser } = useAuthStore()

  const [activeTab,    setActiveTab]    = useState('overview')
  const [transactions, setTransactions] = useState([])
  const [achievements, setAchievements] = useState([])
  const [config,       setConfig]       = useState({})
  const [loadingTx,    setLoadingTx]    = useState(false)
  const [loadingAch,   setLoadingAch]   = useState(false)
  const [claiming,     setClaiming]     = useState(false)
  const [claimMsg,     setClaimMsg]     = useState('')
  const [claimError,   setClaimError]   = useState('')
  const [showPop,      setShowPop]      = useState(false)
  const [popAmount,    setPopAmount]    = useState(25)

  // Load public config (earn rates etc.) on mount
  useEffect(() => {
    configAPI.getPublic()
      .then(res => setConfig(res.config || {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'history' && transactions.length === 0) {
      setLoadingTx(true)
      economyAPI.getTransactions()
        .then(res => setTransactions(res.transactions || []))
        .catch(() => {})
        .finally(() => setLoadingTx(false))
    }
    if (activeTab === 'achievements' && achievements.length === 0) {
      setLoadingAch(true)
      economyAPI.getAchievements()
        .then(res => setAchievements(res.achievements || []))
        .catch(() => {})
        .finally(() => setLoadingAch(false))
    }
  }, [activeTab])

  const handleDailyBonus = async () => {
    setClaiming(true); setClaimMsg(''); setClaimError('')
    try {
      const res = await economyAPI.claimDailyBonus()
      setPopAmount(res.coinsEarned || 25)
      setShowPop(true)
      setTimeout(() => setShowPop(false), 2000)
      setClaimMsg(res.message || `+${res.coinsEarned} GHQ Coins claimed!`)
      if (user) updateUser({ coins: (user.coins || 0) + (res.coinsEarned || 25) })
    } catch (err) {
      setClaimError(err.message)
    } finally {
      setClaiming(false)
    }
  }

  const handleConverted = (newCoins, newGollers) => {
    updateUser({ coins: newCoins, gollers: newGollers })
  }

  // Build "How to Earn" rows from REAL config values
  const dailyBonus    = config.daily_bonus_coins     || 25
  const joinCoins     = config.tournament_join_coins || 50
  const adCoins       = config.ad_watch_coins        || 10
  const convertRate   = config.convert_rate          || 200
  const convertEnabled = String(config.convert_enabled) === 'true'

  const earnWays = [
    { icon: '🏆', event: 'Win Tournament',      coins: `+500 – +8,000`, note: 'Depends on prize tiers set by admin'      },
    { icon: '🥇', event: '1st Place Finish',    coins: `+2,000+`,       note: 'Champions bracket — varies by tournament' },
    { icon: '🥈', event: '2nd Place Finish',    coins: `+1,000+`,       note: 'Champions bracket — varies by tournament' },
    { icon: '🥉', event: '3rd Place Finish',    coins: `+500+`,         note: 'Champions bracket — varies by tournament' },
    { icon: '⚔️', event: 'Join Any Tournament', coins: `+${joinCoins}`,  note: 'Credited instantly on joining'           },
    { icon: '📅', event: 'Daily Login Bonus',   coins: `+${dailyBonus}`, note: 'Claim once per day'                      },
    { icon: '📺', event: 'Watch Ad (Free Join)', coins: `+${adCoins}`,   note: 'Per ad watched in tournament gate'       },
    { icon: '🌟', event: 'Achievements',        coins: '+100 – +10,000', note: 'Unlock milestones to earn bonus coins'   },
  ]

  const spendWays = [
    ...(convertEnabled ? [{
      icon: '🔄', event: 'Convert to Gollars',
      coins: `${convertRate} ⬡ = 1 🪙`,
      note: 'Convert GHQ Coins to Gollars for tournament entry'
    }] : []),
    { icon: '🎟️', event: 'Tournament Entry',   coins: 'Uses Gollars',   note: 'Paid tournaments use 🪙 Gollars not coins' },
    { icon: '🎁', event: 'Shop Items',          coins: 'Coming Soon',     note: 'Profile frames, badges'                   },
  ]

  const coins       = user?.coins       || 0
  const totalEarned = user?.totalEarned || 0
  const wins        = user?.wins        || 0
  const losses      = user?.losses      || 0
  const winRate     = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  return (
    <main className="min-h-screen">
      <CoinPop amount={popAmount} show={showPop} />

      {/* Header */}
      <div className="relative pt-10 pb-16 border-b border-[#1a2545]/60 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,215,0,0.07), transparent)' }} />
        <div className="absolute right-20 top-10 opacity-[0.04] font-display text-[280px] text-[#ffd700] leading-none pointer-events-none select-none">⬡</div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="font-mono text-xs text-[#ffd700] tracking-[0.4em] uppercase mb-3">GHQ Economy</div>
            <h1 className="font-display font-bold text-7xl text-white leading-none mb-4">
              COIN <span className="text-[#ffd700]" style={{ textShadow: '0 0 60px #ffd70066' }}>ECONOMY</span>
            </h1>
            <p className="font-body text-[#4a5568] text-lg max-w-xl">Every action earns. Every win rewards. GHQ Coins are the heartbeat of the platform.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-1 mb-12 border-b border-[#1a2545]">
          {[['overview','Overview'],['convert','🔄 Convert'],['history','Coin History'],['achievements','Achievements']].map(([v, l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className={`px-5 py-3 font-display text-sm tracking-widest uppercase transition-all border-b-2 -mb-px ${
                activeTab === v ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-[#4a5568] hover:text-white'
              }`}>{l}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="space-y-5">
                  {/* Balance */}
                  <div className="border border-[#ffd700]/30 bg-[#0a0f1e] p-6 relative overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
                    <p className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">YOUR BALANCE</p>
                    <div className="font-display font-bold text-5xl text-[#ffd700] mb-1" style={{ textShadow: '0 0 30px #ffd70055' }}>
                      {coins.toLocaleString()}
                    </div>
                    <p className="font-mono text-xs text-[#4a5568] tracking-widest">GHQ COINS</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-[#1a2545]">
                      <div>
                        <p className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">TOTAL EARNED</p>
                        <p className="font-display font-bold text-lg text-[#00ff88]">{totalEarned.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">WIN RATE</p>
                        <p className="font-display font-bold text-lg text-[#00f5ff]">{winRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily bonus */}
                  <button onClick={handleDailyBonus} disabled={claiming || !!claimMsg}
                    className={`w-full py-3 font-display font-bold tracking-widest text-sm border transition-all duration-300 ${
                      claimMsg ? 'border-[#1a2545] text-[#4a5568] cursor-not-allowed' : 'border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/10'
                    }`}>
                    {claiming ? '⏳ Claiming...' : claimMsg ? '✓ BONUS CLAIMED TODAY' : `⬡ CLAIM DAILY BONUS +${dailyBonus}`}
                  </button>
                  {claimError && <p className="font-mono text-[10px] text-[#ff2d55] text-center">{claimError}</p>}

                  {/* Convert shortcut */}
                  {convertEnabled && (
                    <button onClick={() => setActiveTab('convert')}
                      className="w-full py-3 font-display font-bold text-xs tracking-widest uppercase border border-[#f5a623]/40 text-[#f5a623] hover:bg-[#f5a623]/10 transition-all">
                      🔄 Convert Coins → Gollars
                    </button>
                  )}

                  {/* Stats */}
                  <div className="border border-[#1a2545] divide-y divide-[#1a2545]">
                    {[
                      ['Tournaments Won',  wins],
                      ['Tournaments Lost', losses],
                      ['Win Rate',         `${winRate}%`],
                      ['GHQ Coins',        coins.toLocaleString()],
                      ['Gollars',          `🪙 ${(user?.gollers||0).toLocaleString()}`],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center px-4 py-3">
                        <span className="font-mono text-xs text-[#4a5568]">{l}</span>
                        <span className="font-display font-semibold text-sm text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earn/Spend — real data from config */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-white mb-4">HOW TO <span className="text-[#00ff88]">EARN</span></h3>
                    <div className="space-y-2">
                      {earnWays.map((w, i) => (
                        <motion.div key={w.event}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between px-4 py-3 border border-[#1a2545] bg-[#0a0f1e]/60 hover:border-[#00ff88]/20 transition-colors group">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{w.icon}</span>
                            <div>
                              <p className="font-body text-sm text-white group-hover:text-[#00ff88] transition-colors">{w.event}</p>
                              <p className="font-mono text-[10px] text-[#4a5568]">{w.note}</p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#00ff88] whitespace-nowrap">{w.coins}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-white mb-4">HOW TO <span className="text-[#ff2d55]">SPEND</span></h3>
                    <div className="space-y-2">
                      {spendWays.map((w) => (
                        <div key={w.event} className="flex items-center justify-between px-4 py-3 border border-[#1a2545] bg-[#0a0f1e]/60">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{w.icon}</span>
                            <div>
                              <p className="font-body text-sm text-white">{w.event}</p>
                              <p className="font-mono text-[10px] text-[#4a5568]">{w.note}</p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#ff2d55]">{w.coins}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CONVERT TAB ── */}
          {activeTab === 'convert' && (
            <motion.div key="convert" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-lg">
                <h2 className="font-display font-bold text-2xl text-white mb-2">
                  CONVERT <span className="text-[#ffd700]">COINS</span> → <span className="text-[#f5a623]">GOLLARS</span>
                </h2>
                <p className="font-mono text-xs text-[#4a5568] mb-6">
                  Use your GHQ Coins to buy Gollars and enter paid tournaments.
                  Rate and limits are set by admin.
                </p>
                <ConvertPanel config={config} user={user} onConverted={handleConverted} />
              </div>
            </motion.div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="font-display font-bold text-2xl text-white mb-6">TRANSACTION <span className="text-[#00f5ff]">HISTORY</span></h2>
              {loadingTx ? (
                <div className="space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="h-14 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
                  <div className="text-4xl mb-3">⬡</div>
                  <div className="font-display text-lg text-[#4a5568]">No transactions yet</div>
                  <p className="font-body text-sm text-[#4a5568] mt-1">Join tournaments to start earning GHQ Coins</p>
                </div>
              ) : (
                <div className="border border-[#1a2545]">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a2545] bg-[#0a0f1e]">
                    <span className="col-span-6 font-mono text-[10px] text-[#4a5568] tracking-widest">DESCRIPTION</span>
                    <span className="col-span-3 font-mono text-[10px] text-[#4a5568] tracking-widest">DATE</span>
                    <span className="col-span-3 font-mono text-[10px] text-[#4a5568] tracking-widest text-right">AMOUNT</span>
                  </div>
                  {transactions.map((tx, i) => (
                    <motion.div key={tx.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a2545] last:border-0 hover:bg-[#0a0f1e]/40 transition-colors">
                      <div className="col-span-6 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type==='EARN'?'bg-[#00ff88]':'bg-[#ff2d55]'}`} />
                        <span className="font-body text-sm text-[#e8eaf6]/80 truncate">{tx.label}</span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="font-mono text-xs text-[#4a5568]">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center justify-end">
                        <span className={`font-mono text-sm font-bold ${tx.type==='EARN'?'text-[#00ff88]':'text-[#ff2d55]'}`}>
                          {tx.type==='EARN'?'+':'-'}{Math.abs(tx.amount).toLocaleString()} ⬡
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ACHIEVEMENTS ── */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-white">ACHIEVEMENTS</h2>
                <span className="font-mono text-xs text-[#4a5568]">
                  {achievements.filter(a => a.earned).length}/{achievements.length} UNLOCKED
                </span>
              </div>
              {loadingAch ? (
                <div className="grid md:grid-cols-2 gap-4">{[...Array(6)].map((_,i) => <div key={i} className="h-20 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
                  <div className="text-4xl mb-3">🌟</div>
                  <div className="font-display text-lg text-[#4a5568]">No achievements yet</div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((a, i) => (
                    <motion.div key={a.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 px-5 py-4 border transition-all ${
                        a.earned ? 'border-[#ffd700]/20 bg-[#ffd700]/5' : 'border-[#1a2545] opacity-50'
                      }`}>
                      <span className={`text-3xl ${!a.earned?'grayscale':''}`}>{a.icon}</span>
                      <div className="flex-1">
                        <div className={`font-display font-semibold text-sm ${a.earned?'text-white':'text-[#4a5568]'}`}>{a.label}</div>
                        <div className="font-mono text-[10px] text-[#4a5568]">{a.description}</div>
                        {a.earned && a.earnedAt && (
                          <div className="font-mono text-[9px] text-[#4a5568]/60 mt-0.5">
                            Earned {new Date(a.earnedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-mono text-sm font-bold ${a.earned?'text-[#ffd700]':'text-[#4a5568]'}`}>
                          +{a.coinReward.toLocaleString()}
                        </div>
                        <div className="font-mono text-[9px] text-[#4a5568]">COINS</div>
                      </div>
                      {a.earned && <span className="text-[#00ff88] text-sm flex-shrink-0">✓</span>}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
