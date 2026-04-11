import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import useStore from '../store/useStore'
import { walletAPI } from '../services/api'
import BracketView from '../components/bracket/BracketView'
import AdGateModal from '../components/ads/AdGateModal'
import AdSense, { AD_SLOTS } from '../components/ads/AdSense'

const GAME_COLORS = {
  Valorant: '#ff4655', BGMI: '#f5a623', 'Free Fire': '#ff6b35',
  'COD Mobile': '#00c853', PUBG: '#f0c040', CS2: '#de9b35',
  Fortnite: '#00bcd4', 'Clash Royale': '#7c3aed',
}

export default function TournamentDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { user, isLoggedIn, updateGollers, updateUser } = useAuthStore()
  const { fetchTournamentById, activeTournament, bracketData, tournamentLoading } = useStore()

  const [joining,    setJoining]    = useState(false)
  const [joinMsg,    setJoinMsg]    = useState('')
  const [joinError,  setJoinError]  = useState('')
  const [showAdGate, setShowAdGate] = useState(false)

  useEffect(() => { fetchTournamentById(Number(id)) }, [id])

  // When ad gate completes (phase=done), this fires automatically
  const executeJoin = async () => {
    setJoining(true); setJoinError('')
    try {
      const res = await walletAPI.joinTournament(t.id)
      setShowAdGate(false)
      setJoinMsg(res.message)
      if (res.newBalance !== undefined) updateGollers(res.newBalance)
      if (res.coinsEarned) updateUser({ coins: (user?.coins || 0) + res.coinsEarned })
      setTimeout(() => fetchTournamentById(Number(id)), 800)
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleJoinClick = () => {
    if (!isLoggedIn) { navigate('/login'); return }
    const isFreeWithAds = !isPaid && (t.adsRequired > 0)
    if (isFreeWithAds) {
      // Open ad gate — join fires after all ads are watched
      setShowAdGate(true)
    } else {
      // Paid or free-with-no-ads — join directly
      executeJoin()
    }
  }

  const t = activeTournament

  if (tournamentLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00f5ff]/30 border-t-[#00f5ff] rounded-full animate-spin" />
      </div>
    )
  }

  if (!t) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-bold text-3xl text-[#4a5568] mb-2">Tournament not found</div>
          <Link to="/tournaments" className="font-mono text-sm text-[#00f5ff]">← Back to Tournaments</Link>
        </div>
      </div>
    )
  }

  const typeLower   = (t.type   || '').toLowerCase()
  const modeLower   = (t.mode   || '').toLowerCase()
  const statusLower = (t.status || '').toLowerCase()

  const isChampion  = typeLower   === 'champions'
  const isPaid      = modeLower   === 'paid' && (t.entryFee > 0)
  const isLive      = statusLower === 'live'
  const isCompleted = statusLower === 'completed'
  const isCancelled = statusLower === 'cancelled'
  const hasAdGate   = !isPaid && (t.adsRequired > 0)

  const ac               = GAME_COLORS[t.game] || '#00f5ff'
  const registered       = t.registeredPlayers ?? 0
  const fillPct          = Math.min(100, Math.round((registered / t.maxPlayers) * 100))
  const userGollars      = user?.gollers || 0
  const hasEnoughGollars = userGollars >= (t.entryFee || 0)

  return (
    <>
      {/* Ad Gate Modal */}
      {showAdGate && (
        <AdGateModal
          tournament={t}
          joining={joining}
          joinError={joinError}
          onConfirm={executeJoin}
          onCancel={() => { setShowAdGate(false); setJoinError('') }}
        />
      )}

      <div className="min-h-screen pt-4 pb-20">
        {/* Hero */}
        <div className="relative border-b border-[#1a2545]/60 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${ac}12, transparent 70%)` }} />
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />

          <div className="max-w-7xl mx-auto px-6 py-12 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Breadcrumb + badges */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <Link to="/tournaments" className="font-mono text-xs text-[#4a5568] hover:text-white transition-colors">← All Tournaments</Link>
                {isChampion && (
                  <span className="px-2 py-0.5 bg-[#ffd700]/15 border border-[#ffd700]/40 font-mono text-[9px] text-[#ffd700] tracking-widest uppercase">👑 Champions</span>
                )}
                {isLive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                    <span className="font-mono text-[9px] text-[#00ff88] tracking-widest">LIVE</span>
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 border border-[#4a5568]/40 font-mono text-[9px] text-[#4a5568] tracking-widest uppercase">Ended</span>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                {/* Left: Info */}
                <div className="lg:col-span-2">
                  <div className="font-mono text-sm mb-2 font-bold" style={{ color: ac }}>{t.game} · {t.platform}</div>
                  <h1 className="font-display font-bold text-5xl md:text-6xl text-white leading-tight mb-4">{t.name}</h1>
                  {t.description && (
                    <p className="font-body text-[#4a5568] text-base leading-relaxed max-w-xl mb-5">{t.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(t.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1 font-mono text-[10px] tracking-widest uppercase border border-[#1a2545] text-[#4a5568]">{tag}</span>
                    ))}
                    {t.coinReward > 0 && (
                      <span className="px-3 py-1 font-mono text-[10px] tracking-widest uppercase border text-[#ffd700]"
                        style={{ borderColor: '#ffd70044', background: '#ffd70010' }}>
                        +{t.coinReward.toLocaleString()} GHQ Coins on join
                      </span>
                    )}
                    {hasAdGate && (
                      <span className="px-3 py-1 font-mono text-[10px] tracking-widest uppercase border border-[#00f5ff]/30 text-[#00f5ff] bg-[#00f5ff]/5">
                        📺 Watch {t.adsRequired} ad{t.adsRequired !== 1 ? 's' : ''} to join free
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Entry card */}
                <div className="relative border border-[#1a2545] bg-[#0a0f1e] overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${ac}, transparent)` }} />
                  <div className="p-6 space-y-4">

                    {/* Entry fee */}
                    <div>
                      <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">{isPaid ? 'ENTRY FEE' : 'ENTRY'}</div>
                      {isPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-3xl" style={{ color: '#f5a623' }}>🪙 {t.entryFee}</span>
                          <span className="font-mono text-sm text-[#4a5568]">Gollars</span>
                        </div>
                      ) : hasAdGate ? (
                        <div>
                          <div className="font-display font-bold text-3xl text-[#00ff88]">FREE</div>
                          <div className="font-mono text-[10px] text-[#00f5ff] mt-1">
                            📺 Watch {t.adsRequired} ad{t.adsRequired !== 1 ? 's' : ''} to unlock
                          </div>
                        </div>
                      ) : (
                        <div className="font-display font-bold text-3xl text-[#00ff88]">FREE</div>
                      )}
                    </div>

                    {t.prizePool > 0 && (
                      <div>
                        <div className="font-mono text-[9px] text-[#4a5568] tracking-widest mb-1">PRIZE POOL</div>
                        <div className="font-display font-bold text-2xl text-[#ffd700]">₹{t.prizePool.toLocaleString()}</div>
                      </div>
                    )}

                    {/* Player fill bar */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-mono text-[9px] text-[#4a5568] tracking-widest">PLAYERS</span>
                        <span className="font-mono text-xs text-white">{registered}/{t.maxPlayers}</span>
                      </div>
                      <div className="h-1.5 bg-[#1a2545] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${ac}88, ${ac})` }} />
                      </div>
                      <div className="font-mono text-[9px] text-[#4a5568] mt-1">{Math.max(0, t.maxPlayers - registered)} slots remaining</div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 pt-1 border-t border-[#1a2545]">
                      {[
                        ['START', t.startDate ? new Date(t.startDate).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : '—'],
                        ['ORGANIZER', t.organizer || 'GHQ Staff'],
                        ['REGION', t.region || 'India'],
                        ['COIN REWARD', `+${(t.coinReward||0).toLocaleString()} ⬡`],
                      ].map(([l,v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="font-mono text-[10px] text-[#4a5568]">{l}</span>
                          <span className="font-mono text-[10px] text-white">{v}</span>
                        </div>
                      ))}
                      {isPaid && isLoggedIn && (
                        <div className="flex justify-between">
                          <span className="font-mono text-[10px] text-[#4a5568]">YOUR GOLLARS</span>
                          <span className="font-mono text-[10px] font-bold" style={{ color: hasEnoughGollars ? '#00ff88' : '#ff2d55' }}>
                            🪙 {userGollars.toLocaleString()}
                            {!hasEnoughGollars && ` (need ${t.entryFee - userGollars} more)`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <AnimatePresence>
                      {joinMsg && (
                        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                          className="px-3 py-2 border border-[#00ff88]/30 bg-[#00ff88]/10 font-mono text-xs text-[#00ff88]">
                          ✓ {joinMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Join Button */}
                    {isCompleted || isCancelled ? (
                      <div className="w-full py-3 border border-[#1a2545] text-center font-mono text-xs text-[#4a5568]">Tournament Ended</div>
                    ) : joinMsg ? (
                      <div className="w-full py-3 border border-[#00ff88]/30 bg-[#00ff88]/10 text-center font-display font-bold text-sm text-[#00ff88] tracking-wider">
                        ✓ You're Registered!
                      </div>
                    ) : !isLoggedIn ? (
                      <Link to="/login" className="block w-full py-3 text-center font-display font-bold tracking-widest text-sm uppercase relative overflow-hidden"
                        style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                        <div className="absolute inset-0 bg-[#00f5ff]" />
                        <span className="relative text-[#050810]">Login to Join</span>
                      </Link>
                    ) : isPaid && !hasEnoughGollars ? (
                      <Link to="/wallet" className="block w-full py-3 text-center font-display font-bold tracking-widest text-sm uppercase relative overflow-hidden"
                        style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                        <div className="absolute inset-0 bg-[#f5a623]" />
                        <span className="relative text-[#050810]">🪙 Buy Gollars to Enter</span>
                      </Link>
                    ) : (
                      <button onClick={handleJoinClick} disabled={joining}
                        className="w-full py-3 font-display font-bold tracking-widest text-sm uppercase transition-all relative overflow-hidden group disabled:opacity-60"
                        style={{ clipPath:'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
                        <div className="absolute inset-0 transition-all group-hover:opacity-80"
                          style={{ background: isLive ? '#00ff88' : isPaid ? '#f5a623' : '#00f5ff' }} />
                        <span className="relative text-[#050810] font-bold">
                          {joining
                            ? 'Joining...'
                            : hasAdGate
                              ? `📺 Watch ${t.adsRequired} Ad${t.adsRequired !== 1 ? 's' : ''} & Join Free`
                              : isPaid
                                ? `🪙 Join for ${t.entryFee} Gollars`
                                : '🎮 Join Free'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-6 pt-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">

              {/* In-article ad below hero */}
              <AdSense slotId={AD_SLOTS.inArticle} format="auto" fullWidth={true} />

              {(t.rules || []).length > 0 && (
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }}>
                  <h2 className="font-display font-bold text-2xl text-white mb-5">TOURNAMENT <span style={{ color: ac }}>RULES</span></h2>
                  <div className="space-y-2">
                    {t.rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border border-[#1a2545] bg-[#0a0f1e]/40">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[9px]"
                          style={{ borderColor:`${ac}44`, color: ac }}>{i + 1}</div>
                        <span className="font-body text-sm text-[#e8eaf6]/80">{rule}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {isChampion && bracketData && (
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }}>
                  <h2 className="font-display font-bold text-2xl text-white mb-5">LIVE <span className="text-[#ffd700]">BRACKET</span></h2>
                  <div className="border border-[#1a2545] p-4 overflow-x-auto">
                    <BracketView bracketData={bracketData} />
                  </div>
                </motion.div>
              )}

              {(t.registrations || []).length > 0 && (
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }}>
                  <h2 className="font-display font-bold text-2xl text-white mb-5">
                    REGISTERED PLAYERS <span className="text-[#4a5568] text-lg">({t.registrations.length})</span>
                  </h2>
                  <div className="border border-[#1a2545]">
                    <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] bg-[#050810]">
                      {['#','Player','In-Game ID','Placement'].map(h => (
                        <span key={h} className={`font-mono text-[9px] text-[#4a5568] tracking-widest ${h==='Player'?'col-span-4':h==='In-Game ID'?'col-span-4':'col-span-2'}`}>{h}</span>
                      ))}
                    </div>
                    {t.registrations.map((reg, i) => (
                      <div key={reg.id} className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1a2545] last:border-0 items-center">
                        <div className="col-span-2 font-mono text-xs text-[#4a5568]">{i + 1}</div>
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="w-6 h-6 border border-[#1a2545] flex items-center justify-center font-mono text-[8px] text-[#00f5ff]">{reg.user.avatar}</div>
                          <span className="font-display text-sm text-white">{reg.user.username}</span>
                        </div>
                        <div className="col-span-4 font-mono text-xs text-[#f5a623]">{reg.user.gameUserId || <span className="text-[#4a5568]">—</span>}</div>
                        <div className="col-span-2 font-mono text-xs">
                          {reg.placement
                            ? <span style={{ color: reg.placement===1?'#ffd700':reg.placement===2?'#c0c0c0':'#cd7f32' }}>
                                {reg.placement===1?'🏆':reg.placement===2?'🥈':'🥉'} #{reg.placement}
                              </span>
                            : <span className="text-[#4a5568]">—</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Sidebar ad */}
              <AdSense slotId={AD_SLOTS.rectangle} format="rectangle" fullWidth={true} />

              <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once: true }}
                className="border border-[#1a2545] bg-[#0a0f1e] p-5">
                <h3 className="font-display font-bold text-lg text-white mb-4">COIN <span className="text-[#ffd700]">REWARDS</span></h3>
                <div className="space-y-2">
                  {[
                    ['🏆', '1st Place',   isChampion ? '+5,000 ⬡' : '+2,000 ⬡', '#ffd700'],
                    ['🥈', '2nd Place',   isChampion ? '+2,500 ⬡' : '+1,000 ⬡', '#c0c0c0'],
                    ['🥉', '3rd Place',   isChampion ? '+1,500 ⬡' : '+500 ⬡',   '#cd7f32'],
                    ['📊', 'Top 10',      '+200 ⬡', '#00f5ff'],
                    ['⚔️', 'Participate', '+50 ⬡',  '#7c3aed'],
                  ].map(([icon, label, reward, color]) => (
                    <div key={label} className="flex items-center justify-between p-3 border border-[#1a2545]">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="font-body text-sm text-[#e8eaf6]/70">{label}</span>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color }}>{reward}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Second sidebar ad */}
              <AdSense slotId={AD_SLOTS.rectangle} format="rectangle" fullWidth={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
