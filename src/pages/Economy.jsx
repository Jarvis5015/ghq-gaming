import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

function CoinPop({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{y:0,opacity:1}} animate={{y:-60,opacity:0}} exit={{opacity:0}}
          className="fixed top-24 right-8 font-display text-3xl text-[#ffd700] z-50 pointer-events-none"
          style={{textShadow:'0 0 20px #ffd700'}}>
          +25 ⬡
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Economy() {
  const { user, transactions, achievements, earnCoins } = useStore()
  const [claimed, setClaimed] = useState(false)
  const [showPop, setShowPop] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleDailyBonus = () => {
    if (!claimed) {
      earnCoins(25)
      setClaimed(true)
      setShowPop(true)
      setTimeout(() => setShowPop(false), 2000)
    }
  }

  const earnWays = [
    { icon:'🏆', event:'Win Tournament', coins:'+500 – +8,000', note:'Depends on prize pool' },
    { icon:'🥇', event:'1st Place Finish', coins:'+2,000', note:'Champions bracket' },
    { icon:'🥈', event:'2nd Place Finish', coins:'+1,000', note:'Champions bracket' },
    { icon:'🥉', event:'3rd Place Finish', coins:'+500', note:'Champions bracket' },
    { icon:'📊', event:'Top 10 Placement', coins:'+200', note:'All tournament types' },
    { icon:'⚔️', event:'Participate', coins:'+50 – +300', note:'Just join a tournament' },
    { icon:'📅', event:'Daily Login', coins:'+25', note:'Streaks multiply rewards' },
    { icon:'🌟', event:'Achievements', coins:'+100 – +10,000', note:'Unlock milestones' },
    { icon:'🔥', event:'Win Streak Bonus', coins:'×1.5 Multiplier', note:'3+ wins in a row' },
  ]

  const spendWays = [
    { icon:'🎟️', event:'Tournament Entry', coins:'Varies', note:'Based on tournament' },
    { icon:'🏅', event:'Champions Entry', coins:'₹100 – ₹500', note:'Paid in ₹, not coins' },
    { icon:'🎁', event:'Shop Items', coins:'Coming Soon', note:'Profile frames, badges' },
  ]

  return (
    <main className="min-h-screen">
      <CoinPop show={showPop} />

      {/* Header */}
      <div className="relative pt-28 pb-16 border-b border-[#1a2545]/60 overflow-hidden">
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,215,0,0.07), transparent)'}} />
        {/* Animated coin bg */}
        <div className="absolute right-20 top-10 opacity-[0.05] font-display text-[280px] text-[#ffd700] leading-none pointer-events-none select-none">⬡</div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <div className="font-mono text-xs text-[#ffd700] tracking-[0.4em] uppercase mb-3">GHQ Economy</div>
            <h1 className="font-display font-bold text-7xl text-white leading-none mb-4">
              COIN <span className="text-[#ffd700]" style={{textShadow:'0 0 60px #ffd70066'}}>ECONOMY</span>
            </h1>
            <p className="font-body text-[#4a5568] text-lg max-w-xl">Every action earns. Every win rewards. GHQ Coins are the heartbeat of the platform.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-1 mb-12 border-b border-[#1a2545]">
          {[['overview','Overview'],['history','Coin History'],['achievements','Achievements']].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className={`px-5 py-3 font-display text-sm tracking-widest uppercase transition-all border-b-2 -mb-px ${activeTab===v ? 'border-[#ffd700] text-[#ffd700]' : 'border-transparent text-[#4a5568] hover:text-white'}`}>{l}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Balance card */}
                <div className="space-y-5">
                  {/* Balance */}
                  <div className="border border-[#ffd700]/30 bg-[#0a0f1e] p-6 relative overflow-hidden"
                    style={{clipPath:'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/05 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
                    <p className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">YOUR BALANCE</p>
                    <motion.div key={user.coins} initial={{scale:1.1}} animate={{scale:1}} className="font-display font-bold text-5xl text-[#ffd700] mb-1"
                      style={{textShadow:'0 0 30px #ffd70055'}}>
                      {user.coins.toLocaleString()}
                    </motion.div>
                    <p className="font-mono text-xs text-[#4a5568] tracking-widest">GHQ COINS</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-[#1a2545]">
                      <div>
                        <p className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">TOTAL EARNED</p>
                        <p className="font-display font-bold text-lg text-[#00ff88]">{user.totalEarned.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-1">TOTAL SPENT</p>
                        <p className="font-display font-bold text-lg text-[#ff2d55]">{user.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily bonus */}
                  <button onClick={handleDailyBonus} disabled={claimed}
                    className={`w-full py-3 font-display font-bold tracking-widest text-sm border transition-all duration-300 ${claimed ? 'border-[#1a2545] text-[#4a5568] cursor-not-allowed' : 'border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/10 hover:shadow-lg'}`}
                    style={!claimed ? {boxShadow:'0 0 20px #ffd70020'} : {}}>
                    {claimed ? '✓ DAILY BONUS CLAIMED' : '⬡ CLAIM DAILY BONUS +25'}
                  </button>

                  {/* Mini stats */}
                  <div className="border border-[#1a2545] divide-y divide-[#1a2545]">
                    {[['Win Rate', `${Math.round(user.wins/(user.wins+user.losses)*100)}%`],['Tournaments Won', user.wins],['Tournaments Lost', user.losses],['Favourite Game', user.favoriteGame]].map(([l,v]) => (
                      <div key={l} className="flex justify-between items-center px-4 py-3">
                        <span className="font-mono text-xs text-[#4a5568]">{l}</span>
                        <span className="font-display font-semibold text-sm text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Earn ways */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-white mb-4">HOW TO <span className="text-[#00ff88]">EARN</span></h3>
                    <div className="space-y-2">
                      {earnWays.map((w, i) => (
                        <motion.div key={w.event} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
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
                      {spendWays.map((w, i) => (
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

          {activeTab === 'history' && (
            <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <h2 className="font-display font-bold text-2xl text-white mb-6">TRANSACTION <span className="text-[#00f5ff]">HISTORY</span></h2>
              <div className="border border-[#1a2545]">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a2545] bg-[#0a0f1e]">
                  <span className="col-span-6 font-mono text-[10px] text-[#4a5568] tracking-widest">DESCRIPTION</span>
                  <span className="col-span-3 font-mono text-[10px] text-[#4a5568] tracking-widest">DATE</span>
                  <span className="col-span-3 font-mono text-[10px] text-[#4a5568] tracking-widest text-right">AMOUNT</span>
                </div>
                {transactions.map((tx, i) => (
                  <motion.div key={tx.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a2545] last:border-0 hover:bg-[#0a0f1e]/40 transition-colors">
                    <div className="col-span-6 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type==='earn' ? 'bg-[#00ff88]' : 'bg-[#ff2d55]'}`} />
                      <span className="font-body text-sm text-[#e8eaf6]/80">{tx.label}</span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="font-mono text-xs text-[#4a5568]">{tx.date}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end">
                      <span className={`font-mono text-sm font-bold ${tx.coins > 0 ? 'text-[#00ff88]' : 'text-[#ff2d55]'}`}>
                        {tx.coins > 0 ? '+' : ''}{tx.coins.toLocaleString()} ⬡
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-white">ACHIEVEMENTS</h2>
                <span className="font-mono text-xs text-[#4a5568]">{achievements.filter(a=>a.earned).length}/{achievements.length} UNLOCKED</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((a, i) => (
                  <motion.div key={a.id} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.07}}
                    className={`flex items-center gap-4 px-5 py-4 border transition-all ${a.earned ? 'border-[#ffd700]/20 bg-[#ffd700]/5' : 'border-[#1a2545] opacity-50'}`}>
                    <span className={`text-3xl ${!a.earned ? 'grayscale' : ''}`}>{a.icon}</span>
                    <div className="flex-1">
                      <div className={`font-display font-semibold text-sm ${a.earned ? 'text-white' : 'text-[#4a5568]'}`}>{a.label}</div>
                      <div className="font-mono text-[10px] text-[#4a5568]">{a.desc}</div>
                      {a.earned && a.date && <div className="font-mono text-[9px] text-[#4a5568]/60 mt-0.5">Earned {a.date}</div>}
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${a.earned ? 'text-[#ffd700]' : 'text-[#4a5568]'}`}>+{a.coins.toLocaleString()}</div>
                      <div className="font-mono text-[9px] text-[#4a5568]">COINS</div>
                    </div>
                    {a.earned && <span className="text-[#00ff88] text-sm">✓</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
