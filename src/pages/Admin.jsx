import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { gameAPI } from '../services/api'
import AdminWallet from './AdminWallet'
import AdminTournaments from './AdminTournaments'
import AdminWithdraw from './AdminWithdraw'
import AdminCoinSettings from './AdminCoinSettings'

function AdminSidebar({ active, setActive }) {
  const navItems = [
    { id: 'dashboard',     icon: '📊', label: 'Dashboard'        },
    { id: 'tournaments',   icon: '🏆', label: 'Tournaments'      },
    { id: 'wallet',        icon: '🪙', label: 'Gollar Top-Ups'   },
    { id: 'withdraw',      icon: '💸', label: 'Withdrawals'      },
    { id: 'players',       icon: '👥', label: 'Players'          },
    { id: 'coin-settings', icon: '⬡',  label: 'Coin Settings'    },
    { id: 'settings',      icon: '⚙️', label: 'Settings'         },
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

function DashboardPanel({ setActive }) {
  const { tournaments } = useStore()
  const live       = tournaments.filter(t => t.status === 'LIVE')
  const upcoming   = tournaments.filter(t => t.status === 'UPCOMING')
  const totalPrize = tournaments.reduce((s, t) => s + (t.prizePool || 0), 0)

  const [gameStats,    setGameStats]    = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalPlayers, setTotalPlayers] = useState(0)

  useEffect(() => {
    gameAPI.getGameStats()
      .then(res => {
        setGameStats(res.stats || [])
        setTotalPlayers(res.totalPlayers || 0)
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  const maxPlayers = Math.max(...gameStats.map(g => g.players), 1)

  const GAME_COLORS = {
    'BGMI':         '#f5a623',
    'Free Fire':    '#ff6b35',
    'COD Mobile':   '#00c853',
    'Clash Royale': '#7c3aed',
    'Valorant':     '#ff4655',
    'CS2':          '#de9b35',
    'PUBG':         '#f0c040',
    'Fortnite':     '#00bcd4',
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Overview</div>
        <h2 className="font-display font-bold text-3xl text-white">DASHBOARD</h2>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon="🔴" label="Live Now"     value={live.length}                      color="#ff2d55" />
        <StatBox icon="📅" label="Upcoming"     value={upcoming.length}                  color="#00f5ff" />
        <StatBox icon="🏆" label="Tournaments"  value={tournaments.length}               color="#7c3aed" />
        <StatBox icon="👥" label="Total Players" value={statsLoading ? '...' : totalPlayers} color="#00ff88" />
      </div>

      {/* Per-game player counts */}
      <div className="border border-[#1a2545] bg-[#0a0f1e] overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        <div className="px-6 py-4 border-b border-[#1a2545] flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-lg text-white">PLAYERS PER GAME</div>
            <div className="font-mono text-[10px] text-[#4a5568] mt-0.5">Real data from player game selections</div>
          </div>
          <div className="font-mono text-xs text-[#4a5568]">
            {totalPlayers} total game profile{totalPlayers !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="p-6 space-y-3">
          {statsLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-12 border border-[#1a2545] animate-pulse bg-[#050810] rounded" />
            ))
          ) : gameStats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-display text-[#4a5568]">No game data yet</div>
              <div className="font-mono text-[10px] text-[#4a5568] mt-1">Players will appear here after they log in and select their games</div>
            </div>
          ) : (
            gameStats.map((g, i) => {
              const color   = GAME_COLORS[g.game] || '#00f5ff'
              const pct     = maxPlayers > 0 ? (g.players / maxPlayers) * 100 : 0
              const isTop   = i === 0 && g.players > 0
              return (
                <motion.div key={g.game}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 group">

                  {/* Rank */}
                  <div className="w-6 flex-shrink-0 font-mono text-xs text-[#4a5568] text-right">
                    {isTop ? '👑' : `#${i+1}`}
                  </div>

                  {/* Game icon + name */}
                  <div className="w-36 flex-shrink-0 flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <div>
                      <div className="font-display text-sm text-white">{g.game}</div>
                      <div className="font-mono text-[9px] text-[#4a5568]">{g.platform}</div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative h-8 bg-[#050810] border border-[#1a2545] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.06 + 0.2, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 flex items-center"
                      style={{ background: `${color}22`, borderRight: `2px solid ${color}` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="font-mono text-xs" style={{ color: g.players > 0 ? color : '#4a5568' }}>
                        {g.players > 0 ? `${g.players} player${g.players !== 1 ? 's' : ''}` : 'No players yet'}
                      </span>
                    </div>
                  </div>

                  {/* Tournament count */}
                  <div className="w-24 flex-shrink-0 text-right">
                    <div className="font-mono text-xs text-white">{g.players}</div>
                    <div className="font-mono text-[9px] text-[#4a5568]">{g.tournaments} tournaments</div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Platform split */}
        {!statsLoading && gameStats.length > 0 && (() => {
          const mobile = gameStats.filter(g => g.platform === 'Mobile').reduce((s,g) => s + g.players, 0)
          const pc     = gameStats.filter(g => g.platform === 'PC').reduce((s,g) => s + g.players, 0)
          const total  = mobile + pc || 1
          return (
            <div className="px-6 pb-6">
              <div className="border-t border-[#1a2545] pt-4">
                <div className="font-mono text-[9px] text-[#4a5568] tracking-widest uppercase mb-3">Platform Split</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-[#f5a623]">📱 Mobile</span>
                      <span className="font-mono text-[10px] text-white">{mobile} ({Math.round(mobile/total*100)}%)</span>
                    </div>
                    <div className="h-2 bg-[#1a2545] rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${(mobile/total)*100}%`}} transition={{delay:0.5,duration:0.6}}
                        className="h-full rounded-full bg-[#f5a623]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-[#00f5ff]">🖥️ PC</span>
                      <span className="font-mono text-[10px] text-white">{pc} ({Math.round(pc/total*100)}%)</span>
                    </div>
                    <div className="h-2 bg-[#1a2545] rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${(pc/total)*100}%`}} transition={{delay:0.6,duration:0.6}}
                        className="h-full rounded-full bg-[#00f5ff]" />
                    </div>
                  </div>
                </div>
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
            ['🏆 Manage Tournaments',   'tournaments'   ],
            ['💸 Withdrawal Requests',  'withdraw'      ],
            ['🪙 Verify Gollar Top-Ups', 'wallet'       ],
            ['⬡ Coin Settings',         'coin-settings' ],
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

function PlayersPanel() {
  const { leaderboard } = useStore()
  const [search, setSearch] = useState('')
  const filtered = leaderboard.filter(p => p.username?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Manage</div>
        <h2 className="font-display font-bold text-3xl text-white">PLAYERS</h2>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
        className="w-full max-w-sm px-4 py-2.5 mb-5 bg-[#0a0f1e] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />
      <div className="border border-[#1a2545]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a2545] bg-[#050810]">
              {['Rank','Player','Wins','GHQ Coins','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[9px] text-[#4a5568] tracking-widest uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2545]">
            {filtered.map((p, i) => (
              <tr key={i} className="hover:bg-[#0a0f1e]/60 transition-colors">
                <td className="px-4 py-3 font-display text-base" style={{color:p.rank<=3?['#ffd700','#c0c0c0','#cd7f32'][p.rank-1]:'#4a5568'}}>#{p.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-[9px] text-[#00f5ff]">{p.avatar}</div>
                    <span className="font-display text-sm text-white">{p.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-display text-sm text-white">{p.wins}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#ffd700]">⬡ {(p.coins||0).toLocaleString()}</td>
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

function SettingsPanel() {
  const [saved, setSaved] = useState(false)
  const [toggles, setToggles] = useState([
    { label: 'Platform Online',    desc: 'Accept new registrations',     on: true  },
    { label: 'Free Tournaments',   desc: 'Allow free tournaments',       on: true  },
    { label: 'Paid Tournaments',   desc: 'Allow paid tournaments',       on: true  },
    { label: 'Gollar Top-Ups',     desc: 'Allow players to buy Gollars', on: true  },
    { label: 'Withdrawals',        desc: 'Allow Gollar withdrawals',     on: true  },
    { label: 'Daily Login Bonus',  desc: 'Daily bonus claimable',        on: true  },
    { label: 'Maintenance Mode',   desc: 'Take platform offline',        on: false },
  ])
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
        <h2 className="font-display font-bold text-3xl text-white">SETTINGS</h2>
      </div>
      <div className="border border-[#1a2545] divide-y divide-[#1a2545]">
        {toggles.map((t, i) => (
          <div key={t.label} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="font-display text-sm text-white">{t.label}</div>
              <div className="font-mono text-[10px] text-[#4a5568]">{t.desc}</div>
            </div>
            <button onClick={() => setToggles(prev => prev.map((item,idx) => idx===i?{...item,on:!item.on}:item))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${t.on?'bg-[#00f5ff]':'bg-[#1a2545]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${t.on?'left-7':'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {saved && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">✓ Saved!</motion.div>}
      </AnimatePresence>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
        className="relative px-8 py-3 overflow-hidden group"
        style={{clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'}}>
        <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
        <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">Save Settings</span>
      </button>
    </div>
  )
}

export default function Admin() {
  const [activePanel, setActivePanel] = useState('dashboard')

  const panels = {
    dashboard:     <DashboardPanel setActive={setActivePanel} />,
    tournaments:   <AdminTournaments />,
    wallet:        <AdminWallet />,
    withdraw:      <AdminWithdraw />,
    players:       <PlayersPanel />,
    'coin-settings': <AdminCoinSettings />,
    settings:      <SettingsPanel />,
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
