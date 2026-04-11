import { motion } from 'framer-motion'

function MatchCard({ match, roundIndex, matchIndex }) {
  const isLive = match.status === 'live'
  const isDone = match.status === 'done'
  const isUpcoming = match.status === 'upcoming'
  const p1Wins = isDone && match.player1.score > match.player2.score
  const p2Wins = isDone && match.player2.score > match.player1.score

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: roundIndex * 0.2 + matchIndex * 0.1 }}
      className="relative w-48"
    >
      {/* Live badge */}
      {isLive && (
        <div className="absolute -top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-[#ff2d55]">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="font-mono text-[8px] text-white tracking-widest">LIVE</span>
        </div>
      )}

      <div className={`border overflow-hidden ${
        isLive ? 'border-[#ff2d55]/50 shadow-[0_0_15px_rgba(255,45,85,0.15)]'
        : isDone ? 'border-[#1a2545]'
        : 'border-[#1a2545]/40'
      } bg-[#0a0f1e]`}>

        {/* Player 1 */}
        <div className={`flex items-center justify-between px-3 py-2.5 border-b border-[#1a2545] ${p1Wins ? 'bg-[#ffd700]/8' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border ${p1Wins ? 'border-[#ffd700]/40 bg-[#ffd700]/10' : 'border-[#00f5ff]/20 bg-[#00f5ff]/5'}`}>
              <span className={`font-mono text-[8px] ${p1Wins ? 'text-[#ffd700]' : 'text-[#00f5ff]'}`}>P1</span>
            </div>
            <span className={`font-mono text-xs truncate ${
              isUpcoming ? 'text-[#4a5568]'
              : p1Wins ? 'text-[#ffd700] font-bold'
              : 'text-[#e8eaf6]'
            }`}>{match.player1.name}</span>
          </div>
          {match.player1.score !== null && (
            <span className={`font-display text-base ml-2 flex-shrink-0 ${p1Wins ? 'text-[#ffd700]' : 'text-[#4a5568]'}`}>
              {match.player1.score}
            </span>
          )}
        </div>

        {/* Player 2 */}
        <div className={`flex items-center justify-between px-3 py-2.5 ${p2Wins ? 'bg-[#ffd700]/8' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border ${p2Wins ? 'border-[#ffd700]/40 bg-[#ffd700]/10' : 'border-[#ffd700]/20 bg-[#ffd700]/5'}`}>
              <span className={`font-mono text-[8px] ${p2Wins ? 'text-[#ffd700]' : 'text-[#ffd700]/60'}`}>P2</span>
            </div>
            <span className={`font-mono text-xs truncate ${
              isUpcoming ? 'text-[#4a5568]'
              : p2Wins ? 'text-[#ffd700] font-bold'
              : 'text-[#e8eaf6]'
            }`}>{match.player2.name}</span>
          </div>
          {match.player2.score !== null && (
            <span className={`font-display text-base ml-2 flex-shrink-0 ${p2Wins ? 'text-[#ffd700]' : 'text-[#4a5568]'}`}>
              {match.player2.score}
            </span>
          )}
        </div>
      </div>

      {/* Status pill */}
      <div className={`absolute -bottom-2.5 right-2 px-2 py-0.5 font-mono text-[8px] tracking-widest ${
        isLive ? 'bg-[#ff2d55] text-white'
        : isDone ? 'border border-[#00ff88]/30 text-[#00ff88] bg-[#00ff88]/10'
        : 'border border-[#1a2545] text-[#4a5568] bg-[#0a0f1e]'
      }`}>
        {isDone ? '✓ DONE' : isLive ? '● LIVE' : 'SOON'}
      </div>
    </motion.div>
  )
}

export default function BracketView({ bracketData }) {
  if (!bracketData?.rounds) return null
  const { rounds } = bracketData

  // Calculate vertical spacing per round
  const getGap = (rIdx) => {
    const gaps = [20, 84, 180, 372]
    return gaps[rIdx] || 20
  }
  const getMarginTop = (rIdx) => {
    const margins = [0, 36, 108, 252]
    return margins[rIdx] || 0
  }

  return (
    <div className="overflow-x-auto pb-10 pt-4">
      <div className="flex gap-0 min-w-max">
        {rounds.map((round, rIdx) => (
          <div key={rIdx} className="flex">
            {/* Round column */}
            <div className="flex flex-col" style={{ width: '200px' }}>
              {/* Round label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rIdx * 0.15 }}
                className="mb-8 text-center"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 border font-mono text-[10px] tracking-widest uppercase ${
                  rIdx === rounds.length - 1
                    ? 'border-[#ffd700]/50 text-[#ffd700] bg-[#ffd700]/5'
                    : 'border-[#1a2545] text-[#4a5568]'
                }`}>
                  {rIdx === rounds.length - 1 && <span>🏆</span>}
                  {round.name}
                </div>
              </motion.div>

              {/* Matches */}
              <div
                className="flex flex-col"
                style={{
                  gap: `${getGap(rIdx)}px`,
                  marginTop: `${getMarginTop(rIdx)}px`,
                }}
              >
                {round.matches.map((match, mIdx) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    roundIndex={rIdx}
                    matchIndex={mIdx}
                  />
                ))}
              </div>
            </div>

            {/* Connector lines between rounds */}
            {rIdx < rounds.length - 1 && (
              <div className="relative flex flex-col" style={{ width: '48px' }}>
                <div style={{ height: '54px' }} /> {/* offset for label */}
                <div
                  className="flex flex-col relative"
                  style={{
                    gap: `${getGap(rIdx)}px`,
                    marginTop: `${getMarginTop(rIdx)}px`,
                  }}
                >
                  {round.matches.map((_, mIdx) => {
                    // Draw connector for every pair
                    if (mIdx % 2 !== 0) return null
                    const cardH = 72 // approx card height
                    const currGap = getGap(rIdx)
                    const pairSpan = cardH * 2 + currGap
                    const midY = pairSpan / 2

                    return (
                      <div key={mIdx} className="relative" style={{ height: `${pairSpan}px` }}>
                        {/* Top horizontal line from card 1 */}
                        <div className="absolute left-0 top-[36px] w-full h-px bg-[#ffd700]/25" />
                        {/* Bottom horizontal line from card 2 */}
                        <div className="absolute left-0 h-px bg-[#ffd700]/25" style={{ top: `${pairSpan - 36}px`, width: '100%' }} />
                        {/* Vertical connector */}
                        <div className="absolute right-0 bg-[#ffd700]/25" style={{
                          width: '1px',
                          top: '36px',
                          height: `${pairSpan - 72}px`,
                        }} />
                        {/* Arrow tip */}
                        <div className="absolute right-0 w-full h-px bg-[#ffd700]/25" style={{ top: `${midY}px` }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-8 px-4">
        {[
          { color: '#ff2d55', label: 'Live Match' },
          { color: '#ffd700', label: 'Winner' },
          { color: '#00ff88', label: 'Completed' },
          { color: '#4a5568', label: 'Upcoming' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-[9px] text-[#4a5568] tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
