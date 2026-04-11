import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import useStore from '../store/useStore'
import { gameAPI } from '../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────

const GAME_COLORS = {
  BGMI:           '#f5a623',
  'Free Fire':    '#ff6b35',
  'COD Mobile':   '#00c853',
  Valorant:       '#ff4655',
  CS2:            '#de9b35',
  PUBG:           '#f0c040',
  Fortnite:       '#00bcd4',
  'Clash Royale': '#7c3aed',
}

// Hardcoded fallback — shown instantly, no API wait needed
const FALLBACK_GAMES = [
  { name: 'BGMI',         platform: 'Mobile', icon: '🔫' },
  { name: 'Free Fire',    platform: 'Mobile', icon: '🔥' },
  { name: 'COD Mobile',   platform: 'Mobile', icon: '💥' },
  { name: 'Clash Royale', platform: 'Mobile', icon: '👑' },
  { name: 'Valorant',     platform: 'PC',     icon: '🎯' },
  { name: 'CS2',          platform: 'PC',     icon: '🔵' },
  { name: 'PUBG',         platform: 'PC',     icon: '🪖' },
  { name: 'Fortnite',     platform: 'PC',     icon: '🏗️' },
]

const PLATFORM_ICON = { PC: '🖥️', Mobile: '📱' }

// ── GameCard ──────────────────────────────────────────────────────────────────

function GameCard({ profile, onEdit, onRemove, onSetPrimary }) {
  const color = GAME_COLORS[profile.game] || '#00f5ff'
  const wr = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0

  return (
    <motion.div layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative border bg-[#0a0f1e] overflow-hidden"
      style={{ borderColor: `${color}33`, clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      {profile.isPrimary && (
        <div className="absolute top-3 right-3 px-2 py-0.5 font-mono text-[8px] tracking-widest uppercase"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          ★ Primary
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display font-bold text-xl" style={{ color }}>{profile.game}</span>
          <span className="text-sm opacity-60">{PLATFORM_ICON[profile.platform]}</span>
        </div>

        <div className="mb-3">
          <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">IN-GAME ID</div>
          <div className="font-mono text-sm text-white">
            {profile.gameUserId || <span className="text-[#4a5568] italic text-xs">Not set</span>}
          </div>
        </div>

        <div className="mb-4">
          <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">IN-GAME RANK</div>
          <div className="font-mono text-sm text-white">
            {profile.rank || <span className="text-[#4a5568] italic text-xs">Not set</span>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-[#1a2545]">
          {[['Wins', profile.wins, '#00ff88'], ['Losses', profile.losses, '#ff2d55'], ['Win %', `${wr}%`, color]].map(([l, v, c]) => (
            <div key={l} className="text-center">
              <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">{l}</div>
              <div className="font-display font-bold text-base" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">TOURNAMENTS PLAYED</div>
          <div className="font-display font-bold text-sm text-white">{profile.tournamentsPlayed}</div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(profile)}
            className="flex-1 py-1.5 font-mono text-[10px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-white transition-all">
            Edit
          </button>
          {!profile.isPrimary && (
            <button onClick={() => onSetPrimary(profile.game)}
              className="flex-1 py-1.5 font-mono text-[10px] tracking-widest uppercase border transition-all"
              style={{ borderColor: `${color}44`, color }}>
              Set Primary
            </button>
          )}
          <button onClick={() => onRemove(profile.game)}
            className="py-1.5 px-3 font-mono text-[10px] tracking-widest uppercase border border-[#ff2d55]/20 text-[#ff2d55]/50 hover:text-[#ff2d55] hover:border-[#ff2d55]/40 transition-all">
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── AddGameModal ──────────────────────────────────────────────────────────────
// Fetches its own supported games list on mount — no dependency on parent state

function AddGameModal({ existingGames, onAdd, onClose }) {
  const [allGames,  setAllGames]  = useState(FALLBACK_GAMES) // start with fallback instantly
  const [selected,  setSelected]  = useState(null)
  const [form,      setForm]      = useState({ gameUserId: '', rank: '', isPrimary: false })
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  // Try to fetch from server — if it works, great; if not, fallback is already shown
  useEffect(() => {
    gameAPI.getSupportedGames()
      .then(data => { if (data?.games?.length) setAllGames(data.games) })
      .catch(() => {}) // silently keep fallback
  }, [])

  // Filter out games the player already has
  const available = allGames.filter(g => !existingGames.includes(g.name))

  const handleAdd = async () => {
    if (!selected) return setError('Please select a game first')
    setLoading(true)
    setError('')
    try {
      const result = await onAdd({
        game:       selected.name,
        platform:   selected.platform,
        gameUserId: form.gameUserId.trim(),
        rank:       form.rank.trim(),
        isPrimary:  form.isPrimary,
      })
      if (result?.success) {
        onClose()
      } else {
        setError(result?.message || 'Failed to add game')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#050810]/90 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg border border-[#1a2545] bg-[#0a0f1e] overflow-hidden z-10"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-white">ADD A GAME</h2>
            <button onClick={onClose} className="text-[#4a5568] hover:text-white text-2xl leading-none transition-colors">×</button>
          </div>

          {/* Game grid */}
          <div className="mb-5">
            <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-3">SELECT GAME</div>

            {available.length === 0 ? (
              <div className="text-center py-8 border border-[#1a2545] border-dashed">
                <div className="text-3xl mb-2">🎮</div>
                <div className="font-display text-sm text-[#4a5568]">All games are already in your profile!</div>
                <div className="font-mono text-xs text-[#4a5568]/60 mt-1">Remove a game first to add a different one</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {available.map(g => {
                  const color      = GAME_COLORS[g.name] || '#00f5ff'
                  const isSelected = selected?.name === g.name
                  return (
                    <button key={g.name} onClick={() => { setSelected(g); setError('') }}
                      className="flex items-center gap-3 px-4 py-3 border transition-all text-left"
                      style={{
                        borderColor: isSelected ? color : '#1a2545',
                        background:  isSelected ? `${color}18` : 'transparent',
                      }}>
                      <span className="text-lg">{g.icon}</span>
                      <div>
                        <div className="font-display font-bold text-sm" style={{ color: isSelected ? color : '#e8eaf6' }}>
                          {g.name}
                        </div>
                        <div className="font-mono text-[9px] text-[#4a5568]">
                          {PLATFORM_ICON[g.platform]} {g.platform}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="ml-auto text-xs" style={{ color }}>✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Extra fields — shown after selecting a game */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-5 overflow-hidden"
              >
                <div>
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                    In-Game ID / Username <span className="normal-case text-[#4a5568]/60">(optional)</span>
                  </label>
                  <input
                    value={form.gameUserId}
                    onChange={e => setForm({ ...form, gameUserId: e.target.value })}
                    placeholder={`Your ${selected.name} username e.g. PhantomX#1234`}
                    className="w-full px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#00f5ff]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">
                    In-Game Rank <span className="normal-case text-[#4a5568]/60">(optional)</span>
                  </label>
                  <input
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: e.target.value })}
                    placeholder="e.g. Diamond 2, Platinum III, Global Elite"
                    className="w-full px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#00f5ff]/40 transition-colors"
                  />
                </div>

                {/* Set as primary toggle */}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isPrimary: !f.isPrimary }))}
                  className="flex items-center gap-3 w-full cursor-pointer"
                >
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ${form.isPrimary ? 'bg-[#00f5ff]' : 'bg-[#1a2545]'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.isPrimary ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="font-mono text-xs text-[#e8eaf6]/70 tracking-wider">Set as my primary game</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55] flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white hover:border-[#1a2545]/80 transition-all">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selected || loading || available.length === 0}
              className="flex-1 py-2.5 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
            >
              <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors group-disabled:bg-[#00f5ff]/40" />
              <span className="relative text-[#050810]">
                {loading ? 'Adding...' : 'Add Game'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── EditGameModal ─────────────────────────────────────────────────────────────

function EditGameModal({ profile, onSave, onClose }) {
  const [form,    setForm]    = useState({ gameUserId: profile.gameUserId || '', rank: profile.rank || '' })
  const [loading, setLoading] = useState(false)
  const color = GAME_COLORS[profile.game] || '#00f5ff'

  const handleSave = async () => {
    setLoading(true)
    await onSave(profile.game, form)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#050810]/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="relative w-full max-w-md border border-[#1a2545] bg-[#0a0f1e] p-6 z-10"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl" style={{ color }}>EDIT {profile.game}</h2>
          <button onClick={onClose} className="text-[#4a5568] hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">In-Game ID</label>
            <input value={form.gameUserId} onChange={e => setForm({ ...form, gameUserId: e.target.value })}
              placeholder="Your in-game username"
              className="w-full px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-[#4a5568] tracking-widest uppercase block mb-1.5">In-Game Rank</label>
            <input value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })}
              placeholder="e.g. Diamond 2, Platinum III"
              className="w-full px-4 py-2.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-sm placeholder-[#4a5568]/40 focus:outline-none focus:border-[#00f5ff]/40 transition-colors" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 font-display font-bold text-sm tracking-widest uppercase relative overflow-hidden group disabled:opacity-50"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
            <div className="absolute inset-0 transition-colors" style={{ background: color }} />
            <span className="relative text-[#050810]">{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Profile Page ─────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuthStore()
  const { transactions, achievements, fetchTransactions, fetchAchievements } = useStore()

  const [activeTab,      setActiveTab]      = useState('games')
  const [gameProfiles,   setGameProfiles]   = useState([])
  const [statsSummary,   setStatsSummary]   = useState(null)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [loadingGames,   setLoadingGames]   = useState(true)

  useEffect(() => { if (!isLoggedIn) navigate('/login') }, [isLoggedIn])

  // Load game profiles on mount
  useEffect(() => {
    const load = async () => {
      setLoadingGames(true)
      try {
        const [profiles, stats] = await Promise.all([
          gameAPI.getMyProfiles(),
          gameAPI.getMyStats(),
        ])
        setGameProfiles(profiles.profiles || [])
        setStatsSummary(stats)
      } catch (e) {
        console.error('Profile load error:', e)
      } finally {
        setLoadingGames(false)
      }
    }
    if (isLoggedIn) load()
  }, [isLoggedIn])

  useEffect(() => {
    if (activeTab === 'history')      fetchTransactions()
    if (activeTab === 'achievements') fetchAchievements()
  }, [activeTab])

  if (!user) return null

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAddGame = async (data) => {
    try {
      const result = await gameAPI.addGame(data)
      setGameProfiles(prev => [...prev, result.profile])
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const handleEditGame = async (game, data) => {
    try {
      const result = await gameAPI.updateGame(game, data)
      setGameProfiles(prev => prev.map(p => p.game === game ? result.profile : p))
    } catch (err) {
      console.error('Edit game error:', err)
    }
  }

  const handleRemoveGame = async (game) => {
    if (!window.confirm(`Remove ${game} from your profile?`)) return
    try {
      await gameAPI.removeGame(game)
      setGameProfiles(prev => prev.filter(p => p.game !== game))
    } catch (err) {
      console.error('Remove game error:', err)
    }
  }

  const handleSetPrimary = async (game) => {
    try {
      await gameAPI.updateGame(game, { isPrimary: true })
      setGameProfiles(prev => prev.map(p => ({ ...p, isPrimary: p.game === game })))
    } catch (err) {
      console.error('Set primary error:', err)
    }
  }

  const primaryGame = gameProfiles.find(p => p.isPrimary)

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-4 pb-20">

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddGameModal
            existingGames={gameProfiles.map(p => p.game)}
            onAdd={handleAddGame}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {editingProfile && (
          <EditGameModal
            profile={editingProfile}
            onSave={handleEditGame}
            onClose={() => setEditingProfile(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="relative border-b border-[#1a2545]/60 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 80% at 20% 50%, #00f5ff05, transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-[#0a0f1e] border-2 border-[#00f5ff]/40 flex items-center justify-center"
                style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))', boxShadow: '0 0 30px #00f5ff15' }}>
                <span className="font-display font-bold text-2xl text-[#00f5ff]">
                  {user.avatar || user.username?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00ff88] rounded-full border-2 border-[#050810]" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="font-mono text-[10px] text-[#4a5568] tracking-widest mb-1">
                {user.role === 'ADMIN' ? '⚙️ GHQ ADMIN' : '🎮 GHQ PLAYER'}
              </div>
              <h1 className="font-display font-bold text-4xl text-white mb-2">{user.username}</h1>
              <div className="flex flex-wrap gap-4 mb-2">
                <span className="font-mono text-sm text-[#ffd700] font-bold">⬡ {(user.coins || 0).toLocaleString()}</span>
                {user.rank && <span className="font-mono text-sm text-[#00f5ff]">Rank #{user.rank}</span>}
                <span className="font-mono text-sm text-[#4a5568]">{user.wins} Wins</span>
                <span className="font-mono text-sm text-[#4a5568]">
                  {gameProfiles.length} game{gameProfiles.length !== 1 ? 's' : ''} linked
                </span>
              </div>

              {/* Primary game display */}
              {primaryGame && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#4a5568] tracking-wider">MAIN GAME:</span>
                  <span className="font-display font-bold text-sm"
                    style={{ color: GAME_COLORS[primaryGame.game] || '#00f5ff' }}>
                    {primaryGame.game}
                  </span>
                  {primaryGame.gameUserId && (
                    <span className="font-mono text-xs text-[#4a5568]">· {primaryGame.gameUserId}</span>
                  )}
                  {primaryGame.rank && (
                    <span className="font-mono text-xs text-[#4a5568]">· {primaryGame.rank}</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowAddModal(true)}
                className="relative px-5 py-2.5 overflow-hidden group"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}>
                <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                <span className="relative font-display font-bold text-sm tracking-wider uppercase text-[#050810]">
                  + Add Game
                </span>
              </button>
              <button onClick={logout}
                className="px-4 py-2.5 border border-[#ff2d55]/30 text-[#ff2d55]/70 font-display text-xs tracking-wider uppercase hover:bg-[#ff2d55]/10 hover:text-[#ff2d55] transition-all">
                Log Out
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-[#1a2545]">
            {[
              ['games',        'My Games',      gameProfiles.length],
              ['stats',        'Stats',          null],
              ['achievements', 'Achievements',   null],
              ['history',      'Coin History',   null],
            ].map(([v, l, count]) => (
              <button key={v} onClick={() => setActiveTab(v)}
                className={`px-5 py-3 font-display text-sm tracking-widest uppercase transition-all border-b-2 -mb-px flex items-center gap-2 ${
                  activeTab === v ? 'border-[#00f5ff] text-[#00f5ff]' : 'border-transparent text-[#4a5568] hover:text-white'
                }`}>
                {l}
                {count > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-[#00f5ff]/15 text-[#00f5ff] rounded-full font-mono">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── My Games ── */}
        {activeTab === 'games' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">
                  MY GAME <span className="text-[#00f5ff]">PROFILES</span>
                </h2>
                <p className="font-body text-sm text-[#4a5568] mt-1">
                  Each game tracks your ID, rank, wins, and stats separately
                </p>
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="px-5 py-2 border border-[#00f5ff]/30 font-display text-sm tracking-widest uppercase text-[#00f5ff] hover:bg-[#00f5ff]/10 transition-all">
                + Add Game
              </button>
            </div>

            {loadingGames ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 border border-[#1a2545] animate-pulse bg-[#0a0f1e]/40" />
                ))}
              </div>
            ) : gameProfiles.length === 0 ? (
              <div className="text-center py-20 border border-[#1a2545]/40 border-dashed">
                <div className="text-5xl mb-4">🎮</div>
                <div className="font-display font-bold text-xl text-white mb-2">No Games Added Yet</div>
                <div className="font-body text-sm text-[#4a5568] mb-6 max-w-sm mx-auto">
                  Add your games to track separate stats, in-game IDs, and rankings for each one
                </div>
                <button onClick={() => setShowAddModal(true)}
                  className="relative px-8 py-3 overflow-hidden group"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                  <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                    Add Your First Game
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {gameProfiles.map(profile => (
                    <GameCard key={profile.game} profile={profile}
                      onEdit={setEditingProfile}
                      onRemove={handleRemoveGame}
                      onSetPrimary={handleSetPrimary}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Stats ── */}
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                ['Total Coins',        (user.coins || 0).toLocaleString(), '#ffd700'],
                ['Total Wins',         statsSummary?.totals?.totalWins ?? user.wins, '#00ff88'],
                ['Games Linked',       gameProfiles.length, '#00f5ff'],
                ['Tournaments Played', statsSummary?.totals?.totalTournamentsPlayed ?? 0, '#7c3aed'],
              ].map(([l, v, c]) => (
                <div key={l} className="border border-[#1a2545] bg-[#0a0f1e]/60 p-5"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <div className="font-mono text-[9px] text-[#4a5568] tracking-wider uppercase mb-2">{l}</div>
                  <div className="font-display font-bold text-2xl" style={{ color: c }}>{v}</div>
                </div>
              ))}
            </div>

            {gameProfiles.length > 0 && (
              <>
                <h3 className="font-display font-bold text-xl text-white mb-5">PER-GAME BREAKDOWN</h3>
                <div className="border border-[#1a2545] overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#1a2545] bg-[#050810]">
                        {['Game', 'In-Game ID', 'Rank', 'Wins', 'Losses', 'Win %', 'Tournaments'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-mono text-[9px] text-[#4a5568] tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a2545]">
                      {gameProfiles.map(p => {
                        const color = GAME_COLORS[p.game] || '#00f5ff'
                        const wr = p.wins + p.losses > 0 ? Math.round(p.wins / (p.wins + p.losses) * 100) : 0
                        return (
                          <tr key={p.game} className="hover:bg-[#0a0f1e]/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="font-display font-semibold text-sm" style={{ color }}>
                                  {p.game}
                                </span>
                                {p.isPrimary && <span className="text-[9px] text-[#ffd700]">★</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-[#e8eaf6]/70">{p.gameUserId || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-[#e8eaf6]/70">{p.rank || '—'}</td>
                            <td className="px-4 py-3 font-display text-sm text-[#00ff88]">{p.wins}</td>
                            <td className="px-4 py-3 font-display text-sm text-[#ff2d55]">{p.losses}</td>
                            <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color }}>{wr}%</td>
                            <td className="px-4 py-3 font-display text-sm text-white">{p.tournamentsPlayed}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {gameProfiles.length === 0 && (
              <div className="text-center py-12 text-[#4a5568] font-body text-sm">
                Add games to your profile to see stats here
              </div>
            )}
          </motion.div>
        )}

        {/* ── Achievements ── */}
        {activeTab === 'achievements' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-white">ACHIEVEMENTS</h2>
              <span className="font-mono text-xs text-[#4a5568]">
                {achievements.filter(a => a.earned).length}/{achievements.length} UNLOCKED
              </span>
            </div>
            {achievements.length === 0 ? (
              <div className="text-center py-16 text-[#4a5568] font-mono text-sm">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-4 p-4 border ${a.earned ? 'border-[#ffd700]/20 bg-[#ffd700]/5' : 'border-[#1a2545] opacity-40'}`}>
                    <span className={`text-3xl ${!a.earned ? 'grayscale' : ''}`}>{a.icon}</span>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm text-white">{a.label}</div>
                      <div className="font-mono text-[10px] text-[#4a5568]">{a.description}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${a.earned ? 'text-[#ffd700]' : 'text-[#4a5568]'}`}>
                        +{a.coinReward?.toLocaleString()} ⬡
                      </div>
                      {a.earned && <div className="font-mono text-[9px] text-[#00ff88]">✓</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Coin History ── */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display font-bold text-2xl text-white mb-6">COIN HISTORY</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-[#4a5568] font-mono text-sm">No transactions yet</div>
            ) : (
              <div className="border border-[#1a2545]">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a2545] bg-[#050810]">
                  <span className="col-span-5 font-mono text-[9px] text-[#4a5568] tracking-widest">DESCRIPTION</span>
                  <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest">GAME</span>
                  <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">DATE</span>
                  <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest text-right">AMOUNT</span>
                </div>
                {transactions.map((tx, i) => (
                  <motion.div key={tx.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a2545] last:border-0 hover:bg-[#0a0f1e]/40 transition-colors">
                    <div className="col-span-5 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === 'EARN' ? 'bg-[#00ff88]' : 'bg-[#ff2d55]'}`} />
                      <span className="font-body text-sm text-[#e8eaf6]/80 truncate">{tx.label}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {tx.game
                        ? <span className="font-mono text-[10px] font-bold" style={{ color: GAME_COLORS[tx.game] || '#4a5568' }}>{tx.game}</span>
                        : <span className="font-mono text-[10px] text-[#4a5568]">—</span>
                      }
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="font-mono text-xs text-[#4a5568]">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span className={`font-mono text-sm font-bold ${tx.type === 'EARN' ? 'text-[#00ff88]' : 'text-[#ff2d55]'}`}>
                        {tx.type === 'EARN' ? '+' : '-'}{tx.amount?.toLocaleString()} ⬡
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
