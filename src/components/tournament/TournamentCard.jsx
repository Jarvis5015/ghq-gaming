import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/useAuthStore'
import { walletAPI } from '../../services/api'

const gameColors = {
  Valorant: '#ff4655', BGMI: '#f5a623', 'Free Fire': '#ff6b35',
  'COD Mobile': '#00c853', PUBG: '#f0c040', CS2: '#de9b35',
  Fortnite: '#00bcd4', 'Clash Royale': '#7c3aed',
}
const platformIcon = { PC: '🖥️', Mobile: '📱', Both: '🎮' }

export default function TournamentCard({ tournament, index = 0 }) {
  if (!tournament) return null
  const t = tournament

  const navigate = useNavigate()
  const { user, isLoggedIn, updateGollers, updateUser } = useAuthStore()

  // Normalize — DB returns uppercase
  const typeLower   = (t.type   || '').toLowerCase()
  const modeLower   = (t.mode   || '').toLowerCase()
  const statusLower = (t.status || '').toLowerCase()

  const isChampion  = typeLower   === 'champions'
  const isPaid      = modeLower   === 'paid' && (t.entryFee > 0)
  const isLive      = statusLower === 'live'
  const isCompleted = statusLower === 'completed'

  const ac       = gameColors[t.game] || '#00f5ff'
  const current  = t.registeredPlayers ?? t.players?.current ?? 0
  const max      = t.maxPlayers        ?? t.players?.max     ?? 1
  const fillPct  = Math.min(100, Math.round((current / max) * 100))

  const [joining,   setJoining]   = useState(false)
  const [joinMsg,   setJoinMsg]   = useState('')
  const [joinError, setJoinError] = useState('')

  const handleJoin = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) { navigate('/login'); return }

    // For paid tournaments, navigate to detail page so player can see full info + wallet balance
    if (isPaid) {
      navigate(`/tournaments/${t.id}`)
      return
    }

    // Free tournament — join directly from card
    setJoining(true); setJoinMsg(''); setJoinError('')
    try {
      const res = await walletAPI.joinTournament(t.id)
      setJoinMsg('Joined!')
      if (res.newBalance !== undefined) updateGollers(res.newBalance)
      if (res.coinsEarned) updateUser({ coins: (user?.coins || 0) + res.coinsEarned })
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const alreadyJoined = joinMsg !== ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
    >
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${ac}44, transparent, ${ac}22)`,
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }} />

      <div className="relative bg-[#0d1428] border border-[#1a2545] h-full overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>

        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-[#00ff88] animate-ping" />
                <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
              </div>
              <span className="font-mono text-[10px] text-[#00ff88] font-bold tracking-widest">LIVE</span>
            </div>
          ) : <div />}
          {isChampion && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#ffd700]/15 border border-[#ffd700]/40">
              <span className="text-[9px]">👑</span>
              <span className="font-display text-[9px] font-bold text-[#ffd700] tracking-widest uppercase">Champions</span>
            </div>
          )}
        </div>

        <div className="p-5 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold tracking-wider" style={{ color: ac }}>{t.game}</span>
            <span className="text-xs opacity-60">{platformIcon[t.platform] || '🎮'}</span>
            <span className="ml-auto font-mono text-[10px] text-[#4a5568]">{t.platform}</span>
          </div>

          <Link to={`/tournaments/${t.id}`}>
            <h3 className="font-display font-bold text-lg text-white leading-tight mb-4 hover:text-[#00f5ff] transition-colors duration-200">
              {t.name}
            </h3>
          </Link>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono text-[10px] text-[#4a5568] tracking-wider">PLAYERS</span>
              <span className="font-mono text-[10px] text-white">{current}/{max}</span>
            </div>
            <div className="h-1 rounded-full bg-[#1a2545] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${ac}88, ${ac})` }} />
            </div>
          </div>

          {/* Entry fee display */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {isPaid ? (
                <>
                  <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">ENTRY FEE</div>
                  <div className="font-display font-bold text-base text-[#f5a623]">
                    🪙 {t.entryFee} Gollars
                  </div>
                </>
              ) : (
                <>
                  <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">ENTRY</div>
                  <div className="font-display font-bold text-base text-[#00ff88]">FREE</div>
                </>
              )}
              {t.prizePool > 0 && (
                <div className="font-mono text-[10px] text-[#ffd700] mt-0.5">₹{t.prizePool.toLocaleString()} prize</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] text-[#4a5568] tracking-wider mb-0.5">GHQ COINS</div>
              <div className="font-display font-semibold text-sm text-[#ffd700]">+{(t.coinReward || 0).toLocaleString()}</div>
            </div>
          </div>

          {(t.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(t.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 font-mono text-[9px] text-[#4a5568] tracking-wider uppercase border border-[#1a2545]">{tag}</span>
              ))}
            </div>
          )}

          <AnimatePresence>
            {joinMsg && (
              <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mb-3 px-3 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">
                ✓ {joinMsg}
              </motion.div>
            )}
            {joinError && (
              <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mb-3 px-3 py-2 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-xs text-[#ff2d55]">
                {joinError}
                {joinError.includes('Gollar') && (
                  <Link to="/wallet" className="ml-2 underline text-[#f5a623] hover:text-white">Buy Gollars →</Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Link to={`/tournaments/${t.id}`}
              className="px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568] hover:text-white hover:border-[#1a2545]/80 transition-all">
              Details
            </Link>

            {isCompleted ? (
              <span className="ml-auto font-mono text-[10px] text-[#4a5568]">Ended</span>
            ) : alreadyJoined ? (
              <div className="ml-auto flex items-center gap-1 font-mono text-[10px] text-[#00ff88]">
                <span>✓</span> Joined!
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="ml-auto relative px-4 py-1.5 overflow-hidden text-xs font-display font-bold tracking-widest uppercase transition-all group/btn disabled:opacity-50"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
                <div className="absolute inset-0 transition-opacity duration-200"
                  style={{ background: isLive ? '#00ff88' : isPaid ? '#f5a623' : '#00f5ff', opacity: 0.2 }} />
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-white transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: isLive ? '#00ff88' : isPaid ? '#f5a623' : '#00f5ff' }} />
                <span style={{ color: isLive ? '#00ff88' : isPaid ? '#f5a623' : '#00f5ff' }}>
                  {joining
                    ? '...'
                    : isPaid
                      ? `🪙 ${t.entryFee} Gollars`
                      : 'Join Free'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
