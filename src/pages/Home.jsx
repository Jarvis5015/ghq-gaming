import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import TournamentCard from '../components/tournament/TournamentCard'
import NoticeBoard    from '../components/ui/NoticeBoard'
import useAuthStore   from '../store/useAuthStore'
import { tournamentAPI, userAPI } from '../services/api'

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

function Counter({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const steps = 40
    const increment = value / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, (duration * 1000) / steps)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}</>
}

function StatsBar({ tournaments, leaderboard }) {
  const totalPrize = tournaments.reduce((s, t) => s + (t.prizePool || 0), 0)
  const liveCount  = tournaments.filter(t => t.status === 'LIVE').length
  const stats = [
    { label: 'Registered Players', value: leaderboard.length,  suffix: '+', color: '#00f5ff' },
    { label: 'Total Tournaments',  value: tournaments.length,  suffix: '',  color: '#7c3aed' },
    { label: 'Live Right Now',     value: liveCount,           suffix: '',  color: '#00ff88' },
    { label: 'Prize Pool (₹)',     value: totalPrize,          suffix: '+', color: '#ffd700' },
  ]
  return (
    <section className="relative border-y border-[#1a2545]/60 bg-[#0a0f1e]/40 py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ delay: i*0.1 }}
            className="text-center p-6 border border-[#1a2545] bg-[#0a0f1e]/80"
            style={{ clipPath:'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
            <div className="font-display font-bold text-3xl mb-1" style={{ color: s.color }}>
              <Counter value={s.value} />{s.suffix}
            </div>
            <div className="font-mono text-xs text-[#4a5568] tracking-widest uppercase">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function LeaderboardSection({ leaderboard, loading }) {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="flex items-end justify-between mb-12">
          <div>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Hall of Fame</div>
            <h2 className="font-display font-bold text-5xl text-white">TOP <span className="text-[#00f5ff]">PLAYERS</span></h2>
          </div>
          <Link to="/leaderboard" className="font-display text-sm text-[#4a5568] hover:text-[#00f5ff] transition-colors tracking-wider uppercase">View All →</Link>
        </motion.div>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-display font-bold text-xl text-[#4a5568] mb-2">Leaderboard is empty</div>
            <p className="font-mono text-sm text-[#4a5568]">Be the first to compete and claim the top spot!</p>
            <Link to="/tournaments" className="inline-block mt-4 font-mono text-sm text-[#00f5ff] hover:text-white transition-colors">Browse Tournaments →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((player, i) => (
              <motion.div key={player.id || i} initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }} transition={{ delay: i*0.08 }}
                className="relative flex items-center gap-4 p-4 border border-[#1a2545] bg-[#0a0f1e]/60 group hover:border-[#00f5ff]/20 transition-all">
                {i < 3 && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32' }} />}
                <div className="w-8 font-display font-bold text-xl" style={{ color: i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#4a5568' }}>#{i+1}</div>
                <div className="w-10 h-10 bg-[#1a2545] border border-[#1a2545] flex items-center justify-center font-display font-bold text-xs text-[#00f5ff]"
                  style={{ clipPath:'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                  {typeof player.avatar === 'string' && player.avatar.startsWith('http')
                    ? <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                    : player.avatar || player.username?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-white group-hover:text-[#00f5ff] transition-colors">{player.username}</div>
                  <div className="font-mono text-xs text-[#4a5568]">{player.wins||0} Wins</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#ffd700]">{(player.coins||0).toLocaleString()}</div>
                  <div className="font-mono text-[9px] text-[#4a5568] tracking-wider">GHQ COINS</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CoinEconomySection() {
  const coinTypes = [
    { icon:'🏆', label:'Win Tournaments',  coins:'+500 to +8,000', color:'#ffd700' },
    { icon:'🎯', label:'Ranked Placement', coins:'+100 to +2,000', color:'#00f5ff' },
    { icon:'⚔️', label:'Participation',    coins:'+50 per join',   color:'#7c3aed' },
    { icon:'🌟', label:'Achievements',     coins:'+100 to +5,000', color:'#00ff88' },
    { icon:'👑', label:'Champion Title',   coins:'+10,000 Bonus',  color:'#ffd700' },
    { icon:'📅', label:'Daily Login',      coins:'+25 every day',  color:'#ff2d55' },
  ]
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
          <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-3">Economy System</div>
          <h2 className="font-display font-bold text-5xl text-white mb-4">GHQ <span className="text-[#ffd700]" style={{ textShadow:'0 0 30px #ffd70066' }}>COIN</span> ECONOMY</h2>
          <p className="text-[#4a5568] font-body max-w-xl mx-auto">Every action earns. Every win rewards. GHQ Coins power the entire platform.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {coinTypes.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }}
              className="p-4 border bg-[#0a0f1e]/60 hover:bg-[#0a0f1e] transition-colors" style={{ borderColor:`${c.color}22` }}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-display font-semibold text-sm text-white mb-1">{c.label}</div>
              <div className="font-mono text-sm font-bold" style={{ color: c.color }}>{c.coins}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { isLoggedIn, user } = useAuthStore()
  const { scrollY }   = useScroll()
  const heroY         = useTransform(scrollY, [0, 600], [0, -120])
  const heroOpacity   = useTransform(scrollY, [0, 400], [1, 0])

  const [tournaments, setTournaments] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [lbLoading,   setLbLoading]   = useState(true)
  const [filter,      setFilter]      = useState('all')

  useEffect(() => {
    tournamentAPI.getAll()
      .then(res => setTournaments(res.tournaments || []))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false))
    userAPI.getLeaderboard()
      .then(res => setLeaderboard(res.leaderboard || []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false))
  }, [])

  const filtered = tournaments.filter(t => {
    const status = (t.status||'').toLowerCase()
    const mode   = (t.mode||'').toLowerCase()
    const type   = (t.type||'').toLowerCase()
    if (filter==='live')      return status==='live'
    if (filter==='champions') return type==='champions'
    if (filter==='free')      return mode==='free'
    if (filter==='paid')      return mode==='paid'
    return true
  })

  const activeOnly = filtered.filter(t => {
    const s = (t.status||'').toLowerCase()
    return s==='live' || s==='upcoming' || filter!=='all'
  })

  const liveCount = tournaments.filter(t => t.status==='LIVE').length

  return (
    <div className="relative min-h-screen">

      {/* ── 📢 NOTICE BOARD — pinned just below navbar ── */}
      <div className="sticky top-16 z-40 w-full" style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(8px)' }}>
        <NoticeBoard />
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <HexGrid />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background:'radial-gradient(ellipse, #00f5ff08 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background:'radial-gradient(ellipse, #7c3aed08 0%, transparent 70%)' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-[#00f5ff]/20 bg-[#00f5ff]/5 rounded-full">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              loading ? 'bg-[#4a5568]' :
              liveCount > 0 ? 'bg-[#00ff88] animate-ping' : 'bg-[#00f5ff]'
            }`} />
            <span className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase">
              {loading
                ? 'Loading...'
                : liveCount > 0
                  ? `${liveCount} Tournament${liveCount > 1 ? 's' : ''} Live Right Now 🔴`
                  : tournaments.length > 0
                    ? `${tournaments.length} Tournament${tournaments.length > 1 ? 's' : ''} · Register Now`
                    : 'Platform Online · Tournaments Coming Soon'}
            </span>
          </motion.div>

          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
            <div className="font-display font-bold leading-none mb-2">
              <div className="text-6xl md:text-8xl text-white tracking-tight">GAMER</div>
              <div className="text-6xl md:text-8xl tracking-tight" style={{ color:'#00f5ff', textShadow:'0 0 60px #00f5ff66, 0 0 120px #00f5ff33' }}>
                HEAD<span className="text-white">QUARTER</span>
              </div>
            </div>
          </motion.div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}
            className="font-body text-[#4a5568] text-lg md:text-xl max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">
            Compete. Conquer. Earn. The arena where Mobile & PC players battle for glory, prizes, and GHQ Coins.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
            className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/tournaments" className="relative px-8 py-4 overflow-hidden group" style={{ clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
              <div className="absolute inset-0 bg-[#00f5ff]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white transition-opacity" />
              <span className="relative font-display font-bold text-base tracking-widest uppercase text-[#050810]">Browse Tournaments</span>
            </Link>
            {!isLoggedIn && (
              <Link to="/register" className="relative px-8 py-4 border border-[#00f5ff]/40 hover:border-[#00f5ff]/80 transition-colors" style={{ clipPath:'polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px)' }}>
                <span className="font-display font-bold text-base tracking-widest uppercase text-[#00f5ff]">Create Free Account</span>
              </Link>
            )}
            {isLoggedIn && (
              <Link to="/wallet" className="relative px-8 py-4 border border-[#f5a623]/40 hover:border-[#f5a623]/80 transition-colors" style={{ clipPath:'polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px)' }}>
                <span className="font-display font-bold text-base tracking-widest uppercase text-[#f5a623]">🪙 Buy Gollars</span>
              </Link>
            )}
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0 }} className="flex flex-wrap justify-center gap-4 mt-12">
            {[['🏆', tournaments.length.toString(), 'Tournaments'], ['🔴', liveCount>0?liveCount.toString():'0', 'Live Now'], ['👥', leaderboard.length.toString(), 'Players']].map(([icon,val,label]) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 bg-[#0a0f1e]/80 border border-[#1a2545] rounded-sm">
                <span>{icon}</span>
                <span className="font-display font-bold text-white text-sm">{val}</span>
                <span className="font-mono text-xs text-[#4a5568]">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase">Scroll to explore</span>
          <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity }}
            className="w-4 h-6 border border-[#1a2545] rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 bg-[#00f5ff] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <StatsBar tournaments={tournaments} leaderboard={leaderboard} />

      {/* ── TOURNAMENTS ── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Live & Upcoming</div>
              <h2 className="font-display font-bold text-5xl text-white">ACTIVE <span className="text-[#00f5ff]">ARENA</span></h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[['all','All'],['live','🔴 Live'],['champions','👑 Champions'],['free','Free'],['paid','Paid']].map(([val,label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-4 py-1.5 font-display text-xs tracking-widest uppercase transition-all border ${filter===val?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(3)].map((_,i) => <div key={i} className="h-72 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" style={{ clipPath:'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }} />)}
            </div>
          )}

          {!loading && activeOnly.length === 0 && (
            <div className="text-center py-24 border border-[#1a2545]/40 border-dashed">
              <div className="text-5xl mb-4">🎮</div>
              <div className="font-display font-bold text-2xl text-white mb-3">
                {filter==='all' ? 'First Tournament Coming Soon!' : `No ${filter} tournaments right now`}
              </div>
              <p className="font-mono text-sm text-[#4a5568] max-w-md mx-auto mb-6">
                {filter==='all' ? "We're setting up the arena. Register now to be notified when the first tournament drops!" : 'Try a different filter or check back soon.'}
              </p>
              {!isLoggedIn && filter==='all' && (
                <Link to="/register" className="inline-block px-6 py-3 bg-[#00f5ff] font-display font-bold text-sm tracking-widest uppercase text-[#050810] hover:bg-[#00f5ff]/85 transition-colors">
                  Register Free →
                </Link>
              )}
            </div>
          )}

          {!loading && activeOnly.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeOnly.slice(0,6).map((t,i) => <TournamentCard key={t.id} tournament={t} index={i} />)}
            </div>
          )}

          {activeOnly.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/tournaments" className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a2545] text-[#4a5568] hover:text-white hover:border-[#00f5ff]/40 font-display text-sm tracking-widest uppercase transition-all">
                View All {tournaments.length} Tournaments →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TOURNAMENT TYPES ── */}
      <section className="py-20 relative border-y border-[#1a2545]/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-3">Choose Your Battle</div>
            <h2 className="font-display font-bold text-5xl text-white">TWO PATHS TO <span className="text-[#ffd700]">GLORY</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { type:'01', title:'TOURNAMENT', color:'#00f5ff', clip:'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)', desc:'Open format for all players. Free or paid entry. Compete for GHQ Coins and prize pools.', features:['Free or Paid entry','Open to all skill levels','GHQ Coins for participation','Prize pool distribution'], x:-30 },
              { type:'02', title:'CHAMPIONS 👑', color:'#ffd700', clip:'polygon(24px 0, 100% 0, 100% 100%, 0 100%, 0 24px)', desc:'Elite bracket tournaments. Always paid. Highest stakes, biggest rewards, exclusive titles.', features:['Paid entry only','Bracket elimination system','Massive prize pools','Exclusive Champion badge'], x:30 },
            ].map(t => (
              <motion.div key={t.type} initial={{ opacity:0, x:t.x }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                className="relative p-8 bg-[#0a0f1e]/60 overflow-hidden border" style={{ clipPath:t.clip, borderColor:`${t.color}22` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent" style={{ background:`linear-gradient(90deg, transparent, ${t.color}, transparent)` }} />
                <div className="font-mono text-xs tracking-widest mb-4 uppercase" style={{ color:t.color }}>Type {t.type}</div>
                <h3 className="font-display font-bold text-3xl text-white mb-3">{t.title}</h3>
                <p className="text-[#4a5568] font-body leading-relaxed mb-6">{t.desc}</p>
                {t.features.map(f => (
                  <div key={f} className="flex items-center gap-2 font-body text-sm text-[#e8eaf6]/70 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background:t.color }} />{f}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CoinEconomySection />
      <LeaderboardSection leaderboard={leaderboard} loading={lbLoading} />

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at center, #00f5ff08 0%, transparent 70%)' }} />
        <HexGrid />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-4">Your Journey Begins</div>
            <h2 className="font-display font-bold text-6xl text-white mb-6 leading-none">
              READY TO<br/><span className="text-[#00f5ff]" style={{ textShadow:'0 0 40px #00f5ff66' }}>DOMINATE?</span>
            </h2>
            <p className="text-[#4a5568] font-body mb-10">
              {isLoggedIn ? `Welcome back, ${user?.username}! Jump into a tournament and start earning.` : 'Register free. Earn GHQ Coins. Rise through the ranks. Claim your glory.'}
            </p>
            <Link to={isLoggedIn ? '/tournaments' : '/register'}
              className="relative inline-block px-10 py-4 overflow-hidden group" style={{ clipPath:'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
              <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
              <span className="relative font-display font-bold text-base tracking-widest uppercase text-[#050810]">
                {isLoggedIn ? 'Browse Tournaments' : 'Create Free Account'}
              </span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
