import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminWallet        from './AdminWallet'
import AdminTournaments   from './AdminTournaments'
import AdminWithdraw      from './AdminWithdraw'
import AdminCoinSettings  from './AdminCoinSettings'
import AdminAnnouncements from './AdminAnnouncements'

function AdminSidebar({ active, setActive }) {
  const navItems = [
    { id: 'dashboard',      icon: '📊', label: 'Dashboard'        },
    { id: 'announcements',  icon: '📢', label: 'Announcements'    },
    { id: 'tournaments',    icon: '🏆', label: 'Tournaments'      },
    { id: 'wallet',         icon: '🪙', label: 'Gollar Top-Ups'   },
    { id: 'withdraw',       icon: '💸', label: 'Withdrawals'      },
    { id: 'players',        icon: '👥', label: 'Players'          },
    { id: 'coin-settings',  icon: '⬡',  label: 'Coin Settings'    },
    { id: 'settings',       icon: '⚙️', label: 'Settings'         },
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

function DashboardPanel() {
  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Overview</div>
        <h2 className="font-display font-bold text-3xl text-white">DASHBOARD</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: '📢', label: 'Announcements', desc: 'Post notices to homepage notice board', panel: 'announcements', color: '#00f5ff' },
          { icon: '🏆', label: 'Tournaments',   desc: 'Create and manage tournaments',          panel: 'tournaments',   color: '#ffd700' },
          { icon: '🪙', label: 'Gollar Wallet', desc: 'Verify player top-up payments',          panel: 'wallet',        color: '#f5a623' },
          { icon: '💸', label: 'Withdrawals',   desc: 'Process withdrawal requests',            panel: 'withdraw',      color: '#00ff88' },
          { icon: '⬡',  label: 'Coin Settings', desc: 'Set earn rates and conversion',          panel: 'coin-settings', color: '#7c3aed' },
          { icon: '👥', label: 'Players',       desc: 'View and manage player accounts',        panel: 'players',       color: '#ff2d55' },
        ].map(item => (
          <div key={item.label} className="border border-[#1a2545] bg-[#0a0f1e] p-5 hover:border-opacity-60 transition-all"
            style={{ borderColor: `${item.color}22` }}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-display font-bold text-base text-white mb-1">{item.label}</div>
            <div className="font-mono text-[10px] text-[#4a5568]">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlayersPanel() {
  return (
    <div>
      <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Manage</div>
      <h2 className="font-display font-bold text-3xl text-white mb-6">PLAYERS</h2>
      <div className="text-center py-16 border border-[#1a2545]/40 border-dashed">
        <div className="font-display text-[#4a5568]">Player management coming soon</div>
      </div>
    </div>
  )
}

function SettingsPanel() {
  const [saved, setSaved] = useState(false)
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">Admin</div>
        <h2 className="font-display font-bold text-3xl text-white">SETTINGS</h2>
      </div>
      <AnimatePresence>
        {saved && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">✓ Saved!</motion.div>}
      </AnimatePresence>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
        className="relative px-8 py-3 overflow-hidden group"
        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
        <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/90 transition-colors" />
        <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">Save Settings</span>
      </button>
    </div>
  )
}

export default function Admin() {
  const [activePanel, setActivePanel] = useState('dashboard')

  const panels = {
    dashboard:     <DashboardPanel />,
    announcements: <AdminAnnouncements />,
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
