import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import useAuthStore from '../store/useAuthStore'

export default function Leaderboard() {
  const { leaderboard, leaderboardLoading, fetchLeaderboard } = useStore()
  const { user, isLoggedIn } = useAuthStore()
  const [activeGame, setActiveGame] = useState('all')

  const games = ['all', 'Valorant', 'BGMI', 'CS2', 'PUBG', 'Free Fire', 'COD Mobile']

  useEffect(() => {
    fetchLeaderboard(activeGame)
  }, [activeGame])

  const rankColor = (rank) => {
    if (rank === 1) return '#ffd700'
    if (rank === 2) return '#c0c0c0'
    if (rank === 3) return '#cd7f32'
    return '#4a5568'
  }

  // Find current user's position in leaderboard
  const myEntry = isLoggedIn && user
    ? leaderboard.find(p => p.username === user.username)
    : null

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="relative pt-8 pb-16 border-b border-[#1a2545]/60 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#ffd700]" />
            <span className="font-mono text-xs text-[#ffd700] tracking-[0.4em] uppercase">Hall of Champions</span>
            <div className="h-px w-10 bg-[#ffd700]" />
          </div>
          <h1 className="font-display font-bold text-7xl md:text-8xl tracking-wide text-white leading-none">
            LEADER<span className="text-[#ffd700]" style={{ textShadow: '0 0 40px #ffd70066' }}>BOARD</span>
          </h1>
          <p className="font-body text-[#4a5568] mt-4 text-lg">
            Rankings based on GHQ Coins earned. Updated in real-time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Game filter tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {games.map(g => (
            <button key={g} onClick={() => setActiveGame(g)}
              className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all border ${
                activeGame === g
                  ? 'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10'
                  : 'border-[#1a2545] text-[#4a5568] hover:text-white'
              }`}>
              {g === 'all' ? 'All Games' : g}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {leaderboardLoading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 border border-[#1a2545] bg-[#0a0f1e]/40 animate-pulse" />
            ))}
          </div>
        )}

        {!leaderboardLoading && (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-14">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((player, i) => {
                  const actualRank = [2, 1, 3][i]
                  const heights   = ['h-32', 'h-44', 'h-28']
                  const medals    = ['🥈', '🥇', '🥉']
                  const rc        = rankColor(actualRank)
                  return (
                    <motion.div key={player.rank}
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                      className="flex flex-col items-center">
                      <div className="w-14 h-14 border-2 flex items-center justify-center mb-2"
                        style={{ borderColor: rc, background: `${rc}15`, boxShadow: actualRank === 1 ? `0 0 25px ${rc}44` : 'none' }}>
                        <span className="font-mono text-sm font-bold" style={{ color: rc }}>{player.avatar}</span>
                      </div>
                      <span className="text-2xl mb-1">{medals[i]}</span>
                      <p className="font-display font-semibold text-sm text-white tracking-wide">{player.username}</p>
                      <p className="font-mono text-xs font-bold mt-0.5 text-[#ffd700]">
                        ⬡ {player.coins.toLocaleString()}
                      </p>
                      <div className={`w-full ${heights[i]} mt-3 border border-t-0 flex items-end justify-center pb-3`}
                        style={{ borderColor: `${rc}44`, background: `linear-gradient(180deg, ${rc}0A 0%, transparent 100%)` }}>
                        <span className="font-display text-4xl" style={{ color: `${rc}25` }}>#{actualRank}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Full table */}
            <div className="border border-[#1a2545]">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a2545] bg-[#0a0f1e]">
                <span className="col-span-1 font-mono text-[10px] text-[#4a5568] tracking-widest">RANK</span>
                <span className="col-span-5 font-mono text-[10px] text-[#4a5568] tracking-widest">PLAYER</span>
                <span className="col-span-3 font-mono text-[10px] text-[#4a5568] tracking-widest">GHQ COINS</span>
                <span className="col-span-2 font-mono text-[10px] text-[#4a5568] tracking-widest">WINS</span>
                <span className="col-span-1 font-mono text-[10px] text-[#4a5568] tracking-widest"></span>
              </div>

              {leaderboard.map((player, i) => {
                const rc     = rankColor(player.rank)
                const isMe   = player.username === user?.username
                return (
                  <motion.div key={player.rank}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a2545] last:border-0 transition-all hover:bg-[#0a0f1e]/60 ${
                      isMe ? 'bg-[#00f5ff]/5 border-l-2 border-l-[#00f5ff]' : ''
                    }`}>
                    <div className="col-span-1 flex items-center">
                      <span className="font-display font-bold text-xl" style={{ color: rc }}>#{player.rank}</span>
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-9 h-9 border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: `${rc}44`, background: `${rc}10` }}>
                        <span className="font-mono text-xs font-bold" style={{ color: rc }}>{player.avatar}</span>
                      </div>
                      <div>
                        <p className={`font-display font-semibold text-sm ${isMe ? 'text-[#00f5ff]' : 'text-white'}`}>
                          {player.username} {isMe && <span className="text-[#4a5568] text-xs">(You)</span>}
                        </p>
                        <p className="font-mono text-[10px] text-[#4a5568]">{player.favoriteGame || '—'}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1.5">
                      <span className="text-[#ffd700]">⬡</span>
                      <span className="font-mono text-sm font-bold text-[#ffd700]">{player.coins.toLocaleString()}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="font-display text-lg text-white">{player.wins}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <span className="text-lg">
                        {player.rank === 1 ? '👑' : player.rank === 2 ? '⚡' : player.rank === 3 ? '🔥' : player.rank <= 5 ? '⭐' : '🎮'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Your rank banner — shown if logged in and not in visible list */}
            {isLoggedIn && user && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-5 border border-[#00f5ff]/30 bg-[#00f5ff]/5 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#4a5568] tracking-widest">YOUR POSITION</span>
                  <span className="font-display font-bold text-2xl text-[#00f5ff]">
                    {myEntry ? `#${myEntry.rank}` : 'Unranked'}
                  </span>
                  <div className="w-8 h-8 border border-[#00f5ff]/30 flex items-center justify-center">
                    <span className="font-mono text-xs text-[#00f5ff]">{user.avatar}</span>
                  </div>
                  <span className="font-display font-semibold text-white">{user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd700]">⬡</span>
                  <span className="font-mono font-bold text-[#ffd700]">{(user.coins || 0).toLocaleString()}</span>
                  <span className="font-mono text-[10px] text-[#4a5568] ml-1">GHQ COINS</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
