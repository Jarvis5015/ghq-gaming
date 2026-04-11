import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import TournamentCard from '../components/tournament/TournamentCard'

const GAME_COLORS = {
  Valorant: '#ff4655', BGMI: '#f5a623', 'Free Fire': '#ff6b35',
  'COD Mobile': '#00c853', PUBG: '#f0c040', CS2: '#de9b35',
  Fortnite: '#00bcd4', 'Clash Royale': '#7c3aed',
}

const GAME_ICONS = {
  Valorant: '🎯', BGMI: '🔫', 'Free Fire': '🔥',
  'COD Mobile': '💥', PUBG: '🪖', CS2: '🔵',
  Fortnite: '🏗️', 'Clash Royale': '👑',
}

export default function Tournaments() {
  const { tournaments, tournamentsLoading, tournamentsError, fetchTournaments } = useStore()

  const [search,   setSearch]   = useState('')
  const [mode,     setMode]     = useState('all')
  const [type,     setType]     = useState('all')
  const [platform, setPlatform] = useState('all')
  const [status,   setStatus]   = useState('all')
  const [viewMode, setViewMode] = useState('sections') // 'sections' | 'grid'

  useEffect(() => {
    fetchTournaments({
      ...(status   !== 'all' ? { status:   status.toUpperCase()   } : {}),
      ...(type     !== 'all' ? { type:     type.toUpperCase()     } : {}),
      ...(mode     !== 'all' ? { mode:     mode.toUpperCase()     } : {}),
      ...(platform !== 'all' ? { platform }                         : {}),
    })
  }, [status, type, mode, platform])

  // Client-side search
  const filtered = tournaments.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.game.toLowerCase().includes(search.toLowerCase())
  )

  // Group by game for sections view
  const gameGroups = {}
  filtered.forEach(t => {
    if (!gameGroups[t.game]) gameGroups[t.game] = []
    gameGroups[t.game].push(t)
  })

  const liveCount = tournaments.filter(t => t.status === 'LIVE').length

  const filterActive = mode !== 'all' || type !== 'all' || platform !== 'all' || status !== 'all' || search

  return (
    <div className="min-h-screen pt-4 pb-20">
      {/* Header */}
      <div className="relative border-b border-[#1a2545]/60 pb-10 mb-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, #00f5ff06, transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 relative pt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="font-mono text-xs text-[#00f5ff] tracking-[0.4em] uppercase mb-2">Active Arena</div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="font-display font-bold text-6xl text-white">
                ALL <span className="text-[#00f5ff]">TOURNAMENTS</span>
              </h1>
              {liveCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
                  <span className="font-mono text-sm text-[#00ff88] font-bold">{liveCount} LIVE RIGHT NOW</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-10 space-y-4">
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or game..."
                className="w-full pl-10 pr-4 py-3 bg-[#0a0f1e] border border-[#1a2545] text-[#e8eaf6] font-body text-sm placeholder-[#4a5568]/50 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />
            </div>
            {/* View mode toggle */}
            <div className="flex gap-1">
              {[['sections', '⊞ By Game'], ['grid', '▦ All']].map(([v, l]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase border transition-all ${viewMode===v?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1.5">
              {[['all','All'],['live','🔴 Live'],['upcoming','Upcoming'],['completed','Done']].map(([v,l]) => (
                <button key={v} onClick={() => setStatus(v)}
                  className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all ${status===v?'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#1a2545]" />
            <div className="flex gap-1.5">
              {[['all','All Types'],['tournament','Tournament'],['champions','👑 Champions']].map(([v,l]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all ${type===v?'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#1a2545]" />
            <div className="flex gap-1.5">
              {[['all','All'],['free','Free'],['paid','🪙 Paid']].map(([v,l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all ${mode===v?'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <div className="w-px h-6 bg-[#1a2545]" />
            <div className="flex gap-1.5">
              {[['all','All'],['PC','🖥️ PC'],['Mobile','📱 Mobile']].map(([v,l]) => (
                <button key={v} onClick={() => setPlatform(v)}
                  className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all ${platform===v?'border-[#7c3aed] text-[#a78bfa] bg-[#7c3aed]/10':'border-[#1a2545] text-[#4a5568] hover:text-white'}`}>{l}</button>
              ))}
            </div>
            {filterActive && (
              <button onClick={() => { setSearch(''); setMode('all'); setType('all'); setPlatform('all'); setStatus('all') }}
                className="ml-auto font-mono text-[10px] text-[#ff2d55] hover:text-white transition-colors tracking-wider uppercase">
                ✕ Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading */}
        {tournamentsLoading && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_,i) => <div key={i} className="h-72 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />)}
          </div>
        )}

        {/* Error */}
        {tournamentsError && !tournamentsLoading && (
          <div className="text-center py-16 border border-[#ff2d55]/20 bg-[#ff2d55]/5">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-display font-bold text-lg text-[#ff2d55] mb-2">Could not load tournaments</div>
            <div className="font-mono text-sm text-[#4a5568]">Make sure the backend server is running on port 5000</div>
          </div>
        )}

        {/* Content */}
        {!tournamentsLoading && !tournamentsError && (
          filtered.length === 0 ? (
            <div className="text-center py-24 border border-[#1a2545]/40">
              <div className="text-4xl mb-4">🎮</div>
              <div className="font-display font-bold text-xl text-[#4a5568] mb-2">No Tournaments Found</div>
              <div className="font-body text-sm text-[#4a5568]">Try adjusting your filters or check back later</div>
            </div>
          ) : viewMode === 'grid' ? (
            // ── Flat grid ──
            <>
              <div className="mb-6 font-mono text-xs text-[#4a5568] tracking-wider">
                SHOWING {filtered.length} TOURNAMENT{filtered.length !== 1 ? 'S' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} />)}
              </div>
            </>
          ) : (
            // ── Sections by game ──
            <div className="space-y-16">
              {Object.entries(gameGroups).map(([game, gameTournaments]) => {
                const color = GAME_COLORS[game] || '#00f5ff'
                const icon  = GAME_ICONS[game]  || '🎮'
                return (
                  <motion.section key={game}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}>
                    {/* Section header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <h2 className="font-display font-bold text-3xl" style={{ color }}>
                          {game.toUpperCase()}
                        </h2>
                      </div>
                      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
                      <div className="font-mono text-xs text-[#4a5568]">
                        {gameTournaments.length} tournament{gameTournaments.length !== 1 ? 's' : ''}
                      </div>
                      {/* Live indicator for this game */}
                      {gameTournaments.some(t => t.status === 'LIVE') && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                          <span className="font-mono text-[9px] text-[#00ff88] tracking-wider">LIVE</span>
                        </div>
                      )}
                    </div>

                    {/* Tournament cards for this game */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {gameTournaments.map((t, i) => (
                        <TournamentCard key={t.id} tournament={t} index={i} />
                      ))}
                    </div>
                  </motion.section>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
