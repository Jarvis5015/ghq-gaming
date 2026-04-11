const updates = [
  "🏆 PhantomX won VALORANT WINTER CLASH — ₹5,000 + 800 ⬡",
  "⚡ StormRaider joined BGMI CHAMPIONS CUP — 4 slots left",
  "🎯 New tournament: FREE FIRE FRIDAY FIESTA — Free entry!",
  "👑 NightFury earned 2,000 GHQ Coins from bracket win",
  "🔥 PUBG PC PRO LEAGUE is LIVE — 13 slots remaining",
  "💥 CS2 MASTERS INVITATIONAL — Registration closes in 3 days",
  "⬡ 1,200 GHQ Coins distributed in the last hour",
  "🎮 VortexKing climbed to Rank #4 on the Leaderboard",
  "🆓 COD MOBILE OPEN — Free entry, ₹2,000 prize pool",
]

export default function LiveTicker() {
  const doubled = [...updates, ...updates]

  return (
    <div className="relative bg-[#050810] border-y border-[#1a2545]/60 overflow-hidden h-9 flex items-center">
      {/* Fades */}
      <div className="absolute left-24 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050810] to-transparent z-10 pointer-events-none" />

      {/* Live label */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center">
        <div className="h-full flex items-center gap-2 px-4 bg-[#ffd700]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#050810] animate-ping" />
          <span className="font-display font-bold text-[#050810] text-xs tracking-widest whitespace-nowrap">LIVE</span>
        </div>
      </div>

      {/* Scrolling text */}
      <div className="pl-28 overflow-hidden flex-1">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'ticker 50s linear infinite' }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="font-body text-xs text-[#4a5568] hover:text-[#e8eaf6] transition-colors cursor-default">
              {item}
              <span className="mx-6 text-[#1a2545]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
