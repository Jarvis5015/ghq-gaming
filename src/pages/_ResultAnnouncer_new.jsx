// Result Announcer — replace the ResultAnnouncer function in AdminTournaments.jsx

// ── Result Announcer ──────────────────────────────────────────────────────────
// Each player gets a placement dropdown (1 to total players)
// Admin sets GHQ Coins + Gollars reward per player
function ResultAnnouncer({ tournament, registrations, onDone }) {
  const prizeTiers = Array.isArray(tournament?.prizeTiers) ? tournament.prizeTiers : []
  const totalPlayers = registrations?.length || 0

  // placements: { userId: { placement, coins, gollars } }
  const [placements, setPlacements] = useState(() => {
    // Pre-fill from prize tiers if set
    const initial = {}
    return initial
  })
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')

  const MEDALS = { 1: '🏆', 2: '🥈', 3: '🥉' }
  const ordinal = (n) => {
    if (n === 1) return '1st Place'
    if (n === 2) return '2nd Place'
    if (n === 3) return '3rd Place'
    return `#${n}`
  }

  // Get prize tier for a placement (set during tournament creation)
  const getTierRewards = (placement) => {
    const tier = prizeTiers.find(t => t.placement === placement)
    return {
      coins:   tier?.coins   ?? 0,
      gollars: tier?.gollars ?? 0,
    }
  }

  // When admin picks a placement for a player, auto-fill rewards from prize tiers
  const setPlacement = (userId, placement) => {
    if (!placement) {
      // Unassign
      setPlacements(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      return
    }
    const rewards = getTierRewards(Number(placement))
    setPlacements(prev => ({
      ...prev,
      [userId]: {
        placement: Number(placement),
        coins:     rewards.coins,
        gollars:   rewards.gollars,
      },
    }))
  }

  const updateField = (userId, field, val) => {
    setPlacements(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: Math.max(0, Number(val) || 0) },
    }))
  }

  // Check if a placement is already assigned to another player
  const isPlacementTaken = (placement, excludeUserId) => {
    return Object.entries(placements).some(
      ([uid, data]) => data.placement === Number(placement) && Number(uid) !== excludeUserId
    )
  }

  const handleAnnounce = async () => {
    const results = Object.entries(placements).map(([userId, data]) => ({
      userId:        Number(userId),
      placement:     data.placement,
      coinsAwarded:  data.coins,
      gollarsAwarded: data.gollars,
    }))
    if (!results.length) return setError('Assign at least one placement before announcing')
    setLoading(true); setMsg(''); setError('')
    try {
      await tournamentAPI.announceResults(tournament.id, { results })
      setMsg('✓ Results announced! Rewards credited to all players.')
      setTimeout(() => onDone && onDone(), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const assignedCount = Object.keys(placements).length
  const inputCls = "w-full px-2 py-1.5 bg-[#050810] border border-[#1a2545] font-mono text-xs focus:outline-none disabled:opacity-30"

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-1">
        📢 ANNOUNCE RESULTS — <span className="text-[#ffd700]">{tournament?.name}</span>
      </h3>
      <p className="font-mono text-xs text-[#4a5568] mb-2">
        {totalPlayers} players registered · Assign placements using the dropdown
      </p>

      {/* Prize tiers reference */}
      {prizeTiers.length > 0 && (
        <div className="mb-5 p-4 border border-[#f5a623]/20 bg-[#f5a623]/5">
          <div className="font-mono text-[9px] text-[#f5a623] tracking-widest mb-2">
            🪙 PRIZE TIERS FROM TOURNAMENT SETUP (auto-filled on placement select)
          </div>
          <div className="flex flex-wrap gap-3">
            {prizeTiers.map(t => (
              <div key={t.placement} className="flex items-center gap-2 border border-[#1a2545] px-3 py-1.5">
                <span className="font-mono text-xs text-white">{MEDALS[t.placement] || `#${t.placement}`} {ordinal(t.placement)}</span>
                {t.gollars > 0 && <span className="font-mono text-xs text-[#f5a623]">🪙 {t.gollars}</span>}
                {t.coins   > 0 && <span className="font-mono text-xs text-[#ffd700]">⬡ {t.coins}</span>}
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] text-[#4a5568] mt-2">
            Rewards auto-fill when you pick a placement. You can still edit them manually.
          </p>
        </div>
      )}

      <AnimatePresence>
        {msg   && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-4 p-3 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-sm text-[#00ff88]">{msg}</motion.div>}
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-4 p-3 border border-[#ff2d55]/30 bg-[#ff2d55]/10 font-mono text-sm text-[#ff2d55]">⚠ {error}</motion.div>}
      </AnimatePresence>

      {/* Player table */}
      <div className="border border-[#1a2545] mb-6">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
          <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">PLAYER</span>
          <span className="col-span-2 font-mono text-[9px] text-[#4a5568] tracking-widest">IN-GAME ID</span>
          <span className="col-span-3 font-mono text-[9px] text-[#4a5568] tracking-widest">PLACEMENT</span>
          <span className="col-span-2 font-mono text-[9px] text-[#f5a623] tracking-widest">🪙 GOLLARS</span>
          <span className="col-span-2 font-mono text-[9px] text-[#ffd700] tracking-widest">⬡ GHQ COINS</span>
        </div>

        {registrations?.map((reg) => {
          const p       = placements[reg.user.id]
          const hasRank = !!p

          return (
            <div key={reg.id}
              className={`grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] last:border-0 items-center transition-colors ${hasRank ? 'bg-[#0a0f1e]/60' : ''}`}>

              {/* Player info */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-7 h-7 border border-[#1a2545] flex items-center justify-center font-mono text-[9px] text-[#00f5ff] flex-shrink-0">
                  {reg.user.avatar}
                </div>
                <div>
                  <div className="font-display text-sm text-white">{reg.user.username}</div>
                  {hasRank && (
                    <div className="font-mono text-[9px]" style={{
                      color: p.placement === 1 ? '#ffd700' : p.placement === 2 ? '#c0c0c0' : p.placement === 3 ? '#cd7f32' : '#4a5568'
                    }}>
                      {MEDALS[p.placement] || `#${p.placement}`} {ordinal(p.placement)}
                    </div>
                  )}
                </div>
              </div>

              {/* In-game ID */}
              <div className="col-span-2 font-mono text-xs text-[#f5a623]">
                {reg.user.gameUserId || <span className="text-[#4a5568]">—</span>}
              </div>

              {/* Placement dropdown */}
              <div className="col-span-3">
                <select
                  value={p?.placement || ''}
                  onChange={e => setPlacement(reg.user.id, e.target.value || null)}
                  className="w-full px-2 py-1.5 bg-[#050810] border border-[#1a2545] text-[#e8eaf6] font-mono text-xs focus:outline-none focus:border-[#ffd700]/40 cursor-pointer"
                  style={{ color: p ? (p.placement === 1 ? '#ffd700' : p.placement === 2 ? '#c0c0c0' : p.placement === 3 ? '#cd7f32' : '#e8eaf6') : '#4a5568' }}>
                  <option value="">— No placement —</option>
                  {Array.from({ length: totalPlayers }, (_, i) => i + 1).map(pos => {
                    const taken = isPlacementTaken(pos, reg.user.id)
                    return (
                      <option key={pos} value={pos} disabled={taken && p?.placement !== pos}
                        style={{ color: taken && p?.placement !== pos ? '#4a5568' : '#e8eaf6' }}>
                        {MEDALS[pos] || `#${pos}`} {ordinal(pos)}{taken && p?.placement !== pos ? ' (taken)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Gollars reward */}
              <div className="col-span-2">
                <input
                  type="number" min="0"
                  value={p?.gollars ?? ''}
                  onChange={e => updateField(reg.user.id, 'gollars', e.target.value)}
                  disabled={!hasRank}
                  placeholder="0"
                  className={inputCls + ' text-[#f5a623] focus:border-[#f5a623]/40'}
                />
              </div>

              {/* Coins reward */}
              <div className="col-span-2">
                <input
                  type="number" min="0"
                  value={p?.coins ?? ''}
                  onChange={e => updateField(reg.user.id, 'coins', e.target.value)}
                  disabled={!hasRank}
                  placeholder="0"
                  className={inputCls + ' text-[#ffd700] focus:border-[#ffd700]/40'}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {assignedCount > 0 && (
        <div className="border border-[#ffd700]/20 bg-[#ffd700]/5 p-4 mb-5">
          <div className="font-mono text-[10px] text-[#ffd700] tracking-widest mb-3">
            RESULT SUMMARY — {assignedCount} player{assignedCount !== 1 ? 's' : ''} assigned
          </div>
          <div className="space-y-1.5">
            {Object.entries(placements)
              .sort(([, a], [, b]) => a.placement - b.placement)
              .map(([userId, data]) => {
                const reg = registrations?.find(r => r.user.id === Number(userId))
                return (
                  <div key={userId} className="flex items-center gap-3 font-mono text-xs">
                    <span className="w-6">{MEDALS[data.placement] || `#${data.placement}`}</span>
                    <span className="text-white font-bold w-28 truncate">{reg?.user.username}</span>
                    {reg?.user.gameUserId && (
                      <span className="text-[#f5a623] text-[10px]">({reg.user.gameUserId})</span>
                    )}
                    <span className="ml-auto flex items-center gap-3">
                      {data.gollars > 0 && <span className="text-[#f5a623]">+🪙 {data.gollars.toLocaleString()}</span>}
                      {data.coins   > 0 && <span className="text-[#ffd700]">+⬡ {data.coins.toLocaleString()}</span>}
                      {data.gollars === 0 && data.coins === 0 && <span className="text-[#4a5568]">No reward</span>}
                    </span>
                  </div>
                )
              })}
          </div>

          {/* Totals */}
          <div className="mt-3 pt-3 border-t border-[#1a2545] flex gap-6">
            <div className="font-mono text-[10px] text-[#4a5568]">
              Total Gollars out: <span className="text-[#f5a623]">
                🪙 {Object.values(placements).reduce((s, p) => s + (p.gollars || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#4a5568]">
              Total Coins out: <span className="text-[#ffd700]">
                ⬡ {Object.values(placements).reduce((s, p) => s + (p.coins || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => onDone && onDone()}
          className="px-6 py-3 border border-[#1a2545] font-display text-sm tracking-widest uppercase text-[#4a5568] hover:text-white transition-all">
          Cancel
        </button>
        <button
          onClick={handleAnnounce}
          disabled={loading || assignedCount === 0}
          className="relative px-8 py-3 overflow-hidden group disabled:opacity-40"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-[#ffd700] group-hover:bg-[#ffd700]/85 transition-colors" />
          <span className="relative font-display font-bold text-sm tracking-widest uppercase text-[#050810]">
            {loading ? 'Announcing...' : `📢 Announce & Pay ${assignedCount} Player${assignedCount !== 1 ? 's' : ''}`}
          </span>
        </button>
      </div>
    </div>
  )
}
