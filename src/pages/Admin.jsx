// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAPI } from '../services/api'
import AdminWallet        from './AdminWallet'
import AdminTournaments   from './AdminTournaments'
import AdminWithdraw      from './AdminWithdraw'
import AdminCoinSettings  from './AdminCoinSettings'
import AdminAnnouncements from './AdminAnnouncements'

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AdminSidebar({ active, setActive }) {
  const navItems = [
    { id: 'dashboard',     icon: '📊', label: 'Dashboard'      },
    { id: 'announcements', icon: '📢', label: 'Announcements'  },
    { id: 'tournaments',   icon: '🏆', label: 'Tournaments'    },
    { id: 'wallet',        icon: '🪙', label: 'Gollar Top-Ups' },
    { id: 'withdraw',      icon: '💸', label: 'Withdrawals'    },
    { id: 'players',       icon: '👥', label: 'Players'        },
    { id: 'coin-settings', icon: '⬡',  label: 'Coin Settings'  },
    { id: 'settings',      icon: '⚙️', label: 'Settings'       },
  ]
  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#1a2545] bg-[#0a0f1e] flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-[#1a2545]">
        <div className="font-display font-bold text-sm text-[#00f5ff] tracking-widest">GHQ ADMIN</div>
        <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mt-0.5">CONTROL PANEL</div>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-200 ${
              active === item.id
                ? 'bg-[#00f5ff]/10 border-r-2 border-[#00f5ff] text-[#00f5ff]'
                : 'text-[#4a5568] hover:text-white hover:bg-[#1a2545]/30'
            }`}>
            <span className="text-base">{item.icon}</span>
            <span className="font-display text-xs tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-[#1a2545]">
        <div className="font-mono text-[9px] text-[#4a5568]">Logged in as</div>
        <div className="font-display text-xs text-white mt-0.5">GHQ Admin</div>
      </div>
    </aside>
  )
}

// ── Stat Box ──────────────────────────────────────────────────────────────────
function StatBox({ label, value, color = '#00f5ff', icon }) {
  return (
    <div className="border border-[#1a2545] bg-[#0a0f1e] p-5 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-display font-bold text-3xl mb-1" style={{ color }}>{value}</div>
      <div className="font-mono text-[10px] text-[#4a5568] tracking-wider uppercase">{label}</div>
    </div>
  )
}

// ── Dashboard Panel ───────────────────────────────────────────────────────────
const GAME_COLORS = {
  'BGMI': '#f5a623', 'Free Fire': '#ff6b35', 'COD Mobile': '#00c853',
  'Clash Royale': '#7c3aed', 'Valorant': '#ff4655', 'CS2': '#de9b35',
  'PUBG': '#f0c040', 'Fortnite': '#00bcd4',
}

function DashboardPanel({ setActive }) {
  const [gameStats,    setGameStats]    = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [liveTourneys, setLiveTourneys] = useState(0)
  const [upcomingT,    setUpcomingT]    = useState(0)
  const [totalT,       setTotalT]       = useState(0)

  useEffect(() => {
    // Load game stats
    gameAPI.getGameStats()
      .then(res => {
        setGameStats(res.stats || [])
        setTotalPlayers(res.totalPlayers || 0)
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false))

    // Load tournament counts
    import('../services/api').then(({ tournamentAPI }) => {
      tournamentAPI.getAll()
        .then(res => {
          const t = res.tournaments || []
          setLiveTourneys(t.filter(x => x.status === 'LIVE').length)
          setUpcomingT(t.filter(x => x.status === 'UPCOMING').length)
          setTotalT(t.length)
        })
        .catch(console.error)
    })
  }, [])

  const maxPlayers = Math.max(...gameStats.map(g => g.players), 1)

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Overview</div>
        <h2 className="font-display font-bold text-3xl text-white">DASHBOARD</h2>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon="🔴" label="Live Now"     value={liveTourneys}                         color="#ff2d55" />
        <StatBox icon="📅" label="Upcoming"     value={upcomingT}                            color="#00f5ff" />
        <StatBox icon="🏆" label="Tournaments"  value={totalT}                               color="#7c3aed" />
        <StatBox icon="👥" label="Total Players" value={statsLoading ? '...' : totalPlayers} color="#00ff88" />
      </div>

      {/* Per-game player chart */}
      <div className="border border-[#1a2545] bg-[#0a0f1e] overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />
        <div className="px-6 py-4 border-b border-[#1a2545] flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-lg text-white">PLAYERS PER GAME</div>
            <div className="font-mono text-[10px] text-[#4a5568] mt-0.5">Real data from player game selections</div>
          </div>
          <div className="font-mono text-xs text-[#4a5568]">{totalPlayers} selections total</div>
        </div>

        <div className="p-6 space-y-3">
          {statsLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-12 border border-[#1a2545] animate-pulse bg-[#050810]" />
            ))
          ) : gameStats.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-display text-[#4a5568]">No game data yet</div>
              <div className="font-mono text-[10px] text-[#4a5568] mt-1">Players will appear here after selecting their games on login</div>
            </div>
          ) : (
            gameStats.map((g, i) => {
              const color = GAME_COLORS[g.game] || '#00f5ff'
              const pct   = (g.players / maxPlayers) * 100
              return (
                <motion.div key={g.game}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4">
                  <div className="w-5 flex-shrink-0 font-mono text-[10px] text-[#4a5568] text-right">
                    {i === 0 && g.players > 0 ? '👑' : `#${i+1}`}
                  </div>
                  <div className="w-32 flex-shrink-0 flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <div>
                      <div className="font-display text-xs text-white">{g.game}</div>
                      <div className="font-mono text-[9px] text-[#4a5568]">{g.platform}</div>
                    </div>
                  </div>
                  <div className="flex-1 relative h-8 bg-[#050810] border border-[#1a2545] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0"
                      style={{ background: `${color}20`, borderRight: `2px solid ${color}` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="font-mono text-xs" style={{ color: g.players > 0 ? color : '#4a5568' }}>
                        {g.players > 0 ? `${g.players} player${g.players !== 1 ? 's' : ''}` : 'No players yet'}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0 text-right">
                    <div className="font-mono text-xs text-white">{g.players}</div>
                    <div className="font-mono text-[9px] text-[#4a5568]">{g.tournaments} events</div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Platform split */}
        {!statsLoading && gameStats.length > 0 && (() => {
          const mobile = gameStats.filter(g => g.platform === 'Mobile').reduce((s, g) => s + g.players, 0)
          const pc     = gameStats.filter(g => g.platform === 'PC').reduce((s, g) => s + g.players, 0)
          const total  = mobile + pc || 1
          return (
            <div className="px-6 pb-5 border-t border-[#1a2545] pt-4">
              <div className="font-mono text-[9px] text-[#4a5568] tracking-widest uppercase mb-3">Platform Split</div>
              <div className="grid grid-cols-2 gap-4">
                {[['📱 Mobile', mobile, '#f5a623'], ['🖥️ PC', pc, '#00f5ff']].map(([label, count, color]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-mono text-[10px]" style={{ color }}>{label}</span>
                      <span className="font-mono text-[10px] text-white">{count} ({Math.round(count/total*100)}%)</span>
                    </div>
                    <div className="h-2 bg-[#1a2545] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(count/total)*100}%` }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Quick links */}
      <div className="p-6 border border-[#1a2545] bg-[#0a0f1e]/40">
        <div className="font-display font-bold text-lg text-white mb-4">QUICK LINKS</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['🏆 Manage Tournaments',    'tournaments'  ],
            ['💸 Withdrawal Requests',   'withdraw'     ],
            ['🪙 Verify Gollar Top-Ups', 'wallet'       ],
            ['⬡ Coin Settings',          'coin-settings'],
          ].map(([l, target]) => (
            <button key={l} onClick={() => setActive(target)}
              className="border border-[#1a2545] p-4 font-display text-sm text-[#4a5568] hover:text-white hover:border-[#00f5ff]/30 transition-all text-left">
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Players Panel ─────────────────────────────────────────────────────────────
function PlayersPanel() {
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search,  setSearch]    = useState('')

  useEffect(() => {
    import('../services/api').then(({ userAPI }) => {
      userAPI.getLeaderboard()
        .then(res => setPlayers(res.leaderboard || res.users || []))
        .catch(console.error)
        .finally(() => setLoading(false))
    })
  }, [])

  const filtered = players.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Manage</div>
      <h2 className="font-display font-bold text-3xl text-white mb-6">PLAYERS</h2>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by username..."
        className="w-full max-w-sm px-4 py-2.5 mb-5 bg-[#0a0f1e] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />

      <div className="border border-[#1a2545]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a2545] bg-[#050810]">
              {['Rank', 'Player', 'Wins', 'GHQ Coins', 'Gollars', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[9px] text-[#4a5568] tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2545]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 bg-[#1a2545]/40 animate-pulse rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 font-display text-[#4a5568]">No players found</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p.id || i} className="hover:bg-[#0a0f1e]/60 transition-colors">
                <td className="px-4 py-3 font-display text-sm"
                  style={{ color: i < 3 ? ['#ffd700','#c0c0c0','#cd7f32'][i] : '#4a5568' }}>
                  #{i + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-[9px] text-[#00f5ff]">
                      {p.avatar || p.username?.slice(0,2).toUpperCase()}
                    </div>
                    <span className="font-display text-sm text-white">{p.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-display text-sm text-white">{p.wins || 0}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#ffd700]">⬡ {(p.coins||0).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#f5a623]">🪙 {(p.gollers||0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 font-mono text-[9px] border border-[#1a2545] text-[#4a5568] hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all">View</button>
                    <button className="px-2 py-1 font-mono text-[9px] border border-[#1a2545] text-[#4a5568] hover:text-[#ff2d55] hover:border-[#ff2d55]/30 transition-all">Ban</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel() {
  const [toggles, setToggles] = useState([
    {
      key:   'platform_online',
      icon:  '🟢',
      label: 'Platform Online',
      desc:  'Accept new registrations and tournament joins',
      on:    true,
    },
    {
      key:   'coin_to_gollar',
      icon:  '⬡',
      label: 'GHQ Coins → Gollar Conversion',
      desc:  'Allow players to convert their GHQ Coins into Gollars for tournament entry',
      on:    false,
      highlight: true,
    },
    {
      key:   'free_tournaments',
      icon:  '🆓',
      label: 'Free Tournaments',
      desc:  'Allow players to join free tournaments',
      on:    true,
    },
    {
      key:   'paid_tournaments',
      icon:  '🪙',
      label: 'Paid Tournaments',
      desc:  'Allow players to join paid (Gollar) tournaments',
      on:    true,
    },
    {
      key:   'gollar_topups',
      icon:  '💳',
      label: 'Gollar Top-Ups',
      desc:  'Allow players to buy Gollars via UPI',
      on:    true,
    },
    {
      key:   'withdrawals',
      icon:  '💸',
      label: 'Withdrawals',
      desc:  'Allow players to submit Gollar withdrawal requests',
      on:    true,
    },
    {
      key:   'daily_bonus',
      icon:  '📅',
      label: 'Daily Login Bonus',
      desc:  'Give GHQ Coins to players who claim daily bonus',
      on:    true,
    },
    {
      key:   'leaderboard',
      icon:  '🏆',
      label: 'Public Leaderboard',
      desc:  'Show leaderboard on homepage and leaderboard page',
      on:    true,
    },
    {
      key:    'maintenance',
      icon:   '🔧',
      label:  'Maintenance Mode',
      desc:   'Take platform offline — shows maintenance message to all players',
      on:     false,
      danger: true,
    },
  ])

  const [conversionRate, setConversionRate] = useState(100) // 100 coins = 1 Gollar
  const [saved,   setSaved]   = useState(false)
  const [changed, setChanged] = useState(false)

  const toggle = (key) => {
    setToggles(prev => prev.map(t => t.key === key ? { ...t, on: !t.on } : t))
    setChanged(true)
  }

  const handleSave = () => {
    // In a full implementation, save to DB via configAPI
    setSaved(true)
    setChanged(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const coinToGollarOn = toggles.find(t => t.key === 'coin_to_gollar')?.on

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
        <h2 className="font-display font-bold text-3xl text-white">⚙️ SETTINGS</h2>
        <p className="font-mono text-xs text-[#4a5568] mt-1">Platform-wide feature toggles</p>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">
            ✓ Settings saved!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggles */}
      <div className="border border-[#1a2545] divide-y divide-[#1a2545] overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
        {toggles.map(t => (
          <div key={t.key}
            className={`flex items-center justify-between px-5 py-4 transition-colors ${
              t.on && t.danger ? 'bg-[#ff2d55]/5' :
              t.on && t.highlight ? 'bg-[#ffd700]/5' : ''
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{t.icon}</span>
              <div>
                <div className={`font-display text-sm font-semibold flex items-center gap-2 ${
                  t.danger && t.on ? 'text-[#ff2d55]' :
                  t.highlight ? 'text-[#ffd700]' : 'text-white'
                }`}>
                  {t.label}
                  {t.danger && t.on && (
                    <span className="font-mono text-[9px] text-[#ff2d55] border border-[#ff2d55]/40 px-1.5 py-0.5">ACTIVE</span>
                  )}
                  {t.highlight && (
                    <span className="font-mono text-[9px] text-[#ffd700] border border-[#ffd700]/30 px-1.5 py-0.5">NEW</span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-[#4a5568]">{t.desc}</div>
              </div>
            </div>
            <button onClick={() => toggle(t.key)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                t.on
                  ? t.danger     ? 'bg-[#ff2d55]'
                  : t.highlight  ? 'bg-[#ffd700]'
                  : 'bg-[#00f5ff]'
                  : 'bg-[#1a2545]'
              }`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${t.on ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Coin → Gollar conversion rate — only shown when toggle is ON */}
      <AnimatePresence>
        {coinToGollarOn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-[#ffd700]/30 bg-[#ffd700]/5 p-5"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
              <div className="font-display font-bold text-sm text-[#ffd700] mb-1">⬡ → 🪙 Conversion Rate</div>
              <p className="font-mono text-[10px] text-[#4a5568] mb-4">
                How many GHQ Coins equal 1 Gollar. Lower = more generous. Set carefully.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border border-[#ffd700]/30 bg-[#050810] px-4 py-3">
                  <span className="font-display font-bold text-2xl text-[#ffd700]">{conversionRate}</span>
                  <span className="font-mono text-sm text-[#4a5568]">⬡ Coins</span>
                  <span className="font-mono text-sm text-[#4a5568]">=</span>
                  <span className="font-display font-bold text-2xl text-[#f5a623]">1</span>
                  <span className="font-mono text-sm text-[#4a5568]">🪙 Gollar</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-2">
                  Adjust Rate (coins per 1 Gollar)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="10" max="1000" step="10"
                    value={conversionRate}
                    onChange={e => { setConversionRate(Number(e.target.value)); setChanged(true) }}
                    className="flex-1 accent-[#ffd700]"
                  />
                  <input
                    type="number" min="10" max="10000"
                    value={conversionRate}
                    onChange={e => { setConversionRate(Number(e.target.value) || 100); setChanged(true) }}
                    className="w-24 px-3 py-2 bg-[#050810] border border-[#ffd700]/30 text-[#ffd700] font-mono text-sm text-center focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {[50, 100, 200, 500].map(rate => (
                    <button key={rate} onClick={() => { setConversionRate(rate); setChanged(true) }}
                      className={`px-3 py-1.5 font-mono text-[10px] border transition-all ${
                        conversionRate === rate
                          ? 'border-[#ffd700]/60 text-[#ffd700] bg-[#ffd700]/10'
                          : 'border-[#1a2545] text-[#4a5568] hover:text-white'
                      }`}>
                      {rate} coins
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-[#4a5568] mt-3">
                  Example: Player has 500 ⬡ coins → converts to{' '}
                  <span className="text-[#f5a623]">🪙 {(500 / conversionRate).toFixed(1)} Gollars</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <AnimatePresence>
        {changed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <button onClick={handleSave}
              className="relative px-8 py-3 overflow-hidden group w-full"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
              <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
              <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                💾 Save Settings
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Admin ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [activePanel, setActivePanel] = useState('dashboard')

  const panels = {
    dashboard:       <DashboardPanel setActive={setActivePanel} />,
    announcements:   <AdminAnnouncements />,
    tournaments:     <AdminTournaments />,
    wallet:          <AdminWallet />,
    withdraw:        <AdminWithdraw />,
    players:         <PlayersPanel />,
    'coin-settings': <AdminCoinSettings />,
    settings:        <SettingsPanel />,
  }

  return (
    <div className="min-h-screen pt-16 flex">
      <AdminSidebar active={activePanel} setActive={setActivePanel} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activePanel}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              {panels[activePanel]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
