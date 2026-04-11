import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import TournamentCard from '../components/tournament/TournamentCard'
import { tournaments, leaderboard, stats, achievements } from '../data/mockData'

function HexGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,17 58,47 30,62 2,47 2,17" fill="none" stroke="#00f5ff" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>
    </div>
  )
}

function StatCard({ label, value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6 border border-[#1a2545] bg-[#0a0f1e]/80"
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      <div className="font-display font-bold text-3xl text-[#00f5ff] mb-1">{value}</div>
      <div className="font-mono text-xs text-[#4a5568] tracking-widest uppercase">{label}</div>
    </motion.div>
  )
}

function CoinEconomySection() {
  const coinTypes = [
    { icon: '🏆', label: 'Win Tournaments', coins: '+500 to +8,000', color: '#ffd700' },
    { icon: '🎯', label: 'Ranked Placement', coins: '+100 to +2,000', color: '#00f5ff' },
    { icon: '⚔️', label: 'Participation', coins: '+50 to +300', color: '#7c3aed' },
    { icon: '🌟', label: 'Achievements', coins: '+100 to +5,000', color: '#00ff88' },
    { icon: '👑', label: 'Champion Title', coins: '+10,000 Bonus', color: '#ffd700' },
    { icon: '🔥', label: 'Streak Bonus', coins: 'x1.5 Multiplier', color: '#ff2d55' },
  ]
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-3">Economy System</div>
          <h2 className="font-display font-bold text-5xl text-white mb-4">GHQ <span className="text-[#ffd700]" style={{textShadow:'0 0 30px #ffd70066'}}>COIN</span> ECONOMY</h2>
          <p className="text-[#4a5568] font-body max-w-xl mx-auto">Every action earns. Every win rewards. GHQ Coins flow through the entire ecosystem.</p>
        </motion.div>

        {/* Coin visual */}
        <div className="flex justify-center mb-16">
          <motion.div animate={{rotateY:[0,360]}} transition={{duration:8,repeat:Infinity,ease:'linear'}} className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center shadow-2xl" style={{boxShadow:'0 0 60px #ffd70066'}}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffd700]/80 to-[#b8860b]/80 flex items-center justify-center border-4 border-[#ffd700]/40">
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-[#050810]">GHQ</div>
                  <div className="font-mono text-[8px] text-[#050810]/70 tracking-widest">COIN</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {coinTypes.map((c, i) => (
            <motion.div key={c.label} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="p-4 border border-[#1a2545] bg-[#0a0f1e]/60 rounded-sm group hover:border-[#1a2545]/80 transition-colors"
              style={{borderColor:`${c.color}22`}}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-display font-semibold text-sm text-white mb-1">{c.label}</div>
              <div className="font-mono text-sm font-bold" style={{color:c.color}}>{c.coins}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LeaderboardSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Hall of Fame</div>
            <h2 className="font-display font-bold text-5xl text-white">TOP <span className="text-[#00f5ff]">PLAYERS</span></h2>
          </div>
          <Link to="/leaderboard" className="font-display text-sm text-[#4a5568] hover:text-[#00f5ff] transition-colors tracking-wider uppercase">View All →</Link>
        </motion.div>
        <div className="space-y-3">
          {leaderboard.map((player, i) => (
            <motion.div key={player.rank} initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className="relative flex items-center gap-4 p-4 border border-[#1a2545] bg-[#0a0f1e]/60 group hover:border-[#00f5ff]/20 transition-all duration-300">
              {/* rank accent */}
              {i < 3 && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32'}} />}
              <div className="w-8 font-display font-bold text-xl text-[#1a2545]"
                style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#4a5568'}}>
                #{player.rank}
              </div>
              <div className="w-10 h-10 rounded-sm bg-[#1a2545] border border-[#1a2545] flex items-center justify-center font-display font-bold text-xs text-[#00f5ff]"
                style={{clipPath:'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'}}>
                {player.avatar}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-white group-hover:text-[#00f5ff] transition-colors">{player.name}</div>
                <div className="font-mono text-xs text-[#4a5568]">{player.wins} Wins</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-[#ffd700]">{player.coins.toLocaleString()}</div>
                <div className="font-mono text-[9px] text-[#4a5568] tracking-wider">GHQ COINS</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [filter, setFilter] = useState('all')
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, -120])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  const filtered = tournaments.filter(t => {
    if (filter === 'live') return t.status === 'live'
    if (filter === 'champions') return t.type === 'champions'
    if (filter === 'free') return t.tier === 'free'
    if (filter === 'paid') return t.tier === 'paid'
    return true
  })

  return (
    <div className="relative min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <HexGrid />

        {/* Background radials */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{background:'radial-gradient(ellipse, #00f5ff08 0%, transparent 70%)'}} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{background:'radial-gradient(ellipse, #7c3aed08 0%, transparent 70%)'}} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{background:'radial-gradient(ellipse, #00f5ff05 0%, transparent 70%)'}} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Pre-label */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-[#00f5ff]/20 bg-[#00f5ff]/5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase">Platform Online · 124K+ Active Players</span>
          </motion.div>

          {/* Main heading */}
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.35}}>
            <div className="font-display font-bold leading-none mb-2">
              <div className="text-6xl md:text-8xl text-white tracking-tight">GAMER</div>
              <div className="text-6xl md:text-8xl tracking-tight"
                style={{color:'#00f5ff', textShadow:'0 0 60px #00f5ff66, 0 0 120px #00f5ff33'}}>
                HEAD<span className="text-white">QUARTER</span>
              </div>
            </div>
          </motion.div>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.55}}
            className="font-body text-[#4a5568] text-lg md:text-xl max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">
            Compete. Conquer. Earn. The arena where Mobile & PC players battle for glory, prizes, and GHQ Coins.
          </motion.p>

          {/* CTA row */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}}
            className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/tournaments"
              className="relative px-8 py-4 overflow-hidden group"
              style={{clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
              <div className="absolute inset-0 bg-[#00f5ff]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white transition-opacity" />
              <span className="relative font-display font-bold text-base tracking-widest uppercase text-[#050810]">
                Browse Tournaments
              </span>
            </Link>
            <Link to="/register"
              className="relative px-8 py-4 overflow-hidden group border border-[#00f5ff]/40 hover:border-[#00f5ff]/80 transition-colors"
              style={{clipPath:'polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px)'}}>
              <span className="font-display font-bold text-base tracking-widest uppercase text-[#00f5ff]">
                Create Account
              </span>
            </Link>
          </motion.div>

          {/* Floating stat pills */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.0}}
            className="flex flex-wrap justify-center gap-4 mt-12">
            {[['🏆', '8,400+', 'Tournaments'], ['💰', '₹2.4Cr+', 'Prizes Paid'], ['⚡', '180M+', 'Coins Earned']].map(([icon,val,label]) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 bg-[#0a0f1e]/80 border border-[#1a2545] rounded-sm">
                <span>{icon}</span>
                <span className="font-display font-bold text-white text-sm">{val}</span>
                <span className="font-mono text-xs text-[#4a5568]">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase">Scroll to explore</span>
          <motion.div animate={{y:[0,8,0]}} transition={{duration:1.5,repeat:Infinity}} className="w-4 h-6 border border-[#1a2545] rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 bg-[#00f5ff] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="relative border-y border-[#1a2545]/60 bg-[#0a0f1e]/40 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>
      </section>

      {/* TOURNAMENTS SECTION */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Live & Upcoming</div>
              <h2 className="font-display font-bold text-5xl text-white">ACTIVE <span className="text-[#00f5ff]">ARENA</span></h2>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[['all','All'],['live','🔴 Live'],['champions','👑 Champions'],['free','Free'],['paid','Paid']].map(([val,label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-4 py-1.5 font-display text-xs tracking-widest uppercase transition-all duration-200 border ${
                    filter === val
                      ? 'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10'
                      : 'border-[#1a2545] text-[#4a5568] hover:text-white hover:border-[#1a2545]/80'
                  }`}>{label}</button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((t, i) => <TournamentCard key={t.id} t={t} index={i} />)}
          </div>

          <div className="text-center mt-10">
            <Link to="/tournaments"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a2545] text-[#4a5568] hover:text-white hover:border-[#00f5ff]/40 font-display text-sm tracking-widest uppercase transition-all duration-300">
              View All Tournaments →
            </Link>
          </div>
        </div>
      </section>

      {/* TOURNAMENT TYPES EXPLAINER */}
      <section className="py-20 relative border-y border-[#1a2545]/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-3">Choose Your Battle</div>
            <h2 className="font-display font-bold text-5xl text-white">TWO PATHS TO <span className="text-[#ffd700]">GLORY</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tournament Type */}
            <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
              className="relative p-8 border border-[#00f5ff]/20 bg-[#0a0f1e]/60 overflow-hidden"
              style={{clipPath:'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'}}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full" style={{background:'radial-gradient(#00f5ff08, transparent)'}} />
              <div className="font-mono text-xs text-[#00f5ff] tracking-widest mb-4 uppercase">Type 01</div>
              <h3 className="font-display font-bold text-3xl text-white mb-3">TOURNAMENT</h3>
              <p className="text-[#4a5568] font-body leading-relaxed mb-6">Open format tournaments for all players. Can be free or paid. Compete for coins, prizes, and ranking points. Perfect for regular grind and skill building.</p>
              <div className="space-y-2">
                {['Free or Paid entry options','Open to all skill levels','GHQ Coin rewards for participation','Ranking-based prize distribution'].map(f => (
                  <div key={f} className="flex items-center gap-2 font-body text-sm text-[#e8eaf6]/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]" />{f}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Champions Type */}
            <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
              className="relative p-8 border border-[#ffd700]/20 bg-[#0a0f1e]/60 overflow-hidden"
              style={{clipPath:'polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)'}}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
              <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full" style={{background:'radial-gradient(#ffd70008, transparent)'}} />
              <div className="font-mono text-xs text-[#ffd700] tracking-widest mb-4 uppercase">Type 02</div>
              <h3 className="font-display font-bold text-3xl text-white mb-3">CHAMPIONS <span className="text-[#ffd700]">👑</span></h3>
              <p className="text-[#4a5568] font-body leading-relaxed mb-6">Elite bracket tournaments with structured competition. Always paid. Single or double elimination bracket system. The highest stakes, biggest rewards.</p>
              <div className="space-y-2">
                {['Paid entry — Serious competition only','Bracket system (Single/Double Elimination)','Massive prize pools & coin multipliers','Exclusive Champion title & badge'].map(f => (
                  <div key={f} className="flex items-center gap-2 font-body text-sm text-[#e8eaf6]/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffd700]" />{f}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COIN ECONOMY */}
      <CoinEconomySection />

      {/* LEADERBOARD */}
      <LeaderboardSection />

      {/* ACHIEVEMENTS TEASER */}
      <section className="py-20 border-t border-[#1a2545]/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Unlock & Earn</div>
            <h2 className="font-display font-bold text-4xl text-white">ACHIEVEMENTS</h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4">
            {achievements.map((a, i) => (
              <motion.div key={a.id} initial={{opacity:0,scale:0.8}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.1}}
                whileHover={{scale:1.05}} className="flex items-center gap-3 px-5 py-3 border border-[#1a2545] bg-[#0a0f1e]/60">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-display font-semibold text-sm text-white">{a.name}</div>
                  <div className="font-mono text-xs text-[#ffd700]">+{a.coins} coins</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at center, #00f5ff08 0%, transparent 70%)'}} />
        <HexGrid />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-4">Your Journey Begins</div>
            <h2 className="font-display font-bold text-6xl text-white mb-6 leading-none">
              READY TO<br/><span className="text-[#00f5ff]" style={{textShadow:'0 0 40px #00f5ff66'}}>DOMINATE?</span>
            </h2>
            <p className="text-[#4a5568] font-body mb-10">Join 124,000+ players already competing on GHQ. Register free. Earn coins. Rise through the ranks.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register"
                className="relative px-10 py-4 overflow-hidden group"
                style={{clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'}}>
                <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
                <span className="relative font-display font-bold text-base tracking-widest uppercase text-[#050810]">Create Free Account</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
