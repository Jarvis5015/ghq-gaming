// src/components/ui/GameSelectionModal.jsx
// Shown once after a player logs in for the first time
// Player selects which games they play — saved to their game profile
// Admin sees real player counts per game in the dashboard

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameAPI } from '../../services/api'

const GAMES = [
  { name: 'BGMI',        platform: 'Mobile', icon: '🔫', color: '#f5a623', desc: 'Battlegrounds Mobile India' },
  { name: 'Free Fire',   platform: 'Mobile', icon: '🔥', color: '#ff6b35', desc: 'Garena Free Fire'           },
  { name: 'COD Mobile',  platform: 'Mobile', icon: '💥', color: '#00c853', desc: 'Call of Duty: Mobile'       },
  { name: 'Clash Royale',platform: 'Mobile', icon: '👑', color: '#7c3aed', desc: 'Clash Royale'               },
  { name: 'Valorant',    platform: 'PC',     icon: '🎯', color: '#ff4655', desc: 'Valorant'                   },
  { name: 'CS2',         platform: 'PC',     icon: '🔵', color: '#de9b35', desc: 'Counter-Strike 2'          },
  { name: 'PUBG',        platform: 'PC',     icon: '🪖', color: '#f0c040', desc: 'PUBG: Battlegrounds'        },
  { name: 'Fortnite',    platform: 'PC',     icon: '🏗️', color: '#00bcd4', desc: 'Fortnite'                  },
]

export default function GameSelectionModal({ onComplete }) {
  const [selected,  setSelected]  = useState([])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [step,      setStep]      = useState('select') // 'select' | 'saving' | 'done'

  const toggle = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    )
  }

  const handleSave = async () => {
    if (selected.length === 0) return setError('Please select at least one game')
    setSaving(true); setError('')
    try {
      // Save each selected game as a game profile (platform auto-filled)
      for (const gameName of selected) {
        const game = GAMES.find(g => g.name === gameName)
        try {
          await gameAPI.addGame({ game: gameName, platform: game?.platform || 'Mobile' })
        } catch {
          // Ignore if profile already exists (upsert behavior)
        }
      }
      setStep('done')
      setTimeout(() => onComplete(), 1200)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleSkip = () => {
    // Mark as seen so it doesn't show again, but don't save any games
    onComplete()
  }

  const mobileGames = GAMES.filter(g => g.platform === 'Mobile')
  const pcGames     = GAMES.filter(g => g.platform === 'PC')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="w-full max-w-2xl bg-[#0a0f1e] border border-[#1a2545] relative overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />

          {/* Done state */}
          {step === 'done' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
                style={{ background: '#00ff8822', border: '2px solid #00ff88', boxShadow: '0 0 40px #00ff8844' }}>
                🎮
              </motion.div>
              <h3 className="font-display font-bold text-2xl text-[#00ff88] mb-2">You're all set!</h3>
              <p className="font-body text-[#4a5568] text-sm">Welcome to GHQ. Let's find you some tournaments.</p>
            </motion.div>
          ) : (
            <div className="p-8">
              {/* Header */}
              <div className="mb-7">
                <div className="font-mono text-[10px] text-[#00f5ff] tracking-[0.4em] uppercase mb-2">
                  Welcome to GHQ 🎮
                </div>
                <h2 className="font-display font-bold text-3xl text-white mb-2">
                  Which games do you play?
                </h2>
                <p className="font-body text-[#4a5568] text-sm">
                  Select all games you want to compete in. We'll show you the right tournaments.
                </p>
              </div>

              {/* Mobile Games */}
              <div className="mb-5">
                <div className="font-mono text-[9px] text-[#4a5568] tracking-widest uppercase mb-3 flex items-center gap-2">
                  <span className="text-sm">📱</span> Mobile Games
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {mobileGames.map(game => {
                    const isSelected = selected.includes(game.name)
                    return (
                      <motion.button key={game.name} type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggle(game.name)}
                        className={`flex items-center gap-3 p-3.5 border text-left transition-all duration-200 relative ${
                          isSelected
                            ? 'border-opacity-60 bg-opacity-10'
                            : 'border-[#1a2545] bg-[#050810] hover:border-[#2a3555]'
                        }`}
                        style={isSelected ? {
                          borderColor: `${game.color}60`,
                          background:  `${game.color}10`,
                        } : {}}>
                        {/* Check indicator */}
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ background: game.color, color: '#050810' }}>
                            ✓
                          </motion.div>
                        )}
                        <span className="text-2xl flex-shrink-0">{game.icon}</span>
                        <div className="min-w-0">
                          <div className={`font-display font-bold text-sm transition-colors ${isSelected ? 'text-white' : 'text-[#4a5568]'}`}
                            style={isSelected ? { color: game.color } : {}}>
                            {game.name}
                          </div>
                          <div className="font-mono text-[9px] text-[#4a5568] truncate">{game.desc}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* PC Games */}
              <div className="mb-6">
                <div className="font-mono text-[9px] text-[#4a5568] tracking-widest uppercase mb-3 flex items-center gap-2">
                  <span className="text-sm">🖥️</span> PC Games
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pcGames.map(game => {
                    const isSelected = selected.includes(game.name)
                    return (
                      <motion.button key={game.name} type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggle(game.name)}
                        className={`flex items-center gap-3 p-3.5 border text-left transition-all duration-200 relative ${
                          isSelected ? '' : 'border-[#1a2545] bg-[#050810] hover:border-[#2a3555]'
                        }`}
                        style={isSelected ? {
                          borderColor: `${game.color}60`,
                          background:  `${game.color}10`,
                        } : {}}>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ background: game.color, color: '#050810' }}>
                            ✓
                          </motion.div>
                        )}
                        <span className="text-2xl flex-shrink-0">{game.icon}</span>
                        <div className="min-w-0">
                          <div className={`font-display font-bold text-sm transition-colors`}
                            style={isSelected ? { color: game.color } : { color: '#4a5568' }}>
                            {game.name}
                          </div>
                          <div className="font-mono text-[9px] text-[#4a5568] truncate">{game.desc}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Selected count */}
              <div className="flex items-center gap-2 mb-4">
                {selected.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {selected.slice(0,5).map(g => (
                        <span key={g} className="text-base">{GAMES.find(gm => gm.name === g)?.icon}</span>
                      ))}
                    </div>
                    <span className="font-mono text-xs text-[#00ff88]">
                      {selected.length} game{selected.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-xs text-[#4a5568]">No games selected yet</span>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-4 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleSkip}
                  className="px-5 py-3 font-mono text-xs text-[#4a5568] border border-[#1a2545] hover:text-white hover:border-[#2a3555] transition-all tracking-wider">
                  Skip for now
                </button>
                <button onClick={handleSave} disabled={saving || selected.length === 0}
                  className="flex-1 relative py-3 overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                  <div className="absolute inset-0 bg-[#00f5ff] group-hover:bg-[#00f5ff]/85 transition-colors" />
                  <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
                    {saving
                      ? 'Saving...'
                      : selected.length > 0
                        ? `Save ${selected.length} Game${selected.length !== 1 ? 's' : ''} →`
                        : 'Select Games to Continue'}
                  </span>
                </button>
              </div>

              <p className="font-mono text-[9px] text-[#4a5568] text-center mt-3">
                You can always update your games in your Profile settings
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
