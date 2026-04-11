import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import AdminWallet from './AdminWallet'
import AdminTournaments from './AdminTournaments'
import AdminWithdraw from './AdminWithdraw'

function AdminSidebar({ active, setActive }) {
  const navItems = [
    { id: 'dashboard',   icon: '📊', label: 'Dashboard'        },
    { id: 'tournaments', icon: '🏆', label: 'Tournaments'      },
    { id: 'wallet',      icon: '🪙', label: 'Gollar Top-Ups'   },
    { id: 'withdraw',    icon: '💸', label: 'Withdrawals'      },
    { id: 'players',     icon: '👥', label: 'Players'          },
    { id: 'economy',     icon: '⬡',  label: 'Economy'          },
    { id: 'settings',    icon: '⚙️', label: 'Settings'         },
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
  const { tournaments, fetchTournaments } = useStore()
  const live     = tournaments.filter(t => t.status === 'LIVE')
  const upcoming = tournaments.filter(t => t.status === 'UPCOMING')
  const totalPrize = tournaments.reduce((s, t) => s + (t.prizePool || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Overview</div>
        <h2 className="font-display font-bold text-3xl text-white">DASHBOARD</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon="🔴" label="Live Now"   value={live.length}        color="#ff2d55" />
        <StatBox icon="📅" label="Upcoming"   value={upcoming.length}    color="#00f5ff" />
        <StatBox icon="🏆" label="Total"      value={tournaments.length} color="#7c3aed" />
        <StatBox icon="💰" label="Prize Pool" value={`₹${(totalPrize/1000).toFixed(0)}K`} color="#ffd700" />
      </div>
      <div className="p-6 border border-[#1a2545] bg-[#0a0f1e]/40">
        <div className="font-display font-bold text-lg text-white mb-4">QUICK LINKS</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['🏆 Manage Tournaments', 'tournaments'],
            ['💸 Withdrawal Requests','withdraw'    ],
            ['🪙 Verify Gollar Top-Ups','wallet'    ],
            ['👥 View Players',       'players'    ],
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

function EconomyPanel() {
  const [form, setForm] = useState({ username: '', amount: '', reason: '' })
  const [msg,  setMsg]  = useState('')

  const handleGrant = async (e) => {
    e.preventDefault()
    try {
      const { economyAPI } = await import('../services/api')
      await economyAPI.adminGrant({ username: form.username, amount: Number(form.amount), reason: form.reason })
      setMsg(`✓ ${form.amount} coins granted to ${form.username}`)
      setForm({ username:'', amount:'', reason:'' })
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(`✗ ${err.message}`)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Economy</div>
        <h2 className="font-display font-bold text-3xl text-white">GHQ COIN MANAGEMENT</h2>
      </div>
      <div className="max-w-md border border-[#1a2545] bg-[#0a0f1e] p-6">
        <h3 className="font-display font-semibold text-lg text-white mb-5">GRANT GHQ COINS TO PLAYER</h3>
        {msg && <div className={`mb-4 p-3 border font-mono text-xs ${msg.startsWith('✓')?'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]':'border-[#ff2d55]/30 bg-[#ff2d55]/10 text-[#ff2d55]'}`}>{msg}</div>}
        <form onSubmit={handleGrant} className="space-y-3">
          {[['Username','username','Player username','text'],['Amount (⬡)','amount','e.g. 500','number'],['Reason','reason','Tournament prize adjustment','text']].map(([label,key,ph,type]) => (
            <div key={key}>
              <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={ph}
                className="w-full px-3 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />
            </div>
          ))}
          <button type="submit" className="w-full py-2.5 font-display font-bold text-xs tracking-widest uppercase border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all mt-2">
            Grant GHQ Coins ⬡
          </button>
        </form>
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
    { label: 'Daily Login Bonus',  desc: 'Grant 25 coins on login',      on: true  },
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
    dashboard:   <DashboardPanel setActive={setActivePanel} />,
    tournaments: <AdminTournaments />,
    wallet:      <AdminWallet />,
    withdraw:    <AdminWithdraw />,
    players:     <PlayersPanel />,
    economy:     <EconomyPanel />,
    settings:    <SettingsPanel />,
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
